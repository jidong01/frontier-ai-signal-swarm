import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import dayjs from 'dayjs';
import Anthropic from '@anthropic-ai/sdk';
import type { Memo, MemoStore, SourceProfile, SourceStore, CuratorProfile, DossierMeta, DossierIndex, FeedItem, Annotation, AnnotationStore } from './types.js';

export class CuratorMemory {
  private memoStore: MemoStore;
  private sourceStore: SourceStore;
  private profile: CuratorProfile;
  private dossierIndex: DossierIndex;
  private annotationStore: AnnotationStore;
  private dataDir: string;
  private loaded = false;
  private anthropic: Anthropic;

  constructor(dataDir = './data/curator') {
    this.dataDir = dataDir;
    this.anthropic = new Anthropic();
    this.memoStore = { memos: [], last_updated: '' };
    this.sourceStore = { sources: [], last_updated: '' };
    this.profile = { name: '', interests: { domains: {}, depth_preference: 'deep', hype_sensitivity: 'high' }, learned_patterns: { likes: [], dislikes: [], connections: [] }, last_updated: '' };
    this.dossierIndex = { dossiers: [], last_updated: '' };
    this.annotationStore = { annotations: [], last_updated: '' };
  }

  async load(): Promise<void> {
    // Load memos
    try {
      const data = await readFile(join(this.dataDir, 'memos.json'), 'utf-8');
      this.memoStore = JSON.parse(data);
    } catch { /* start fresh */ }

    // Load sources
    try {
      const data = await readFile(join(this.dataDir, 'sources.json'), 'utf-8');
      this.sourceStore = JSON.parse(data);
    } catch { /* start fresh */ }

    // Load profile
    try {
      const data = await readFile(join(this.dataDir, 'profile.json'), 'utf-8');
      this.profile = JSON.parse(data);
    } catch { /* start fresh */ }

    // Load dossier index
    try {
      const data = await readFile(join(this.dataDir, 'dossier-index.json'), 'utf-8');
      this.dossierIndex = JSON.parse(data);
    } catch { /* start fresh */ }

    // Load annotations
    try {
      const data = await readFile(join(this.dataDir, 'annotations.json'), 'utf-8');
      this.annotationStore = JSON.parse(data);
    } catch { /* start fresh */ }

    this.loaded = true;
    console.log(`  Curator memory loaded: ${this.memoStore.memos.length} memos, ${this.sourceStore.sources.length} sources, ${this.annotationStore.annotations.length} annotations`);
  }

  // --- Memo CRUD ---

  addMemo(content: string, feedItemIds: string[] = []): Memo {
    const memo: Memo = {
      id: crypto.randomUUID(),
      content,
      feed_item_ids: feedItemIds,
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    };
    this.memoStore.memos.push(memo);
    return memo;
  }

  updateMemo(id: string, content: string): Memo | null {
    const memo = this.memoStore.memos.find(m => m.id === id);
    if (!memo) return null;
    memo.content = content;
    memo.updated_at = dayjs().toISOString();
    return memo;
  }

  getMemos(limit = 50, offset = 0): Memo[] {
    return [...this.memoStore.memos]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(offset, offset + limit);
  }

  getMemo(id: string): Memo | null {
    return this.memoStore.memos.find(m => m.id === id) ?? null;
  }

  // --- Source CRUD ---

  getSources(statusFilter?: 'active' | 'suggested' | 'inactive'): SourceProfile[] {
    let sources = this.sourceStore.sources;
    if (statusFilter) {
      sources = sources.filter(s => s.status === statusFilter);
    }
    return sources.sort((a, b) => b.trust_score - a.trust_score);
  }

  getSource(id: string): SourceProfile | null {
    return this.sourceStore.sources.find(s => s.id === id) ?? null;
  }

  updateSource(id: string, updates: Partial<Pick<SourceProfile, 'status' | 'curator_note' | 'name'>>): SourceProfile | null {
    const source = this.sourceStore.sources.find(s => s.id === id);
    if (!source) return null;
    if (updates.status !== undefined) source.status = updates.status;
    if (updates.curator_note !== undefined) source.curator_note = updates.curator_note;
    if (updates.name !== undefined) source.name = updates.name;
    return source;
  }

  addSource(name: string, urlPattern: string, addedBy: 'curator' | 'ai' = 'curator'): SourceProfile {
    const source: SourceProfile = {
      id: `src-${String(this.sourceStore.sources.length + 1).padStart(3, '0')}`,
      url_pattern: urlPattern,
      name,
      status: addedBy === 'ai' ? 'suggested' : 'active',
      trust_score: 0.5,
      added_by: addedBy,
      stats: { times_picked: 0, times_read: 0, times_memo: 0, times_dismissed: 0 },
      created_at: dayjs().toISOString(),
      last_active_at: dayjs().toISOString(),
    };
    this.sourceStore.sources.push(source);
    return source;
  }

  // --- Source Stats & Trust ---

  updateSourceStats(sourceId: string, action: 'picked' | 'read' | 'memo' | 'dismissed'): void {
    const source = this.sourceStore.sources.find(s => s.id === sourceId);
    if (!source) return;

    const key = `times_${action}` as keyof typeof source.stats;
    source.stats[key]++;
    source.last_active_at = dayjs().toISOString();
    this.recalculateTrustScore(source);
  }

  // Find source by URL match
  findSourceByUrl(url: string): SourceProfile | null {
    return this.sourceStore.sources.find(s => {
      const pattern = s.url_pattern.replace('site:', '');
      return url.includes(pattern);
    }) ?? null;
  }

  private recalculateTrustScore(source: SourceProfile): void {
    const { times_picked, times_read, times_memo, times_dismissed } = source.stats;
    const denom = times_picked + 1;
    source.trust_score = Math.max(0, Math.min(1,
      (times_read * 0.3 + times_memo * 0.5 + times_picked * 0.1) / denom
      - (times_dismissed * 0.3 / denom)
    ));
  }

  // --- Profile ---

  getProfile(): CuratorProfile {
    return this.profile;
  }

  getFilteringContext(): string {
    const { likes, dislikes } = this.profile.learned_patterns;
    const parts: string[] = [];
    if (likes.length > 0) parts.push(`이 큐레이터는 다음을 중시합니다: ${likes.join(', ')}`);
    if (dislikes.length > 0) parts.push(`다음은 피합니다: ${dislikes.join(', ')}`);
    parts.push(`깊이 선호: ${this.profile.interests.depth_preference}, 과대포장 민감도: ${this.profile.interests.hype_sensitivity}`);
    return parts.join('. ');
  }

  // --- Feedback Learning ---

  learnFromFeedback(item: FeedItem, action: 'bookmarked' | 'dismissed'): void {
    const LEARNING_RATE = 0.05;

    // 1. Update domain weights from signal_type
    if (item.signal_type) {
      const types = item.signal_type.split(/\s*[\/,]\s*/);
      for (const rawType of types) {
        const type = rawType.trim().toLowerCase();
        if (type && type in this.profile.interests.domains) {
          const current = this.profile.interests.domains[type];
          if (action === 'bookmarked') {
            this.profile.interests.domains[type] = Math.min(1, current + LEARNING_RATE);
          } else {
            this.profile.interests.domains[type] = Math.max(0, current - LEARNING_RATE);
          }
        }
      }
    }

    // 2. Track bookmarked titles as recent interests
    if (action === 'bookmarked' && item.title) {
      if (!this.profile.learned_patterns.connections.includes(item.title)) {
        this.profile.learned_patterns.connections.push(item.title);
        if (this.profile.learned_patterns.connections.length > 20) {
          this.profile.learned_patterns.connections.shift();
        }
      }
    }

    this.profile.last_updated = dayjs().toISOString();
  }

  getCuratorBrief(): string {
    const sortedDomains = Object.entries(this.profile.interests.domains)
      .sort(([, a], [, b]) => b - a);

    const parts: string[] = [];
    parts.push(`큐레이터: ${this.profile.name}`);
    parts.push(`관심 도메인: ${sortedDomains.slice(0, 5).map(([k, v]) => `${k}(${(v * 100).toFixed(0)}%)`).join(', ')}`);
    parts.push(`깊이: ${this.profile.interests.depth_preference}, 과대포장 민감도: ${this.profile.interests.hype_sensitivity}`);

    const { likes, dislikes, connections } = this.profile.learned_patterns;
    if (connections.length > 0) parts.push(`최근 관심 주제: ${connections.slice(-5).join(', ')}`);
    if (likes.length > 0) parts.push(`선호: ${likes.join(', ')}`);
    if (dislikes.length > 0) parts.push(`비선호: ${dislikes.join(', ')}`);

    return parts.join('\n');
  }

  // --- Dossier Index ---

  getDossiers(): DossierMeta[] {
    return [...this.dossierIndex.dossiers].sort((a, b) => b.date.localeCompare(a.date));
  }

  getDossier(id: string): DossierMeta | null {
    return this.dossierIndex.dossiers.find(d => d.id === id) ?? null;
  }

  addDossier(meta: Omit<DossierMeta, 'feed_item_ids' | 'memo_ids'>): DossierMeta {
    const existing = this.dossierIndex.dossiers.find(d => d.id === meta.id);
    if (existing) {
      // Update existing
      existing.title = meta.title;
      existing.source_urls = meta.source_urls;
      existing.one_liner = meta.one_liner;
      return existing;
    }

    const dossier: DossierMeta = {
      ...meta,
      feed_item_ids: [],
      memo_ids: [],
    };
    this.dossierIndex.dossiers.push(dossier);
    return dossier;
  }

  linkDossierToFeedItems(dossierId: string, feedItemIds: string[]): void {
    const dossier = this.dossierIndex.dossiers.find(d => d.id === dossierId);
    if (!dossier) return;
    dossier.feed_item_ids = [...new Set([...dossier.feed_item_ids, ...feedItemIds])];
  }

  linkDossierToMemos(dossierId: string, memoIds: string[]): void {
    const dossier = this.dossierIndex.dossiers.find(d => d.id === dossierId);
    if (!dossier) return;
    dossier.memo_ids = [...new Set([...dossier.memo_ids, ...memoIds])];
  }

  // Find dossiers that used a specific URL
  findDossiersForUrl(url: string): DossierMeta[] {
    return this.dossierIndex.dossiers.filter(d =>
      d.source_urls.some(sUrl => url.includes(sUrl) || sUrl.includes(url))
    );
  }

  // --- Annotation CRUD ---

  addAnnotation(data: Omit<Annotation, 'id' | 'created_at' | 'updated_at' | 'feed_item_ids' | 'memo_id'>): Annotation {
    const annotation: Annotation = {
      ...data,
      id: crypto.randomUUID(),
      feed_item_ids: [],
      created_at: dayjs().toISOString(),
      updated_at: dayjs().toISOString(),
    };

    // Auto-create linked Memo if content is provided
    if (data.content) {
      const memo = this.addMemo(data.content);
      annotation.memo_id = memo.id;
    }

    // Auto-link to dossier's feed items
    const dossier = this.getDossier(data.dossier_id);
    if (dossier) {
      annotation.feed_item_ids = [...dossier.feed_item_ids];
    }

    this.annotationStore.annotations.push(annotation);
    this.learnFromAnnotation(annotation);
    return annotation;
  }

  getAnnotationsForDossier(dossierId: string): Annotation[] {
    return this.annotationStore.annotations
      .filter(a => a.dossier_id === dossierId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }

  getAnnotation(id: string): Annotation | null {
    return this.annotationStore.annotations.find(a => a.id === id) ?? null;
  }

  updateAnnotation(id: string, content: string): Annotation | null {
    const ann = this.annotationStore.annotations.find(a => a.id === id);
    if (!ann) return null;
    ann.content = content;
    ann.updated_at = dayjs().toISOString();
    // Update linked memo if exists
    if (ann.memo_id) {
      this.updateMemo(ann.memo_id, content);
    }
    return ann;
  }

  deleteAnnotation(id: string): boolean {
    const idx = this.annotationStore.annotations.findIndex(a => a.id === id);
    if (idx === -1) return false;
    this.annotationStore.annotations.splice(idx, 1);
    return true;
  }

  getAnnotationStats(): { total: number; by_type: Record<string, number>; by_dossier: Record<string, number> } {
    const anns = this.annotationStore.annotations;
    const by_type: Record<string, number> = {};
    const by_dossier: Record<string, number> = {};
    for (const a of anns) {
      by_type[a.type] = (by_type[a.type] || 0) + 1;
      by_dossier[a.dossier_id] = (by_dossier[a.dossier_id] || 0) + 1;
    }
    return { total: anns.length, by_type, by_dossier };
  }

  // --- Learning from annotations ---

  learnFromAnnotation(annotation: Annotation): void {
    const LEARNING_RATE = 0.05;

    if (annotation.signal_type) {
      const types = annotation.signal_type.split(/\s*[\/,]\s*/);
      for (const rawType of types) {
        const type = rawType.trim().toLowerCase();
        if (type && type in this.profile.interests.domains) {
          const current = this.profile.interests.domains[type];
          if (annotation.type === 'dismiss') {
            this.profile.interests.domains[type] = Math.max(0, current - LEARNING_RATE);
          } else {
            this.profile.interests.domains[type] = Math.min(1, current + LEARNING_RATE);
          }
        }
      }
    }

    if ((annotation.type === 'highlight' || annotation.type === 'bookmark') && annotation.selected_text) {
      const snippet = annotation.selected_text.slice(0, 60);
      if (!this.profile.learned_patterns.connections.includes(snippet)) {
        this.profile.learned_patterns.connections.push(snippet);
        if (this.profile.learned_patterns.connections.length > 30) {
          this.profile.learned_patterns.connections.shift();
        }
      }
    }

    this.profile.last_updated = dayjs().toISOString();
  }

  /**
   * Interpret an annotation with Claude (Haiku) and update the profile
   * with semantically meaningful insights — not raw text.
   * Runs asynchronously in the background; never throws.
   */
  async interpretAndLearn(annotation: Annotation): Promise<void> {
    if (!annotation.selected_text && !annotation.content) return;

    const text = annotation.selected_text || annotation.content || '';
    const annotationType = annotation.type;

    const prompt = `큐레이터가 AI 트렌드 도시에(dossier)를 읽다가 다음 텍스트를 "${annotationType}" 했습니다.

텍스트: "${text}"

큐레이터의 현재 프로필:
${this.getCuratorBrief()}

이 행동이 드러내는 것을 분석하여 JSON으로만 응답하세요. 설명 없이 JSON만:
{
  "domain_adjustments": { "도메인명": 숫자 },
  "new_like": "이 행동이 드러내는 선호 패턴 (없으면 null)",
  "new_dislike": "이 행동이 드러내는 비선호 패턴 (없으면 null, dismiss일 때만)",
  "connection_summary": "이 관심사를 한 문장으로 요약 (15자 이내)",
  "interpretation": "이 하이라이트/행동이 드러내는 관심사를 1문장으로"
}

규칙:
- domain_adjustments: ${annotationType === 'dismiss' ? '관련 도메인 -0.03 ~ -0.07' : '관련 도메인 +0.03 ~ +0.07'}
- 도메인은 architecture, agent_engineering, infrastructure, research, opensource, product, ecosystem, capital, regulation, talent 중에서만
- connection_summary는 개별 뉴스 제목이 아니라 추상화된 관심 패턴
- dismiss면 new_like는 null, bookmark/highlight면 new_dislike는 null`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{ role: 'user', content: prompt }],
      });

      const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return;

      const result = JSON.parse(jsonMatch[0]) as {
        domain_adjustments: Record<string, number>;
        new_like: string | null;
        new_dislike: string | null;
        connection_summary: string;
        interpretation: string;
      };

      // Apply domain adjustments
      for (const [domain, delta] of Object.entries(result.domain_adjustments)) {
        if (domain in this.profile.interests.domains) {
          const current = this.profile.interests.domains[domain];
          this.profile.interests.domains[domain] = Math.max(0, Math.min(1, current + delta));
        }
      }

      // Add new like
      if (result.new_like && !this.profile.learned_patterns.likes.includes(result.new_like)) {
        this.profile.learned_patterns.likes.push(result.new_like);
        if (this.profile.learned_patterns.likes.length > 20) {
          this.profile.learned_patterns.likes.shift();
        }
      }

      // Add new dislike
      if (result.new_dislike && !this.profile.learned_patterns.dislikes.includes(result.new_dislike)) {
        this.profile.learned_patterns.dislikes.push(result.new_dislike);
        if (this.profile.learned_patterns.dislikes.length > 20) {
          this.profile.learned_patterns.dislikes.shift();
        }
      }

      // Add semantically summarized connection (replaces raw text)
      if (result.connection_summary) {
        if (!this.profile.learned_patterns.connections.includes(result.connection_summary)) {
          this.profile.learned_patterns.connections.push(result.connection_summary);
          if (this.profile.learned_patterns.connections.length > 30) {
            this.profile.learned_patterns.connections.shift();
          }
        }
      }

      this.profile.last_updated = dayjs().toISOString();
      await this.saveProfile();

      console.log(`  [CuratorMemory] interpretAndLearn: ${result.interpretation}`);
    } catch (err) {
      // Never crash — interpretation is best-effort
      console.warn(`  [CuratorMemory] interpretAndLearn failed (non-fatal):`, err instanceof Error ? err.message : err);
    }
  }

  async saveAnnotations(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    this.annotationStore.last_updated = dayjs().toISOString();
    await writeFile(join(this.dataDir, 'annotations.json'), JSON.stringify(this.annotationStore, null, 2), 'utf-8');
  }

  async saveDossierIndex(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    this.dossierIndex.last_updated = dayjs().toISOString();
    await writeFile(join(this.dataDir, 'dossier-index.json'), JSON.stringify(this.dossierIndex, null, 2), 'utf-8');
  }

  // --- Save ---

  async saveMemos(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    this.memoStore.last_updated = dayjs().toISOString();
    await writeFile(join(this.dataDir, 'memos.json'), JSON.stringify(this.memoStore, null, 2), 'utf-8');
  }

  async saveSources(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    this.sourceStore.last_updated = dayjs().toISOString();
    await writeFile(join(this.dataDir, 'sources.json'), JSON.stringify(this.sourceStore, null, 2), 'utf-8');
  }

  async saveProfile(): Promise<void> {
    await mkdir(this.dataDir, { recursive: true });
    await writeFile(join(this.dataDir, 'profile.json'), JSON.stringify(this.profile, null, 2), 'utf-8');
  }

  async saveAll(): Promise<void> {
    await Promise.all([this.saveMemos(), this.saveSources(), this.saveDossierIndex(), this.saveAnnotations(), this.saveProfile()]);
  }

  // --- Stats ---

  getStats() {
    const activeSources = this.sourceStore.sources.filter(s => s.status === 'active').length;
    const suggestedSources = this.sourceStore.sources.filter(s => s.status === 'suggested').length;
    return {
      total_memos: this.memoStore.memos.length,
      total_sources: this.sourceStore.sources.length,
      active_sources: activeSources,
      suggested_sources: suggestedSources,
      total_dossiers: this.dossierIndex.dossiers.length,
      total_annotations: this.annotationStore.annotations.length,
    };
  }
}
