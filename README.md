# Proyecto Kantify

## Resumen del Proyecto
Kantify es una aplicación web interactiva que aplica el experimento de universalización de Kant para ayudar a los usuarios a reflexionar sobre las consecuencias éticas globales de sus decisiones cotidianas.

## Objetivos Clave
1.  **Sesión 100% anónima**: Garantizar la privacidad del usuario sin recolección de datos personales.
2.  **Interacción con Dilemas Éticos**: Presentar preguntas con sliders para respuestas matizadas, cubriendo 6 tópicos éticos.
3.  **Feedback Inmediato y Narrativa**: Proveer una narrativa reflexiva estilo “Y si todos...” basada en IA.
4.  **Perfil Ético Descargable**: Permitir la exportación de un perfil ético anónimo.

## Stack Tecnológico
*   **Framework**: Next.js (con App Router)
*   **Lenguaje**: TypeScript
*   **UI**: React, Tailwind CSS, ShadCN UI Components
*   **Inteligencia Artificial**: Google Genkit (con Gemini) para generación de dilemas y narrativas.
*   **Gestión de Estado (Cliente)**: React Context API
*   **Persistencia de Sesión (Cliente)**: LocalStorage

## Estructura del Proyecto (Next.js)
*   `src/app/`: Rutas principales de la aplicación (inicio, dilemas, perfil).
*   `src/components/`: Componentes React reutilizables (UI, layout).
*   `src/contexts/`: Lógica de estado global del cliente (ej: `AppContext.tsx`).
*   `src/lib/`: Utilidades, tipos TypeScript (`types.ts`).
*   `src/ai/flows/`: Flujos de Genkit predefinidos para la lógica de IA.
*   `src/data/`: Datos estáticos (ej: `corpus_dilemas.json`).
*   `public/`: Archivos estáticos (imágenes, etc.).

## Cómo Empezar
1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/your-username/kantify.git
    cd kantify
    ```
2.  **Crear y activar entorno virtual** (opcional pero recomendado para gestión de Node.js/npm si usas nvm):
    ```bash
    # Ejemplo con nvm
    # nvm use
    ```
3.  **Instalar dependencias**:
    ```bash
    npm install
    # o yarn install
    ```
4.  **Configurar variables de entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto. Necesitarás configurar las credenciales para Google AI (Gemini) si los flujos de Genkit lo requieren para ejecutarse localmente.
    ```env
    GOOGLE_API_KEY=TU_API_KEY_DE_GOOGLE_AI
    # Otras variables si son necesarias para Genkit
    ```
5.  **Correr la aplicación en modo desarrollo**:
    ```bash
    npm run dev
    # o yarn dev
    ```
    La aplicación estará disponible en `http://localhost:9002` (o el puerto que hayas configurado).

6.  **(Opcional) Correr Genkit en modo desarrollo** (si necesitas interactuar directamente con los flujos o ver logs de Genkit):
    Abre otra terminal y ejecuta:
    ```bash
    npm run genkit:dev
    # o npm run genkit:watch para recargar automáticamente
    ```

## Épicas del Proyecto (Conceptuales)
*   **E1: Gestión de Sesión Anónima**: Manejo de sesión de usuario anónima en el cliente.
*   **E2: Interacción Ética y Respuestas**: Presentación de dilemas y captura de respuestas del usuario.
*   **E3: Inteligencia Artificial y Feedback Ético**: Integración con Genkit para generación de dilemas dinámicos y narrativas kantianas.
*   **E4: Backend con API (FastAPI)**: Reemplazado por Server Actions y API Routes de Next.js.
*   **E5: Frontend Interactivo (Streamlit + Plotly)**: Implementado con React, Next.js y componentes ShadCN. Posibles visualizaciones con Recharts (integrado en ShadCN charts) o Plotly.js.

## Metodología Scrum
*   **Duración del Sprint**: 2 semanas.
*   **Ceremonias Clave**:
    *   Daily Standup (15 min).
    *   Sprint Planning (2-4 horas).
    *   Sprint Review (1-2 horas).
    *   Sprint Retrospective (1-1.5 horas).
*   **Definition of Done (Inicial)**:
    1.  Código revisado y fusionado a la rama principal.
    2.  Funcionalidad probada (manual o automáticamente según el caso).
    3.  Cumple con los criterios de aceptación de la Historia de Usuario.
    4.  Documentación actualizada (si aplica).
    5.  No introduce regresiones conocidas.

## Consideraciones sobre la Base de Datos
Para esta versión Next.js, la persistencia de datos del usuario se maneja principalmente en el lado del cliente (`localStorage`) para mantener el anonimato y la simplicidad. El corpus de dilemas se carga desde un archivo JSON.
Si en el futuro se requiere persistencia centralizada (incluso anonimizada para análisis agregado con consentimiento), se podrían considerar bases de datos como Firebase Firestore, Supabase (PostgreSQL) o Neon. SQLite no es una opción común para despliegues de Next.js en producción.

## Próximos Pasos / Enfoque Sprint 0-1 (Ejemplo)
*   **Sprint 0: Configuración y Normas**
    *   Configuración completa del entorno de desarrollo.
    *   Establecimiento de guías de estilo de código y convenciones de Git.
    *   Despliegue inicial básico en una plataforma (ej: Vercel, Firebase Hosting).
*   **Sprint 1: MVP Mínimo Navegable**
    *   (HU-XXX) Implementar la carga y visualización del primer dilema desde el corpus.
    *   (HU-YYY) Permitir respuesta del usuario mediante slider.
    *   (HU-ZZZ) Integrar la generación de la narrativa kantiana para el primer dilema.
    *   (HU-AAA) Flujo básico de navegación entre Inicio, Dilemas y Perfil (mock).

