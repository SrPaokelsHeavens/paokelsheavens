---
# --- THE SOVEREIGN CONTROL MASTER MANIFEST v4 ---
# "The Leader commands, the Scriptorium obeys."

# 1. TEMPORAL BOUNDARIES (Retention)
# -----------------------------------------------------------------------------
chapterDaysOnDisplay: 0   # 0 = Chapters never expire from the carousel
newsDaysOnDisplay: 15     # News is banished after 15 days
autoCleanup: false        # Set to true to physically delete old files from /carousel/

# 2. DENSITY & ORCHESTRATION
# -----------------------------------------------------------------------------
maxTotalCards: 15         # Maximum total cards displayed
chaptersPerNovel: 1       # Show only the last X chapters of each novel
newsLimit: 0              # 0 = No limit for news (filled until maxTotalCards)
displayType: "all"        # "all", "news", or "chapters"

# 3. PRIORITY & WEIGHTING
# -----------------------------------------------------------------------------
typePriority:             # Content appearing first in the logic
  - "chapter"
  - "news"
  - "manual"
featuredFirst: true       # Pull cards with 'featured: true' to the start
priorityList: []          # List of sourceIds to manually pin at the front

# 4. BATCHING LOGIC
# -----------------------------------------------------------------------------
groupingBatch: true       # Combine chapters of the same novel into one card
batchTitleFormat: "{novel}: {count} New Chapters"

# 5. FILTERS
# -----------------------------------------------------------------------------
novelBlacklist: []        # Novel slugs to exclude from auto-generation
newsCategoryFilter:       # Categories allowed to generate news cards
  - "System"
  - "Novel"
  - "Event"
  - "Community"

# 6. MAINTENANCE
# -----------------------------------------------------------------------------
forceRebuild: false       # Set to true to ignore Registry and recreate all cards
purgeOrphaned: true       # Remove Registry entries if original source is deleted
---

# SYSTEM LOG: SOVEREIGN
- Created: 2026-02-08
- Current Status: Awaiting The Forge
