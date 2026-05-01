import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../storage/database/supabase-client';

const supabase = getSupabaseClient();

// 根据 URL 识别来源平台
function identifySource(url: string): string {
  if (url.includes('mp.weixin.qq.com') || url.includes('weixin')) {
    return '微信';
  }
  if (url.includes('zhihu.com') || url.includes('zhidx.com')) {
    return '知乎';
  }
  if (url.includes('juejin.cn')) {
    return '掘金';
  }
  if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) {
    return '小红书';
  }
  if (url.includes('douban.com')) {
    return '豆瓣';
  }
  if (url.includes('bilibili.com') || url.includes('b23.tv')) {
    return 'B站';
  }
  return 'other';
}

// 抓取网页内容（模拟实现，实际需要使用 fetch-url skill）
export async function fetchArticleContent(url: string) {
  try {
    // 识别来源
    const source = identifySource(url);
    
    // 模拟抓取结果（实际需要调用 fetch-url skill）
    // 这里返回模拟数据，实际使用时需要接入真实的网页抓取服务
    const mockData: {
      title: string;
      summary: string;
      cover_image: string | null;
      content: string;
      source: string;
    } = {
      title: '正在加载文章内容...',
      summary: '正在解析文章摘要，请稍候...',
      cover_image: null,
      content: '',
      source
    };
    
    // 如果 URL 是真实可访问的，可以尝试获取真实数据
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
        }
      });
      
      if (response.ok) {
        const html = await response.text();
        
        // 简单解析 HTML 获取标题
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch) {
          mockData.title = titleMatch[1].trim();
        }
        
        // 尝试获取 og:title
        const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        if (ogTitleMatch) {
          mockData.title = ogTitleMatch[1];
        }
        
        // 尝试获取 og:image
        const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
        if (ogImageMatch) {
          mockData.cover_image = ogImageMatch[1];
        }
        
        // 尝试获取 description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        if (descMatch) {
          mockData.summary = descMatch[1].substring(0, 500);
        }
      }
    } catch (e) {
      // fetch 失败时使用模拟数据
      console.log('Fetch article failed, using mock data:', e);
    }
    
    return mockData;
  } catch (error: any) {
    throw new Error(`抓取文章失败: ${error.message}`);
  }
}
