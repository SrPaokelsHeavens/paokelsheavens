# PAOKELSHEAVENS — Search Visibility Audit (2026-02-24)

**Snapshot:** commit `117117a2` (savepoint-20260224) built for `paokelsheavens.asia`.  
**Goal:** document the current search posture and outline precise, non-redundant improvements that fit the existing Markdown + Forge workflow.

---

## 1. Discovery & Indexation Signals

| Area | Current State | Risks | Suggested Fix |
| --- | --- | --- | --- |
| Robots | `public/robots.txt` allows crawling but points to `https://srpaokelsheavens.eu.org/sitemap-index.xml` (nonexistent, wrong domain). | Google can’t auto-discover deep routes; sitemap fetch fails. | Generate a real sitemap (see §5) hosted at `https://paokelsheavens.asia/sitemap.xml` and update `robots.txt` accordingly. |
| Sitemaps | None emitted during `astro build`. | New chapters/news rely on random discovery; no freshness hints. | Install `@astrojs/sitemap`, configure with `site: 'https://paokelsheavens.asia/paokelsheavens'` + `base: '/paokelsheavens'`, or output via Forge using the existing source arrays. |
| Search Console | Not yet linked to the new apex domain. | No crawl diagnostics, no manual indexing requests. | Add `paokelsheavens.asia` as a **Domain Property**, verify through DNS, and submit the sitemap after each deployment. |
| URL hygiene | All routes live under `/paokelsheavens/` (per `astro.config.mjs`). | Works for GitHub Pages, but canonical tags still missing (see §2). | Keep base path but surface canonical URLs for both GitHub + custom domain. |

---

## 2. Metadata & Semantic Markup

1. **Page titles / descriptions.**  
   - `BaseLayout.astro` hard-codes a single description for every page (`"Sr.Paokel's Sect Scriptorium..."`).  
   - Chapter/news markdown files already carry rich frontmatter (`title`, `excerpt`, `publishDate`) but it is not injected into `<meta>` tags.  
   **Action:** Pass `description` from each page’s frontmatter into `BaseLayout`; build helper utilities so that `title` equals `Chapter Name | Novel | PKH`.

2. **Canonical + Open Graph tags.**  
   - There is no `<link rel="canonical">`, `og:title`, `og:url`, etc.  
   **Action:** Extend `BaseLayout` to compute canonical URLs using `Astro.site` + `Astro.url` and emit OG/Twitter tags (image fallback may come from chapter cover, news image, or hero art).

3. **Structured data (JSON-LD).**  
   - The project currently renders zero `application/ld+json` blocks.  
   **Action:** Create utilities to output:
     - `BookSeries` for each novel (`src/content/library/<novel>/index.md`).
     - `Chapter` referencing `isPartOf` the series (use `novel_id`, `vol_number`).  
     - `NewsArticle` for each news markdown.  
     - Optional `BreadcrumbList` for `/library → /library/<novel> → chapter`.  
   - Inject the JSON-LD script in each page template (chapters, news, Dao Table subpages).

4. **Navigation copy.**  
   - Hero/DAO sections rely heavily on visuals; there is little descriptive text for Google to parse.  
   **Action:** Ensure each major section contains crawlable paragraphs summarizing the content (e.g., “Weekly Contributors highlights disciples who donated after reading a chapter.”).

---

## 3. Content Architecture & Internal Linking

| Topic | Observations | Improvements |
| --- | --- | --- |
| DAO Highlights | `scripts/forge-carousel.js` now pushes highlight cards, but only `/dao-table` has full copy. | Add short intros on each DAO subpage (Celestial Tiers, Immortal Spirits, etc.) referencing their Markdown sources and linking back to relevant news items. |
| News feed | News markdowns exist, yet the homepage previously filtered them out (fixed via `newsLimit: 4`). | Keep publishing news for every major change (chapters, Dao automation). Link each article to the affected book/DAO section. |
| Library deep links | Chapter cards use `/library/<novel>/<vol>/<chapter>`, but there is no “related chapters/volumes” widget. | Add inline navigation (previous/next chapter, breadcrumbs) so crawlers can traverse the sequence easily. |
| External promotion | Currently no backlinks / share buttons. | Announce releases on forums, Discord, social platforms to build external signals. Even a simple `news` RSS feed helps readers and indexing bots. |

---

## 4. Performance & UX Signals

1. **Images:** Carousel hero images load raw Unsplash originals (1–2 MB). Implement Astro’s `<Image />` or preprocess via an image proxy to generate multiple breakpoints + `loading="lazy"`.
2. **Inline scripts:** `BaseLayout` contains large inline JS blocks (header protection, notification logic) that run every second. Consider moving non-critical routines to `requestIdleCallback` or splitting into hydration islands to minimize blocking time.
3. **Notification prompt:** If push notifications remain disabled, hide the prompt unless the browser supports `Notification.permission`.
4. **Core Web Vitals monitoring:** Set up free monitoring (e.g., Google Analytics 4 + Search Console Core Web Vitals report) once the domain is verified.

---

## 5. Workflow-Friendly Enhancements

1. **Forge-generated sitemap & RSS**  
   - Forge already aggregates chapters, news, DAO entities. Reuse that data to emit:
     - `public/sitemap.xml` (chapters, news, dao subpages, static pages).  
     - `public/rss.xml` (latest chapters/news) for subscribers + Google’s feed discovery.
   - Store the generated files in `public/` during `npm run forge` so builds + GitHub Pages include them automatically.

2. **Per-page SEO metadata in Markdown**  
   - Add optional frontmatter fields (`seoTitle`, `seoDescription`, `ogImage`) to novel, chapter, news markdown.  
   - Update page templates to fall back to defaults when these are not provided.

3. **Release checklist (to document for editors)**  
   1. `npm run forge`  
   2. `npm run build`  
   3. Validate `dist/sitemap.xml` + `robots.txt`  
   4. `git push origin main`  
   5. After deployment, submit sitemap / request indexing in Search Console.

4. **Search Console & Analytics access**  
   - Once verified, grant editor access to the Search Console property and connect GA4 for performance insights.

---

## 6. Priority Roadmap

| Priority | Task | Files Involved | Outcome |
| --- | --- | --- | --- |
| P0 | Generate sitemap + update robots | `astro.config.mjs`, `public/robots.txt`, Forge script | Ensures Google can crawl every page. |
| P0 | Add canonical & OG tags | `src/layouts/BaseLayout.astro` | Prevents duplicate URLs, improves SERP snippets. |
| P1 | Structured data for novels/chapters/news | `src/pages/**/*.astro`, helper in `src/utils/` | Enables rich results and better topic association. |
| P1 | Page-specific meta descriptions | Page templates (library, news, dao) | Boosts click-through rate for queries like “Ultimate Martial Will Chapter 1”. |
| P2 | Image optimization | Carousel component + Astro Image integration | Improves Core Web Vitals & search ranking. |
| P2 | RSS/news automation | Forge + `public/` outputs | Easier syndication, additional discovery vector. |
| P3 | External promotion + backlinks | Community channels | Strengthens authority signals beyond on-site SEO. |

---

### Summary
Your content system (Markdown + Forge) is strong, but Google currently sees a stylish site with little machine-readable context. By fixing discovery plumbing (sitemap + robots), enriching metadata/structured data, and leveraging the existing Forge data to automate SEO assets, you can turn every chapter or Dao ledger update into an immediately discoverable record. The steps above stay within the current workflow and avoid duplicate control systems while meaningfully improving search recognizability.
