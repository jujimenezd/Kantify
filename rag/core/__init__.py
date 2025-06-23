"""
Core module for RAG Dilemma Generator
"""

from .generate_dilemma_rag import generate_dilemma_with_rag
from .get_embedding_function import get_embedding_function

__all__ = ["generate_dilemma_with_rag", "get_embedding_function"]
