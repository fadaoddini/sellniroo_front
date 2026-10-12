import axios from 'axios'
import Config from '@/config/config'

const authHeaders = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const faqService = {
  async getBundle(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.faq.bundle(params))
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری',
      }
    }
  },

  async getSettings() {
    try {
      const res = await axios.get(Config.endpoints.faq.settings())
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا' }
    }
  },

  async updateSettings(payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.faq.settings(),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ذخیره',
        errors: e.response?.data?.errors,
      }
    }
  },

  async getCategories(includeInactive = false) {
    try {
      const res = await axios.get(
        Config.endpoints.faq.categories({
          include_inactive: includeInactive ? '1' : undefined,
        }),
        { headers: includeInactive ? authHeaders() : {} }
      )
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا', data: [] }
    }
  },

  async createCategory(payload) {
    try {
      const res = await axios.post(
        Config.endpoints.faq.categories(),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        errors: e.response?.data?.errors,
      }
    }
  },

  async updateCategory(id, payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.faq.category(id),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        errors: e.response?.data?.errors,
      }
    }
  },

  async deleteCategory(id) {
    try {
      await axios.delete(Config.endpoints.faq.category(id), {
        headers: authHeaders(),
      })
      return { success: true }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا در حذف' }
    }
  },

  async getItems(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.faq.items(params), {
        headers: params.include_inactive ? authHeaders() : {},
      })
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا', data: [] }
    }
  },

  async createItem(payload) {
    try {
      const res = await axios.post(
        Config.endpoints.faq.items(),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        errors: e.response?.data?.errors,
      }
    }
  },

  async updateItem(id, payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.faq.item(id),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        errors: e.response?.data?.errors,
      }
    }
  },

  async deleteItem(id) {
    try {
      await axios.delete(Config.endpoints.faq.item(id), {
        headers: authHeaders(),
      })
      return { success: true }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا در حذف' }
    }
  },
}

export default faqService
