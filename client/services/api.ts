import AsyncStorage from '@react-native-async-storage/async-storage';

const API_STORAGE_KEY = '@app_config';
let cachedBaseUrl: string | null = null;

export async function getApiBaseUrl(): Promise<string> {
  // 每次都重新读取，不使用缓存
  try {
    const config = await AsyncStorage.getItem(API_STORAGE_KEY);
    if (config) {
      const parsed = JSON.parse(config);
      if (parsed.backendUrl) {
        return parsed.backendUrl;
      }
    }
  } catch (e) {
    console.error('Failed to load API config:', e);
  }
  
  return process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';
}

export function clearApiCache(): void {
  cachedBaseUrl = null;
}

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

// Articles API
export async function fetchArticles(): Promise<Article[]> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles`);
  if (!response.ok) throw new Error('Failed to fetch articles');
  return response.json();
}

export async function fetchArticle(id: number): Promise<Article> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles/${id}`);
  if (!response.ok) throw new Error('Failed to fetch article');
  return response.json();
}

export async function fetchFromUrl(url: string): Promise<Article> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) throw new Error('Failed to fetch from URL');
  return response.json();
}

export async function createArticle(article: Partial<Article>): Promise<Article> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!response.ok) throw new Error('Failed to create article');
  return response.json();
}

export async function updateArticle(id: number, article: Partial<Article>): Promise<Article> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(article),
  });
  if (!response.ok) throw new Error('Failed to update article');
  return response.json();
}

export async function deleteArticle(id: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete article');
}

// Notes API
export async function fetchNotes(articleId?: number): Promise<Note[]> {
  const baseUrl = await getApiBaseUrl();
  const params = articleId ? `?article_id=${articleId}` : '';
  const response = await fetch(`${baseUrl}/api/v1/notes${params}`);
  if (!response.ok) throw new Error('Failed to fetch notes');
  return response.json();
}

export async function fetchNote(id: number): Promise<Note> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/notes/${id}`);
  if (!response.ok) throw new Error('Failed to fetch note');
  return response.json();
}

export async function createNote(note: Partial<Note>): Promise<Note> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return response.json();
}

export async function updateNote(id: number, note: Partial<Note>): Promise<Note> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });
  if (!response.ok) throw new Error('Failed to update note');
  return response.json();
}

export async function deleteNote(id: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/notes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete note');
}

// Tags API
export async function fetchTags(): Promise<Tag[]> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/tags`);
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

export async function createTag(tag: Partial<Tag>): Promise<Tag> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tag),
  });
  if (!response.ok) throw new Error('Failed to create tag');
  return response.json();
}

export async function deleteTag(id: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/tags/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete tag');
}

// Article-Tag relations
export async function addTagToArticle(articleId: number, tagId: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles/${articleId}/tags/${tagId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to add tag to article');
}

export async function removeTagFromArticle(articleId: number, tagId: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/articles/${articleId}/tags/${tagId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove tag from article');
}

// Note-Tag relations
export async function addTagToNote(noteId: number, tagId: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/notes/${noteId}/tags/${tagId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to add tag to note');
}

export async function removeTagFromNote(noteId: number, tagId: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/v1/notes/${noteId}/tags/${tagId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to remove tag from note');
}
