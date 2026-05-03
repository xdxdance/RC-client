export interface Article {
  id: number;
  title: string;
  url: string;
  author?: string;
  source?: string;
  cover_image?: string;
  content?: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: number;
  article_id?: number;
  type: 'quote' | 'opinion' | 'question' | 'excerpt' | 'idea';
  content: string;
  page_number?: string;
  chapter?: string;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
  created_at: string;
}

export interface ArticleTag {
  article_id: number;
  tag_id: number;
}

export interface NoteTag {
  note_id: number;
  tag_id: number;
}
