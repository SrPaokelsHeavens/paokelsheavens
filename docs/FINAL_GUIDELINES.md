# Final Architecture Guidelines (The Golden Edict v2)

This revision supersedes the multilingual/Discord-era edict. All contributors must follow the directives below until a new decree is issued.

## 1. Core Stack
- **Framework:** Astro 5.x (static output only).
- **Styling:** Tailwind CSS with dark theme defaults defined in src/styles/global.css.
- **Content Source of Truth:** Markdown collections in src/content/** plus structured JSON (only where Markdown is not yet migrated).
- **Automation Scripts:** scripts/forge-carousel.js (mandatory before every dev/uild), scripts/postinstall-fixes.js (patched during 
pm install).

## 2. Language Policy
- The site is 100% English. Do not add locale toggles, translation dropdowns, or Spanish/Chinese copy.
- Markdown frontmatter must use English enums (e.g., status: "Ongoing").
- Retired i18n news, assets, or branches must not be reintroduced; delete any leftover references when encountered.

## 3. Integrations & Tooling
- **Discord / Gemini / External APIs:** Disabled until we design a compliant flow. Keep scripts/fetch-events.js stubbed and do not add runtime API calls.
- **Images:** Prefer remote HTTPS sources vetted for stability. When adding local assets, convert to WebP and store under public/ or Astro assets.
- **Telemetry:** Remains disabled through ASTRO_TELEMETRY_DISABLED=1 in the build script.

## 4. Content Collections
- Library hierarchy: 
ovel -> volume -> chapter enforced through src/content/config.ts discriminated union.
- Carousel entries are derived, not hand-authored unless absolutely necessary (	ype: "manual"). Run 
pm run forge to regenerate cards after content edits.
- Dao Table is being migrated to Markdown tiers; until it lands, do not add new donors to the JSON file.

## 5. Build & Deployment
- Always execute 
pm run forge (directly or via 
pm run dev/build) prior to verifying UI changes.
- Windows realpath/esbuild patches are handled automatically by postinstall-fixes. Do not upgrade Vite/Esbuild without revalidating those patches.
- GitHub Pages remains the deployment target; CI will later be restored once Discord blockers are gone.

## 6. Quality Gates
- No broken links or placeholder # URLs in committed code.
- Avoid inline scripts that manipulate the DOM outside Astro components unless there is no other option (e.g., TTS reader helper).
- Keep documentation synchronized with reality—if a feature is removed, its governance references must disappear in the same PR.
