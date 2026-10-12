import axios from 'axios'
import Config from '@/config/config'

const authHeaders = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const quizService = {
  async getBundle(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.quiz.bundle(params))
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری آزمون',
      }
    }
  },

  async start(specialtyKey) {
    try {
      const res = await axios.post(Config.endpoints.quiz.start(), {
        specialty_key: specialtyKey,
      })
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در شروع آزمون',
      }
    }
  },

  async submit(payload) {
    try {
      const res = await axios.post(
        Config.endpoints.quiz.submit(),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ثبت امتیاز',
      }
    }
  },

  async getLeaderboard(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.quiz.leaderboard(params))
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        data: [],
      }
    }
  },

  async getSettings() {
    try {
      const res = await axios.get(Config.endpoints.quiz.settings())
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا' }
    }
  },

  async updateSettings(payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.quiz.settings(),
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

  async getSpecialties(includeInactive = false) {
    try {
      const params = includeInactive ? { include_inactive: '1' } : {}
      const res = await axios.get(Config.endpoints.quiz.specialties(params), {
        headers: includeInactive ? authHeaders() : {},
      })
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا', data: [] }
    }
  },

  async createSpecialty(payload) {
    try {
      const res = await axios.post(
        Config.endpoints.quiz.specialties(),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ایجاد',
      }
    }
  },

  async updateSpecialty(id, payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.quiz.specialty(id),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ذخیره',
      }
    }
  },

  async deleteSpecialty(id) {
    try {
      await axios.delete(Config.endpoints.quiz.specialty(id), {
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

  async getQuestions(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.quiz.questions(params), {
        headers: authHeaders(),
      })
      return { success: true, data: res.data?.data || [] }
    } catch (e) {
      return { success: false, error: e.response?.data?.message || 'خطا', data: [] }
    }
  },

  async createQuestion(payload) {
    try {
      const res = await axios.post(
        Config.endpoints.quiz.questions(),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ایجاد',
      }
    }
  },

  async updateQuestion(id, payload) {
    try {
      const res = await axios.patch(
        Config.endpoints.quiz.question(id),
        payload,
        { headers: authHeaders() }
      )
      return { success: true, data: res.data?.data }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در ذخیره',
      }
    }
  },

  async deleteQuestion(id) {
    try {
      await axios.delete(Config.endpoints.quiz.question(id), {
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

  async getScores(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.quiz.scores(params), {
        headers: authHeaders(),
      })
      const raw = res.data?.data
      // سازگاری با پاسخ قدیمی (آرایه) و جدید ({ items, stats })
      if (Array.isArray(raw)) {
        return { success: true, data: { items: raw, stats: null, mode: 'attempts' } }
      }
      return {
        success: true,
        data: {
          items: raw?.items || [],
          stats: raw?.stats || null,
          mode: raw?.mode || 'attempts',
        },
      }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        data: { items: [], stats: null },
      }
    }
  },

  async getMyHistory(params = {}) {
    try {
      const res = await axios.get(Config.endpoints.quiz.my(params), {
        headers: authHeaders(),
      })
      return { success: true, data: res.data?.data || {} }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری تاریخچه آزمون',
        data: null,
      }
    }
  },
}

export default quizService
