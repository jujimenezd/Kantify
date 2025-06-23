# 🚀 FastAPI Server para RAG Dilemma Generator

## 📖 Descripción

Servidor FastAPI que expone el sistema RAG de dilemas éticos como API REST para integrar con Next.js.

## 🏗️ Arquitectura

```
[Next.js] → [FastAPI :8000] → [RAG System] → [ChromaDB + OpenAI] → [Dilemas Filosóficos]
```

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
pip install -r config/requirements_api.txt
```

### 2. Iniciar servidor

```bash
python scripts/start_server.py
```

## 🔗 Endpoints

### `GET /`

Health check básico

```json
{ "status": "healthy", "message": "RAG Dilemma API is running" }
```

### `GET /topics`

Obtener tópicos e intensidades disponibles

```json
{
  "topics": [
    "Temporalidad Moral",
    "Alteridad Radical",
    "Imperativo de Universalización"
    "Ontología de la Ignorancia"
    "Economía Moral del Deseo"
    "Microética Cotidiana"

  ],
  "intensities": ["Suave", "Medio", "Extremo"]
}
```

### `POST /generate-dilemma`

Generar dilema ético con fundamentación filosófica

**Request:**

```json
{
  "topic": "Temporalidad Moral",
  "intensity": "Medio",
  "user_context": "Usuario empático con 3 respuestas previas"
}
```

**Response:**

```json
{
  "success": true,
  "dilema_texto": "¿Texto del dilema generado?",
  "fundamentacion_filosofica": "Explicación filosófica...",
  "fuentes_utilizadas": ["Kant", "Jonas"],
  "variable_oculta": "Aspecto ético profundo",
  "topic": "Temporalidad Moral",
  "intensity": "Medio",
  "sources_metadata": ["kant.pdf", "jonas.pdf"],
  "generation_time_ms": 2450.5
}
```

### `GET /docs`

Documentación Swagger UI interactiva

## 🧪 Testing

### Prueba automática completa

```bash
python scripts/test_api.py
```

### Prueba manual con curl

```bash
# Health check
curl http://localhost:8000/

# Generar dilema
curl -X POST http://localhost:8000/generate-dilemma \
  -H "Content-Type: application/json" \
  -d '{"topic": "Temporalidad Moral", "intensity": "Suave"}'
```

## 🌐 Integración con Next.js

### En Next.js API Route

```typescript
// src/app/api/rag-dilemma/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch("http://localhost:8000/generate-dilemma", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return Response.json(await response.json());
}
```

### En Cliente Next.js

```typescript
const response = await fetch("/api/rag-dilemma", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    topic: "Temporalidad Moral",
    intensity: "Medio",
    user_context: "Usuario empático",
  }),
});

const dilemma = await response.json();
```

## 📊 Características

- ✅ **CORS** configurado para Next.js
- ✅ **Validación** automática con Pydantic
- ✅ **Documentación** Swagger automática
- ✅ **Error handling** robusto
- ✅ **Logging** detallado
- ✅ **Async/await** para performance
- ✅ **Health checks** para monitoring

## 🔧 Desarrollo

### Estructura de archivos

```bash
rag/
├── api/                   # Servidor FastAPI y modelos
│   ├── __init__.py        # Inicialización
│   ├── models.py          # Modelos Pydantic
│   ├── routes.py          # Rutas FastAPI
│   └── server.py          # Servidor FastAPI principal
```

### Logs

El servidor genera logs detallados:

```

🎯 Generando dilema: Temporalidad Moral | Medio
✅ Dilema generado exitosamente en 2450.52ms

```

## ❗ Troubleshooting

### Error: `ConnectionError`

**Problema**: Next.js no puede conectar al servidor FastAPI
**Solución**: Verifica que el servidor esté ejecutándose en `localhost:8000`

### Error: `503 Service Unavailable`

**Problema**: ChromaDB no encontrada
**Solución**: `python core/create_database.py`

### Error: `Internal Server Error`

**Problema**: OpenAI API Key no configurada
**Solución**: Verificar archivo `.env`
