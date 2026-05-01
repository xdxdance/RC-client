import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { articleApi, noteApi } from '@/services/api';
import { useSafeRouter } from '@/hooks/useSafeRouter';

const NOTE_TYPES = [
  { key: 'quote', label: '金句' },
  { key: 'insight', label: '观点' },
  { key: 'question', label: '疑问' },
  { key: '摘录', label: '摘录' },
  { key: 'idea', label: '灵感' },
];

export default function AddArticleScreen() {
  const [url, setUrl] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('quote');
  const [loading, setLoading] = useState(false);
  const router = useSafeRouter();

  const handleFetchUrl = async () => {
    if (!url.trim()) {
      Alert.alert('提示', '请输入文章链接');
      return;
    }

    setLoading(true);
    try {
      const article = await articleApi.create(url.trim());
      Alert.alert('成功', '文章已保存', [
        { text: '查看文章', onPress: () => router.push('/article-detail', { id: article.id }) },
        { text: '继续添加', style: 'cancel' },
      ]);
      setUrl('');
    } catch (error: any) {
      Alert.alert('错误', error.message || '获取文章失败，请检查链接是否有效');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim()) {
      Alert.alert('提示', '请输入笔记内容');
      return;
    }

    setLoading(true);
    try {
      const note = await noteApi.create({
        content: noteContent.trim(),
        note_type: noteType,
      });
      Alert.alert('成功', '笔记已保存', [
        { text: '查看笔记', onPress: () => router.push('/note-edit', { id: note.id }) },
        { text: '继续添加', style: 'cancel' },
      ]);
      setNoteContent('');
    } catch (error: any) {
      Alert.alert('错误', error.message || '保存笔记失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 标题栏 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>添加内容</Text>
          </View>

          {/* 链接输入区 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>粘贴文章链接</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.urlInput}
                placeholder="https://..."
                placeholderTextColor="#71717A"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <View style={styles.inputActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <FontAwesome5 name="paste" size={16} color="#71717A" solid />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.hint}>支持微信、知乎、公众号等平台链接</Text>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleFetchUrl}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? '获取中...' : '获取文章'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 分隔线 */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>或</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* 快速笔记 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>快速记录灵感</Text>
            <TextInput
              style={styles.noteInput}
              placeholder="写下你的好词好句、观点感悟..."
              placeholderTextColor="#71717A"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              textAlignVertical="top"
            />
            
            {/* 笔记类型选择 */}
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

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSaveNote}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? '保存中...' : '保存笔记'}
              </Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#18181B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181B',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEEEF3',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  urlInput: {
    flex: 1,
    height: 52,
    fontSize: 16,
    color: '#18181B',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E4E7',
  },
  dividerText: {
    fontSize: 14,
    color: '#71717A',
    marginHorizontal: 16,
  },
  noteInput: {
    backgroundColor: '#EEEEF3',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#18181B',
    minHeight: 120,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  typeTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
});
