import { getSupabaseClient } from '@/storage/database/supabase-client';
import type { Note, InsertNote, Tag, InsertTag, NoteTag } from '@/storage/database/shared/schema';

// 获取所有笔记（可按类型筛选）
export async function getNotes(noteType?: string) {
  const client = getSupabaseClient();
  
  let query = client
    .from('notes')
    .select('id, article_id, content, thought, note_type, created_at, updated_at, articles(title, source)')
    .order('created_at', { ascending: false });
  
  if (noteType && noteType !== 'all') {
    query = query.eq('note_type', noteType);
  }
  
  const { data, error } = await query;
  if (error) throw new Error(`查询笔记列表失败: ${error.message}`);
  
  return data || [];
}

// 获取单个笔记
export async function getNoteById(id: number) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('notes')
    .select('*, articles(id, title, source, cover_image), tags(id, name)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`查询笔记失败: ${error.message}`);
  
  return data;
}

// 获取文章的笔记
export async function getNotesByArticleId(articleId: number) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('notes')
    .select('id, content, thought, note_type, created_at, updated_at, tags(id, name)')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`查询文章笔记失败: ${error.message}`);
  
  return data || [];
}

// 创建笔记
export async function createNote(note: InsertNote & { tag_ids?: number[] }) {
  const client = getSupabaseClient();
  
  const { tag_ids, ...noteData } = note;
  
  // 插入笔记
  const { data: newNote, error: noteError } = await client
    .from('notes')
    .insert(noteData)
    .select()
    .single();
  if (noteError) throw new Error(`创建笔记失败: ${noteError.message}`);
  
  // 添加标签关联
  if (tag_ids && tag_ids.length > 0) {
    const noteTags = tag_ids.map(tag_id => ({
      note_id: newNote.id,
      tag_id
    }));
    
    const { error: tagError } = await client
      .from('note_tags')
      .insert(noteTags);
    if (tagError) throw new Error(`添加笔记标签失败: ${tagError.message}`);
  }
  
  return newNote as Note;
}

// 更新笔记
export async function updateNote(id: number, note: Partial<InsertNote> & { tag_ids?: number[] }) {
  const client = getSupabaseClient();
  
  const { tag_ids, ...noteData } = note;
  
  // 更新笔记内容
  if (Object.keys(noteData).length > 0) {
    const { error: updateError } = await client
      .from('notes')
      .update({ ...noteData, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (updateError) throw new Error(`更新笔记失败: ${updateError.message}`);
  }
  
  // 更新标签关联
  if (tag_ids !== undefined) {
    // 删除旧关联
    await client.from('note_tags').delete().eq('note_id', id);
    
    // 添加新关联
    if (tag_ids.length > 0) {
      const noteTags = tag_ids.map(tag_id => ({
        note_id: id,
        tag_id
      }));
      
      const { error: tagError } = await client
        .from('note_tags')
        .insert(noteTags);
      if (tagError) throw new Error(`更新笔记标签失败: ${tagError.message}`);
    }
  }
  
  return true;
}

// 删除笔记
export async function deleteNote(id: number) {
  const client = getSupabaseClient();
  
  const { error } = await client
    .from('notes')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`删除笔记失败: ${error.message}`);
  
  return true;
}

// 获取所有标签
export async function getTags() {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('tags')
    .select('*')
    .order('name');
  if (error) throw new Error(`查询标签列表失败: ${error.message}`);
  
  return data as Tag[];
}

// 创建标签
export async function createTag(name: string) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('tags')
    .insert({ name })
    .select()
    .single();
  if (error) {
    // 如果标签已存在，返回已有标签
    if (error.code === '23505') {
      const existing = await client.from('tags').select('*').eq('name', name).maybeSingle();
      return existing as unknown as Tag | null;
    }
    throw new Error(`创建标签失败: ${error.message}`);
  }
  
  return data as Tag;
}

// 获取笔记的标签
export async function getNoteTags(noteId: number) {
  const client = getSupabaseClient();
  
  const { data, error } = await client
    .from('note_tags')
    .select('tags(*)')
    .eq('note_id', noteId);
  if (error) throw new Error(`查询笔记标签失败: ${error.message}`);
  
  return (data || []).map((item: any) => item.tags);
}
