import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Screen } from '@/components/Screen';
import { fetchNotes, deleteNote, type Note } from '@/services/api';
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

const NOTE_TYPE_COLORS = {
  quote: 'bg-yellow-100 text-yellow-700',
  opinion: 'bg-blue-100 text-blue-700',
  question: 'bg-purple-100 text-purple-700',
  excerpt: 'bg-green-100 text-green-700',
  idea: 'bg-pink-100 text-pink-700',
};

export default function NoteListScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const router = useSafeRouter();

  const loadNotes = useCallback(async () => {
    try {
      const data = await fetchNotes();
      setNotes(data || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotes();
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteNote(id);
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const filteredNotes = filterType
    ? notes.filter((note) => note.type === filterType)
    : notes;

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 shadow-sm"
      onPress={() => router.push('/note-edit', { id: item.id })}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className={`px-2 py-1 rounded-full ${NOTE_TYPE_COLORS[item.type]}`}>
          <Text className="text-xs font-medium">
            {NOTE_TYPE_LABELS[item.type]}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text className="text-red-500 text-sm">删除</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-gray-700 dark:text-gray-200 mb-2" numberOfLines={3}>
        {item.content}
      </Text>
      <Text className="text-xs text-gray-400">
        {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
        {item.chapter && ` · ${item.chapter}`}
        {item.page_number && ` · 第${item.page_number}页`}
      </Text>
    </TouchableOpacity>
  );

  const types = ['quote', 'opinion', 'question', 'excerpt', 'idea'] as const;

  return (
    <Screen>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            我的笔记
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              className={`px-3 py-1 rounded-full ${
                filterType === null ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              onPress={() => setFilterType(null)}
            >
              <Text className="text-sm">全部</Text>
            </TouchableOpacity>
            {types.map((type) => (
              <TouchableOpacity
                key={type}
                className={`px-3 py-1 rounded-full ${
                  filterType === type ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
                onPress={() => setFilterType(filterType === type ? null : type)}
              >
                <Text className="text-sm">{NOTE_TYPE_LABELS[type]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={filteredNotes}
          renderItem={renderNote}
          keyExtractor={(item) => item.id.toString()}
          contentContainerClassName="p-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            !loading ? (
              <View className="flex-1 items-center justify-center py-20">
                <Text className="text-gray-500 dark:text-gray-400">暂无笔记</Text>
              </View>
            ) : null
          }
        />

        <TouchableOpacity
          className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
          onPress={() => router.push('/note-edit')}
        >
          <Text className="text-white text-3xl font-light">+</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}
