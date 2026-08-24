// services/newsService.js

import axios from 'axios';
import Config from '@/config/config';

class NewsService {
  constructor() {
    this.baseUrl = Config.baseUrl;
  }




/**
 * دریافت لیست دسته‌بندی‌های دارای خبر
 */
async getCategories() {
  try {
    const url = Config.endpoints.news.categories();
    console.log('📂 دریافت دسته‌بندی‌ها از:', url);

    const response = await axios.get(url);
    
    return {
      success: true,
      data: response.data?.data || response.data || []
    };
  } catch (error) {
    console.error('❌ خطا در دریافت دسته‌بندی‌ها:', error);
    return {
      success: false,
      data: []
    };
  }
}

  /**
   * دریافت لیست اخبار با صفحه‌بندی
   */
async getNews(page = 1, limit = 12, search = '', category = 'all') {
  try {
    const params = {
      page: page,
      limit: limit,
      is_active: 'true'
    };

    if (search) params.search = search;
    if (category && category !== 'all') params.category = category;

    const url = Config.endpoints.news.list(params);
    console.log('📰 دریافت اخبار از:', url);

    const response = await axios.get(url);

    let results = [];
    let totalCount = 0;

    if (response.data && typeof response.data === 'object') {
      if (response.data.results && Array.isArray(response.data.results)) {
        results = response.data.results;
        totalCount = response.data.count || results.length;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        results = response.data.data;
        totalCount = response.data.count || results.length;
      } else if (Array.isArray(response.data)) {
        results = response.data;
        totalCount = response.data.length;
      }
    }

    return {
      success: true,
      data: results,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit) || 1
    };

  } catch (error) {
    console.error('❌ خطا در دریافت اخبار:', error);
    return {
      success: false,
      data: [],
      total: 0,
      page: page,
      limit: limit,
      totalPages: 0,
      error: error.response?.data?.message || 'خطا در دریافت اخبار'
    };
  }
}

  /**
   * دریافت یک خبر خاص
   */
  async getNewsDetail(id) {
    try {
      const url = Config.endpoints.news.detail(id);
      console.log('📰 دریافت جزئیات خبر از:', url);

      const response = await axios.get(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ خطا در دریافت جزئیات خبر:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت خبر'
      };
    }
  }

  /**
   * دریافت آخرین اخبار
   */
  async getLatestNews(limit = 12) {
    try {
      const url = Config.endpoints.news.latest(limit);
      console.log('📰 دریافت آخرین اخبار از:', url);

      const response = await axios.get(url);
      
      let results = response.data?.data || response.data || [];
      if (Array.isArray(results) && results.length > 0 && results[0]?.data) {
        results = results[0]?.data || results;
      }

      return {
        success: true,
        data: results
      };
    } catch (error) {
      console.error('❌ خطا در دریافت آخرین اخبار:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * دریافت اخبار بر اساس منبع
   */
  async getNewsBySource(source, limit = 20) {
    try {
      const url = Config.endpoints.news.bySource(source, limit);
      console.log('📰 دریافت اخبار بر اساس منبع از:', url);

      const response = await axios.get(url);
      
      return {
        success: true,
        data: response.data?.data || response.data || []
      };
    } catch (error) {
      console.error('❌ خطا در دریافت اخبار بر اساس منبع:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  /**
   * دریافت آمار اخبار
   */
  async getStats() {
    try {
      const url = Config.endpoints.news.stats();
      console.log('📊 دریافت آمار از:', url);

      const response = await axios.get(url);
      
      return {
        success: true,
        data: response.data?.data || response.data || {}
      };
    } catch (error) {
      console.error('❌ خطا در دریافت آمار:', error);
      return {
        success: false,
        data: {}
      };
    }
  }

  /**
   * اجرای اسکرپینگ (در پس‌زمینه)
   */
  async triggerScrape() {
    try {
      const url = Config.endpoints.news.scrape();
      console.log('🔄 اجرای اسکرپینگ از:', url);

      const response = await axios.get(url, {
        timeout: 5000
      });
      return {
        success: true,
        data: response.data,
        message: response.data?.message || 'اسکرپینگ با موفقیت شروع شد'
      };
    } catch (error) {
      console.error('❌ خطا در اجرای اسکرپینگ:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در اجرای اسکرپینگ'
      };
    }
  }

  /**
   * بروزرسانی و دریافت اخبار جدید (همزمان)
   */
  async refreshNews() {
    try {
      const url = Config.endpoints.news.refresh();
      console.log('🔄 بروزرسانی اخبار از:', url);

      const response = await axios.get(url, {
        timeout: 60000
      });
      return {
        success: true,
        data: response.data,
        count: response.data?.count || 0,
        message: response.data?.message || 'اخبار با موفقیت بروزرسانی شدند'
      };
    } catch (error) {
      console.error('❌ خطا در بروزرسانی اخبار:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در بروزرسانی اخبار'
      };
    }
  }
}

const newsService = new NewsService();
export default newsService;