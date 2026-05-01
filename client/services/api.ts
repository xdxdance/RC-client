const BASE_URL = process.env.EXPO_PUBLIC_BACKEND_BASE_URL || 'http://localhost:9091';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Article {
  id: number;
  url: string;
  title: string;
  summary: string | null;
  cover_image: string | null;
  source: string;
  content: string | null;
  created_at: string;
  note_count?: number;
}

interface Note {
  id: number;
  article_id: number | null;
  content: string;
  thought: string | null;
  note_type: string;
  created_at: string;
  updated_at: string | null;
  articles?: {
    id: number;
    title: string;
    source: string;
    cover_image?: string;
  };
  tags?: Tag[];
}

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

// 通用请求方法
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}/api/v1${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const result: ApiResponse<T> = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Request failed');
  }
  
  return result.data as T;
}

// 文章 API
export const articleApi = {
  // 获取文章列表
  getList: (source?: string) => {
    const query = source && source !== 'all' ? `?source=${source}` : '';
    return request<Article[]>(`/articles${query}`);
  },
  
  // 获取单个文章
  getById: (id: number) => {
    return request<Article>(`/articles/${id}`);
  },
  
  // 创建文章（通过 URL）
  create: (url: string) => {
    return request<Article>('/articles', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  },
  
  // 删除文章
  delete: (id: number) => {
    return request<void>(`/articles/${id}`, { method: 'DELETE' });
  },
};

// 笔记 API
export const noteApi = {
  // 获取笔记列表
  getList: (noteType?: string) => {
    const query = noteType && noteType !== 'all' ? `?note_type=${noteType}` : '';
    return request<Note[]>(`/notes${query}`);
  },
  
  // 获取单个笔记
  getById: (id: number) => {
    return request<Note>(`/notes/${id}`);
  },
  
  // 获取文章的笔记
  getByArticleId: (articleId: number) => {
    return request<Note[]>(`/notes/article/${articleId}`);
  },
  
  // 创建笔记
  create: (data: {
    article_id?: number;
    content: string;
    thought?: string;
    note_type?: string;
    tag_ids?: number[];
  }) => {
    return request<Note>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 更新笔记
  update: (id: number, data: {
    content?: string;
    thought?: string;
    note_type?: string;
    tag_ids?: number[];
  }) => {
    return request<Note>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // 删除笔记
  delete: (id: number) => {
    return request<void>(`/notes/${id}`, { method: 'DELETE' });
  },
};

// 标签 API
export const tagApi = {
  // 获取所有标签
  getList: () => {
    return request<Tag[]>('/tags');
  },
  
  // 创建标签
  create: (name: string) => {
    return request<Tag>('/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },
};

export type { Article, Note, Tag };
