import { defineCollection, z } from 'astro:content';

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
      status: z.enum(['En curso', 'Finalizada', 'Pausada']),
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

export const collections = {
  library,
  news,
};
