import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { fetchArticle, fetchNotes, type Article, type Note } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';
import dayjs from 'dayjs';

const NOTE_TYPE_LABELS = {
  quote: '金句',
  opinion: '观点',
  question: '疑问',
  excerpt: '摘录',
  idea: '灵感',
};

export default function ArticleDetailScreen() {
  const { id } = useSafeSearchParams<{ id: number }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useSafeRouter();

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [articleData, notesData] = await Promise.all([
        fetchArticle(id),
        fetchNotes(id),
      ]);
      setArticle(articleData);
      setNotes(notesData || []);
    } catch (error) {
      console.error('Failed to load article:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </Screen>
    );
  }

  if (!article) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">文章不存在</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 p-4">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {article.title}
          </Text>
          <View className="flex-row items-center mb-3">
            {article.author && (
              <Text className="text-gray-600 dark:text-gray-300 mr-3">
                作者: {article.author}
              </Text>
            )}
            {article.source && (
              <Text className="text-gray-500 dark:text-gray-400">
                来源: {article.source}
              </Text>
            )}
          </View>
          <Text className="text-sm text-gray-400">
            {dayjs(article.created_at).format('YYYY-MM-DD HH:mm')}
          </Text>
        </View>

        <View className="p-4">
          {article.summary && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">摘要</Text>
              <Text className="text-gray-700 dark:text-gray-200">{article.summary}</Text>
            </View>
          )}

          {article.content && (
            <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
              <Text className="text-gray-700 dark:text-gray-200 leading-6">
                {article.content}
              </Text>
            </View>
          )}

          <View className="bg-white dark:bg-gray-800 rounded-xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-900 dark:text-white">
                笔记 ({notes.length})
              </Text>
              <Text
                className="text-blue-500"
                onPress={() => router.push('/note-edit', { articleId: id })}
              >
                + 添加笔记
              </Text>
            </View>

            {notes.length === 0 ? (
              <Text className="text-gray-500 dark:text-gray-400 text-center py-4">
                暂无笔记
              </Text>
            ) : (
              notes.map((note) => (
                <View
                  key={note.id}
                  className="border-l-4 border-blue-500 pl-3 py-2 mb-3"
                >
                  <View className="flex-row items-center mb-1">
                    <Text className="text-xs text-blue-500 font-medium">
                      {NOTE_TYPE_LABELS[note.type]}
                    </Text>
                  </View>
                  <Text className="text-gray-700 dark:text-gray-200">
                    {note.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
