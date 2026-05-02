import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = '@api_url';
const DEFAULT_API_URL = 'http://10.112.4.245:9091';

// 获取 API 基础 URL
export async function getApiBaseUrl(): Promise<string> {
  try {
    const customUrl = await AsyncStorage.getItem(API_URL_KEY);
    if (customUrl) {
      return customUrl.endsWith('/') ? customUrl : `${customUrl}/`;
    }
  } catch (error) {
    console.error('读取自定义API地址失败:', error);
  }
  return DEFAULT_API_URL.endsWith('/') ? DEFAULT_API_URL : `${DEFAULT_API_URL}/`;
}

// 动态获取完整的 API URL
export async function getApiUrl(path: string): Promise<string> {
  const baseUrl = await getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}api/v1${cleanPath}`;
}

// ==================== API 类型定义 ====================

export interface Article {
  id: number;
  url: string;
  title: string;
  summary: string | null;
  cover_image: string | null;
  source: string;
  content: string | null;
  created_at: string;
  notes_count?: number;
}

export interface Note {
  id: number;
  article_id: number | null;
  content: string;
  thought: string | null;
  note_type: string;
  created_at: string;
  updated_at: string | null;
  article?: Article;
  tags?: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface CreateArticleData {
  url: string;
  title: string;
  summary?: string;
  cover_image?: string;
  source?: string;
  content?: string;
}

export interface CreateNoteData {
  article_id?: number;
  content: string;
  thought?: string;
  note_type: string;
  tag_ids?: number[];
}

export interface UpdateNoteData {
  content?: string;
  thought?: string;
  note_type?: string;
  tag_ids?: number[];
}

// ==================== API 请求函数 ====================

// 文章列表
export async function getArticles(source?: string): Promise<Article[]> {
  const baseUrl = await getApiBaseUrl();
  let url = `${baseUrl}api/v1/articles`;
  if (source) {
    url += `?source=${encodeURIComponent(source)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`获取文章列表失败: ${response.status}`);
  }
  return response.json();
}

// 文章详情
export async function getArticleById(id: number): Promise<Article> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/articles/${id}`);
  if (!response.ok) {
    throw new Error(`获取文章详情失败: ${response.status}`);
  }
  return response.json();
}

// 添加文章
export async function createArticle(data: CreateArticleData): Promise<Article> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/articles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`添加文章失败: ${response.status}`);
  }
  return response.json();
}

// 删除文章
export async function deleteArticle(id: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/articles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`删除文章失败: ${response.status}`);
  }
}

// 抓取文章
export async function fetchArticle(url: string): Promise<Article> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/fetch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    throw new Error(`抓取文章失败: ${response.status}`);
  }
  return response.json();
}

// 笔记列表
export async function getNotes(noteType?: string): Promise<Note[]> {
  const baseUrl = await getApiBaseUrl();
  let url = `${baseUrl}api/v1/notes`;
  if (noteType) {
    url += `?note_type=${encodeURIComponent(noteType)}`;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`获取笔记列表失败: ${response.status}`);
  }
  return response.json();
}

// 创建笔记
export async function createNote(data: CreateNoteData): Promise<Note> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`创建笔记失败: ${response.status}`);
  }
  return response.json();
}

// 更新笔记
export async function updateNote(id: number, data: UpdateNoteData): Promise<Note> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`更新笔记失败: ${response.status}`);
  }
  return response.json();
}

// 删除笔记
export async function deleteNote(id: number): Promise<void> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/notes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`删除笔记失败: ${response.status}`);
  }
}

// 标签列表
export async function getTags(): Promise<Tag[]> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/tags`);
  if (!response.ok) {
    throw new Error(`获取标签列表失败: ${response.status}`);
  }
  return response.json();
}

// 创建标签
export async function createTag(name: string): Promise<Tag> {
  const baseUrl = await getApiBaseUrl();
  const response = await fetch(`${baseUrl}api/v1/tags`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error(`创建标签失败: ${response.status}`);
  }
  return response.json();
}
