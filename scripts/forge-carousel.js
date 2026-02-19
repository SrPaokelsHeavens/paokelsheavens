import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Paths
const CONTENT_PATH = path.join(process.cwd(), 'src/content');
const CAROUSEL_PATH = path.join(CONTENT_PATH, 'carousel');
const SETTINGS_PATH = path.join(CONTENT_PATH, 'settings');
const REGISTRY_FILE = path.join(SETTINGS_PATH, 'registry.json');
const CONTROL_FILE = path.join(SETTINGS_PATH, 'control.md');
const DAO_PATH = path.join(CONTENT_PATH, 'dao');
const DAO_TABLE_PATH = path.join(CONTENT_PATH, 'daoTableEntries');
const DAO_TIER_PATH = path.join(CONTENT_PATH, 'daoTiers');

function collectMarkdownFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
        const entryPath = path.join(dir, entry);
        const stat = fs.statSync(entryPath);
        if (stat.isDirectory()) {
            results = results.concat(collectMarkdownFiles(entryPath));
        } else if (entry.endsWith('.md')) {
            results.push(entryPath);
        }
    });
    return results;
}

// Ensure directory exists
if (!fs.existsSync(CAROUSEL_PATH)) {
    fs.mkdirSync(CAROUSEL_PATH, { recursive: true });
}

async function forge() {
    console.log('The Forge is heating up...');

    const tierImageMap = new Map();
    if (fs.existsSync(DAO_TIER_PATH)) {
        const tierFiles = collectMarkdownFiles(DAO_TIER_PATH);
        tierFiles.forEach((file) => {
            const { data } = matter(fs.readFileSync(file, 'utf-8'));
            if (data?.tier && data?.image) {
                tierImageMap.set(data.tier, data.image);
            }
        });
    }

    // 1. Load Control Manifest
    if (!fs.existsSync(CONTROL_FILE)) {
        console.error('Control Manifest not found!');
        return;
    }
    const controlContent = fs.readFileSync(CONTROL_FILE, 'utf-8');
    const { data: config } = matter(controlContent);

    // 2. Load Registry
    let registry = { processedIds: [], banishedIds: [], lastSync: '' };
    if (fs.existsSync(REGISTRY_FILE)) {
        registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    }

    // 3. Scan for Sources
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
                                    image: data.cover || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000'
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

    // --- SCAN LEGACY DAO ENTRIES ---
    if (fs.existsSync(DAO_PATH)) {
        const daoFiles = collectMarkdownFiles(DAO_PATH);
        daoFiles.forEach(file => {
            const relativeSlug = path.relative(DAO_PATH, file).replace(/\\/g, '/').replace('.md', '');
            const { data, content } = matter(fs.readFileSync(file, 'utf-8'));
            if (data.highlight === false) return;

            const fallbackExcerpt = data.message || content.split('\n').find(line => line.trim().length > 0) || `Recognition within the ${data.tier}.`;

            sources.push({
                id: `dao-${relativeSlug.replace(/\//g, '-')}`,
                title: `${data.name} – ${data.tier}`,
                excerpt: fallbackExcerpt.trim(),
                date: data.since || new Date().toISOString().split('T')[0],
                url: '/dao-table',
                type: 'manual',
                image: data.image || tierImageMap.get(data.tier) || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000'
            });
        });
    }

    // --- SCAN NEW DAO TABLE ENTRIES ---
    if (fs.existsSync(DAO_TABLE_PATH)) {
        const daoTableFiles = collectMarkdownFiles(DAO_TABLE_PATH);
        daoTableFiles.forEach((file) => {
            const { data, content } = matter(fs.readFileSync(file, 'utf-8'));
            if (data.status && data.status !== 'active') {
                return;
            }
            const preview = data.note || content.split('\n').find((line) => line.trim().length > 0) || 'Dao table contributor.';
            sources.push({
                id: `dao-main-${path.basename(file, '.md')}`,
                title: `${data.alias} – ${data.tier}`,
                excerpt: preview.trim(),
                date: data.joined || new Date().toISOString().split('T')[0],
                url: '/dao-table',
                type: 'manual',
                image: tierImageMap.get(data.tier) || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000'
            });
        });
    }

    // 4. Forge Cards
    let newlyCreated = 0;
    const currentFiles = fs.readdirSync(CAROUSEL_PATH).map(f => f.replace('.md', ''));

    sources.forEach(source => {
        const fileName = `${source.id}.md`;
        const filePath = path.join(CAROUSEL_PATH, fileName);

        const isBanished = registry.processedIds.includes(source.id) && !currentFiles.includes(source.id);

        if (config.forceRebuild || (!currentFiles.includes(source.id) && !isBanished)) {
            const content = `---\nsourceId: "${source.id}"\ntitle: "${source.title}"\nexcerpt: "${source.type === 'chapter' ? `A new chapter has been uploaded: ${source.title} (Vol. ${source.vol}, Ch. ${source.num})` : source.excerpt}"\nimage: "${source.image}"\nurl: "${source.url}"\ntype: "${source.type}"\npublishDate: "${source.date}"\nfeatured: false\npriority: 0\n---\n`;
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

    console.log(`Forge complete. ${newlyCreated} new cards materialized.`);
}

forge().catch(console.error);

