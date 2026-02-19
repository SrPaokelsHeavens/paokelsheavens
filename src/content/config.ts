import { defineCollection, z } from 'astro:content';

const celestialTierEnum = z.enum([
  'Celestial Body Refining Realm',
  'Celestial Foundation Realm',
  'Celestial Core Realm',
  'Celestial Soul Realm',
  'Celestial Transformation Realm',
  'Celestial Sovereign Realm',
]);

// --- UNIFIED LIBRARY COLLECTION (Novel -> Volume -> Chapter) ---
const library = defineCollection({
  type: 'content',
  schema: z.discriminatedUnion('type', [
    // 1. NOVEL LEVEL (info.md)
    z.object({
      type: z.literal('novel'),
      id: z.string(), 
      title: z.string(),
      description: z.string(),
      author: z.string(),
      status: z.enum(['Ongoing', 'Completed', 'Hiatus']),
      genres: z.array(z.string()),
      cover: z.string(),
      featured: z.boolean().default(false),
    }),
    
    // 2. VOLUME LEVEL (metadata.md)
    z.object({
      type: z.literal('volume'),
      id: z.string(), 
      novel_id: z.string(), 
      vol_number: z.number(),
      title: z.string(),
      description: z.string().optional(),
    }),
    
    // 3. CHAPTER LEVEL (ch-*.md)
    z.object({
      type: z.literal('chapter'),
      id: z.string(), 
      title: z.string(),
      chapter_number: z.number(),
      publishDate: z.string(),
      
      // Relational Links (Ancestors)
      novel_id: z.string(), 
      novel_title: z.string(), 
      
      vol_id: z.string(), 
      vol_number: z.number(), 
      vol_title: z.string(), 
    }),
  ]),
});

// --- CAROUSEL MATERIALIZATION (The Editable Drafts) ---
const carousel = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    image: z.string().optional(),
    url: z.string(),
    type: z.enum(['chapter', 'news', 'manual']),
    publishDate: z.string(),
    sourceId: z.string(), // Link to the original entity
    featured: z.boolean().default(false),
    priority: z.number().default(0),
  }),
});

// --- CELESTIAL CONTROL CENTER (Sovereign Settings) ---
const settings = defineCollection({
  type: 'content',
  schema: z.object({
    // 1. TEMPORAL BOUNDARIES
    chapterDaysOnDisplay: z.number().default(0), // 0 = Never expires
    newsDaysOnDisplay: z.number().default(15),
    autoCleanup: z.boolean().default(false),

    // 2. DENSITY & ORCHESTRATION
    maxTotalCards: z.number().default(15),
    chaptersPerNovel: z.number().default(1),
    newsLimit: z.number().default(0), // 0 = No limit until maxTotalCards

    // 3. PRIORITY & WEIGHTING
    typePriority: z.array(z.enum(['chapter', 'news', 'manual'])).default(['chapter', 'news', 'manual']),
    featuredFirst: z.boolean().default(true),
    priorityList: z.array(z.string()).default([]),

    // 4. BATCHING LOGIC
    groupingBatch: z.boolean().default(true),
    batchTitleFormat: z.string().default('{novel}: {count} New Chapters'),

    // 5. FILTERS
    novelBlacklist: z.array(z.string()).default([]),
    newsCategoryFilter: z.array(z.string()).default(['System', 'Novel', 'Event', 'Community']),

    // 6. FORCE & MAINTENANCE
    forceRebuild: z.boolean().default(false),
    purgeOrphaned: z.boolean().default(true),
  }),
});

// --- NEWS COLLECTION ---
const news = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    publishDate: z.string(),
    category: z.enum(['System', 'Novel', 'Event', 'Community']),
    excerpt: z.string(),
    image: z.string().optional(), // Nueva variable para imagen de internet
    author: z.string().default('Admin'),
  }),
});

// --- DAO TABLE (Recognition Tiers) ---
const dao = defineCollection({
  type: 'content',
  schema: z.object({
    tier: celestialTierEnum,
    name: z.string(),
    epithet: z.string().optional(),
    since: z.string().optional(),
    message: z.string().optional(),
    image: z.string().optional(),
    highlight: z.boolean().default(true),
    order: z.number().optional(),
  }),
});

const daoTableEntries = defineCollection({
  type: 'content',
  schema: z.object({
    alias: z.string(),
    cultivationLevel: z.string(),
    tier: celestialTierEnum,
    joined: z.string().optional(),
    note: z.string().optional(),
    status: z.enum(['active', 'retired', 'archived']).default('active'),
  }),
});

const daoTiers = defineCollection({
  type: 'content',
  schema: z.object({
    tier: celestialTierEnum,
    title: z.string(),
    summary: z.string().default('Tier upcoming.'),
    image: z.string(),
    priority: z.number().default(0),
  }),
});

const sectMembers = defineCollection({
  type: 'content',
  schema: z.object({
    tier: celestialTierEnum,
    alias: z.string(),
    epithet: z.string().optional(),
    focus: z.string().optional(),
    since: z.string().optional(),
    note: z.string().optional(),
    status: z.enum(['active', 'paused']).default('active'),
  }),
});

const daoTable = defineCollection({
  type: 'data',
  schema: z.object({}),
});

export const collections = {
  library,
  news,
  carousel,
  settings,
  dao,
  daoTableEntries,
  daoTiers,
  sectMembers,
  'dao-table': daoTable,
};
