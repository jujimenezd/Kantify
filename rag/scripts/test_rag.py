#!/usr/bin/env python3
"""
Script de prueba para el generador de dilemas con RAG
Ejecutar con: python scripts/test_rag.py
"""

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from core.generate_dilemma_rag import generate_dilemma_with_rag
import os


def test_dilemma_generation():
    """Función de prueba para generar algunos dilemas de ejemplo"""

    print("🚀 INICIANDO PRUEBAS DEL GENERADOR DE DILEMAS CON RAG")
    print("=" * 60)

    # Verificar que existe la base de datos
    if not os.path.exists("chroma"):
        print("❌ ERROR: No se encontró la carpeta 'chroma'")
        print(
            "💡 SOLUCIÓN: Ejecuta primero 'python core/create_database.py' para crear la base de datos"
        )
        return False

    # Casos de prueba basados en tu corpus actual
    test_cases = [
        {
            "topic": "Temporalidad Moral",
            "intensity": "Suave",
            "context": "Usuario nuevo sin respuestas previas",
        },
        {
            "topic": "Alteridad Radical",
            "intensity": "Medio",
            "context": "Usuario que ha mostrado tendencia hacia respuestas empáticas",
        },
        {
            "topic": "Imperativo de Universalización",
            "intensity": "Extremo",
            "context": "Usuario experimentado con 5 dilemas respondidos",
        },
        {
            "topic": "Ontología de la Ignorancia",
            "intensity": "Suave",
            "context": "Usuario nuevo sin respuestas previas",
        },
        {
            "topic": "Economía Moral del Deseo",
            "intensity": "Medio",
            "context": "Usuario que ha mostrado tendencia hacia respuestas empáticas",
        },
        {
            "topic": "Microética Cotidiana",
            "intensity": "Extremo",
            "context": "Usuario experimentado con 5 dilemas respondidos",
        },
    ]

    results = []

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 PRUEBA {i}/{len(test_cases)}")
        print(f"   📋 Tópico: {test_case['topic']}")
        print(f"   ⚡ Intensidad: {test_case['intensity']}")
        print(f"   👤 Contexto: {test_case['context']}")
        print("-" * 40)

        try:
            result = generate_dilemma_with_rag(
                topic=test_case["topic"],
                intensity=test_case["intensity"],
                user_context=test_case["context"],
            )

            print("✅ ÉXITO - Dilema generado:")
            print(f"   💭 Texto: {result.get('dilemma_text', 'N/A')}")
            print(
                f"   🧠 Fundamentación: {result.get('philosophical_foundation', 'N/A')[:]}..."
            )
            print(f"   📚 Fuentes: {result.get('used_sources', 'N/A')}")

            results.append({"test": i, "success": True, "result": result})

        except Exception as e:
            print(f"❌ ERROR en prueba {i}: {str(e)}")
            results.append({"test": i, "success": False, "error": str(e)})

    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)

    successful = sum(1 for r in results if r["success"])
    total = len(results)

    print(f"✅ Exitosas: {successful}/{total}")
    print(f"❌ Fallidas: {total - successful}/{total}")

    if successful == total:
        print("🎉 ¡TODAS LAS PRUEBAS PASARON!")
        print("✨ El generador de dilemas RAG está funcionando correctamente")
    else:
        print("⚠️  Algunas pruebas fallaron. Revisa los errores arriba.")

    return successful == total


if __name__ == "__main__":
    # Verificar dependencias básicas
    try:
        from dotenv import load_dotenv

        load_dotenv()

        if not os.getenv("OPENAI_API_KEY"):
            print("❌ ERROR: No se encontró OPENAI_API_KEY en las variables de entorno")
            print("💡 SOLUCIÓN: Crea un archivo .env con tu clave de OpenAI")
            exit(1)

    except ImportError as e:
        print(f"❌ ERROR: Falta instalar dependencias: {e}")
        print(
            "💡 SOLUCIÓN: pip install -r requirements.txt (si existe) o instala las dependencias manualmente"
        )
        exit(1)

    # Ejecutar pruebas
    success = test_dilemma_generation()
    exit(0 if success else 1)
