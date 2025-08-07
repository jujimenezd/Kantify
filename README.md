# Kantify

**Aplicación web interactiva para reflexión ética basada en filosofía kantiana**

## 🎯 Descripción del Proyecto

Kantify es una aplicación web que aplica el experimento de universalización de Kant para ayudar a los usuarios a reflexionar sobre las consecuencias éticas globales de sus decisiones cotidianas. La plataforma presenta dilemas éticos interactivos y genera retroalimentación personalizada usando el principio "¿Qué pasaría si todos hicieran esto?" .

## ✨ Características Principales

### 🔒 Privacidad Total
- **Sesiones 100% anónimas**: Sin recolección de datos personales 
- **Persistencia local**: Datos almacenados únicamente en localStorage del navegador  

### 🎭 Dilemas Éticos Interactivos
- **6 tópicos filosóficos**: Temporalidad Moral, Alteridad Radical, Imperativo de Universalización, Ontología de la Ignorancia, Economía Moral del Deseo, Microética Cotidiana 
- **3 niveles de intensidad**: Suave, Medio, Extremo
- **Respuestas matizadas**: Sistema de sliders para capturar posiciones éticas complejas

### 🤖 IA Filosóficamente Fundamentada
- **Generación RAG**: Dilemas basados en textos de Kant, Levinas, Bauman, Butler y Jonas 
- **Narrativas kantianas**: Retroalimentación inmediata usando Google Genkit y Gemini 
- **Fundamentación filosófica**: Cada dilema incluye base teórica y fuentes utilizadas

### 📊 Perfil Ético Personalizado
- **Análisis de respuestas**: Generación automática de perfil basado en decisiones 
- **Exportación PDF**: Descarga de perfil ético anónimo 

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 14 con App Router, TypeScript, Tailwind CSS 
- **IA**: Google Genkit con Gemini para narrativas, OpenAI GPT para generación RAG 
- **Backend**: FastAPI para sistema RAG 
- **Base de Datos**: ChromaDB para embeddings vectoriales 
- **Estado**: React Context API para gestión global 

### Componentes Principales
- **HomePage** (/): Página de bienvenida y explicación del concepto 
- **DilemmasPage** (/dilemmas): Interfaz principal de interacción con dilemas
- **ProfilePage** (/profile): Visualización y exportación del perfil ético

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Python 3.8+
- Claves API: Google AI (Gemini) y OpenAI

### Configuración del Frontend

```bash
# Clonar repositorio
git clone https://github.com/jujimenezd/kantify.git
cd kantify

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu GOOGLE_API_KEY
```


### Configuración del Sistema RAG

```bash
# Navegar al directorio RAG
cd rag

# Instalar dependencias Python
pip install -e .
pip install -r config/requirements_api.txt

# Configurar OpenAI API Key
echo "OPENAI_API_KEY=tu_clave_aqui" > .env

# Crear base de datos vectorial
python core/create_database.py
```



### Ejecución

```bash
# Terminal 1: Iniciar servidor RAG
cd rag
python scripts/start_server.py

# Terminal 2: Iniciar aplicación Next.js
npm run dev

# Terminal 3 (opcional): Modo desarrollo Genkit
npm run genkit:dev
```
La aplicación estará disponible en http://localhost:9002

## 🧪 Testing

### Pruebas del Sistema RAG

```bash
cd rag
python scripts/test_rag.py        # Pruebas por CLI
python scripts/test_api.py        # Pruebas por CLI
```


### Endpoints Disponibles
- **RAG API**: http://localhost:8000
- **Documentación**: http://localhost:8000/docs

## 📁 Estructura del Proyecto
```bash
kantify/
├── src/
│   ├── app/                 # Páginas Next.js
│   ├── components/          # Componentes React
│   ├── contexts/           # Gestión de estado global
│   ├── lib/                # Utilidades y tipos
│   ├── ai/flows/           # Flujos Genkit
│   └── data/               # Datos estáticos
├── rag/
│   ├── core/               # Motor RAG
│   ├── api/                # Servidor FastAPI
│   ├── data/               # PDFs filosóficos
│   └── docs/               # Documentación técnica
└── public/                 # Assets estáticos
```


## 🎯 Flujo de Usuario

1. **Bienvenida**: Introducción al concepto en la página principal
2. **Reflexión**: Interacción con dilemas éticos usando sliders
3. **Narrativa**: Recepción de retroalimentación kantiana personalizada
4. **Perfil**: Generación y exportación del perfil ético

## 📚 Documentación Técnica

- [Sistema RAG](rag/docs/RAG.md): Documentación completa del backend
- [API FastAPI](rag/docs/API.md): Endpoints y integración

## 🤝 Contribución

Para contribuir:

1. Fork del repositorio
2. Crear rama feature (git checkout -b feature/nueva-funcionalidad)
3. Commit cambios (git commit -am 'Agregar nueva funcionalidad')
4. Push a la rama (git push origin feature/nueva-funcionalidad)
5. Crear Pull Request

## 📄 Licencia

MIT licence
