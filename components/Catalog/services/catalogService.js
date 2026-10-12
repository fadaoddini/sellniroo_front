import axios from 'axios'
import Config from '@/config/config'

const authHeaders = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const catalogService = {
  async getBundle() {
    try {
      const res = await axios.get(Config.endpoints.catalog.bundle())
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا' }
    }
  },

  async getSettings() {
    try {
      const res = await axios.get(Config.endpoints.catalog.settings())
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا' }
    }
  },

  async updateSettings(payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.catalog.settings(),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ذخیره',
      }
    }
  },

  async getPages(includeInactive = false) {
    try {
      const params = includeInactive ? { include_inactive: '1' } : {}
      const res = await axios.get(Config.endpoints.catalog.pages(params), {
        headers: includeInactive ? authHeaders() : {},
      })
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا' }
    }
  },

  async createPage(formData) {
    try {
      const res = await axios.post(Config.endpoints.catalog.pages(), formData, {
        headers: {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: res.data?.data }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ایجاد',
      }
    }
  },

  async updatePage(id, formData) {
    try {
      const res = await axios.patch(Config.endpoints.catalog.page(id), formData, {
        headers: {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: res.data?.data }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بروزرسانی',
      }
    }
  },

  async deletePage(id) {
    try {
      await axios.delete(Config.endpoints.catalog.page(id), {
        headers: authHeaders(),
      })
      return { success: true }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در حذف',
      }
    }
  },

  async reorder(orderIds) {
    try {
      const res = await axios.post(
        Config.endpoints.catalog.reorder(),
        { order: orderIds },
        { headers: { ...authHeaders(), 'Content-Type': 'application/json' } }
      )
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ترتیب',
      }
    }
  },

  async uploadMedia(file) {
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await axios.post(Config.endpoints.catalog.upload(), fd, {
        headers: {
          ...authHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      })
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در آپلود',
      }
    }
  },
}

export default catalogService
