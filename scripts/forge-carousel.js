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
const DAO_MEMBERS_PATH = path.join(CONTENT_PATH, 'dao-table', 'sect-immortal-members');
const IMMORTAL_SPIRITS_PATH = path.join(CONTENT_PATH, 'dao-table', 'table');
const PUBLIC_PATH = path.join(process.cwd(), 'public');
const SITEMAP_FILE = path.join(PUBLIC_PATH, 'sitemap.xml');
const CANONICAL_BASE_URL = 'https://paokelsheavens.asia';
const STATIC_ROUTES = [
    '/',
    '/library',
    '/news',
    '/dao-table',
    '/dao-table/celestial-tiers',
    '/dao-table/sect-immortal-members',
    '/dao-table/immortal-spirits',
    '/community',
    '/donations'
];

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
    const tierEntriesData = [];
    if (fs.existsSync(DAO_TIER_PATH)) {
        const tierFiles = collectMarkdownFiles(DAO_TIER_PATH);
        tierFiles.forEach((file) => {
            const { data } = matter(fs.readFileSync(file, 'utf-8'));
            if (data?.tier && data?.image) {
                tierImageMap.set(data.tier, data.image);
            }
            tierEntriesData.push({ data, file });
        });
    }

    // 1. Load Control Manifest
    if (!fs.existsSync(CONTROL_FILE)) {
        console.error('Control Manifest not found!');
        return;
    }
    const controlContent = fs.readFileSync(CONTROL_FILE, 'utf-8');
    const { data: config } = matter(controlContent);
    const allowedNewsCategories = Array.isArray(config.newsCategoryFilter)
        ? new Set(config.newsCategoryFilter)
        : null;
    const highlightConfig = config.daoHighlights || {};

    // 2. Load Registry
    let registry = { processedIds: [], banishedIds: [], lastSync: '' };
    if (fs.existsSync(REGISTRY_FILE)) {
        registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf-8'));
    }
    registry.processedIds = registry.processedIds || [];
    registry.banishedIds = registry.banishedIds || [];

    // 3. Scan for Sources
    const libraryPath = path.join(CONTENT_PATH, 'library');
    const newsPath = path.join(CONTENT_PATH, 'news');

    let sources = [];
    const novelMetadataMap = new Map();

    // --- SCAN CHAPTERS ---
    if (fs.existsSync(libraryPath)) {
        const novels = fs.readdirSync(libraryPath);
        novels.forEach(novel => {
            if (config.novelBlacklist?.includes(novel)) return;

            const novelDir = path.join(libraryPath, novel);
            if (!fs.statSync(novelDir).isDirectory()) {
                return;
            }

            const indexPath = path.join(novelDir, 'index.md');
            if (fs.existsSync(indexPath)) {
                const { data: novelMeta } = matter(fs.readFileSync(indexPath, 'utf-8'));
                if (novelMeta) {
                    novelMetadataMap.set(novel, novelMeta);
                    if (novelMeta.id) {
                        novelMetadataMap.set(novelMeta.id, novelMeta);
                    }
                }
            }

            const volumes = fs.readdirSync(novelDir);
            volumes.forEach(vol => {
                const volDir = path.join(novelDir, vol);
                if (fs.statSync(volDir).isDirectory()) {
                    const chapters = fs.readdirSync(volDir).filter(f => f.endsWith('.md') && f !== 'metadata.md');
                    chapters.forEach(ch => {
                        const chPath = path.join(volDir, ch);
                        const { data } = matter(fs.readFileSync(chPath, 'utf-8'));
                        if (data.type === 'chapter') {
                            const novelMeta =
                                novelMetadataMap.get(data.novel_id) ||
                                novelMetadataMap.get(novel) ||
                                {};
                            const coverImage =
                                novelMeta.cover ||
                                data.cover ||
                                'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000';

                            sources.push({
                                id: `ch-${novel}-${vol}-${ch.replace('.md', '')}`,
                                title: data.title,
                                novelTitle: novelMeta.title || data.novel_title,
                                novelId: data.novel_id || novelMeta.id || novel,
                                vol: data.vol_number,
                                num: data.chapter_number,
                                date: data.publishDate || new Date().toISOString().split('T')[0],
                                url: `/library/${novel}/${vol}/${ch.replace('.md', '')}`,
                                type: 'chapter',
                                image: coverImage,
                            });
                        }
                    });
                }
            });
        });
    }

    // --- SCAN NEWS ---
    if (fs.existsSync(newsPath)) {
        const newsFiles = fs.readdirSync(newsPath).filter(f => f.endsWith('.md'));
        newsFiles.forEach(file => {
            const filePath = path.join(newsPath, file);
            const { data } = matter(fs.readFileSync(filePath, 'utf-8'));
            if (allowedNewsCategories && data.category && !allowedNewsCategories.has(data.category)) {
                return;
            }
            sources.push({
                id: `news-${file.replace('.md', '')}`,
                title: data.title,
                excerpt: data.excerpt,
                date: data.publishDate,
                url: '/news',
                type: 'news',
                image: data.image || 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1000',
                category: data.category
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
            const contentSnippet = content.split('\n').find((line) => line.trim().length > 0) || '';
            const preview = (contentSnippet && contentSnippet.trim()) || data.note || 'Dao table contributor.';
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

    const sourceMap = new Map(sources.map((entry) => [entry.id, entry]));

    const selectLatest = (entries, dateKey) => {
        if (!entries.length) return null;
        return entries
            .slice()
            .sort((a, b) => {
                const dateA = new Date(a[dateKey] || 0).getTime();
                const dateB = new Date(b[dateKey] || 0).getTime();
                return dateB - dateA;
            })[0];
    };

    const fallbackCard =
        highlightConfig.fallbackCard && highlightConfig.fallbackCard.id
            ? {
                  id: highlightConfig.fallbackCard.id,
                  title: highlightConfig.fallbackCard.title,
                  excerpt: highlightConfig.fallbackCard.excerpt,
                  image: highlightConfig.fallbackCard.image,
                  url: highlightConfig.fallbackCard.url,
                  type: highlightConfig.fallbackCard.type || 'manual',
                  date: highlightConfig.fallbackCard.publishDate || new Date().toISOString().split('T')[0],
                  category: highlightConfig.fallbackCard.category,
              }
            : null;

    const daoHighlights = [];

    const resolveFallbackSource = (entryConfig) => {
        if (entryConfig?.fallbackSourceId && sourceMap.has(entryConfig.fallbackSourceId)) {
            return sourceMap.get(entryConfig.fallbackSourceId);
        }
        return fallbackCard;
    };

    const pushHighlight = (suffix, rawSource, options = {}) => {
        if (!rawSource) return;
        daoHighlights.push({
            id: `dao-highlight-${suffix}`,
            title: rawSource.title || options.title || 'Dao Highlight',
            excerpt: rawSource.excerpt || options.excerpt || 'New Dao update.',
            image: rawSource.image || options.image,
            url: options.url || rawSource.url || '/dao-table',
            type: options.type || rawSource.type || 'manual',
            date: rawSource.date || options.date || new Date().toISOString().split('T')[0],
            category: options.category || rawSource.category,
        });
    };

    // Weekly Contributors (Dao Table Entries)
    if (highlightConfig.weeklyContributors) {
        const latestContributor = selectLatest(
            sources.filter((source) => source.id.startsWith('dao-main-')),
            'date'
        );
        const label = 'Weekly Contributors';
        if (latestContributor) {
            pushHighlight('contributors', latestContributor, {
                url: '/dao-table',
                category: label,
            });
        } else {
            pushHighlight('contributors', resolveFallbackSource(highlightConfig.weeklyContributors), {
                url: '/dao-table',
                category: label,
            });
        }
        // Remove all dao-main entries so only highlight remains
        sources = sources.filter((source) => !source.id.startsWith('dao-main-'));
    }

    // Celestial Tiers
    if (highlightConfig.celestialTiers) {
        const latestTier = tierEntriesData
            .slice()
            .sort((a, b) => (b.data.priority ?? 0) - (a.data.priority ?? 0))[0];
        const label = 'Celestial Tiers';
        if (latestTier) {
            pushHighlight('celestial-tiers', {
                title: latestTier.data.title,
                excerpt: latestTier.data.summary,
                image: latestTier.data.image,
                url: '/dao-table/celestial-tiers',
                date: new Date().toISOString().split('T')[0],
                category: label,
            });
        } else {
            const fallbackSource = resolveFallbackSource(highlightConfig.celestialTiers);
            pushHighlight('celestial-tiers', fallbackSource, {
                url: '/dao-table/celestial-tiers',
                category: label,
            });
        }
    }

    // Sect Immortal Members
    if (highlightConfig.sectImmortalMembers) {
        const memberFiles = fs.existsSync(DAO_MEMBERS_PATH) ? collectMarkdownFiles(DAO_MEMBERS_PATH) : [];
        const members = memberFiles.map((file) => {
            const { data, content } = matter(fs.readFileSync(file, 'utf-8'));
            const snippet = content.split('\n').find((line) => line.trim().length > 0) || '';
            return {
                title: data.alias,
                excerpt: snippet.trim() || data.focus || data.epithet,
                date: data.since,
                image: tierImageMap.get(data.tier),
            };
        });
        const latestMember = selectLatest(members, 'date');
        const label = 'Sect Immortal Members';
        if (latestMember) {
            pushHighlight('sect-members', latestMember, {
                url: '/dao-table/sect-immortal-members',
                category: label,
            });
        } else {
            const fallbackSource = resolveFallbackSource(highlightConfig.sectImmortalMembers);
            pushHighlight('sect-members', fallbackSource, {
                url: '/dao-table/sect-immortal-members',
                category: label,
            });
        }
    }

    // Immortal Spirits
    if (highlightConfig.immortalSpirits) {
        const spiritFiles = fs.existsSync(IMMORTAL_SPIRITS_PATH) ? collectMarkdownFiles(IMMORTAL_SPIRITS_PATH) : [];
        const spirits = spiritFiles.map((file) => {
            const { data, content } = matter(fs.readFileSync(file, 'utf-8'));
            const snippet = content.split('\n').find((line) => line.trim().length > 0) || '';
            return {
                title: data.title || data.alias || 'Immortal Spirit',
                excerpt: snippet.trim() || data.note,
                date: data.since,
            };
        });
        const latestSpirit = selectLatest(spirits, 'date');
        const label = 'Immortal Spirits';
        if (latestSpirit) {
            pushHighlight('immortal-spirits', latestSpirit, {
                url: '/dao-table/immortal-spirits',
                category: label,
            });
        } else {
            const fallbackSource = resolveFallbackSource(highlightConfig.immortalSpirits);
            pushHighlight('immortal-spirits', fallbackSource, {
                url: '/dao-table/immortal-spirits',
                category: label,
            });
        }
    }

    // Merge highlight sources into main list
    if (daoHighlights.length) {
        daoHighlights.forEach((highlight) => {
            sources.push({
                id: highlight.id,
                title: highlight.title,
                excerpt: highlight.excerpt,
                image: highlight.image,
                url: highlight.url,
                type: highlight.type || 'manual',
                date: highlight.date,
                category: highlight.category,
            });
        });
    }

    if (Object.keys(highlightConfig).length > 0) {
        sources = sources.filter((source) => {
            if (source.id.startsWith('dao-highlight-')) return true;
            if (source.id.startsWith('dao-')) return false;
            return true;
        });
    }

    // 4. Forge Cards
    let newlyCreated = 0;
    const banishedSet = new Set(registry.banishedIds);
    const processedSet = new Set();

    const ensureFrontmatter = (source) => {
        const excerpt =
            source.type === 'chapter'
                ? `A new chapter has been uploaded: ${source.title} (Vol. ${source.vol}, Ch. ${source.num})`
                : (source.excerpt || 'New chronicle available.');

        const payload = {
            sourceId: source.id,
            title: source.title,
            excerpt,
            url: source.url,
            type: source.type,
            publishDate: source.date,
            featured: false,
            priority: 0,
        };

        if (source.image) {
            payload.image = source.image;
        }

        if (source.category) {
            payload.category = source.category;
        }

        return matter.stringify('', payload).trim();
    };

    sources.forEach(source => {
        if (banishedSet.has(source.id)) {
            return;
        }

        const fileName = `${source.id}.md`;
        const filePath = path.join(CAROUSEL_PATH, fileName);
        const desired = ensureFrontmatter(source);
        const hasFile = fs.existsSync(filePath);
        const existing = hasFile ? fs.readFileSync(filePath, 'utf-8').trim() : '';

        if (config.forceRebuild || !hasFile || existing !== desired) {
            fs.writeFileSync(filePath, `${desired}\n`, 'utf-8');
            newlyCreated++;
        }
        processedSet.add(source.id);
    });

    if (config.purgeOrphaned || config.autoCleanup) {
        const keepers = processedSet;
        const carouselFiles = fs.readdirSync(CAROUSEL_PATH).filter(f => f.endsWith('.md'));
        carouselFiles.forEach(file => {
            const id = file.replace('.md', '');
            if (!keepers.has(id)) {
                fs.unlinkSync(path.join(CAROUSEL_PATH, file));
            }
        });
    }

    // 5. Update Registry
    registry.processedIds = Array.from(processedSet);
    registry.lastSync = new Date().toISOString();
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2));

    generateSitemap(sources);

    console.log(`Forge complete. ${newlyCreated} new cards materialized.`);
}

function generateSitemap(sourceList) {
    try {
        if (!fs.existsSync(PUBLIC_PATH)) {
            fs.mkdirSync(PUBLIC_PATH, { recursive: true });
        }

        const urlMap = new Map();
        const registerUrl = (rawUrl, date) => {
            if (!rawUrl) return;
            let normalized = rawUrl.trim();
            if (!normalized.startsWith('/')) {
                normalized = `/${normalized}`;
            }
            if (normalized !== '/' && normalized.endsWith('/')) {
                normalized = normalized.slice(0, -1);
            }
            const isoDate = date ? new Date(date).toISOString() : null;
            const existing = urlMap.get(normalized);
            if (!existing || (isoDate && (!existing || isoDate > existing))) {
                urlMap.set(normalized, isoDate);
            }
        };

        STATIC_ROUTES.forEach((route) => registerUrl(route));
        sourceList.forEach((source) => registerUrl(source.url, source.date));

        const nowIso = new Date().toISOString();
        const urlEntries = Array.from(urlMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        const xmlBody = urlEntries
            .map(([route, lastmod]) => {
                const loc = `${CANONICAL_BASE_URL}${route === '/' ? '' : route}`;
                const mod = lastmod || nowIso;
                return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${mod}</lastmod>\n  </url>`;
            })
            .join('\n');

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xmlBody}\n</urlset>\n`;
        fs.writeFileSync(SITEMAP_FILE, xml, 'utf-8');
        console.log(`Sitemap updated with ${urlEntries.length} entries.`);
    } catch (error) {
        console.error('Failed to generate sitemap:', error);
    }
}

forge().catch(console.error);


