// 피드 아이템 — AI가 수집했거나 큐레이터가 직접 던진 것
export interface FeedItem {
  id: string;                    // UUID
  url: string;
  title: string;
  summary: string;               // 한 줄 요약 (카드 접힌 상태에서 표시)
  analysis?: string;             // 상세 팩트 설명 (3-5문장, 구체적 수치·기술 맥락 포함)
  source_origin: string;         // "anthropic.com", "arxiv.org" 등
  found_by: 'ai' | 'curator' | 'dossier';  // 누가 발견했는가
  why_picked?: string;           // 이 신호를 선택한 이유 (큐레이터 맥락 기준)
  memo_ids: string[];            // 연결된 메모
  status: 'unread' | 'read' | 'bookmarked' | 'dismissed';
  created_at: string;
  read_at?: string;
  dossier_ids?: string[];        // 이 아이템이 포함된 도시에 ID들
  // 도시에 인제스트 메타데이터
  item_type?: 'signal' | 'deep_dive';       // 도시에 콘텐츠 유형
  dossier_id?: string;                       // 원본 도시에 ID
  signal_strength?: string;                  // 시그널: noise/weak/moderate/strong/critical
  signal_type?: string;                      // 시그널: research/infrastructure/regulation 등
}

// 큐레이터 메모 — 소스에 대한 생각
export interface Memo {
  id: string;
  content: string;               // 자유 텍스트 (마크다운)
  feed_item_ids: string[];       // 연결된 피드 아이템
  created_at: string;
  updated_at: string;
}

// 소스 프로필 — 진화하는 소스 목록
export interface SourceProfile {
  id: string;
  url_pattern: string;           // "site:anthropic.com/blog" 등
  name: string;                  // "Anthropic Blog"
  status: 'active' | 'suggested' | 'inactive';
  trust_score: number;           // 0-1, 행동에서 계산
  added_by: 'system' | 'curator' | 'ai';
  curator_note?: string;         // 큐레이터의 소스 평가
  stats: SourceStats;
  created_at: string;
  last_active_at: string;
}

export interface SourceStats {
  times_picked: number;          // 피드에 등장 횟수
  times_read: number;            // 큐레이터가 읽은 횟수
  times_memo: number;            // 메모가 달린 횟수
  times_dismissed: number;       // 무시 횟수
}

// 큐레이터 프로필 — AI 행동을 조정하는 학습된 선호
export interface CuratorProfile {
  name: string;
  interests: {
    domains: Record<string, number>;   // "infrastructure": 0.9
    depth_preference: 'shallow' | 'medium' | 'deep';
    hype_sensitivity: 'low' | 'medium' | 'high';
  };
  learned_patterns: {
    likes: string[];
    dislikes: string[];
    connections: string[];
  };
  last_updated: string;
}

// 스토어 타입들
export interface FeedStore {
  items: FeedItem[];
  last_updated: string;
}

export interface MemoStore {
  memos: Memo[];
  last_updated: string;
}

export interface SourceStore {
  sources: SourceProfile[];
  last_updated: string;
}

// 도시에 메타데이터 — 도시에와 피드/메모 연결
export interface DossierMeta {
  id: string;                    // dossier filename without extension (e.g., "dossier-2026-03-02")
  title: string;
  date: string;                  // YYYY-MM-DD
  file: string;                  // HTML filename
  url: string;                   // /output/filename.html
  source_urls: string[];         // URLs of sources used in this dossier
  feed_item_ids: string[];       // Linked feed item IDs
  memo_ids: string[];            // Related memo IDs
  one_liner?: string;            // One-line summary
  created_at: string;
}

export interface DossierIndex {
  dossiers: DossierMeta[];
  last_updated: string;
}

// 어노테이션 — 도시에 페이지의 하이라이트, 메모, 북마크
export interface Annotation {
  id: string;
  dossier_id: string;
  type: 'highlight' | 'memo' | 'bookmark' | 'dismiss';
  selected_text?: string;
  content?: string;
  section_id?: string;
  position: {
    start_path: string;
    start_offset: number;
    end_path: string;
    end_offset: number;
    context_before: string;
    context_after: string;
  } | null;
  feed_item_ids: string[];
  memo_id?: string;
  signal_type?: string;
  created_at: string;
  updated_at: string;
}

export interface AnnotationStore {
  annotations: Annotation[];
  last_updated: string;
}
