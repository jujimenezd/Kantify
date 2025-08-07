# 🧠 RAG Dilemma Generator


Sistema completo para generar dilemas éticos fundamentados filosóficamente usando RAG.


## 🚀 Inicio Rápido


### 1. Configuración


```bash

cd rag/config

pip install e .

pip install -r requirements_api.txt

# Editar .env con tu OPENAI_API_KEY

```


### 2. Crear Base de Datos


```bash

python core/create_database.py

```


### 3. Iniciar Servidor FastAPI


```bash

python scripts/start_server.py

```


### 4. Probar API desde terminal


```bash

python scripts/test_api.py

```


## 🔗 URLs


- **Servidor**: http://localhost:8000

- **Docs**: http://localhost:8000/docs


## 📁 Estructura


```bash

rag/

├── core/          # Motor RAG

├── api/           # Servidor FastAPI

├── scripts/       # Utilidades

├── docs/          # Documentación

├── config/        # Configuración

├── data/          # PDFs filosóficos

└── chroma/        # Base de datos

```


## 📊 API Endpoints


### `POST /generate-dilemma`


```json

{

  "topic": "Temporalidad Moral",

  "intensity": "Medio",

  "user_context": "Usuario empático"

}

```


## 🎯 Tópicos

- **Temporalidad Moral**: Responsabilidad futuras

- **Alteridad Radical**: Reconocimiento del "Otro"

- **Imperativo de Universalización**: Coherencia moral


**Intensidades**: Suave, Medio, Extremo


## 📚 Documentación Detallada


- [`RAG.md`](./RAG.md) - Sistema RAG
