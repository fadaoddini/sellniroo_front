import axios from 'axios'
import Config from '@/config/config'

const authHeaders = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const softappsService = {
  async list(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.softapps.list(params), {
        headers: authHeaders(),
      })
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری نرم‌افزارها',
        data: { apps: [], categories: [], platforms: [] },
      }
    }
  },

  async detail(slug) {
    try {
      const res = await axios.get(Config.endpoints.softapps.detail(slug), {
        headers: authHeaders(),
      })
      return { success: true, data: res.data?.data || null }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'نرم‌افزار یافت نشد',
      }
    }
  },

  async purchase(id, payload = {}) {
    try {
      const res = await axios.post(
        Config.endpoints.softapps.purchase(id),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {}, message: res.data?.message }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در شروع پرداخت',
        code: e.response?.data?.code,
      }
    }
  },

  async download(id) {
    try {
      const res = await axios.post(
        Config.endpoints.softapps.download(id),
        {},
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در دانلود',
        code: e.response?.data?.code,
        httpStatus: e.response?.status,
      }
    }
  },

  async manageList() {
    try {
      const res = await axios.get(Config.endpoints.softapps.manageApps(), {
        headers: authHeaders(),
      })
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        data: [],
      }
    }
  },

  async createApp(formData) {
    try {
      const res = await axios.post(
        Config.endpoints.softapps.manageApps(),
        formData,
        {
          headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return { success: true, data: res.data?.data || {}, message: res.data?.message }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ایجاد',
        errors: e.response?.data?.errors,
      }
    }
  },

  async updateApp(id, formData) {
    try {
      const res = await axios.patch(
        Config.endpoints.softapps.manageApp(id),
        formData,
        {
          headers: {
            ...authHeaders(),
            'Content-Type': 'multipart/form-data',
          },
        }
      )
      return { success: true, data: res.data?.data || {}, message: res.data?.message }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ویرایش',
        errors: e.response?.data?.errors,
      }
    }
  },

  async deleteApp(id) {
    try {
      await axios.delete(Config.endpoints.softapps.manageApp(id), {
        headers: authHeaders(),
      })
      return { success: true }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا در حذف' }
    }
  },

  async manageCategories() {
    try {
      const res = await axios.get(Config.endpoints.softapps.manageCategories(), {
        headers: authHeaders(),
      })
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا', data: [] }
    }
  },

  async createCategory(payload) {
    try {
      const res = await axios.post(
        Config.endpoints.softapps.manageCategories(),
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
        Config.endpoints.softapps.manageCategory(id),
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
      await axios.delete(Config.endpoints.softapps.manageCategory(id), {
        headers: authHeaders(),
      })
      return { success: true }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا در حذف' }
    }
  },

  async accounting(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.softapps.accounting(params), {
        headers: authHeaders(),
      })
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری حسابداری',
      }
    }
  },
}

export default softappsService
