import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdir, stat as fsStat } from 'fs/promises';
import { CuratorMemory } from './curator-memory.js';
import { FeedManager } from './feed-manager.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = 3847;

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Initialize data layer ---
  const memory = new CuratorMemory('./data/curator');
  await memory.load();
  const feed = new FeedManager(memory, './data/curator');
  await feed.load();

  // --- Static files ---
  app.use(express.static(join(__dirname, 'public')));

  // =========================================================================
  // API: Feed
  // =========================================================================

  // GET /api/feed — List feed items
  app.get('/api/feed', (req, res) => {
    const status = req.query.status as string | undefined;
    const found_by = req.query.found_by as string | undefined;
    const item_type = req.query.item_type as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const filterOpts = {
      status: status as any,
      found_by: found_by as any,
      item_type: item_type as any,
    };

    const items = feed.getItems({ ...filterOpts, limit, offset });
    const filteredTotal = feed.countItems(filterOpts);
    const stats = feed.getStats();

    // Enrich items with dossier linkage
    const enrichedItems = items.map(item => {
      const dossiers = memory.findDossiersForUrl(item.url);
      return {
        ...item,
        dossier_ids: dossiers.map(d => d.id),
      };
    });

    res.json({
      items: enrichedItems,
      counts: {
        all: stats.total,
        unread: stats.unread,
        bookmarked: stats.bookmarked,
      },
      total: filteredTotal,
      totalPages: Math.max(1, Math.ceil(filteredTotal / limit)),
    });
  });

  // POST /api/feed — Add a feed item (curator adds a link)
  app.post('/api/feed', async (req, res) => {
    try {
      const { url, title, summary } = req.body;
      if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
      }

      // Extract origin from URL
      let source_origin = '';
      try {
        source_origin = new URL(url).hostname;
      } catch {
        source_origin = 'unknown';
      }

      const item = feed.addItem({
        url,
        title: title || url,
        summary: summary || '',
        source_origin,
        found_by: 'curator',
      });

      // If summary provided as "thought", also create a memo
      if (summary) {
        const memo = memory.addMemo(summary, [item.id]);
        feed.linkMemo(item.id, memo.id);
        await memory.saveMemos();
      }

      await feed.save();
      res.status(201).json(item);
    } catch (err: any) {
      if (err.message?.includes('Duplicate')) {
        res.status(409).json({ error: err.message });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  });

  // PATCH /api/feed/:id — Update feed item status
  app.patch('/api/feed/:id', async (req, res) => {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'status is required' });
      return;
    }

    const item = feed.updateStatus(req.params.id, status);
    if (!item) {
      res.status(404).json({ error: 'Feed item not found' });
      return;
    }

    await Promise.all([feed.save(), memory.saveSources(), memory.saveProfile()]);
    res.json(item);
  });

  // =========================================================================
  // API: Memos
  // =========================================================================

  // GET /api/memos — List memos
  app.get('/api/memos', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const memos = memory.getMemos(limit, offset);
    res.json({ memos, total: memory.getStats().total_memos });
  });

  // POST /api/memos — Create a memo
  app.post('/api/memos', async (req, res) => {
    const { content, feed_item_ids } = req.body;
    if (!content) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    const memo = memory.addMemo(content, feed_item_ids || []);

    // Link memo to feed items
    if (feed_item_ids) {
      for (const fid of feed_item_ids) {
        feed.linkMemo(fid, memo.id);
      }
    }

    await Promise.all([memory.saveMemos(), feed.save(), memory.saveSources()]);
    res.status(201).json(memo);
  });

  // PATCH /api/memos/:id — Update a memo
  app.patch('/api/memos/:id', async (req, res) => {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    const memo = memory.updateMemo(req.params.id, content);
    if (!memo) {
      res.status(404).json({ error: 'Memo not found' });
      return;
    }

    await memory.saveMemos();
    res.json(memo);
  });

  // =========================================================================
  // API: Sources
  // =========================================================================

  // GET /api/sources — List sources
  app.get('/api/sources', (req, res) => {
    const status = req.query.status as string | undefined;
    const sources = memory.getSources(status as any);
    res.json({ sources });
  });

  // POST /api/sources — Add a source
  app.post('/api/sources', async (req, res) => {
    const { name, url_pattern, curator_note } = req.body;
    if (!name || !url_pattern) {
      res.status(400).json({ error: 'name and url_pattern are required' });
      return;
    }

    const source = memory.addSource(name, url_pattern, 'curator');
    if (curator_note) {
      memory.updateSource(source.id, { curator_note });
    }

    await memory.saveSources();
    res.status(201).json(source);
  });

  // POST /api/sources/auto-register — Bulk register new sources from pipeline
  // Accepts { urls: string[], dossier_id?: string }
  // Extracts hostname → site:hostname pattern, skips duplicates, adds as 'suggested'
  app.post('/api/sources/auto-register', async (req, res) => {
    const { urls, dossier_id } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      res.status(400).json({ error: 'urls array is required' });
      return;
    }

    const added: any[] = [];
    const skipped: string[] = [];

    for (const url of urls) {
      let hostname = '';
      try {
        hostname = new URL(url).hostname;
      } catch {
        skipped.push(url);
        continue;
      }

      const pattern = `site:${hostname}`;
      const existing = memory.findSourceByUrl(hostname);
      if (existing) {
        skipped.push(url);
        continue;
      }

      const name = hostname.replace(/^www\./, '');
      const note = dossier_id ? `발견: ${dossier_id}` : '파이프라인 자동 발견';
      const source = memory.addSource(name, pattern, 'ai');
      memory.updateSource(source.id, { curator_note: note });
      added.push(source);
    }

    if (added.length > 0) await memory.saveSources();
    res.status(201).json({ added, skipped });
  });

  // PATCH /api/sources/:id — Update a source
  app.patch('/api/sources/:id', async (req, res) => {
    const { status, curator_note, name } = req.body;

    const source = memory.updateSource(req.params.id, { status, curator_note, name });
    if (!source) {
      res.status(404).json({ error: 'Source not found' });
      return;
    }

    await memory.saveSources();
    res.json(source);
  });

  // =========================================================================
  // API: Profile & Stats
  // =========================================================================

  // GET /api/profile — Curator profile
  app.get('/api/profile', (req, res) => {
    res.json(memory.getProfile());
  });

  // GET /api/brief — Learned preferences for pipeline integration
  app.get('/api/brief', (req, res) => {
    res.json({
      brief: memory.getCuratorBrief(),
      profile: memory.getProfile(),
    });
  });

  // GET /api/stats — Dashboard stats
  app.get('/api/stats', (req, res) => {
    const feedStats = feed.getStats();
    const memoryStats = memory.getStats();
    res.json({
      feed: feedStats,
      memory: memoryStats,
    });
  });

  // POST /api/reload — 디스크에서 데이터 재로드 (서버 재시작 없이)
  app.post('/api/reload', async (req, res) => {
    try {
      await memory.load();
      await feed.load();
      res.json({ ok: true, message: '데이터 재로드 완료' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // =========================================================================
  // API: Dossiers — list, link, and serve generated dossiers
  // =========================================================================

  const outputDir = join(process.cwd(), 'output');

  // GET /api/dossiers — List dossiers with linked feed items
  app.get('/api/dossiers', async (req, res) => {
    try {
      const files = await readdir(outputDir);
      const indexedDossiers = memory.getDossiers();

      // Build list from files, enriched with index metadata
      const dossiers = [];

      for (const file of files) {
        if (!file.endsWith('.html')) continue;

        const filePath = join(outputDir, file);
        const fileStat = await fsStat(filePath);
        const name = file.replace('.html', '');

        const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
        const date = dateMatch ? dateMatch[1] : fileStat.mtime.toISOString().split('T')[0];

        // Check if we have indexed metadata
        const indexed = indexedDossiers.find(d => d.id === name);

        dossiers.push({
          id: name,
          title: indexed?.title || name,
          date,
          file,
          url: `/output/${file}`,
          size: fileStat.size,
          one_liner: indexed?.one_liner || '',
          source_urls: indexed?.source_urls || [],
          feed_item_ids: indexed?.feed_item_ids || [],
          memo_ids: indexed?.memo_ids || [],
          linked: !!indexed,
        });
      }

      dossiers.sort((a, b) => b.date.localeCompare(a.date));
      res.json({ dossiers });
    } catch {
      res.json({ dossiers: [] });
    }
  });

  // POST /api/dossiers — Register/link a dossier (called by Claude Code after generating)
  app.post('/api/dossiers', async (req, res) => {
    const { id, title, date, file, source_urls, one_liner } = req.body;
    if (!id || !title) {
      res.status(400).json({ error: 'id and title are required' });
      return;
    }

    const meta = memory.addDossier({
      id,
      title,
      date: date || new Date().toISOString().split('T')[0],
      file: file || `${id}.html`,
      url: `/output/${file || id + '.html'}`,
      source_urls: source_urls || [],
      one_liner,
      created_at: new Date().toISOString(),
    });

    // Auto-link: find feed items whose URLs match dossier source_urls
    if (source_urls && source_urls.length > 0) {
      const allItems = feed.getItems({ limit: 1000 });
      const matchingIds = allItems
        .filter(item => source_urls.some((sUrl: string) =>
          item.url.includes(sUrl) || sUrl.includes(item.url)
        ))
        .map(item => item.id);

      if (matchingIds.length > 0) {
        memory.linkDossierToFeedItems(id, matchingIds);
      }
    }

    await memory.saveDossierIndex();
    res.status(201).json(meta);
  });

  // PATCH /api/dossiers/:id/link — Link feed items or memos to a dossier
  app.patch('/api/dossiers/:id/link', async (req, res) => {
    const { feed_item_ids, memo_ids } = req.body;
    const dossierId = req.params.id;

    const dossier = memory.getDossier(dossierId);
    if (!dossier) {
      res.status(404).json({ error: 'Dossier not found in index' });
      return;
    }

    if (feed_item_ids) memory.linkDossierToFeedItems(dossierId, feed_item_ids);
    if (memo_ids) memory.linkDossierToMemos(dossierId, memo_ids);

    await memory.saveDossierIndex();
    res.json(memory.getDossier(dossierId));
  });

  // POST /api/dossiers/:id/ingest — Split dossier into individual feed items
  app.post('/api/dossiers/:id/ingest', async (req, res) => {
    const dossierId = req.params.id;
    const { signals, deep_dives } = req.body;

    if (!signals && !deep_dives) {
      res.status(400).json({ error: 'signals or deep_dives required' });
      return;
    }

    const dossier = memory.getDossier(dossierId);
    if (!dossier) {
      res.status(404).json({ error: 'Dossier not found in index' });
      return;
    }

    const created: any[] = [];

    // Create feed items for signals
    if (signals && Array.isArray(signals)) {
      for (const signal of signals) {
        const item = feed.addItem({
          url: dossier.url + '#signal-' + encodeURIComponent(signal.name || ''),
          title: signal.name || 'Signal',
          summary: signal.summary || '',
          analysis: signal.analysis || '',
          why_picked: signal.why_picked || '',
          source_origin: dossierId,
          found_by: 'dossier',
          item_type: 'signal',
          dossier_id: dossierId,
          signal_strength: signal.strength || '',
          signal_type: signal.type || '',
        });
        created.push(item);
      }
    }

    // Create feed items for deep dives
    if (deep_dives && Array.isArray(deep_dives)) {
      for (let idx = 0; idx < deep_dives.length; idx++) {
        const dd = deep_dives[idx];
        const item = feed.addItem({
          url: dossier.url + '#deep-dive-' + (idx + 1),
          title: '심층 탐구: ' + (dd.title || `#${idx + 1}`),
          summary: dd.summary || '',
          analysis: dd.analysis || '',
          why_picked: dd.why_picked || '',
          source_origin: dossierId,
          found_by: 'dossier',
          item_type: 'deep_dive',
          dossier_id: dossierId,
        });
        created.push(item);
      }
    }

    // Link all created items to the dossier
    const createdIds = created.map(c => c.id);
    memory.linkDossierToFeedItems(dossierId, createdIds);

    await Promise.all([feed.save(), memory.saveDossierIndex()]);

    res.status(201).json({
      dossier_id: dossierId,
      created_count: created.length,
      items: created,
    });
  });

  // Serve output files statically
  app.use('/output', express.static(outputDir));

  // =========================================================================
  // API: Annotations
  // =========================================================================

  // GET /api/annotations — List annotations for a dossier
  app.get('/api/annotations', (req, res) => {
    const dossier_id = req.query.dossier_id as string;
    if (!dossier_id) {
      res.status(400).json({ error: 'dossier_id query parameter is required' });
      return;
    }
    const annotations = memory.getAnnotationsForDossier(dossier_id);
    res.json({ annotations });
  });

  // POST /api/annotations — Create annotation
  app.post('/api/annotations', async (req, res) => {
    const { dossier_id, type, selected_text, content, section_id, position, signal_type } = req.body;
    if (!dossier_id || !type) {
      res.status(400).json({ error: 'dossier_id and type are required' });
      return;
    }

    const annotation = memory.addAnnotation({
      dossier_id,
      type,
      selected_text,
      content,
      section_id,
      position: position || null,
      signal_type,
    });

    await Promise.all([memory.saveAnnotations(), memory.saveMemos(), memory.saveProfile()]);
    res.status(201).json(annotation);

    // Interpret annotation with Claude in background (non-blocking)
    // Updates profile.interests and learned_patterns semantically
    memory.interpretAndLearn(annotation).catch(() => {/* non-fatal */});
  });

  // PATCH /api/annotations/:id — Update annotation content
  app.patch('/api/annotations/:id', async (req, res) => {
    const { content } = req.body;
    if (!content) {
      res.status(400).json({ error: 'content is required' });
      return;
    }

    const annotation = memory.updateAnnotation(req.params.id, content);
    if (!annotation) {
      res.status(404).json({ error: 'Annotation not found' });
      return;
    }

    await Promise.all([memory.saveAnnotations(), memory.saveMemos()]);
    res.json(annotation);
  });

  // DELETE /api/annotations/:id — Delete annotation
  app.delete('/api/annotations/:id', async (req, res) => {
    const success = memory.deleteAnnotation(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Annotation not found' });
      return;
    }

    await memory.saveAnnotations();
    res.status(204).send();
  });

  // GET /api/annotations/stats — Annotation statistics
  app.get('/api/annotations/stats', (req, res) => {
    res.json(memory.getAnnotationStats());
  });

  // =========================================================================
  // Fallback: serve index.html for SPA-like navigation
  // =========================================================================
  app.use((req, res) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/') && !req.path.includes('.')) {
      res.sendFile(join(__dirname, 'public', 'index.html'));
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  });

  // =========================================================================
  // Start
  // =========================================================================
  app.listen(PORT, () => {
    console.log(`\n  Curator Workspace`);
    console.log(`  http://localhost:${PORT}\n`);
    console.log(`  Feed: ${feed.getStats().total} items (${feed.getStats().unread} unread)`);
    console.log(`  Memos: ${memory.getStats().total_memos}`);
    console.log(`  Sources: ${memory.getStats().active_sources} active\n`);
  });
}

startServer().catch(err => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
