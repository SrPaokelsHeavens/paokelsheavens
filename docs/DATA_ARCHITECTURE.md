# Data Architecture – Digital Scriptorium

## 1. Collections & Schemas
- **Library (src/content/library)**
  - 	ype: "novel" frontmatter defines metadata (title, author, status, genres, cover, featured).
  - 	ype: "volume" stores per-volume metadata.
  - 	ype: "chapter" carries relational pointers (
ovel_id, ol_id) plus publish metadata.
- **News (src/content/news)**
  - Markdown entries with 	itle, publishDate, category, excerpt, image, uthor.
- **Dao Table (src/content/dao)**
  - Each Markdown file represents a supporter in one of six tiers (Body Refining ? Sovereign) with fields for name, epithet, message, and optional imagery.
- **Carousel (src/content/carousel)**
  - Generated Markdown cards; do not edit manually unless debugging the forge.
- **Settings (src/content/settings)**
  - control.md frontmatter drives carousel filtering; egistry.json tracks processed IDs.

## 2. Derived Data
- scripts/forge-carousel.js now unifies chapters, news, **and** DAO entries into hero-ready cards.
- Frontmatter fields (highlight, since, etc.) determine whether DAO entries appear in the carousel feed.
- LocalStorage features (reading progress, notification prompt) augment UX but never feed build-time data.

## 3. File vs. JSON
- All donor data moved to Markdown; src/data/donors.json has been retired.
- Add new structured datasets as Markdown collections whenever possible so Astro validates them with Zod.

## 4. Client-Side Storage
- eading-progress-map + last-read keys live in LocalStorage.
- Notifications prompt stores pkh-notification-choice. These are UX conveniences only.

## 5. Contribution Flow
1. Add or edit Markdown under src/content/** (library, news, dao).
2. Run 
pm run forge to refresh carousel drafts.
3. Run 
pm run dev or 
pm run build to validate.
4. Commit both content changes and any generated carousel files together.
