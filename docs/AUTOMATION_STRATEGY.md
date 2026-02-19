# Automation Strategy (Discord-Free Roadmap)

## 1. Data Inputs
- **Markdown Collections:** Chapters, news posts, and Dao tiers all live under src/content/**. Commits to these files are the main automation trigger.
- **No Live APIs:** Discord, TikTok, YouTube, and Gemini integrations remain paused. Every automation hook must rely on repo data to avoid deployment blockers.

## 2. Build Hooks
- 
pm run forge scans library/news/dao content and materializes carousel cards. It must succeed before Astro can sync collections.
- 
pm run build runs orge, sets ASTRO_TELEMETRY_DISABLED=1, and compiles the static site into dist/.
- GitHub Actions will be re-enabled after Discord references are fully removed; until then, builds are manual.

## 3. Future-Friendly Notes
- Any new feed (social, announcements, etc.) must write to Markdown first (e.g., src/content/social/*.md). Static builds should never depend on live APIs.
- Cron jobs should remain lightweight (<= every 12h) and only need 
pm ci && npm run build.

## 4. Secrets & Security
- No API keys or tokens belong in this repo. We will document any future secret requirements inside docs/OPERATIONAL_WORKFLOW.md before implementation.
