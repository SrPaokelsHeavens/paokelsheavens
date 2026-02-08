import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Paths
const CONTENT_PATH = path.join(process.cwd(), 'src/content');
const CAROUSEL_PATH = path.join(CONTENT_PATH, 'carousel');
const SETTINGS_PATH = path.join(CONTENT_PATH, 'settings');
const REGISTRY_FILE = path.join(SETTINGS_PATH, 'registry.json');
const CONTROL_FILE = path.join(SETTINGS_PATH, 'control.md');

// Ensure directory exists
if (!fs.existsSync(CAROUSEL_PATH)) {
    fs.mkdirSync(CAROUSEL_PATH, { recursive: true });
}

async function forge() {
    console.log('⚔️  The Forge is heating up...');

    // 1. Load Control Manifest
    if (!fs.existsSync(CONTROL_FILE)) {
        console.error('❌ Control Manifest not found!');
        return;
    }
    const controlContent = fs.readFileSync(CONTROL_FILE, 'utf-8');
    const { data: config } = matter(controlContent);

    // 2. Load Registry
    let registry = { processedIds: [], banishedIds: [], lastSync: "" };
    if (fs.existsSync(REGISTRY_FILE)) {
        registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    }

    // 3. Scan for Sources (Chapters & News)
    const libraryPath = path.join(CONTENT_PATH, 'library');
    const newsPath = path.join(CONTENT_PATH, 'news');

    let sources = [];

    // --- SCAN CHAPTERS ---
    if (fs.existsSync(libraryPath)) {
        const novels = fs.readdirSync(libraryPath);
        novels.forEach(novel => {
            if (config.novelBlacklist?.includes(novel)) return;
            
            const novelDir = path.join(libraryPath, novel);
            if (fs.statSync(novelDir).isDirectory()) {
                const volumes = fs.readdirSync(novelDir);
                volumes.forEach(vol => {
                    const volDir = path.join(novelDir, vol);
                    if (fs.statSync(volDir).isDirectory()) {
                        const chapters = fs.readdirSync(volDir).filter(f => f.endsWith('.md') && f !== 'metadata.md');
                        chapters.forEach(ch => {
                            const chPath = path.join(volDir, ch);
                            const { data } = matter(fs.readFileSync(chPath, 'utf-8'));
                            if (data.type === 'chapter') {
                                sources.push({
                                    id: `ch-${novel}-${vol}-${ch.replace('.md', '')}`,
                                    title: data.title,
                                    novelTitle: data.novel_title,
                                    novelId: data.novel_id,
                                    vol: data.vol_number,
                                    num: data.chapter_number,
                                    date: data.publishDate || new Date().toISOString().split('T')[0],
                                    url: `/library/${novel}/${vol}/${ch.replace('.md', '')}`,
                                    type: 'chapter',
                                    image: (data.novel_id === 'ultimate-martial-will') 
                                           ? 'https://i.ibb.co/wNPbn6R6/Ultimate-martial-will-cover.png' 
                                           : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000'
                                });
                            }
                        });
                    }
                });
            }
        });
    }

    // --- SCAN NEWS ---
    if (fs.existsSync(newsPath)) {
        const newsFiles = fs.readdirSync(newsPath).filter(f => f.endsWith('.md'));
        newsFiles.forEach(file => {
            const filePath = path.join(newsPath, file);
            const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
            sources.push({
                id: `news-${file.replace('.md', '')}`,
                title: data.title,
                excerpt: data.excerpt,
                date: data.publishDate,
                url: '/news',
                type: 'news',
                image: data.image || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1000'
            });
        });
    }

    // 4. Forge Cards
    let newlyCreated = 0;
    const currentFiles = fs.readdirSync(CAROUSEL_PATH).map(f => f.replace('.md', ''));

    sources.forEach(source => {
        const fileName = `${source.id}.md`;
        const filePath = path.join(CAROUSEL_PATH, fileName);

        // Logic: Recreate ONLY if it doesn't exist AND hasn't been banished (or if ForceRebuild is on)
        const isBanished = registry.processedIds.includes(source.id) && !currentFiles.includes(source.id);
        
        if (config.forceRebuild || (!currentFiles.includes(source.id) && !isBanished)) {
            const content = `---
sourceId: "${source.id}"
title: "${source.title}"
excerpt: "${source.type === 'chapter' ? `A new chapter has been uploaded: ${source.title} (Vol. ${source.vol}, Ch. ${source.num})` : source.excerpt}"
image: "${source.image}"
url: "${source.url}"
type: "${source.type}"
publishDate: "${source.date}"
featured: false
priority: 0
---
`;
            fs.writeFileSync(filePath, content);
            newlyCreated++;
            if (!registry.processedIds.includes(source.id)) {
                registry.processedIds.push(source.id);
            }
        }
    });

    // 5. Update Registry
    registry.lastSync = new Date().toISOString();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));

    console.log(`✅ Forge complete. ${newlyCreated} new cards materialized.`);
}

forge().catch(console.error);
