import os
import ollama

host = os.environ.get("OLLAMA_HOST", "http://192.168.1.8:11434")
print(f"Probando qwen2.5:1.5b en {host}...")
client = ollama.Client(host=host)

system_prompt = "Return ONLY valid JSON. {\"test\": \"ok\"}"
try:
    response = client.chat(model='qwen2.5:1.5b', messages=[
        {'role': 'system', 'content': system_prompt},
        {'role': 'user', 'content': 'Do it.'}
    ], format='json')
    content = response['message']['content']
    print("OUTPUT BRUTO:")
    print(repr(content))
except Exception as e:
    print(f"Error: {e}")
