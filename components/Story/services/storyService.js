import axios from 'axios'
import Config from '@/config/config'

const storyService = {
  // دریافت لیست استوری‌ها
  async getStories() {
    try {
      const response = await axios.get(`${Config.baseUrl}/api/stories/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      return {
        success: true,
        data: response.data.results || response.data || [],
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در دریافت استوری‌ها',
      }
    }
  },

  // افزودن استوری جدید
  async createStory(storyData) {
    try {
      const formData = new FormData()
      formData.append('title', storyData.title || '')
      formData.append('image_url', storyData.image_url)
      formData.append('link', storyData.link || '')

      const response = await axios.post(
        `${Config.baseUrl}/api/stories/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error creating story:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در ایجاد استوری',
      }
    }
  },

  // حذف استوری
  async deleteStory(id) {
    try {
      await axios.delete(`${Config.baseUrl}/api/stories/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
      return { success: true }
    } catch (error) {
      console.error('Error deleting story:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'خطا در حذف استوری',
      }
    }
  },

  // ثبت بازدید
  async trackView(storyId) {
    try {
      await axios.post(`${Config.baseUrl}/api/stories/${storyId}/view/`)
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  },
}

export default storyService