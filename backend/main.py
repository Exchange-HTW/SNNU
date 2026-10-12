import asyncio
import copy
import json
import os
import re
from collections import OrderedDict
from typing import Any

import ollama
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import seed
from base_data import INITIAL_PAGE_DATA

seed.seed_data()

app = FastAPI(title="SNNU AI Generator API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "translategemma:4b")
BATCH_SIZE = max(1, int(os.getenv("OLLAMA_BATCH_SIZE", "30")))
MAX_CONCURRENCY = max(1, int(os.getenv("OLLAMA_MAX_CONCURRENCY", "2")))
CACHE_SIZE = max(1, int(os.getenv("TRANSLATION_CACHE_SIZE", "8")))

NON_TRANSLATABLE_KEYS = {
    "id", "icon", "videoSrc", "src", "url", "href", "email", "photo",
    "links", "phone", "year", "align", "fullWidth", "code", "images", "mapQuery", "authors",
}

LANGUAGE_NAMES = {
    "en": "English", "de": "German", "es": "Spanish", "fr": "French",
    "it": "Italian", "pt": "Portuguese", "zh": "Chinese", "ja": "Japanese",
    "ko": "Korean", "ru": "Russian", "ar": "Arabic", "tr": "Turkish",
    "pl": "Polish", "nl": "Dutch", "sv": "Swedish",
}

HTML_TAG_RE = re.compile(r"<[^>]+>")
_translation_cache: OrderedDict[str, dict[str, Any]] = OrderedDict()


class GenerateRequest(BaseModel):
    language: str = Field(min_length=2, max_length=20)
    # Kept as hidden compatibility defaults; translation currently depends only on language.
    school: str = "HTW Saar"
    audience: str = "Student"


def collect_translatable_values(node: Any) -> list[tuple[Any, Any, str]]:
    """Return mutable container/key/value references for every prose string."""
    values: list[tuple[Any, Any, str]] = []

    def visit(current: Any) -> None:
        if isinstance(current, dict):
            is_person = "role" in current and "name" in current
            is_publication = "authors" in current and "year" in current and "title" in current
            for key, value in current.items():
                if (
                    key in NON_TRANSLATABLE_KEYS
                    or (is_person and key == "name")
                    or (is_publication and key in {"subtitle", "title", "text"})
                ):
                    continue
                if isinstance(value, str):
                    if value.strip():
                        values.append((current, key, value))
                else:
                    visit(value)
        elif isinstance(current, list):
            for index, value in enumerate(current):
                if isinstance(value, str):
                    if value.strip():
                        values.append((current, index, value))
                else:
                    visit(value)

    visit(node)
    return values


def extract_translation_payload(raw: str) -> list[str]:
    """Parse and validate Ollama's structured translation response."""
    candidate = raw.strip()
    if candidate.startswith("```"):
        candidate = candidate.removeprefix("```json").removeprefix("```")
        candidate = candidate.removesuffix("```").strip()
    start = candidate.find("{")
    end = candidate.rfind("}")
    if start < 0 or end < start:
        raise ValueError("Ollama did not return a JSON object")
    parsed = json.loads(candidate[start:end + 1])
    translations = parsed.get("translations") if isinstance(parsed, dict) else None
    if not isinstance(translations, list) or not all(isinstance(item, str) for item in translations):
        raise ValueError("Ollama returned an invalid translation payload")
    return translations


def split_html_text(text: str) -> tuple[list[str], list[Any]]:
    """Separate prose from HTML so tags are never sent to the model."""
    segments: list[str] = []
    template: list[Any] = []
    for part in re.split(r"(<[^>]+>)", text):
        if not part:
            continue
        if HTML_TAG_RE.fullmatch(part) or not part.strip():
            template.append(part)
            continue
        leading = part[:len(part) - len(part.lstrip())]
        trailing = part[len(part.rstrip()):]
        template.append((leading, len(segments), trailing))
        segments.append(part.strip())
    return segments, template


def rebuild_html_text(template: list[Any], translated_segments: list[str]) -> str:
    parts: list[str] = []
    for item in template:
        if isinstance(item, str):
            parts.append(item)
        else:
            leading, index, trailing = item
            parts.append(f"{leading}{translated_segments[index]}{trailing}")
    return "".join(parts)


async def request_translations(texts, target_language, client, semaphore):
    system_prompt = (
        "You are a deterministic website translation API. "
        f"Translate every item in the input JSON array into {target_language}. "
        "Do not invent or change facts, names, citations, institutions, numbers, dates, URLs, "
        "or email addresses. Do not add HTML or XML markup. "
        "Return the translations in the required JSON object, in exactly the same order and length."
    )
    response_schema = {
        "type": "object",
        "properties": {
            "translations": {
                "type": "array",
                "items": {"type": "string"},
                "minItems": len(texts),
                "maxItems": len(texts),
            }
        },
        "required": ["translations"],
        "additionalProperties": False,
    }
    async with semaphore:
        response = await client.chat(
            model=OLLAMA_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(texts, ensure_ascii=False)},
            ],
            format=response_schema,
            options={"temperature": 0.0, "top_p": 0.1},
        )
    try:
        translated = extract_translation_payload(response["message"]["content"])
        if len(translated) != len(texts):
            raise ValueError(f"Ollama returned {len(translated)} items for a batch of {len(texts)}")
        if any("<" in text or ">" in text for text in translated):
            raise ValueError("Ollama introduced unexpected markup")
    except (json.JSONDecodeError, ValueError) as exc:
        if len(texts) == 1:
            raise ValueError(f"Ollama returned malformed structured JSON: {exc}") from exc
        midpoint = len(texts) // 2
        left, right = await asyncio.gather(
            request_translations(texts[:midpoint], target_language, client, semaphore),
            request_translations(texts[midpoint:], target_language, client, semaphore),
        )
        return left + right
    return translated


async def translate_batch(texts, language, client, semaphore):
    target_language = LANGUAGE_NAMES.get(language.lower(), language)
    flattened: list[str] = []
    templates: list[tuple[list[Any], int, int]] = []
    for text in texts:
        segments, template = split_html_text(text)
        start = len(flattened)
        flattened.extend(segments)
        templates.append((template, start, len(segments)))

    if not flattened:
        return texts

    translated = await request_translations(flattened, target_language, client, semaphore)
    return [
        rebuild_html_text(template, translated[start:start + count])
        for template, start, count in templates
    ]


async def translate_page(data, language):
    references = collect_translatable_values(data)
    if not references:
        return data

    batches = [references[index:index + BATCH_SIZE] for index in range(0, len(references), BATCH_SIZE)]
    client = ollama.AsyncClient(host=OLLAMA_HOST)
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    tasks = [
        translate_batch([value for _, _, value in batch], language, client, semaphore)
        for batch in batches
    ]
    translated_batches = await asyncio.gather(*tasks)

    for batch, translated_values in zip(batches, translated_batches):
        for (container, key, _), translated in zip(batch, translated_values):
            container[key] = translated
    return data


@app.post("/generate")
async def generate_page(request: GenerateRequest):
    language = request.language.lower()
    if language not in LANGUAGE_NAMES:
        raise HTTPException(status_code=400, detail=f"Unsupported language: {request.language}")

    if language == "en":
        return copy.deepcopy(INITIAL_PAGE_DATA)

    if language in _translation_cache:
        _translation_cache.move_to_end(language)
        return copy.deepcopy(_translation_cache[language])

    try:
        translated = await translate_page(copy.deepcopy(INITIAL_PAGE_DATA), language)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Ollama translation failed: {exc}") from exc

    _translation_cache[language] = copy.deepcopy(translated)
    _translation_cache.move_to_end(language)
    while len(_translation_cache) > CACHE_SIZE:
        _translation_cache.popitem(last=False)
    return translated

@app.get("/default-data")
async def get_default_data():
    return copy.deepcopy(INITIAL_PAGE_DATA)


@app.get("/health")
async def health():
    return {"status": "ok", "ollama_host": OLLAMA_HOST, "model": OLLAMA_MODEL}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
