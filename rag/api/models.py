"""
Modelos Pydantic para la API del generador de dilemas RAG
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class DilemmaRequest(BaseModel):
    """Modelo para las solicitudes de generación de dilemas"""

    topic: str = Field(
        ..., description="Tópico ético del dilema", example="Temporalidad Moral"
    )
    intensity: str = Field(
        ...,
        description="Intensidad del dilema",
        pattern=r"^(Suave|Medio|Extremo)$",
        example="Medio",
    )
    user_context: Optional[str] = Field(
        None,
        description="Contexto opcional del usuario",
        example="Usuario empático con 3 respuestas previas",
    )


class DilemmaResponse(BaseModel):
    """Modelo para las respuestas de dilemas generados"""

    success: bool = Field(..., description="Si la generación fue exitosa")
    dilemma_text: str = Field(..., description="Texto del dilema generado")
    philosophical_foundation: str = Field(
        ..., description="Fundamentación filosófica del dilema"
    )
    used_sources: List[str] = Field(..., description="Fuentes filosóficas utilizadas")
    hidden_variable: str = Field(..., description="Variable ética oculta que explora")
    topic: str = Field(..., description="Tópico confirmado")
    intensity: str = Field(..., description="Intensidad confirmada")
    sources_metadata: List[str] = Field(..., description="Metadatos de las fuentes PDF")
    generation_time_ms: Optional[float] = Field(
        None, description="Tiempo de generación en milisegundos"
    )


class HealthResponse(BaseModel):
    """Modelo para respuestas de health check"""

    status: str = Field(..., example="healthy")
    message: str = Field(..., example="RAG Dilemma API is running")
    database_status: str = Field(..., example="connected")


class ErrorResponse(BaseModel):
    """Modelo para respuestas de error"""

    success: bool = Field(False)
    error: str = Field(..., description="Descripción del error")
    error_type: str = Field(..., description="Tipo de error")


class TopicsResponse(BaseModel):
    """Modelo para la respuesta de tópicos disponibles"""

    topics: List[str] = Field(..., description="Lista de tópicos éticos disponibles")
    intensities: List[str] = Field(..., description="Lista de intensidades disponibles")
