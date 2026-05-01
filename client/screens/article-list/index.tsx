import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { articleApi, type Article } from '@/services/api';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const SOURCE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: '微信', label: '微信' },
  { key: '知乎', label: '知乎' },
  { key: '掘金', label: '掘金' },
  { key: '小红书', label: '小红书' },
  { key: 'other', label: '其他' },
];

export default function ArticleListScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSource, setSelectedSource] = useState('all');
  const router = useSafeRouter();

  const fetchArticles = useCallback(async () => {
    try {
      const data = await articleApi.getList(selectedSource);
      setArticles(data || []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSource]);

  useFocusEffect(
    useCallback(() => {
      fetchArticles();
    }, [fetchArticles])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchArticles();
  };

  const handleArticlePress = (article: Article) => {
    router.push('/article-detail', { id: article.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}个月前`;
  };

  const renderArticleItem = ({ item }: { item: Article }) => (
    <TouchableOpacity
      style={styles.articleCard}
      onPress={() => handleArticlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.articleContent}>
        <Text style={styles.articleTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.articleSummary} numberOfLines={2}>
          {item.summary || '暂无摘要'}
        </Text>
        <View style={styles.articleMeta}>
          <View style={styles.metaItem}>
            <FontAwesome5 name="link" size={12} color="#71717A" solid />
            <Text style={styles.metaText}>{item.source === 'other' ? '其他' : item.source}</Text>
          </View>
          <View style={styles.metaItem}>
            <FontAwesome5 name="clock" size={12} color="#71717A" solid />
            <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
          </View>
          {item.note_count !== undefined && item.note_count > 0 && (
            <View style={styles.metaItem}>
              <FontAwesome5 name="edit" size={12} color="#71717A" solid />
              <Text style={styles.metaText}>{item.note_count}条笔记</Text>
            </View>
          )}
        </View>
      </View>
      {item.cover_image && (
        <Image
          source={{ uri: item.cover_image }}
          style={styles.articleCover}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome5 name="book-open" size={48} color="#71717A" solid style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>暂无收藏文章</Text>
      <Text style={styles.emptySubtitle}>点击底部「添加」按钮收藏文章</Text>
    </View>
  );

  return (
    <Screen style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>拾光收藏</Text>
        <TouchableOpacity style={styles.searchButton}>
          <FontAwesome5 name="search" size={18} color="#71717A" solid />
        </TouchableOpacity>
      </View>

      {/* 筛选标签 */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={SOURCE_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTag,
                selectedSource === item.key && styles.filterTagActive,
              ]}
              onPress={() => setSelectedSource(item.key)}
            >
              <Text
                style={[
                  styles.filterTagText,
                  selectedSource === item.key && styles.filterTagTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 文章列表 */}
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderArticleItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
        ListEmptyComponent={!loading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181B',
  },
  searchButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    paddingBottom: 12,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#EEEEF3',
    borderRadius: 20,
  },
  filterTagActive: {
    backgroundColor: '#4F46E5',
  },
  filterTagText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },
  filterTagTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  articleCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  articleContent: {
    flex: 1,
    marginRight: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 8,
    lineHeight: 22,
  },
  articleSummary: {
    fontSize: 14,
    color: '#71717A',
    marginBottom: 12,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#71717A',
  },
  articleCover: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#EEEEF3',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#71717A',
  },
});
