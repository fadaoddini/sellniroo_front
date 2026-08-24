// services/videoArchiveService.js

import axios from 'axios'
import Config from '@/config/config'

const videoArchiveService = {
  // دریافت لیست ویدیوها (عمومی - نیازی به توکن ندارد)
  async getVideos(params = {}) {
    try {
      const response = await axios.get(
        Config.endpoints.videoArchive.list(params),
        {
          // ❌ حذف Authorization برای عمومی بودن
          // headers: {
          //   Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          // },
        }
      )
      return {
        success: true,
        data: response.data.data || response.data.results || [],
        count: response.data.count || 0,
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 0,
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت ویدیوها',
      }
    }
  },

  // دریافت جزئیات یک ویدیو (عمومی - نیازی به توکن ندارد)
  async getVideo(id) {
    try {
      const response = await axios.get(
        Config.endpoints.videoArchive.detail(id),
        {
          // ❌ حذف Authorization برای عمومی بودن
          // headers: {
          //   Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          // },
        }
      )
      return {
        success: true,
        data: response.data.data || response.data,
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت ویدیو',
      }
    }
  },

  // ایجاد ویدیو جدید (ادمین - نیاز به توکن دارد)
  async createVideo(videoData) {
    try {
      const formData = new FormData()
      if (videoData.title) formData.append('title', videoData.title)
      if (videoData.video) formData.append('video', videoData.video)
      if (videoData.thumbnail) formData.append('thumbnail', videoData.thumbnail)
      if (videoData.is_active !== undefined) formData.append('is_active', videoData.is_active)
      if (videoData.order !== undefined) formData.append('order', videoData.order)

      const response = await axios.post(
        Config.endpoints.videoArchive.create(),
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      console.error('Error creating video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در ایجاد ویدیو',
      }
    }
  },

  // بروزرسانی ویدیو (ادمین - نیاز به توکن دارد)
  async updateVideo(id, videoData) {
    try {
      const formData = new FormData()
      if (videoData.title) formData.append('title', videoData.title)
      if (videoData.video) formData.append('video', videoData.video)
      if (videoData.thumbnail) formData.append('thumbnail', videoData.thumbnail)
      if (videoData.is_active !== undefined) formData.append('is_active', videoData.is_active)
      if (videoData.order !== undefined) formData.append('order', videoData.order)

      const response = await axios.patch(
        Config.endpoints.videoArchive.update(id),
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return { success: true, data: response.data.data || response.data }
    } catch (error) {
      console.error('Error updating video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در بروزرسانی ویدیو',
      }
    }
  },

  // حذف ویدیو (ادمین - نیاز به توکن دارد)
  async deleteVideo(id) {
    try {
      await axios.delete(
        Config.endpoints.videoArchive.delete(id),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      return { success: true }
    } catch (error) {
      console.error('Error deleting video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در حذف ویدیو',
      }
    }
  },

  // ثبت بازدید (عمومی)
  async trackView(videoId) {
    try {
      // بازدید به صورت خودکار در سرور ثبت می‌شود
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },

  // دریافت آمار (ادمین - نیاز به توکن دارد)
  async getStats() {
    try {
      const response = await axios.get(
        Config.endpoints.videoArchive.stats(),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      )
      return {
        success: true,
        data: response.data.data || response.data,
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت آمار',
      }
    }
  },

  // تغییر ترتیب (ادمین - نیاز به توکن دارد)
  async reorder(orderData) {
    try {
      const response = await axios.post(
        Config.endpoints.videoArchive.reorder(),
        { order: orderData },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        }
      )
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error reordering videos:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در تغییر ترتیب',
      }
    }
  },
}

export default videoArchiveService