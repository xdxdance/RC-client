import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { articleApi, noteApi, type Article, type Note } from '@/services/api';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';

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

export default function ArticleDetailScreen() {
  const { id } = useSafeSearchParams<{ id: number }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useSafeRouter();

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [articleData, notesData] = await Promise.all([
        articleApi.getById(id),
        noteApi.getByArticleId(id),
      ]);
      setArticle(articleData);
      setNotes(notesData || []);
    } catch (error) {
      console.error('Failed to fetch article:', error);
      Alert.alert('错误', '获取文章失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDeleteNote = async (noteId: number) => {
    Alert.alert('确认', '确定要删除这条笔记吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await noteApi.delete(noteId);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
          } catch (error) {
            Alert.alert('错误', '删除失败');
          }
        },
      },
    ]);
  };

  const handleAddNote = () => {
    router.push('/note-edit', { articleId: id, isNew: true });
  };

  const handleEditNote = (note: Note) => {
    router.push('/note-edit', { id: note.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (!article && !loading) {
    return (
      <Screen style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>文章不存在</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="chevron-left" size={20} color="#71717A" solid />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>文章详情</Text>
        <TouchableOpacity style={styles.moreButton}>
          <FontAwesome5 name="ellipsis-h" size={20} color="#71717A" solid />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#4F46E5"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* 封面图 */}
        {article?.cover_image && (
          <Image
            source={{ uri: article.cover_image }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        {/* 标题 */}
        <Text style={styles.title}>{article?.title}</Text>

        {/* 来源 */}
        <View style={styles.sourceContainer}>
          <View style={styles.sourceTag}>
            <Text style={styles.sourceTagText}>
              {article?.source === 'other' ? '其他' : article?.source}
            </Text>
          </View>
          <Text style={styles.dateText}>
            {article?.created_at && formatDate(article.created_at)}
          </Text>
        </View>

        {/* 摘要 */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <FontAwesome5 name="file-alt" size={16} color="#4F46E5" solid />
            <Text style={styles.summaryTitle}>文章摘要</Text>
          </View>
          <Text style={styles.summaryText}>
            {article?.summary || '暂无摘要'}
          </Text>
          {article?.url && (
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>原文链接</Text>
              <FontAwesome5 name="external-link-alt" size={12} color="#4F46E5" solid />
            </TouchableOpacity>
          )}
        </View>

        {/* 笔记区域 */}
        <View style={styles.notesSection}>
          <View style={styles.notesSectionHeader}>
            <View style={styles.notesTitleRow}>
              <FontAwesome5 name="edit" size={16} color="#4F46E5" solid />
              <Text style={styles.notesTitle}>我的笔记</Text>
            </View>
            <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
              <Text style={styles.addNoteButtonText}>+ 添加笔记</Text>
            </TouchableOpacity>
          </View>

          {notes.length === 0 ? (
            <View style={styles.emptyNotes}>
              <Text style={styles.emptyNotesText}>还没有笔记</Text>
              <Text style={styles.emptyNotesSubtext}>
                点击上方按钮添加笔记
              </Text>
            </View>
          ) : (
            <View style={styles.notesList}>
              {notes.map((note) => (
                <View key={note.id} style={styles.noteCard}>
                  {/* 标签 */}
                  <View style={styles.noteTags}>
                    <View
                      style={[
                        styles.noteTag,
                        { backgroundColor: NOTE_TYPE_COLORS[note.note_type]?.bg || '#EEEEF3' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.noteTagText,
                          { color: NOTE_TYPE_COLORS[note.note_type]?.text || '#71717A' },
                        ]}
                      >
                        {NOTE_TYPE_LABELS[note.note_type] || note.note_type}
                      </Text>
                    </View>
                  </View>

                  {/* 内容 */}
                  <Text style={styles.noteContent}>{note.content}</Text>

                  {/* 感悟 */}
                  {note.thought && (
                    <Text style={styles.noteThought}>{note.thought}</Text>
                  )}

                  {/* 时间 */}
                  <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>{formatDate(note.created_at)}</Text>
                    <View style={styles.noteActions}>
                      <TouchableOpacity
                        style={styles.noteAction}
                        onPress={() => handleEditNote(note)}
                      >
                        <FontAwesome5 name="edit" size={14} color="#71717A" solid />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.noteAction}
                        onPress={() => handleDeleteNote(note.id)}
                      >
                        <FontAwesome5 name="trash-alt" size={14} color="#71717A" solid />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 24,
    backgroundColor: '#EEEEF3',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#18181B',
    marginBottom: 12,
    lineHeight: 30,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  sourceTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
  },
  sourceTagText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#71717A',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181B',
  },
  summaryText: {
    fontSize: 14,
    color: '#71717A',
    lineHeight: 22,
  },
  linkButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 24,
  },
  notesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  notesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
  },
  addNoteButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
  },
  addNoteButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyNotes: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  emptyNotesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 4,
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: '#71717A',
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  noteTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  noteTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  noteTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteContent: {
    fontSize: 14,
    color: '#18181B',
    lineHeight: 22,
    marginBottom: 8,
  },
  noteThought: {
    fontSize: 12,
    color: '#71717A',
    lineHeight: 18,
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
  noteDate: {
    fontSize: 12,
    color: '#71717A',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 8,
  },
  noteAction: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#71717A',
  },
});
