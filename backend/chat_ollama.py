import os
import ollama

# Obtener la IP desde la variable de entorno, o usar localhost
host = os.environ.get("OLLAMA_HOST", "http://127.0.0.1:11434")
print("="*50)
print(f"Iniciando chat con qwen2.5:1.5b en {host}")
print("Escribe 'salir', 'quit' o 'exit' para terminar el chat.")
print("="*50)

client = ollama.Client(host=host)

# Guardar el historial de la conversación
mensajes = []

while True:
    # Pedir al usuario que escriba algo
    user_input = input("\nTú: ")
    
    # Condición de salida
    if user_input.strip().lower() in ['salir', 'quit', 'exit']:
        print("Cerrando el chat. ¡Hasta luego!")
        break
        
    if not user_input.strip():
        continue

    # Agregar el mensaje del usuario al historial
    mensajes.append({'role': 'user', 'content': user_input})
    
    print("Gemma: ", end="", flush=True)
    
    try:
        # Enviar petición a Ollama con stream=True para ver cómo escribe en tiempo real
        stream = client.chat(model='qwen2.5:1.5b', messages=mensajes, stream=True)
        
        respuesta_completa = ""
        for chunk in stream:
            token = chunk['message']['content']
            print(token, end="", flush=True)
            respuesta_completa += token
            
        print() # Salto de línea final
        
        # Guardar la respuesta del asistente en el historial para darle memoria al chat
        mensajes.append({'role': 'assistant', 'content': respuesta_completa})
        
    except Exception as e:
        print(f"\n[Error de Conexión]: {e}")
