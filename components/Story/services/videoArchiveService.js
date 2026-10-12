// services/videoArchiveService.js

import axios from 'axios'
import Config from '@/config/config'

const videoArchiveService = {
  async getVideos(page = 1, pageSize = 8, extraParams = {}) {
    try {
      const url = Config.endpoints.videoArchive.list({
        page,
        page_size: pageSize,
        ...extraParams,
      })

      const headers = {}
      if (extraParams.include_inactive && typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken')
        if (token) headers.Authorization = `Bearer ${token}`
      }

      const response = await axios.get(url, { headers })

      const data = response.data?.data || {}
      const items = data.items || []
      const pagination = data.pagination || {}

      return {
        success: true,
        data: {
          items,
          pagination: {
            current_page: pagination.current_page || 1,
            page_size: pagination.page_size || pageSize,
            total_items: pagination.total_items || 0,
            total_pages: pagination.total_pages || 1,
            has_next: pagination.has_next || false,
            has_previous: pagination.has_previous || false,
            next_page_number: pagination.next_page_number || null,
            previous_page_number: pagination.previous_page_number || null,
          },
        },
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت ویدیوها',
      }
    }
  },

  async getVideo(id) {
    try {
      const response = await axios.get(Config.endpoints.videoArchive.detail(id))
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت ویدیو',
      }
    }
  },

  async trackView(videoId) {
    try {
      const response = await axios.post(
        Config.endpoints.videoArchive.trackView(videoId)
      )
      return {
        success: true,
        data: response.data?.data || {},
      }
    } catch (error) {
      console.warn('Error tracking view:', error?.message)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در ثبت بازدید',
      }
    }
  },

  async createVideo(videoData) {
    try {
      const formData = new FormData()
      if (videoData.title) formData.append('title', videoData.title)
      if (videoData.video) formData.append('video', videoData.video)
      if (videoData.thumbnail) formData.append('thumbnail', videoData.thumbnail)
      if (videoData.is_active !== undefined)
        formData.append('is_active', videoData.is_active)
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
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      console.error('Error creating video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در ایجاد ویدیو',
      }
    }
  },

  async updateVideo(id, videoData) {
    try {
      const formData = new FormData()
      if (videoData.title) formData.append('title', videoData.title)
      if (videoData.video) formData.append('video', videoData.video)
      if (videoData.thumbnail) formData.append('thumbnail', videoData.thumbnail)
      if (videoData.is_active !== undefined)
        formData.append('is_active', videoData.is_active)
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
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      console.error('Error updating video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در بروزرسانی ویدیو',
      }
    }
  },

  async deleteVideo(id) {
    try {
      await axios.delete(Config.endpoints.videoArchive.delete(id), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      return { success: true }
    } catch (error) {
      console.error('Error deleting video:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در حذف ویدیو',
      }
    }
  },

  async getStats() {
    try {
      const response = await axios.get(Config.endpoints.videoArchive.stats(), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      })
      return {
        success: true,
        data: response.data?.data || response.data,
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت آمار',
      }
    }
  },

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
