import os
import ollama

# Obtener la IP desde la variable de entorno, o usar localhost
host = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")
print(f"Conectando a Ollama en: {host}")

client = ollama.Client(host=host)

try:
    print("Enviando petición a gemma4:12b...")
    response = client.chat(model='gemma4:12b', messages=[
        {'role': 'user', 'content': 'Di "Hola, la conexión funciona" en español y nada más.'}
    ])
    print("\n--- Respuesta de Ollama ---")
    print(response['message']['content'])
    print("---------------------------\n")
except Exception as e:
    print(f"\nError al conectar con Ollama: {e}")
