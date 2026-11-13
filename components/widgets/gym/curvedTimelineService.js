import axios from 'axios'
import Config from '@/config/config'

const authHeaders = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const curvedTimelineService = {
  async getBundle() {
    try {
      const res = await axios.get(Config.endpoints.curvedTimeline.bundle())
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
      const res = await axios.get(Config.endpoints.curvedTimeline.settings())
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا' }
    }
  },

  async updateSettings(payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.curvedTimeline.settings(),
        payload,
        { headers: authHeaders() },
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

  async getSteps(includeInactive = false) {
    try {
      const res = await axios.get(
        Config.endpoints.curvedTimeline.steps({
          include_inactive: includeInactive ? '1' : undefined,
        }),
        { headers: includeInactive ? authHeaders() : {} },
      )
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا', data: [] }
    }
  },

  async createStep(payload) {
    try {
      const res = await axios.post(
        Config.endpoints.curvedTimeline.steps(),
        payload,
        { headers: authHeaders() },
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

  async updateStep(id, payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.curvedTimeline.step(id),
        payload,
        { headers: authHeaders() },
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

  async deleteStep(id) {
    try {
      await axios.delete(Config.endpoints.curvedTimeline.step(id), {
        headers: authHeaders(),
      })
      return { success: true }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا در حذف' }
    }
  },
}

export default curvedTimelineService
