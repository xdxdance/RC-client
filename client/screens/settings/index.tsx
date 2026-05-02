import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL_KEY = '@api_url';

export default function Settings() {
  const [apiUrl, setApiUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApiUrl();
  }, []);

  const loadApiUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem(API_URL_KEY);
      if (savedUrl) {
        setApiUrl(savedUrl);
      }
    } catch (error) {
      console.error('加载API地址失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiUrl = async () => {
    try {
      if (!apiUrl.trim()) {
        Alert.alert('提示', '请输入API地址');
        return;
      }

      // 验证 URL 格式
      let url = apiUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
        setApiUrl(url);
      }

      await AsyncStorage.setItem(API_URL_KEY, url);
      
      // 测试连接
      const testUrl = url.endsWith('/') ? url : `${url}/`;
      const response = await fetch(`${testUrl}api/v1/health`);
      
      if (response.ok) {
        Alert.alert('成功', 'API地址已保存并测试连接成功！');
      } else {
        Alert.alert('警告', 'API地址已保存，但连接测试失败，请检查地址是否正确。');
      }
    } catch (error) {
      Alert.alert('错误', '保存失败：' + (error as Error).message);
    }
  };

  const resetToDefault = async () => {
    try {
      await AsyncStorage.removeItem(API_URL_KEY);
      setApiUrl('http://10.112.4.245:9091');
      Alert.alert('提示', '已重置为默认地址');
    } catch (error) {
      console.error('重置失败:', error);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 justify-center items-center">
          <Text className="text-on-surface-variant">加载中...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 p-4">
        {/* 标题 */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-on-surface">设置</Text>
          <Text className="text-sm text-on-surface-variant mt-1">
            配置后端服务地址
          </Text>
        </View>

        {/* 说明 */}
        <View className="bg-primary/10 rounded-2xl p-4 mb-6">
          <Text className="text-sm text-primary font-medium mb-1">使用说明</Text>
          <Text className="text-xs text-on-surface-variant leading-4">
            如果手机和电脑在不同网络，需要重新设置API地址。{'\n'}
            例如：电脑IP变化后，在此更新地址即可。
          </Text>
        </View>

        {/* API 地址输入 */}
        <View className="bg-surface rounded-2xl p-4 mb-6 shadow-[var(--shadow-card)]">
          <Text className="text-sm font-semibold text-on-surface mb-3">
            后端服务地址
          </Text>
          <TextInput
            className="bg-surface-container rounded-xl px-4 py-3 text-on-surface text-sm border border-outline/30 focus:border-primary"
            placeholder="例如：http://192.168.1.100:9091"
            placeholderTextColor="rgba(113, 113, 122, 0.5)"
            value={apiUrl}
            onChangeText={setApiUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Text className="text-xs text-on-surface-variant mt-2">
            输入格式：http://IP地址:端口号
          </Text>
        </View>

        {/* 按钮 */}
        <View className="space-y-3">
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 px-6 shadow-md"
            onPress={saveApiUrl}
            activeOpacity={0.8}
          >
            <Text className="text-on-primary font-semibold text-center">
              保存并测试连接
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-surface rounded-xl py-4 px-6 shadow-[var(--shadow-card)] border border-outline/20"
            onPress={resetToDefault}
            activeOpacity={0.8}
          >
            <Text className="text-on-surface font-medium text-center">
              重置为默认地址
            </Text>
          </TouchableOpacity>
        </View>

        {/* 当前状态 */}
        <View className="mt-8 bg-surface-container rounded-xl p-4">
          <Text className="text-xs text-on-surface-variant mb-2">当前使用的地址</Text>
          <Text className="text-sm text-on-surface font-mono break-all">
            {apiUrl || '未设置'}
          </Text>
        </View>

        {/* 版本信息 */}
        <View className="mt-auto pt-8">
          <Text className="text-xs text-on-surface-variant text-center">
            拾光收藏 v1.0.0
          </Text>
        </View>
      </View>
    </Screen>
  );
}
