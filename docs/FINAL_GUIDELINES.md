# Lineamientos Finales de Arquitectura (The Golden Edict)

Este documento es la autoridad final sobre la implementación técnica de "Heaven's Path Web". Cualquier desviación debe ser aprobada por el Consejo de Ancianos (Usuario y Agente).

## 1. Arquitectura del Núcleo (Core)
- **Engine:** Astro 5.0 (Modo Estático).
- **Estilos:** Tailwind CSS v4 (Configuración Dark Mode forzada).
- **Base de Datos:**
  - `src/content/novels/*.md` (Capítulos).
  - `src/content/config.ts` (Definición estricta de esquemas Zod).
  - `src/data/*.json` (Datos volátiles: donantes, redes).

## 2. Protocolos de Automatización (The Automaton)
### A. Frecuencia de Actualización
- **Triggers de Build:**
  - `on: push` (Inmediato al subir capítulos/cambios).
  - `schedule: cron '0 */6 * * *'` (Cada 6 horas para barrido de redes).
### B. Extracción de Datos (Discord Bridge)
- El script de build (`scripts/fetch-socials.js`) consultará la API de Discord.
- **Librerías Permitidas:** `discord.js` (solo REST mode), `metascraper` (para enriquecer links).
- **Fallback:** Si la API falla, el build NO debe romperse; usará la caché anterior.

## 3. Inteligencia Artificial (Gemini 3 Flash)
- **Uso 1 (Build Time):** Generación de "Meta-Descriptions" para SEO y resúmenes de capítulos en el listado.
- **Uso 2 (Runtime - Bot):** Chat interactivo en Discord (alojado externamente).
- **Restricción:** La API Key nunca debe estar en el cliente (navegador).

## 4. Estándares de Código (Code Cultivation)
- **Componentes:** Astro Components (`.astro`) por defecto. React/Svelte solo si es estrictamente necesario para interactividad compleja (ej: el Infinite Scroll).
- **Tipado:** TypeScript estricto.
- **Performance:** Todas las imágenes deben estar en formato `.webp` y procesadas por Astro Assets.

## 5. Plan de Ejecución Inmediata
1. Inicializar Astro.
2. Instalar dependencias (`tailwindcss`, `framer-motion`, `discord.js`).
3. Crear Layout Base (Header, Footer, Fondo).
4. Implementar "Chronicles Stream".
