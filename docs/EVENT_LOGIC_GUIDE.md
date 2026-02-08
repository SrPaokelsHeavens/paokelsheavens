# Guía del Heraldo de Eventos (Event Generation Guide)

Esta guía explica a los desarrolladores cómo se detectan, procesan y renderizan los eventos en la web.

## 1. El Concepto de "Evento"
En esta web, un evento es cualquier cambio significativo:
- **Interno:** Adición/Modificación de capítulos, noticias o la Dao Table.
- **Externo:** Publicaciones en YouTube, TikTok, Facebook detectadas vía Discord Hub.

## 2. Estructura de Datos del Evento (Event Schema)
Cada evento, independientemente de su origen, debe normalizarse a este formato antes de ser renderizado:

```typescript
interface SectEvent {
  id: string;
  type: 'chapter' | 'social' | 'news' | 'donation';
  source: 'web' | 'youtube' | 'tiktok' | 'facebook';
  title: string;       // Generado por Gemini 3 Flash
  metadata: {
    author?: string;
    volume?: string;
    date: string;      // Formato ISO
    tags: string[];
  };
  media?: {
    thumbnail: string; // URL de la miniatura o portada
    type: 'image' | 'video';
  };
  url: string;         // Link a la fuente original
}
```

## 3. Lógica de Gemini 3 Flash (The Herald Prompt)
Para los eventos internos, el prompt de Gemini será:
> "Actúa como el Heraldo de la Secta SrPaokel. He añadido un archivo en la ruta [PATH]. 
> Extrae el contexto y genera un título de anuncio enganchante de máximo 60 caracteres.
> El tono debe ser épico y Dark Fantasy."

## 4. Renderizado (The Scroll Component)
- **Comportamiento:** Scroll infinito bidireccional (CSS Marquee).
- **Interactividad:**
  - El elemento padre es un link (`<a>`).
  - Al hacer click, redirecciona a `event.url`.
  - Efecto `hover`: La tarjeta debe mostrar un resplandor (glow) color Oro Antiguo (`#C5A059`).

## 5. Extracción Externa (YouTube/Social)
- Se utiliza `metascraper` para obtener el título y la imagen de los links externos.
- Si no hay imagen disponible, se usará un placeholder de "Sello de la Secta".
