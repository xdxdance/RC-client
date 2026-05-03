import { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { createNote, updateNote, fetchNote, type Note } from '@/services/api';
import { useSafeSearchParams, useSafeRouter } from '@/hooks/useSafeRouter';

const NOTE_TYPES = [
  { value: 'quote', label: '金句', desc: '触动你的文字' },
  { value: 'opinion', label: '观点', desc: '作者的核心论点' },
  { value: 'question', label: '疑问', desc: '你想深入思考的问题' },
  { value: 'excerpt', label: '摘录', desc: '重要段落原文' },
  { value: 'idea', label: '灵感', desc: '联想到的内容' },
] as const;

export default function NoteEditScreen() {
  const params = useSafeSearchParams<{ id?: number; articleId?: number }>();
  const [content, setContent] = useState('');
  const [type, setType] = useState<Note['type']>('quote');
  const [pageNumber, setPageNumber] = useState('');
  const [chapter, setChapter] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useSafeRouter();

  const isEditing = !!params.id;

  useEffect(() => {
    if (params.id) {
      loadNote();
    }
  }, [params.id]);

  const loadNote = async () => {
    if (!params.id) return;
    try {
      const note = await fetchNote(params.id);
      setContent(note.content);
      setType(note.type);
      setPageNumber(note.page_number || '');
      setChapter(note.chapter || '');
    } catch (error) {
      console.error('Failed to load note:', error);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入笔记内容');
      return;
    }

    setSaving(true);
    try {
      const noteData = {
        content: content.trim(),
        type,
        page_number: pageNumber || undefined,
        chapter: chapter || undefined,
        article_id: params.articleId || undefined,
      };

      if (isEditing && params.id) {
        await updateNote(params.id, noteData);
      } else {
        await createNote(noteData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save note:', error);
      Alert.alert('错误', '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-blue-500">取消</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEditing ? '编辑笔记' : '新建笔记'}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            <Text className={saving ? 'text-gray-400' : 'text-blue-500'}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">笔记类型</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {NOTE_TYPES.map((item) => (
              <TouchableOpacity
                key={item.value}
                className={`px-4 py-2 rounded-xl ${
                  type === item.value
                    ? 'bg-blue-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
                onPress={() => setType(item.value)}
              >
                <Text
                  className={`font-medium ${
                    type === item.value
                      ? 'text-white'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            {NOTE_TYPES.find((t) => t.value === type)?.desc}
          </Text>

          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
            <TextInput
              className="text-gray-700 dark:text-gray-200 text-base min-h-[150] leading-6"
              placeholder="写下你的笔记..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">章节</Text>
              <TextInput
                className="text-gray-700 dark:text-gray-200"
                placeholder="可选"
                placeholderTextColor="#9CA3AF"
                value={chapter}
                onChangeText={setChapter}
              />
            </View>
            <View className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1">页码</Text>
              <TextInput
                className="text-gray-700 dark:text-gray-200"
                placeholder="可选"
                placeholderTextColor="#9CA3AF"
                value={pageNumber}
                onChangeText={setPageNumber}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
