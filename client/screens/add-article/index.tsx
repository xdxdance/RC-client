import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Screen } from '@/components/Screen';
import { fetchFromUrl } from '@/services/api';
import { useSafeRouter } from '@/hooks/useSafeRouter';

export default function AddArticleScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const router = useSafeRouter();

  const handleFetch = async () => {
    if (!url.trim()) {
      Alert.alert('提示', '请输入文章链接');
      return;
    }

    setLoading(true);
    setLoadingText('正在获取...');

    try {
      setLoadingText('正在获取文章内容...');
      const article = await fetchFromUrl(url.trim());
      
      if (article && article.id) {
        setLoadingText('获取成功！');
        setTimeout(() => {
          router.replace('/article-detail', { id: article.id });
        }, 500);
      } else {
        Alert.alert('提示', '文章获取成功，但未返回有效ID，请刷新列表查看');
        setLoading(false);
        setLoadingText('');
      }
    } catch (error: any) {
      console.error('Failed to fetch article:', error);
      const errorMsg = error?.message || '无法获取文章，请检查链接是否正确';
      Alert.alert('获取失败', errorMsg);
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <Screen>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} disabled={loading}>
            <Text className="text-blue-500">取消</Text>
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-semibold text-gray-900 dark:text-white text-center">
            添加文章
          </Text>
          <View className="w-10" />
        </View>

        <View className="p-4">
          <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            文章链接
          </Text>
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
            <TextInput
              className="text-gray-700 dark:text-gray-200 text-base"
              placeholder="粘贴微信文章、知乎等链接..."
              placeholderTextColor="#9CA3AF"
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!loading}
            />
          </View>

          <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-4">
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              支持的平台
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-2">
              <View className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                <Text className="text-gray-600 dark:text-gray-300 text-sm">微信</Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                <Text className="text-gray-600 dark:text-gray-300 text-sm">知乎</Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                <Text className="text-gray-600 dark:text-gray-300 text-sm">即刻</Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                <Text className="text-gray-600 dark:text-gray-300 text-sm">小红书</Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                <Text className="text-gray-600 dark:text-gray-300 text-sm">公众号</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            className={`rounded-xl py-4 items-center ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
            onPress={handleFetch}
            disabled={loading}
          >
            {loading ? (
              <View className="items-center">
                <ActivityIndicator color="white" />
                <Text className="text-white text-sm mt-2">{loadingText}</Text>
              </View>
            ) : (
              <Text className="text-white font-semibold text-lg">获取文章</Text>
            )}
          </TouchableOpacity>

          {loading && (
            <Text className="text-gray-500 text-sm text-center mt-4">
              如果长时间无响应，请检查网络或尝试其他链接
            </Text>
          )}
        </View>
      </View>
    </Screen>
  );
}
