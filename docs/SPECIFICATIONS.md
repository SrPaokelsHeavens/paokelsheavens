# Technical & Design Specifications

## 1. Stack
- **Framework:** Astro 5.x (static output).
- **Styling:** Tailwind CSS with custom colors (oid, gold, lood).
- **Hosting:** GitHub Pages.
- **Languages:** English only.

## 2. Palette
- Void (#050505)
- Void Light (#0a0a0b)
- Bone (#D1D1C7)
- Gold (#C5A059)
- Blood (#7F1D1D)

## 3. Typography
- Serif: Cinzel / Playfair (headers, lore).
- Sans: Inter / Roboto (body, UI labels).

## 4. Core Components
- **Hero + Celestial Carousel:** Driven by llEvents computed in src/pages/index.astro.
- **Library Grid & Reader:** Uses Astro content collections + ChapterReader component.
- **News Modal:** Inline template duplication with JavaScript modal.
- **Notifications / Reading Progress:** Lightweight client scripts persisted in LocalStorage.

## 5. Content Requirements
- Every Markdown file must include the schema-required fields; build fails otherwise.
- Images should be remote and reliable; if not, host under public/.
- No translation toggles or bilingual copy.

## 6. Performance Targets
- Keep hero/carousel payload scoped to max 15 cards via settings/control.md.
- Prefer CSS animations over JavaScript when possible.
- Large scripts (reader, carousel) already lazy-initialize; maintain that approach for future widgets.
