# Arquitectura de Datos - Scriptorium Digital

Para un portal de novelas estilo Wuxiaworld en un entorno estático, seguiremos una estructura de **Colecciones Estáticas**.

## 1. Entidades de Información

### A. Serie / Novela (Series)
Es el contenedor principal. Cada serie se define por un archivo de configuración y una carpeta de capítulos.
- **Campos:**
  - `title`: Título de la obra.
  - `slug`: Identificador URL (ej: `el-camino-del-vacio`).
  - `description`: Sinopsis detallada.
  - `author`: Autor original.
  - `translator`: Quién traduce/edita.
  - `status`: [En curso, Pausada, Finalizada].
  - `genres`: Lista de géneros (Xianxia, Wuxia, Seinen, etc.).
  - `tags`: Etiquetas adicionales (Cultivo, Reencarnación, OpMC).
  - `cover`: Ruta a la imagen de portada.

### B. Capítulo (Chapter)
Archivos individuales en formato Markdown (.md).
- **Campos en Frontmatter (Cabecera):**
  - `title`: Nombre del capítulo.
  - `number`: Número de orden.
  - `volume`: Volumen al que pertenece.
  - `publishDate`: Fecha de lanzamiento.
- **Contenido:** Texto plano con soporte para formato rico (itálicas para pensamientos, negritas para habilidades).

### C. Géneros y Categorías
Sistema de filtrado basado en constantes para evitar errores de tipeo.
- **Lista Base:** Cultivo, Artes Marciales, Alquimia, Bestias, Romance, Tragedia.

## 2. Flujo de Información

1. **Entrada de Datos:** Se crea un archivo `.md` en la carpeta correspondiente.
2. **Procesamiento:** El motor (Astro) lee la carpeta `src/content/novels/` y genera automáticamente:
   - La página de la novela.
   - El índice de capítulos.
   - La página de lectura con navegación (Previo/Siguiente).
3. **Búsqueda/Filtros:** Se genera un índice JSON en tiempo de compilación para que el buscador de la web sea instantáneo sin consultar una base de datos.

## 3. Gestión de "Usuarios" (Solución Estática)
Dado que GitHub Pages no permite bases de datos dinámicas:
- **Lectura:** Pública y libre.
- **Progreso de lectura:** Se guardará en el **LocalStorage** del navegador del usuario (sin necesidad de cuenta).
- **Comentarios:** Integración con **Giscus** (usa GitHub Discussions) o **Disqus**.
- **Comunidad:** Widget lateral de Discord para chat en vivo.

## 4. Dao Table (Sistema de Donantes)
Los donantes se gestionarán en un archivo `src/data/donors.json`.
- **Rangos (Tiers):**
  - `Immortal`: Donantes de mayor nivel.
  - `Sect Elder`: Donantes recurrentes.
  - `Core Disciple`: Donantes recientes o semanales.
- **Campos por Donante:** `name`, `rank`, `amount_hidden` (booleano), `message` (opcional).

## 5. Chronicles of the Heavens (Event Stream)
Sistema de agregación de eventos cronológicos.
- **Fuentes:**
  - `internal`: Generado automáticamente de las carpetas de capítulos y noticias.
  - `external`: Archivo `src/data/social_feed.json` para redes sociales.
- **Esquema de Evento:**
  - `type`: [chapter, social, news, update].
  - `platform`: [facebook, tiktok, youtube, web].
  - `title`: Texto breve.
  - `url`: Link al contenido.
  - `timestamp`: Fecha exacta para ordenamiento.

## 6. Donaciones (Pasarelas)
- Enlaces directos a pasarelas externas (PayPal, Ko-fi, Patreon, Crypto Wallets).
