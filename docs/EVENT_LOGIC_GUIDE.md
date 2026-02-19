# Herald Event Logic Guide (v2)

## 1. What Counts as an Event?
- **Chapter Releases:** New Markdown chapters inside src/content/library/**.
- **News Posts:** Entries under src/content/news.
- **Dao Table Highlights:** (Scheduled) Markdown donors once the collection exists.

## 2. Event Schema
`	s
interface SectEvent {
  id: string;
  type: 'chapter' | 'news' | 'dao' | 'manual';
  title: string;
  excerpt?: string;
  metadata: {
    author?: string;
    date: string; // ISO string
  };
  image?: string;
  url: string;
  publishDate: string;
}
`

## 3. Generation Flow
1. Authors commit Markdown.
2. 
pm run forge scans all sources and produces/updates src/content/carousel/*.md files.
3. src/pages/index.astro reads the carousel collection, applies filtering from settings/control.md, and feeds the hero carousel.

## 4. Tone & Copy
- Keep titles concise (<= 60 chars) and lore-friendly.
- Excerpts should be single sentences; avoid promising multilingual features or Discord drops.
- Metadata dates must be ISO strings so the filtering logic can enforce retention windows.

## 5. Manual Cards
- If an announcement does not map to an existing collection, create a Markdown file with 	ype: "manual" so the system treats it consistently.
- Remove manual cards once their information is stale.
