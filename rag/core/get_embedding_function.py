# from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
import os
import openai

load_dotenv()

openai.api_key = os.environ["OPENAI_API_KEY"]


def get_embedding_function():
    """
    Funcion para obtener el embedding de HuggingFace
    """
    embedding = OpenAIEmbeddings(
        model="text-embedding-3-large",
        # model_name = "hkunlp/instructor-xl"
        # model_kwargs = {"device": "cpu"}
        # encode_kwargs = {"normalize_embeddings": True}
        # hf = HuggingFaceEmbeddings(
        #     model_name=model_name,
        #     model_kwargs=model_kwargs,
        #     encode_kwargs=encode_kwargs,
    )
    return embedding
