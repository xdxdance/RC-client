import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { fetchArticles, deleteArticle, type Article } from '@/services/api';
import { useFocusEffect } from 'expo-router';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import dayjs from 'dayjs';

const NOTE_TYPE_LABELS = {
  quote: '金句',
  opinion: '观点',
  question: '疑问',
  excerpt: '摘录',
  idea: '灵感',
};

export default function ArticleListScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useSafeRouter();

  const loadArticles = useCallback(async () => {
    try {
      const data = await fetchArticles();
      setArticles(data || []);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadArticles();
    }, [loadArticles])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadArticles();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteArticle(id);
      loadArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
      onPress={() => router.push('/article-detail', { id: item.id })}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {item.title || 'Untitled'}
          </Text>
          {item.source && (
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {item.source}
            </Text>
          )}
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
          </Text>
        </View>
        <TouchableOpacity
          className="p-2"
          onPress={() => handleDelete(item.id)}
        >
          <Text className="text-red-500 text-sm">删除</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">文章收藏</Text>
        </View>

        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-gray-500 dark:text-gray-400">暂无收藏文章</Text>
              </View>
            ) : null
          }
        />

        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push('/add-article')}
        >
          <Text className="text-white text-3xl font-light">+</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
