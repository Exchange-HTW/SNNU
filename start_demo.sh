#!/bin/bash

# Este script levanta el backend y el frontend simultáneamente para la demo

# Asegurarnos de estar en la carpeta del proyecto sin importar desde dónde se ejecute el script
cd "$(dirname "$0")"

# Función para detener ambos servidores al presionar Ctrl+C
trap 'echo -e "\n🛑 Deteniendo los servidores..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' SIGINT SIGTERM

echo "==================================================="
echo "🚀 Iniciando SNNU Demo Local"
echo "==================================================="

echo "👉 1/2 Iniciando el backend (FastAPI)..."
cd backend
source venv/bin/activate
export OLLAMA_HOST="http://192.168.1.8:11434"
export OLLAMA_MODEL="translategemma:4b"
export OLLAMA_BATCH_SIZE="30"
export OLLAMA_MAX_CONCURRENCY="2"
export CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"

# Ejecutar en segundo plano
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "👉 2/2 Iniciando el frontend (React/Vite)..."
cd ../frontend
# Ejecutar en segundo plano
npm run dev &
FRONTEND_PID=$!

echo ""
echo "==================================================="
echo "✅ Todo listo. Puedes abrir tu navegador en:"
echo "🌐 Frontend: http://localhost:5174"
echo "⚙️  Backend:  http://localhost:8000"
echo ""
echo "❌ Presiona [Ctrl+C] en esta terminal para apagar todo."
echo "==================================================="
echo ""

# Esperar a que los procesos terminen (o hasta que el usuario presione Ctrl+C)
wait $BACKEND_PID $FRONTEND_PID

