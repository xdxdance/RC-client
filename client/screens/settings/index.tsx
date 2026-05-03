import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearApiCache, getApiBaseUrl } from '@/services/api';

const API_STORAGE_KEY = '@app_config';

export default function SettingsScreen() {
  const [apiUrl, setApiUrl] = useState('http://localhost:9091');
  const [saved, setSaved] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    // Load API URL on mount
    AsyncStorage.getItem(API_STORAGE_KEY).then((config) => {
      if (config) {
        try {
          const parsed = JSON.parse(config);
          if (parsed.backendUrl) {
            setApiUrl(parsed.backendUrl);
          }
        } catch (e) {
          // ignore
        }
      }
    }).catch((error) => {
      console.error('Failed to load API URL:', error);
    });
    
    // 显示实际读取到的 API 地址
    getApiBaseUrl().then((url) => {
      setCurrentUrl(url);
    });
  }, []);

  const handleSave = async () => {
    try {
      const trimmedUrl = apiUrl.trim();
      if (!trimmedUrl) {
        Alert.alert('提示', '请输入API地址');
        return;
      }
      // 保存到 @app_config 格式
      await AsyncStorage.setItem(API_STORAGE_KEY, JSON.stringify({ backendUrl: trimmedUrl }));
      // 清除 API 缓存，强制重新加载
      clearApiCache();
      setSaved(true);
      Alert.alert('成功', 'API地址已保存');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save API URL:', error);
      Alert.alert('错误', '保存失败');
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/v1/health`);
      if (response.ok) {
        Alert.alert('成功', '连接正常');
      } else {
        Alert.alert('失败', '服务器返回错误');
      }
    } catch (error) {
      Alert.alert('失败', '无法连接到服务器');
    }
  };

  return (
    <Screen>
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            设置
          </Text>
        </View>

        <View className="p-4">
          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              后端 API 地址
            </Text>
            <TextInput
              className="text-gray-700 dark:text-gray-200 text-base mb-2"
              placeholder="http://localhost:9091"
              placeholderTextColor="#9CA3AF"
              value={apiUrl}
              onChangeText={(text) => {
                setApiUrl(text);
                setSaved(false);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {/* 显示当前实际使用的 API 地址 */}
            <Text className="text-xs text-gray-400 mb-3">
              当前使用: {currentUrl || '读取中...'}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-blue-500 rounded-lg py-3 items-center"
                onPress={handleSave}
              >
                <Text className="text-white font-medium">
                  {saved ? '已保存' : '保存'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-lg py-3 items-center"
                onPress={testConnection}
              >
                <Text className="text-gray-700 dark:text-gray-300 font-medium">
                  测试连接
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4">
            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              关于
            </Text>
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-700 dark:text-gray-200">版本</Text>
              <Text className="text-gray-500">1.0.0</Text>
            </View>
            <View className="flex-row items-center justify-between py-2">
              <Text className="text-gray-700 dark:text-gray-200">应用名称</Text>
              <Text className="text-gray-500">拾光收藏</Text>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
}
