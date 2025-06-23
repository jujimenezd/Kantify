"""
Rutas y endpoints para la API del generador de dilemas RAG
"""

import asyncio
import logging
import os
import time
from fastapi import APIRouter, HTTPException, status

# Importar modelos locales
from .models import (
    DilemmaRequest,
    DilemmaResponse,
    HealthResponse,
    ErrorResponse,
    TopicsResponse,
)

# Importar función RAG desde core
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from core.generate_dilemma_rag import generate_dilemma_with_rag

logger = logging.getLogger(__name__)

# Crear router
router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def root():
    """Endpoint de salud básico"""
    return HealthResponse(
        status="healthy",
        message="RAG Dilemma API is running",
        database_status="connected" if os.path.exists("chroma") else "not_found",
    )


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check detallado"""
    database_status = "connected" if os.path.exists("chroma") else "not_found"
    openai_status = "configured" if os.getenv("OPENAI_API_KEY") else "missing"

    return HealthResponse(
        status="healthy"
        if database_status == "connected" and openai_status == "configured"
        else "degraded",
        message=f"Database: {database_status}, OpenAI: {openai_status}",
        database_status=database_status,
    )


@router.post(
    "/generate-dilemma",
    response_model=DilemmaResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Bad Request"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    },
)
async def generate_dilemma(request: DilemmaRequest):
    """
    Generar un dilema ético usando RAG con fundamentación filosófica

    - **topic**: Tópico ético (ej: "Temporalidad Moral", "Alteridad Radical", "Imperativo de Universalización", "Ontología de la Ignorancia", "Economía Moral del Deseo", "Microética Cotidiana")
    - **intensity**: Intensidad del dilema ("Suave", "Medio", "Extremo")
    - **user_context**: Contexto opcional sobre el usuario para personalización
    """
    start_time = time.time()

    logger.info(f"🎯 Generando dilema: {request.topic} | {request.intensity}")
    if request.user_context:
        logger.info(f"👤 Contexto de usuario: {request.user_context}")

    try:
        # Verificaciones previas
        if not os.path.exists("chroma"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Base de datos ChromaDB no encontrada. Ejecuta 'python core/create_database.py' primero.",
            )

        if not os.getenv("OPENAI_API_KEY"):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="OpenAI API Key no configurada. Verifica tu archivo .env",
            )

        # Ejecutar generación RAG en background para no bloquear
        result = await asyncio.to_thread(
            generate_dilemma_with_rag,
            topic=request.topic,
            intensity=request.intensity,
            user_context=request.user_context,
        )

        end_time = time.time()
        generation_time = (end_time - start_time) * 1000  # en milisegundos

        logger.info(f"✅ Dilema generado exitosamente en {generation_time:.2f}ms")

        # Validar que el resultado tenga los campos necesarios
        required_fields = [
            "dilemma_text",
            "philosophical_foundation",
            "used_sources",
            "hidden_variable",
        ]
        for field in required_fields:
            if field not in result:
                logger.warning(f"⚠️  Campo faltante en resultado: {field}")
                result[field] = f"Campo {field} no disponible"

        return DilemmaResponse(
            success=True,
            dilemma_text=result["dilemma_text"],
            philosophical_foundation=result["philosophical_foundation"],
            used_sources=result.get("used_sources", []),
            hidden_variable=result["hidden_variable"],
            topic=result.get("topic", request.topic),
            intensity=result.get("intensity", request.intensity),
            sources_metadata=result.get("sources_metadata", []),
            generation_time_ms=generation_time,
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"❌ Error generando dilema: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}",
        )


@router.get("/topics", response_model=TopicsResponse)
async def get_available_topics():
    """Obtener los tópicos éticos disponibles"""
    return TopicsResponse(
        topics=[
            "Temporalidad Moral",
            "Alteridad Radical",
            "Imperativo de Universalización",
            "Ontología de la Ignorancia",
            "Economía Moral del Deseo",
            "Microética Cotidiana",
        ],
        intensities=["Suave", "Medio", "Extremo"],
    )
