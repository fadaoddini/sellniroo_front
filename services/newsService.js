// services/newsService.js

import axios from 'axios';
import Config from '@/config/config';

const newsService = {
  // ============================================================
  // 🔹 اخبار
  // ============================================================

  /**
   * دریافت لیست اخبار با صفحه‌بندی و فیلتر
   * پشتیبانی از امضای قدیمی:
   *   getNews(page, limit, search, category)
   * و امضای جدید:
   *   getNews({ page, limit, search, category, is_featured, is_breaking, ordering })
   */
  async getNews(pageOrOpts = 1, limit = 12, search = '', category = 'all') {
    const opts =
      pageOrOpts && typeof pageOrOpts === 'object'
        ? pageOrOpts
        : {
            page: pageOrOpts,
            limit,
            search,
            category,
          }

    const page = Math.max(1, Number(opts.page) || 1)
    const pageLimit = Math.max(1, Math.min(48, Number(opts.limit) || 12))
    const searchQ = String(opts.search || '').trim()
    const cat = opts.category || 'all'
    const ordering = opts.ordering || '-publish_date'

    try {
      const params = {
        page,
        limit: pageLimit,
        ordering,
        ...(searchQ ? { search: searchQ } : {}),
        ...(cat && cat !== 'all' ? { category: cat } : {}),
        ...(opts.is_featured === true || opts.is_featured === 'true'
          ? { is_featured: 'true' }
          : {}),
        ...(opts.is_breaking === true || opts.is_breaking === 'true'
          ? { is_breaking: 'true' }
          : {}),
        ...(opts.from_date ? { from_date: opts.from_date } : {}),
        ...(opts.to_date ? { to_date: opts.to_date } : {}),
      }

      const url = Config.endpoints.news.list(params)
      const response = await axios.get(url)
      const data = response.data

      if (data.results && Array.isArray(data.results)) {
        return {
          success: true,
          data: data.results,
          total: data.count || data.results.length,
          totalPages: Math.ceil(
            (data.count || data.results.length) / pageLimit
          ),
          currentPage: page,
        }
      }

      if (data.data && Array.isArray(data.data)) {
        return {
          success: true,
          data: data.data,
          total: data.total || data.count || data.data.length,
          totalPages:
            data.total_pages ||
            data.totalPages ||
            Math.ceil(
              (data.total || data.data.length) / pageLimit
            ),
          currentPage: data.current_page || data.currentPage || page,
        }
      }

      if (Array.isArray(data)) {
        return {
          success: true,
          data,
          total: data.length,
          totalPages: Math.ceil(data.length / pageLimit),
          currentPage: page,
        }
      }

      if (data.data?.results && Array.isArray(data.data.results)) {
        return {
          success: true,
          data: data.data.results,
          total: data.data.count || data.data.results.length,
          totalPages: Math.ceil(
            (data.data.count || data.data.results.length) / pageLimit
          ),
          currentPage: page,
        }
      }

      return {
        success: true,
        data: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
      }
    } catch (error) {
      console.error('❌ Error fetching news:', error)
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          'خطا در دریافت اخبار',
        data: [],
        total: 0,
        totalPages: 0,
      }
    }
  },

  /**
   * دریافت جزئیات یک خبر با slug
   */
  async getNewsBySlug(slug) {
    try {
      const url = Config.endpoints.news.detail(slug);
      const response = await axios.get(url);
      
      console.log('📦 News detail response:', response.data);

      const data = response.data;

      // ساختار با data.data
      if (data.data && data.data.data) {
        return { success: true, data: data.data.data };
      }
      
      // ساختار با data.data مستقیم
      if (data.data) {
        return { success: true, data: data.data };
      }
      
      // ساختار مستقیم
      if (data.id || data.slug) {
        return { success: true, data: data };
      }

      return {
        success: false,
        error: data?.message || 'خبر یافت نشد',
      };
    } catch (error) {
      console.error('❌ Error fetching news detail:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت خبر',
      };
    }
  },

  /**
   * دریافت دسته‌بندی‌ها
   */
  async getCategories() {
    try {
      const url = Config.endpoints.news.categories();
      const response = await axios.get(url);
      
      console.log('📦 Categories response:', response.data);

      const data = response.data;
      
      // ساختار با data.data
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      // ساختار با results
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      // ساختار مستقیم آرایه
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * دریافت آخرین اخبار
   */
  async getLatestNews(limit = 12) {
    try {
      const url = Config.endpoints.news.latest(limit);
      const response = await axios.get(url);
      
      const data = response.data;
      
      // ساختار با data.data
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      // ساختار با results
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      // ساختار مستقیم آرایه
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching latest news:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * دریافت اخبار ویژه (اسلایدر)
   */
  async getFeaturedNews(limit = 10) {
    try {
      const url = Config.endpoints.news.featured(limit);
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching featured news:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * دریافت اخبار فوری
   */
  async getBreakingNews(limit = 20) {
    try {
      const url = Config.endpoints.news.breaking(limit);
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching breaking news:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * دریافت داغ‌ترین اخبار
   */
  async getHotNews(limit = 10) {
    try {
      const url = Config.endpoints.news.hot(limit);
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching hot news:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * دریافت پربازدیدترین اخبار
   */
  async getPopularNews(limit = 10, days = 30) {
    try {
      const url = Config.endpoints.news.popular(limit, days);
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching popular news:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * جستجوی پیشرفته
   */
  async searchNews(query, category = null) {
    try {
      const url = Config.endpoints.news.search(query, category);
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data, total: data.count || data.data.length };
      }
      
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results, total: data.count || data.results.length };
      }
      
      if (Array.isArray(data)) {
        return { success: true, data: data, total: data.length };
      }

      return { success: true, data: [], total: 0 };
    } catch (error) {
      console.error('❌ Error searching news:', error);
      return { success: false, data: [], total: 0, error: error.message };
    }
  },

  /**
   * دریافت آمار اخبار (فقط ادمین)
   */
  async getStats() {
    try {
      const url = Config.endpoints.news.stats();
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data) {
        return { success: true, data: data.data };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error fetching news stats:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // ============================================================
  // 🔹 تعامل با خبر
  // ============================================================

  /**
   * افزایش بازدید خبر
   */
  async incrementView(slug) {
    try {
      const url = Config.endpoints.news.view(slug);
      const response = await axios.post(url);
      return { 
        success: true, 
        viewCount: response.data?.view_count || response.data?.data?.view_count || 0 
      };
    } catch (error) {
      console.error('❌ Error incrementing view:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * افزایش لایک خبر
   */
  async incrementLike(slug) {
    try {
      const url = Config.endpoints.news.like(slug);
      const response = await axios.post(url);
      return { 
        success: true, 
        likeCount: response.data?.like_count || response.data?.data?.like_count || 0 
      };
    } catch (error) {
      console.error('❌ Error incrementing like:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * افزایش اشتراک‌گذاری خبر
   */
  async incrementShare(slug) {
    try {
      const url = Config.endpoints.news.share(slug);
      const response = await axios.post(url);
      return { 
        success: true, 
        shareCount: response.data?.share_count || response.data?.data?.share_count || 0 
      };
    } catch (error) {
      console.error('❌ Error incrementing share:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * مطالب ارسالی کاربر لاگین‌شده (پروفایل)
   */
  async getMyContributions(headers = {}) {
    try {
      const url = Config.endpoints.news.myContributions()
      const response = await axios.get(url, { headers })
      const data = response.data
      const list = data?.results || data?.data || (Array.isArray(data) ? data : [])
      return {
        success: true,
        data: list,
        total: data?.count ?? list.length,
      }
    } catch (error) {
      console.error('❌ Error fetching my contributions:', error)
      return {
        success: false,
        error:
          error.response?.data?.detail ||
          error.message ||
          'خطا در دریافت مطالب',
        data: [],
        total: 0,
      }
    }
  },

  /**
   * ارسال مطلب توسط مخاطب — وضعیت pending تا تایید مدیر
   * data: FormData یا object
   */
  async contributeNews(data) {
    try {
      const url = Config.endpoints.news.contribute()
      const isFormData =
        typeof FormData !== 'undefined' && data instanceof FormData
      const headers = {}
      if (isFormData) {
        /* Content-Type را نگذار تا boundary درست شود */
      }
      const response = await axios.post(url, data, { headers })
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message,
      }
    } catch (error) {
      console.error('❌ Error contributing news:', error)
      const errData = error.response?.data
      let message = 'خطا در ارسال مطلب'
      if (typeof errData === 'string') message = errData
      else if (errData?.message) message = errData.message
      else if (errData?.detail) message = errData.detail
      else if (errData && typeof errData === 'object') {
        const key = Object.keys(errData)[0]
        const val = errData[key]
        message = Array.isArray(val) ? val[0] : String(val)
      }
      return { success: false, error: message }
    }
  },

  /**
   * ایجاد خبر جدید (فقط ادمین)
   * data می‌تواند object معمولی یا FormData باشد
   */
  async createNews(data, headers = {}) {
    try {
      const url = Config.endpoints.news.create();
      const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
      // برای FormData هدر Content-Type را ست نکن تا boundary درست ساخته شود
      const requestHeaders = { ...headers };
      if (isFormData && requestHeaders['Content-Type']) {
        delete requestHeaders['Content-Type'];
      }
      const response = await axios.post(url, data, {
        headers: requestHeaders,
      });

      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ Error creating news:', error);
      const errData = error.response?.data;
      let message = 'خطا در ایجاد خبر';
      if (typeof errData === 'string') message = errData;
      else if (errData?.message) message = errData.message;
      else if (errData?.detail) message = errData.detail;
      else if (errData && typeof errData === 'object') {
        const key = Object.keys(errData)[0];
        const val = errData[key];
        message = `${key}: ${Array.isArray(val) ? val[0] : val}`;
      }
      return {
        success: false,
        error: message,
      };
    }
  },

  /**
   * ویرایش خبر (فقط ادمین)
   */
  async updateNews(slug, data) {
    try {
      const url = Config.endpoints.news.update(slug);
      const response = await axios.put(url, data);
      
      return {
        success: true,
        data: response.data.data || response.data,
      };
    } catch (error) {
      console.error('❌ Error updating news:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در ویرایش خبر',
      };
    }
  },

  /**
   * حذف خبر (فقط ادمین)
   */
  async deleteNews(slug) {
    try {
      const url = Config.endpoints.news.delete(slug);
      const response = await axios.delete(url);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Error deleting news:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در حذف خبر',
      };
    }
  },

  // ============================================================
  // 🔹 کامنت‌ها
  // ============================================================

  /**
   * دریافت کامنت‌های یک خبر
   */
  async getComments(newsId, params = {}) {
    try {
      const url = Config.endpoints.news.comments(newsId, params);
      const response = await axios.get(url);
      
      console.log('📦 Comments response:', response.data);

      const data = response.data;
      
      // ساختار با data.data
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      // ساختار با results
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      // ساختار مستقیم آرایه
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * ارسال کامنت جدید
   */
  async addComment(newsId, text, parentId = null, guestName = null, guestEmail = null) {
    try {
      const url = Config.endpoints.news.addComment();
      
      const payload = {
        news: newsId,
        text: text,
        parent: parentId,
        guest_name: guestName,
        guest_email: guestEmail
      };
      
      // حذف فیلدهای خالی
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });
      
      console.log('📤 Sending comment:', payload);
      
      const response = await axios.post(url, payload);
      console.log('📦 Add comment response:', response.data);
      
      return {
        success: true,
        data: response.data.data || response.data
      };
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || 'خطا در ارسال نظر',
        details: error.response?.data
      };
    }
  },

  /**
   * لایک کردن کامنت
   */
  async likeComment(commentId) {
    try {
      const url = Config.endpoints.news.likeComment(commentId);
      const response = await axios.post(url);
      
      return {
        success: true,
        likes: response.data?.likes || 0
      };
    } catch (error) {
      console.error('❌ Error liking comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در لایک کردن'
      };
    }
  },

  /**
   * حذف کامنت
   */
  async deleteComment(commentId) {
    try {
      const url = Config.endpoints.news.deleteComment(commentId);
      const response = await axios.delete(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در حذف نظر'
      };
    }
  },

  /**
   * تایید کامنت (فقط ادمین)
   */
  async approveComment(commentId) {
    try {
      const url = Config.endpoints.news.approveComment(commentId);
      const response = await axios.post(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error approving comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در تایید نظر'
      };
    }
  },

  /**
   * رد کامنت (فقط ادمین)
   */
  async rejectComment(commentId) {
    try {
      const url = Config.endpoints.news.rejectComment(commentId);
      const response = await axios.post(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Error rejecting comment:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در رد نظر'
      };
    }
  },

  /**
   * دریافت کامنت‌های در انتظار تایید (فقط ادمین)
   */
  async getPendingComments() {
    try {
      const url = Config.endpoints.news.pendingComments();
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching pending comments:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * دریافت آمار کامنت‌ها (فقط ادمین)
   */
  async getCommentStats() {
    try {
      const url = Config.endpoints.news.commentStats();
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data) {
        return { success: true, data: data.data };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error fetching comment stats:', error);
      return { success: false, data: null, error: error.message };
    }
  },

  // ============================================================
  // 🔹 ویدیوها
  // ============================================================

  /**
   * دریافت لیست ویدیوها
   */
  async getVideos(params = {}) {
    try {
      const url = Config.endpoints.news.videos(params);
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data && Array.isArray(data.data)) {
        return { success: true, data: data.data };
      }
      
      if (data.results && Array.isArray(data.results)) {
        return { success: true, data: data.results };
      }
      
      if (Array.isArray(data)) {
        return { success: true, data: data };
      }

      return { success: true, data: [] };
    } catch (error) {
      console.error('❌ Error fetching videos:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  /**
   * دریافت جزئیات ویدیو
   */
  async getVideoById(id) {
    try {
      const url = Config.endpoints.news.videoDetail(id);
      const response = await axios.get(url);
      
      const data = response.data;
      
      if (data.data) {
        return { success: true, data: data.data };
      }
      
      return { success: true, data: data };
    } catch (error) {
      console.error('❌ Error fetching video:', error);
      return { success: false, data: null, error: error.message };
    }
  },
};

export default newsService;