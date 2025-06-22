import argparse
from langchain.vectorstores.chroma import Chroma
from langchain.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

from get_embedding_function import get_embedding_function

# Cargar las variables de entorno
load_dotenv()

CHROMA_PATH = "chroma"

# Plantilla del prompt dandole el contexto y el prompt escrito
PROMPT_TEMPLATE = """
You have to answer the following question based on the given context:
{context}
Answer the following question:{question}
Provide a detailed answer in Spanish.
Don't include non-relevant information.
"""


def main():
    # Se crea un CLI para escribir la consulta en la terminal
    parser = argparse.ArgumentParser()
    parser.add_argument("query_text", type=str, help="The query text.")
    args = parser.parse_args()
    query_text = args.query_text
    query_rag(query_text)


def query_rag(query_text: str):
    # Cargamos la base de datos y usamos el embedding de OpenAI
    embedding_function = get_embedding_function()
    db = Chroma(
        embedding_function=embedding_function,
        persist_directory=CHROMA_PATH,
    )
    print("Base de datos cargada correctamente")

    # Buscamos en la base de datos los documentos mas relevantes en base a la consulta y crear el contexto
    results = db.similarity_search_with_score(query_text, k=5)
    print(f"Resultados encontrados: {len(results)}")

    # Preparamos el prompt para el modelo de OpenAI
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    # print(f"Prompt template: {prompt_template}")
    prompt = prompt_template.format(context=context_text, question=query_text)
    # print(f"Prompt preparado {prompt}")

    # Obtenemos la respuesta del modelo de OpenAI
    model = ChatOpenAI()
    response_text = model.predict(prompt)
    print(f"Respuesta del modelo: {response_text}")

    # Obtenemos las fuentes que se utilizaron para responder la pregunta
    sources = [doc.metadata.get("source", None) for doc, _score in results]
    print(f"Fuentes encontradas: {sources}")

    formatted_response = f"Response: {response_text}\nSources: {sources}"
    print("Respuesta formateada")
    print(formatted_response)
    return formatted_response


if __name__ == "__main__":
    main()
