export interface Client {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  brand_colors: { primary: string; secondary: string; accent: string };
  brand_fonts: { heading: string; body: string };
  created_by: string;
  created: string;
  updated: string;
}

export interface MetaConnection {
  id: string;
  client: string;
  platform: 'instagram' | 'facebook';
  page_id: string;
  account_id: string;
  expires_at: string;
  created: string;
}

export interface Post {
  id: string;
  client: string;
  platform: 'instagram' | 'facebook';
  content: string;
  media: string[];
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  meta_post_id?: string;
  created_by: string;
  created: string;
  updated: string;
}

export interface MetricsCache {
  id: string;
  client: string;
  platform: string;
  period_start: string;
  period_end: string;
  data: Record<string, unknown>;
  fetched_at: string;
}
