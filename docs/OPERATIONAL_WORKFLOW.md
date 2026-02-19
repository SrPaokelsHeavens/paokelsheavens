# Operational Workflow (Celestial Engine v2)

## 1. Flow Overview
`
[Author]
   |
   +--> Edit Markdown / JSON in repo
            |
            v
      [npm run forge]
            |
            v
      [Astro build (static)]
            |
            v
      [dist/ ? GitHub Pages]
`

## 2. Lifecycle Scenarios
### A. Publishing a Chapter
1. Add src/content/library/<novel>/<vol>/ch-*.md with correct frontmatter.
2. Run 
pm run forge to mirror it into the carousel.
3. Verify the chapter reader + hero card locally.
4. Commit both the chapter and generated carousel entry.

### B. Posting News
1. Create a Markdown file under src/content/news.
2. Provide excerpt + image for carousel cards.
3. Forge + build.

### C. Dao Table Update (upcoming)
1. Create a Markdown entry per donor tier.
2. Forge will clone it into the carousel, and the Dao Table page will read from the same collection.

## 3. Resilience
- If orge fails, Astro will not build—fix content before proceeding.
- Avoid runtime network calls; everything required for the build must exist on disk.

## 4. Deployment
- 
pm run build outputs to dist/.
- Deploy to GitHub Pages (manual for now). Once Discord blockers are removed we can restore CI with scheduled builds.

## 5. Contact & Support
- With Discord removed, the only active contact channel is dmin@srpaokelsheavens.eu.org.
- Update this document immediately if we introduce any new governance process.
