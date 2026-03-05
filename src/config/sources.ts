export interface SourceConfig {
  name: string;
  type: 'announcement' | 'paper' | 'blog' | 'news' | 'release_note' | 'community' | 'regulatory';
  search_queries: string[];
  origin: string;
}

export const AI_SOURCES: SourceConfig[] = [
  {
    name: 'AI Company Announcements',
    type: 'announcement',
    search_queries: [
      'OpenAI announcement 2026',
      'Anthropic Claude release 2026',
      'Google DeepMind announcement 2026',
      'Meta AI Llama release 2026',
      'xAI Grok announcement 2026',
      'Mistral AI release 2026',
    ],
    origin: 'company_announcements'
  },
  {
    name: 'AI Research Papers',
    type: 'paper',
    search_queries: [
      'arxiv AI breakthrough 2026',
      'large language model research paper 2026',
      'transformer architecture new paper 2026',
      'AI alignment research 2026',
    ],
    origin: 'arxiv'
  },
  {
    name: 'Model Releases',
    type: 'release_note',
    search_queries: [
      'new AI model release 2026',
      'LLM benchmark results 2026',
      'foundation model launch 2026',
    ],
    origin: 'model_releases'
  },
  {
    name: 'API Changes',
    type: 'release_note',
    search_queries: [
      'OpenAI API update 2026',
      'Claude API changes 2026',
      'AI API pricing change 2026',
    ],
    origin: 'api_changes'
  },
  {
    name: 'AI Investment News',
    type: 'news',
    search_queries: [
      'AI startup funding 2026',
      'AI investment round 2026',
      'AI company valuation 2026',
      'AI infrastructure investment 2026',
    ],
    origin: 'investment'
  },
  {
    name: 'AI Tech Blogs',
    type: 'blog',
    search_queries: [
      'AI frontier technology blog 2026',
      'LLM scaling laws analysis 2026',
      'AI inference optimization 2026',
    ],
    origin: 'tech_blogs'
  },
  {
    name: 'Developer Community',
    type: 'community',
    search_queries: [
      'AI developer tools update 2026',
      'AI open source community 2026',
      'AI framework release 2026',
    ],
    origin: 'dev_community'
  },
  {
    name: 'Open Source Updates',
    type: 'release_note',
    search_queries: [
      'open source AI model release 2026',
      'hugging face trending model 2026',
      'open weights model 2026',
    ],
    origin: 'opensource'
  }
];
