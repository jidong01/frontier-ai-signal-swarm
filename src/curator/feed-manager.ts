import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dayjs from 'dayjs';
import type { FeedItem, FeedStore } from './types.js';
import type { CuratorMemory } from './curator-memory.js';

export class FeedManager {
  private store: FeedStore;
  private dataDir: string;
  private memory: CuratorMemory;
  private loaded = false;

  constructor(memory: CuratorMemory, dataDir = './data/curator') {
    this.dataDir = dataDir;
    this.memory = memory;
    this.store = { items: [], last_updated: '' };
  }

  async load(): Promise<void> {
    try {
      const data = await readFile(join(this.dataDir, 'feed.json'), 'utf-8');
      this.store = JSON.parse(data);
    } catch { /* start fresh */ }
    this.loaded = true;
    console.log(`  Feed loaded: ${this.store.items.length} items`);
  }

  async save(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    this.store.last_updated = dayjs().toISOString();
    await writeFile(join(this.dataDir, 'feed.json'), JSON.stringify(this.store, null, 2), 'utf-8');
  }

  // --- Feed CRUD ---

  addItem(item: Omit<FeedItem, 'id' | 'created_at' | 'memo_ids' | 'status'>): FeedItem {
    const feedItem: FeedItem = {
      id: crypto.randomUUID(),
      ...item,
      memo_ids: [],
      status: 'unread',
      created_at: dayjs().toISOString(),
    };

    // Check URL duplicate (skip for dossier-sourced items — multiple items may share the same dossier URL)
    if (feedItem.found_by !== 'dossier' && this.store.items.some(existing => existing.url === feedItem.url)) {
      throw new Error(`Duplicate URL: ${feedItem.url}`);
    }

    this.store.items.push(feedItem);

    // Track source stats
    const source = this.memory.findSourceByUrl(feedItem.url);
    if (source) {
      this.memory.updateSourceStats(source.id, 'picked');
    }

    return feedItem;
  }

  getItems(options: {
    status?: FeedItem['status'];
    found_by?: FeedItem['found_by'];
    item_type?: FeedItem['item_type'];
    limit?: number;
    offset?: number;
  } = {}): FeedItem[] {
    let items = [...this.store.items];

    if (options.status) {
      items = items.filter(i => i.status === options.status);
    }
    if (options.found_by) {
      items = items.filter(i => i.found_by === options.found_by);
    }
    if (options.item_type) {
      items = items.filter(i => i.item_type === options.item_type);
    }

    // Sort newest first
    items.sort((a, b) => b.created_at.localeCompare(a.created_at));

    const offset = options.offset ?? 0;
    const limit = options.limit ?? 50;
    return items.slice(offset, offset + limit);
  }

  getItem(id: string): FeedItem | null {
    return this.store.items.find(i => i.id === id) ?? null;
  }

  updateStatus(id: string, status: FeedItem['status']): FeedItem | null {
    const item = this.store.items.find(i => i.id === id);
    if (!item) return null;

    const prevStatus = item.status;
    item.status = status;

    if (status === 'read' && prevStatus === 'unread') {
      item.read_at = dayjs().toISOString();
      const source = this.memory.findSourceByUrl(item.url);
      if (source) this.memory.updateSourceStats(source.id, 'read');
      this.creditDossierSources(item, 'read');
    }

    if (status === 'bookmarked') {
      item.read_at = item.read_at || dayjs().toISOString();
      // Bookmark = strong positive engagement
      const source = this.memory.findSourceByUrl(item.url);
      if (source) this.memory.updateSourceStats(source.id, 'memo');
      this.creditDossierSources(item, 'memo');
      this.memory.learnFromFeedback(item, 'bookmarked');
    }

    if (status === 'dismissed') {
      const source = this.memory.findSourceByUrl(item.url);
      if (source) this.memory.updateSourceStats(source.id, 'dismissed');
      this.creditDossierSources(item, 'dismissed');
      this.memory.learnFromFeedback(item, 'dismissed');
    }

    return item;
  }

  /** For dossier-sourced items, credit the original sources via dossier.source_urls */
  private creditDossierSources(item: FeedItem, action: 'read' | 'memo' | 'dismissed'): void {
    if (item.found_by !== 'dossier' || !item.dossier_id) return;

    const dossier = this.memory.getDossier(item.dossier_id);
    if (!dossier?.source_urls?.length) return;

    for (const sourceUrl of dossier.source_urls) {
      const source = this.memory.findSourceByUrl(sourceUrl);
      if (source) {
        this.memory.updateSourceStats(source.id, action);
      }
    }
  }

  linkMemo(feedItemId: string, memoId: string): void {
    const item = this.store.items.find(i => i.id === feedItemId);
    if (item && !item.memo_ids.includes(memoId)) {
      item.memo_ids.push(memoId);
      // Track source memo
      const source = this.memory.findSourceByUrl(item.url);
      if (source) this.memory.updateSourceStats(source.id, 'memo');
    }
  }

  // Check if URL already exists
  hasUrl(url: string): boolean {
    return this.store.items.some(i => i.url === url);
  }

  // Stats
  getStats() {
    const total = this.store.items.length;
    const unread = this.store.items.filter(i => i.status === 'unread').length;
    const bookmarked = this.store.items.filter(i => i.status === 'bookmarked').length;
    const aiFound = this.store.items.filter(i => i.found_by === 'ai').length;
    const curatorFound = this.store.items.filter(i => i.found_by === 'curator').length;
    const dossierFound = this.store.items.filter(i => i.found_by === 'dossier').length;
    return { total, unread, bookmarked, ai_found: aiFound, curator_found: curatorFound, dossier_found: dossierFound };
  }
}
