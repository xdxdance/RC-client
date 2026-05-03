import { getSupabaseClient, getServiceRoleKey } from '../supabase-client';
import { createClient } from '@supabase/supabase-js';
import type { Article, Note, Tag } from './schema';

// Article operations
export async function getArticles() {
  const supabase = getSupabaseClient();
  return supabase.from('articles').select('*').order('created_at', { ascending: false });
}

export async function getArticleById(id: number) {
  const supabase = getSupabaseClient();
  return supabase.from('articles').select('*').eq('id', id).single();
}

export async function createArticle(article: Partial<Article>) {
  const supabase = getSupabaseClient();
  return supabase.from('articles').insert(article).select().single();
}

export async function updateArticle(id: number, article: Partial<Article>) {
  const supabase = getSupabaseClient();
  return supabase.from('articles').update(article).eq('id', id).select().single();
}

export async function deleteArticle(id: number) {
  const supabase = getSupabaseClient();
  return supabase.from('articles').delete().eq('id', id);
}

// Note operations
export async function getNotes(articleId?: number) {
  const supabase = getSupabaseClient();
  let query = supabase.from('notes').select('*').order('created_at', { ascending: false });
  if (articleId) {
    query = query.eq('article_id', articleId);
  }
  return query;
}

export async function getNoteById(id: number) {
  const supabase = getSupabaseClient();
  return supabase.from('notes').select('*').eq('id', id).single();
}

export async function createNote(note: Partial<Note>) {
  const supabase = getSupabaseClient();
  return supabase.from('notes').insert(note).select().single();
}

export async function updateNote(id: number, note: Partial<Note>) {
  const supabase = getSupabaseClient();
  return supabase.from('notes').update(note).eq('id', id).select().single();
}

export async function deleteNote(id: number) {
  const supabase = getSupabaseClient();
  return supabase.from('notes').delete().eq('id', id);
}

// Tag operations
export async function getTags() {
  const supabase = getSupabaseClient();
  return supabase.from('tags').select('*').order('name');
}

export async function createTag(tag: Partial<Tag>) {
  const supabase = getSupabaseClient();
  return supabase.from('tags').insert(tag).select().single();
}

export async function updateTag(id: number, tag: Partial<Tag>) {
  const supabase = getSupabaseClient();
  return supabase.from('tags').update(tag).eq('id', id).select().single();
}

export async function deleteTag(id: number) {
  const supabase = getSupabaseClient();
  return supabase.from('tags').delete().eq('id', id);
}

// Article-Tag relations
export async function addTagToArticle(articleId: number, tagId: number) {
  const supabase = getSupabaseClient();
  return supabase.from('article_tags').insert({ article_id: articleId, tag_id: tagId });
}

export async function removeTagFromArticle(articleId: number, tagId: number) {
  const supabase = getSupabaseClient();
  return supabase.from('article_tags').delete().match({ article_id: articleId, tag_id: tagId });
}

export async function getArticleTags(articleId: number) {
  const supabase = getSupabaseClient();
  return supabase
    .from('article_tags')
    .select('tag_id')
    .eq('article_id', articleId);
}

// Note-Tag relations
export async function addTagToNote(noteId: number, tagId: number) {
  const supabase = getSupabaseClient();
  return supabase.from('note_tags').insert({ note_id: noteId, tag_id: tagId });
}

export async function removeTagFromNote(noteId: number, tagId: number) {
  const supabase = getSupabaseClient();
  return supabase.from('note_tags').delete().match({ note_id: noteId, tag_id: tagId });
}

export async function getNoteTags(noteId: number) {
  const supabase = getSupabaseClient();
  return supabase
    .from('note_tags')
    .select('tag_id')
    .eq('note_id', noteId);
}
