# Workflow Operacional Extendido (The Celestial Engine)

Este documento describe la coreografía técnica entre la Web, Discord, las Redes Sociales y la IA.

## 1. Diagrama de Flujo Lógico

```text
[CREADOR (TÚ)] 
      |
      +---> [GITHUB REPO] <--- (Push Chapter.md / Edit donors.json)
      |          |
      |          v
      |   [GITHUB ACTIONS] (El Motor de Construcción)
      |          |
      |          +--> [GEMINI 3 FLASH API] (Analiza contenido, genera resumen)
      |          |
      |          +--> [DISCORD API] (Extrae links de redes sociales)
      |          |
      |          v
      |   [GENERACIÓN DE SITIO ESTÁTICO (ASTRO)]
      |          |
      |          +--> [ASSETS OPTIMIZER] (Convierte imágenes a WebP)
      |          |
      |          v
      +---> [GITHUB PAGES] (Hosting Final - Entrega al Usuario)
                 |
                 +--> [LECTOR] <--- (Interactúa con Comentarios/LocalStorage)
```

## 2. Detalle de los Ciclos de Vida

### Ciclo A: Publicación de una Novela (Event-Driven)
1. **Acción:** Subes `capitulo-01.md`.
2. **Procesamiento de Evento:** 
   - Astro identifica el archivo y su metadata (Volumen, Novela, Tags).
   - Un script de Node.js envía la metadata a **Gemini 3 Flash**.
   - Gemini genera un **Anuncio de Evento** (Ej: "Nueva adición al Tomo X...").
3. **Resultado:** 
   - Se genera una **Event Card** en el scroll infinito.
   - La tarjeta incluye: Título, Autor, Fecha, Tags y link directo.
   - Discord anuncia el suceso con el formato de "Heraldo".

### Ciclo B: El Scroll Infinito (Chronicles)
1. **Acción:** Publicas un video en TikTok.
2. **Puente:** El bot de Discord (Spirit Guardian) detecta el link en el canal `#puente-social`.
3. **Sincronización:** Cada 6 horas, GitHub Actions "barre" ese canal.
4. **Enriquecimiento:** Se extrae la miniatura del video de TikTok.
5. **Resultado:** El carrusel de la Home muestra el video nuevo sin que hayas tocado el código de la web.

### Ciclo C: La Dao Table (Donaciones)
1. **Acción:** Recibes una donación.
2. **Registro:** Editas `src/data/donors.json` añadiendo el nombre y el rango (Ej: `Sect Elder`).
3. **Actualización:** GitHub Actions reconstruye la web.
4. **Visual:** El nombre del donante aparece con un aura animada en la sección "Dao Table".

## 3. Manejo de Crisis (Resiliencia)
- **Falla de API:** Si Gemini o Discord no responden, el build usa los datos de la última vez (Caché). La web NUNCA se cae.
- **Error de Sintaxis:** Si escribes mal un archivo Markdown, el linter de GitHub Actions detendrá el deploy y te enviará un correo avisándote del error antes de que los usuarios lo vean.
