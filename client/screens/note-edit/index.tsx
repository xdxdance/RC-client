import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { noteApi, articleApi, type Note, type Article } from '@/services/api';
import { useSafeRouter, useSafeSearchParams } from '@/hooks/useSafeRouter';

const NOTE_TYPES = [
  { key: 'quote', label: '金句' },
  { key: 'insight', label: '观点' },
  { key: 'question', label: '疑问' },
  { key: '摘录', label: '摘录' },
  { key: 'idea', label: '灵感' },
];

export default function NoteEditScreen() {
  const params = useSafeSearchParams<{
    id?: number;
    articleId?: number;
    isNew?: boolean;
  }>();
  const router = useSafeRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState('');
  const [thought, setThought] = useState('');
  const [noteType, setNoteType] = useState('quote');
  const [loading, setLoading] = useState(false);
  const [fetchingNote, setFetchingNote] = useState(!!params.id);

  const isEditing = !!params.id || params.isNew;

  // 获取笔记详情
  useEffect(() => {
    const fetchNote = async () => {
      if (!params.id) return;
      try {
        const data = await noteApi.getById(params.id);
        setNote(data);
        setContent(data.content);
        setThought(data.thought || '');
        setNoteType(data.note_type);

        // 如果有关联文章，获取文章详情
        if (data.article_id) {
          const articleData = await articleApi.getById(data.article_id);
          setArticle(articleData);
        }
      } catch (error) {
        Alert.alert('错误', '获取笔记失败');
        router.back();
      } finally {
        setFetchingNote(false);
      }
    };

    fetchNote();
  }, [params.id]);

  // 获取文章详情（从文章详情页添加笔记时）
  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.articleId || params.id) return;
      try {
        const data = await articleApi.getById(params.articleId);
        setArticle(data);
      } catch (error) {
        console.error('Failed to fetch article:', error);
      }
    };

    fetchArticle();
  }, [params.articleId, params.id]);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请输入笔记内容');
      return;
    }

    setLoading(true);
    try {
      if (params.id) {
        // 更新笔记
        await noteApi.update(params.id, {
          content: content.trim(),
          thought: thought.trim() || undefined,
          note_type: noteType,
        });
        Alert.alert('成功', '笔记已更新');
      } else {
        // 创建笔记
        await noteApi.create({
          article_id: params.articleId,
          content: content.trim(),
          thought: thought.trim() || undefined,
          note_type: noteType,
        });
        Alert.alert('成功', '笔记已保存');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('错误', error.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!params.id) return;

    Alert.alert('确认', '确定要删除这条笔记吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          try {
            await noteApi.delete(params.id!);
            Alert.alert('成功', '笔记已删除');
            router.back();
          } catch (error) {
            Alert.alert('错误', '删除失败');
          }
        },
      },
    ]);
  };

  const handleRemoveArticle = () => {
    setArticle(null);
  };

  const handleBack = () => {
    if (content.trim() || thought.trim()) {
      Alert.alert('提示', '还有未保存的内容，确定要退出吗？', [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => router.back() },
      ]);
    } else {
      router.back();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (fetchingNote) {
    return (
      <Screen style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 顶部导航 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <FontAwesome5 name="chevron-left" size={20} color="#71717A" solid />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>编辑笔记</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            <FontAwesome5 name="check" size={16} color="#FFFFFF" solid />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 笔记类型 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>笔记类型</Text>
            <View style={styles.typeContainer}>
              {NOTE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeTag,
                    noteType === type.key && styles.typeTagActive,
                  ]}
                  onPress={() => setNoteType(type.key)}
                >
                  <Text
                    style={[
                      styles.typeTagText,
                      noteType === type.key && styles.typeTagTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 来源文章 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>来源文章（可选）</Text>
            {article ? (
              <View style={styles.articleCard}>
                {article.cover_image && (
                  <Image
                    source={{ uri: article.cover_image }}
                    style={styles.articleCover}
                  />
                )}
                <View style={styles.articleInfo}>
                  <Text style={styles.articleTitle} numberOfLines={1}>
                    {article.title}
                  </Text>
                  <Text style={styles.articleSource}>{article.source}</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeArticle}
                  onPress={handleRemoveArticle}
                >
                  <FontAwesome5 name="times" size={16} color="#71717A" solid />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addArticleButton}>
                <Text style={styles.addArticleText}>+ 关联文章</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 笔记内容 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>摘录内容</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="输入你摘录的内容..."
              placeholderTextColor="#71717A"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* 个人感悟 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>个人感悟（可选）</Text>
            <TextInput
              style={styles.thoughtInput}
              placeholder="写下你的思考或感悟..."
              placeholderTextColor="#71717A"
              value={thought}
              onChangeText={setThought}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* 操作按钮 */}
          <View style={styles.actions}>
            {params.id && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <FontAwesome5 name="trash-alt" size={14} color="#EF4444" solid />
                <Text style={styles.deleteButtonText}>删除笔记</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.saveButtonFull}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? '保存中...' : '保存笔记'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 元信息 */}
          {note && (
            <View style={styles.meta}>
              <Text style={styles.metaText}>
                创建于 {formatDate(note.created_at)}
                {note.updated_at && `\n最后修改于 ${formatDate(note.updated_at)}`}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#71717A',
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
  saveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#71717A',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#EEEEF3',
    borderRadius: 12,
  },
  typeTagActive: {
    backgroundColor: '#4F46E5',
  },
  typeTagText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },
  typeTagTextActive: {
    color: '#FFFFFF',
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  articleCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#EEEEF3',
  },
  articleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  articleTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#18181B',
    marginBottom: 4,
  },
  articleSource: {
    fontSize: 12,
    color: '#71717A',
  },
  removeArticle: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addArticleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderStyle: 'dashed',
  },
  addArticleText: {
    fontSize: 14,
    color: '#71717A',
    fontWeight: '500',
  },
  contentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#18181B',
    minHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(212, 212, 216, 0.5)',
  },
  thoughtInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#18181B',
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'rgba(212, 212, 216, 0.5)',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    flexDirection: 'row',
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  saveButtonFull: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  meta: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(228, 228, 231, 0.5)',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
  },
});
