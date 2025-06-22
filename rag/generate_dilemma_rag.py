import argparse
import json
from langchain.vectorstores.chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from typing import Dict, List, Optional

from get_embedding_function import get_embedding_function

# Cargar las variables de entorno
load_dotenv()

CHROMA_PATH = "chroma"

# Plantilla del prompt especializada para generar dilemas éticos
DILEMMA_GENERATION_TEMPLATE = """
Eres un experto en filosofía ética con profundo conocimiento en las obras de Kant, Levinas, Bauman, Jonas y Butler.

Basándote en el siguiente contexto filosófico:
{context}

Genera UN DILEMA ÉTICO original que:

REQUISITOS:
1. **Tópico**: {topic}
2. **Intensidad**: {intensity} (Suave = situaciones cotidianas, Medio = decisiones con consecuencias significativas, Extremo = dilemas de vida o muerte)
3. **Fundamentación**: Debe conectar con las ideas filosóficas del contexto proporcionado
4. **Estilo**: Pregunta directa que provoque reflexión personal (usar "tú" o "usted")
5. **Longitud**: Entre 30-80 palabras
6. **Aplicabilidad**: Situación en la que una persona real podría encontrarse

EJEMPLOS DE ESTILO:
- Suave: "Si una acción tuya hoy tiene un impacto negativo menor pero acumulativo que solo será visible en 50 años, ¿te sientes realmente responsable por ello?"
- Medio: "Si supieras que tu estilo de vida contribuye a problemas que harán la vida difícil para tus nietos, ¿harías cambios drásticos aunque limiten tu comodidad presente?"
- Extremo: "Si pudieras salvar 100 vidas sacrificando una vida inocente de tu familia, ¿lo harías?"

FORMATO DE RESPUESTA (JSON):
{{
    "dilema_texto": "El texto del dilema aquí...",
    "fundamentacion_filosofica": "Breve explicación de 2-3 líneas sobre qué concepto filosófico del contexto conecta con este dilema",
    "fuentes_utilizadas": ["Concepto o autor principal del contexto"],
    "variable_oculta": "El aspecto ético profundo que explora este dilema"
}}

Genera el dilema ahora:
"""


def generate_dilemma_with_rag(
    topic: str, intensity: str, user_context: Optional[str] = None
) -> Dict:
    """
    Genera un dilema ético usando RAG para fundamentación filosófica

    Args:
        topic: El tópico ético (ej: "Temporalidad Moral", "Alteridad Radical")
        intensity: La intensidad ("Suave", "Medio", "Extremo")
        user_context: Contexto opcional sobre respuestas previas del usuario

    Returns:
        Dict con el dilema generado y su fundamentación
    """

    # Cargamos la base de datos
    embedding_function = get_embedding_function()
    db = Chroma(
        embedding_function=embedding_function,
        persist_directory=CHROMA_PATH,
    )
    print(f"📚 Base de datos cargada correctamente")

    # Construir query para buscar contexto filosófico relevante
    search_query = f"{topic} ética filosofía moral responsabilidad {intensity.lower()}"
    if user_context:
        search_query += f" {user_context}"

    # Buscar documentos relevantes
    results = db.similarity_search_with_score(search_query, k=4)
    print(f"🔍 Encontrados {len(results)} documentos relevantes")

    # Preparar contexto filosófico
    context_text = "\n\n---\n\n".join(
        [
            f"Fuente: {doc.metadata.get('source', 'Desconocida')}\n{doc.page_content}"
            for doc, _score in results
        ]
    )

    # Generar el prompt
    prompt_template = ChatPromptTemplate.from_template(DILEMMA_GENERATION_TEMPLATE)
    prompt = prompt_template.format(
        context=context_text, topic=topic, intensity=intensity
    )

    # Generar respuesta con OpenAI
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0.8)
    response_text = model.predict(prompt)

    print(f"🤖 Respuesta generada:")
    print(response_text)

    # Parsear respuesta JSON
    try:
        # Extraer JSON del response si viene con texto adicional
        start_idx = response_text.find("{")
        end_idx = response_text.rfind("}") + 1
        if start_idx != -1 and end_idx != 0:
            json_str = response_text[start_idx:end_idx]
            dilemma_data = json.loads(json_str)
        else:
            raise ValueError("No se encontró JSON válido en la respuesta")

        # Agregar metadatos adicionales
        dilemma_data.update(
            {
                "topic": topic,
                "intensity": intensity,
                "sources_metadata": [
                    doc.metadata.get("source", "Desconocida") for doc, _ in results
                ],
            }
        )

        return dilemma_data

    except (json.JSONDecodeError, ValueError) as e:
        print(f"❌ Error parseando JSON: {e}")
        print(f"Respuesta cruda: {response_text}")

        # Fallback: crear estructura básica
        return {
            "dilema_texto": response_text.strip(),
            "fundamentacion_filosofica": "Generado con base en conocimiento filosófico general",
            "fuentes_utilizadas": ["Contexto filosófico general"],
            "variable_oculta": f"Aspectos éticos de {topic}",
            "topic": topic,
            "intensity": intensity,
            "sources_metadata": [
                doc.metadata.get("source", "Desconocida") for doc, _ in results
            ],
            "error": "Formato de respuesta no estándar",
        }


def main():
    """CLI para probar la generación de dilemas"""
    parser = argparse.ArgumentParser(description="Generar dilemas éticos con RAG")
    parser.add_argument("topic", type=str, help="Tópico ético del dilema")
    parser.add_argument(
        "intensity",
        type=str,
        choices=["Suave", "Medio", "Extremo"],
        help="Intensidad del dilema",
    )
    parser.add_argument("--context", type=str, help="Contexto opcional del usuario")

    args = parser.parse_args()

    print(f"🎯 Generando dilema sobre '{args.topic}' con intensidad '{args.intensity}'")
    if args.context:
        print(f"📝 Contexto del usuario: {args.context}")

    result = generate_dilemma_with_rag(args.topic, args.intensity, args.context)

    print("\n" + "=" * 50)
    print("📋 DILEMA GENERADO:")
    print("=" * 50)
    print(f"Texto: {result['dilema_texto']}")
    print(f"\n🧠 Fundamentación: {result['fundamentacion_filosofica']}")
    print(f"\n📚 Fuentes: {', '.join(result['fuentes_utilizadas'])}")
    print(f"\n🔍 Variable oculta: {result['variable_oculta']}")
    print(f"\n📖 Metadatos de fuentes: {result['sources_metadata']}")


if __name__ == "__main__":
    main()
