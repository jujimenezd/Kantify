import os
import shutil
import argparse
from langchain.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.schema.document import Document
from langchain.vectorstores.chroma import Chroma

from get_embedding_function import get_embedding_function


# ruta de la carpeta data
CHROMA_PATH = "chroma"
DATA_PATH = "data"


def main():
    # Check if the database should be cleared (using the --clear flag).
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Reset the database.")
    args = parser.parse_args()
    if args.reset:
        print("✨ Clearing Database")
        clear_database()

    # Cargar los documentos de la carpeta data
    documents = load_documents()
    chunks = split_documents(documents)
    add_to_chroma(chunks)


def load_documents():
    """
    Cargar los documentos de la carpeta data
    retorna un diccionario con el contenido de texto en cada pagina del PDF
    """
    document_loader = PyPDFDirectoryLoader(DATA_PATH)
    return document_loader.load()


def split_documents(documents: list[Document]):
    """
    Divide el texto en fragmentos más pequeños y manejables. Cada fragmento tiene 1000 letras y comparte 500 letras con el fragmento anterior para no perder el hilo del texto
    """
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        length_function=len,
        is_separator_regex=False,
    )
    return text_splitter.split_documents(documents)


def add_to_chroma(chunks: list[Document]):
    """
    Funcion para guardar los chunks en la base de datos vectorial
    """
    db = Chroma(
        persist_directory=CHROMA_PATH,
        embedding_function=get_embedding_function(),
    )

    # Calculamos los ids de las paginas
    chunks_with_ids = calculate_chunk_ids(chunks)

    # añadir o actualizar documentos
    existing_items = db.get(include=[])
    existing_ids = set(existing_items["ids"])
    print(f"Existe {len(existing_ids)} documentos en la base de datos")

    # solo añadir documentos que no existan en la base de datos
    new_chunks = []
    for chunk in chunks_with_ids:
        if chunk.metadata["id"] not in existing_ids:
            new_chunks.append(chunk)

    if len(new_chunks):
        print(f"Añadiendo {len(new_chunks)} documentos nuevos")
        new_chunk_ids = [chunk.metadata["id"] for chunk in new_chunks]
        db.add_documents(new_chunks, ids=new_chunk_ids)
        db.persist()
    else:
        print("No hay documentos nuevos para añadir")


def calculate_chunk_ids(chunks):
    """
    Funcion para calcular los ids de los chunks
    de forma que cada chunk tenga un id unico

    Con esto verificamos: si a;adimos un PDF nuevo o nuevas paginas de un PDF existente,
    el sistema puede verificar si ya esta en la base de datos o no

    "data/libro.pdf:6:2"

    Fuentelibro: pagina : chunk index
    """

    last_page_id = None
    current_chunk_index = 0

    # Recorremos los chunks y accedemos a sus metadatos
    for chunk in chunks:
        source = chunk.metadata.get("source")
        page = chunk.metadata.get("page")
        current_page_id = f"{source}:{page}"

        # si el ID de la pagina actual es el mismo que el anterior, incrementamos el indice del chunk
        if current_page_id == last_page_id:
            current_chunk_index += 1
        else:
            current_chunk_index = 0

        # calculamos el id del chunk
        chunk_id = f"{current_page_id}:{current_chunk_index}"
        last_page_id = current_page_id

        # Agregamos la pagina en los metadatos
        chunk.metadata["id"] = chunk_id

    return chunks


def clear_database():
    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)


if __name__ == "__main__":
    main()
