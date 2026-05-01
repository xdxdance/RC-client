import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { noteApi, type Note } from '@/services/api';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const TYPE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'quote', label: '金句' },
  { key: 'insight', label: '观点' },
  { key: 'question', label: '疑问' },
  { key: '摘录', label: '摘录' },
  { key: 'idea', label: '灵感' },
];

const NOTE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  quote: { bg: '#FEF3C7', text: '#B45309' },
  insight: { bg: '#DBEAFE', text: '#1D4ED8' },
  question: { bg: '#D1FAE5', text: '#047857' },
  摘录: { bg: '#FCE7F3', text: '#BE185D' },
  idea: { bg: '#E9D5FF', text: '#7C3AED' },
};

const NOTE_TYPE_LABELS: Record<string, string> = {
  quote: '金句',
  insight: '观点',
  question: '疑问',
  摘录: '摘录',
  idea: '灵感',
};

export default function NoteListScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState('all');
  const router = useSafeRouter();

  const fetchNotes = useCallback(async () => {
    try {
      const data = await noteApi.getList(selectedType);
      setNotes(data || []);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType]);

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotes();
  };

  const handleNotePress = (note: Note) => {
    router.push('/note-edit', { id: note.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `今天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (diffDays === 1) return `昨天 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    return `${Math.floor(diffDays / 30)}个月前`;
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => handleNotePress(item)}
      activeOpacity={0.7}
    >
      {/* 标签 */}
      <View style={styles.noteTags}>
        <View
          style={[
            styles.noteTag,
            { backgroundColor: NOTE_TYPE_COLORS[item.note_type]?.bg || '#EEEEF3' },
          ]}
        >
          <Text
            style={[
              styles.noteTagText,
              { color: NOTE_TYPE_COLORS[item.note_type]?.text || '#71717A' },
            ]}
          >
            {NOTE_TYPE_LABELS[item.note_type] || item.note_type}
          </Text>
        </View>
        {item.tags?.map((tag) => (
          <View key={tag.id} style={styles.noteTag}>
            <Text style={styles.noteTagText}>{tag.name}</Text>
          </View>
        ))}
      </View>

      {/* 内容 */}
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>

      {/* 来源 */}
      {item.articles ? (
        <Text style={styles.noteSource}>——{item.articles.title}</Text>
      ) : (
        <Text style={styles.noteSource}>独立笔记</Text>
      )}

      {/* 底部 */}
      <View style={styles.noteFooter}>
        <View style={styles.noteMeta}>
          <FontAwesome5 name="clock" size={12} color="#71717A" solid />
          <Text style={styles.noteDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.viewDetail}>
          <Text style={styles.viewDetailText}>查看详情</Text>
          <FontAwesome5 name="chevron-right" size={12} color="#4F46E5" solid />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome5 name="sticky-note" size={48} color="#71717A" solid style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>暂无笔记</Text>
      <Text style={styles.emptySubtitle}>点击底部「添加」按钮记录灵感</Text>
    </View>
  );

  return (
    <Screen style={styles.container}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>我的笔记</Text>
        <TouchableOpacity style={styles.searchButton}>
          <FontAwesome5 name="search" size={18} color="#71717A" solid />
        </TouchableOpacity>
      </View>

      {/* 筛选标签 */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TYPE_FILTERS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTag,
                selectedType === item.key && styles.filterTagActive,
              ]}
              onPress={() => setSelectedType(item.key)}
            >
              <Text
                style={[
                  styles.filterTagText,
                  selectedType === item.key && styles.filterTagTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 笔记列表 */}
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNoteItem}
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
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  noteTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  noteTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#EEEEF3',
    borderRadius: 8,
  },
  noteTagText: {
    fontSize: 12,
    color: '#71717A',
    fontWeight: '500',
  },
  noteContent: {
    fontSize: 14,
    color: '#18181B',
    lineHeight: 22,
    marginBottom: 8,
  },
  noteSource: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 12,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 228, 231, 0.5)',
  },
  noteMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteDate: {
    fontSize: 12,
    color: '#71717A',
  },
  viewDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
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
