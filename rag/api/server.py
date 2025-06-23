#!/usr/bin/env python3
"""
FastAPI Server principal para el generador de dilemas RAG
Ejecutar con: uvicorn api.server:app --reload --host 0.0.0.0 --port 8000
"""

import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import router

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Context manager para startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("🚀 Iniciando RAG Dilemma API Server...")

    # Verificar base de datos ChromaDB
    if not os.path.exists("chroma"):
        logger.warning("⚠️  No se encontró la base de datos ChromaDB")
    else:
        logger.info("✅ Base de datos ChromaDB encontrada")

    # Verificar variables de entorno
    if not os.getenv("OPENAI_API_KEY"):
        logger.warning("⚠️  OPENAI_API_KEY no encontrada")
    else:
        logger.info("✅ OpenAI API Key configurada")

    logger.info("🎯 Servidor listo!")

    yield

    # Shutdown
    logger.info("🛑 Cerrando RAG Dilemma API Server...")


# Crear app FastAPI
app = FastAPI(
    title="RAG Dilemma Generator API",
    description="API para generar dilemas éticos fundamentados filosóficamente usando RAG",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configurar CORS para Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(router)

# Para desarrollo local
if __name__ == "__main__":
    import uvicorn

    logger.info("🔥 Ejecutando servidor en modo desarrollo...")
    uvicorn.run(
        "api.server:app", host="127.0.0.1", port=8000, reload=True, log_level="info"
    )
