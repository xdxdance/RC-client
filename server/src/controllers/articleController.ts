import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { Article, InsertArticle } from '@/storage/database/shared/schema';

// 获取文章列表
export async function getArticles(source?: string) {
  const client = getSupabaseClient();
  
  let query = client
    .from('articles')
    .select('id, url, title, summary, cover_image, source, created_at')
    .order('created_at', { ascending: false });
  
  if (source && source !== 'all') {
    query = query.eq('source', source);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(`查询文章列表失败: ${error.message}`);
  
  return data as Article[];
}

// 获取单个文章
export async function getArticleById(id: number) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`查询文章失败: ${error.message}`);
  
  return data as Article | null;
}

// 获取文章并统计笔记数量
export async function getArticleWithNoteCount(id: number) {
  const client = getSupabaseClient();
  
  // 获取文章
  const { data: article, error: articleError } = await client
    .from('articles')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (articleError) throw new Error(`查询文章失败: ${articleError.message}`);
  if (!article) return null;
  
  // 统计笔记数量
  const { count, error: countError } = await client
    .from('notes')
    .select('*', { count: 'exact', head: true })
    .eq('article_id', id);
  if (countError) throw new Error(`统计笔记数量失败: ${countError.message}`);
  
  return {
    ...article,
    note_count: count || 0
  };
}

// 创建文章
export async function createArticle(article: InsertArticle) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('articles')
    .insert(article)
    .select()
    .single();
  if (error) throw new Error(`创建文章失败: ${error.message}`);
  
  return data as Article;
}

// 删除文章
export async function deleteArticle(id: number) {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('articles')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`删除文章失败: ${error.message}`);
  
  return true;
}
