# 🧠 Generador de Dilemas Éticos con RAG

## 📖 Descripción

Este sistema utiliza **Retrieval-Augmented Generation (RAG)** para generar dilemas éticos fundamentados en textos filosóficos de:

- **Immanuel Kant** - Fundamentación de la metafísica de las costumbres
- **Emmanuel Levinas** - La huella del otro
- **Zygmunt Bauman** - Miedo líquido
- **Judith Butler** - Vida precaria
- **Hans Jonas** - El principio de responsabilidad

## 🏗️ Arquitectura

```
[Usuario] → [generate_dilemma_rag.py] → [ChromaDB] → [OpenAI GPT] → [Dilema Fundamentado]
```

## 🚀 Configuración

### 1. Instalar dependencias

```bash
pip install langchain langchain-openai chromadb python-dotenv openai
```

### 2. Configurar variables de entorno

Crear archivo `.env` en la carpeta `rag/`:

```env
OPENAI_API_KEY=tu_clave_aqui
```

### 3. Crear base de datos

```bash
python create_database.py
```

## 🧪 Uso

### Modo CLI (Línea de comandos)

```bash
# Ejemplo básico
python generate_dilemma_rag.py "Temporalidad Moral" "Suave"

# Con contexto de usuario
python generate_dilemma_rag.py "Alteridad Radical" "Medio" --context "Usuario empático"
```

### Modo Programático

```python
from generate_dilemma_rag import generate_dilemma_with_rag

resultado = generate_dilemma_with_rag(
    topic="Imperativo de Universalización",
    intensity="Extremo",
    user_context="Usuario con 3 respuestas previas"
)

print(resultado['dilema_texto'])
```

## ✅ Testing

### Prueba rápida

```bash
python test_dilemma_generator.py
```

Este script ejecutará 3 pruebas automatizadas y te mostrará si todo funciona correctamente.

### Prueba manual individual

```bash
python generate_dilemma_rag.py "Temporalidad Moral" "Suave"
```

## 📊 Formato de Salida

```json
{
  "dilema_texto": "¿Texto del dilema generado?",
  "fundamentacion_filosofica": "Explicación de la base filosófica",
  "fuentes_utilizadas": ["Kant", "Levinas"],
  "variable_oculta": "Aspecto ético profundo",
  "topic": "Temporalidad Moral",
  "intensity": "Suave",
  "sources_metadata": ["kant.pdf", "levinas.pdf"]
}
```

## 🎯 Tópicos Soportados

- **Temporalidad Moral**: Responsabilidad por consecuencias futuras
- **Alteridad Radical**: Reconocimiento ético del "Otro"
- **Imperativo de Universalización**: Coherencia de máximas morales

## 🔧 Personalización

### Modificar el prompt

Edita `DILEMMA_GENERATION_TEMPLATE` en `generate_dilemma_rag.py`

### Ajustar búsqueda RAG

Modifica parámetros en `generate_dilemma_with_rag()`:

- `k=4`: Número de documentos a recuperar
- `temperature=0.8`: Creatividad del modelo

## ❗ Troubleshooting

### Error: "No se encontró la carpeta 'chroma'"

**Solución**: Ejecuta `python create_database.py` primero

### Error: "OPENAI_API_KEY no encontrada"

**Solución**: Verifica tu archivo `.env`

### Error: "Dependencias faltantes"

**Solución**: `pip install -r requirements.txt` o instala manualmente

## 🔄 Próximos pasos

1. ✅ **Fase 1 COMPLETADA** - Sistema RAG funcional
2. 🔄 **Fase 2** - API Bridge con Next.js
3. ⏳ **Fase 3** - Integración con frontend
