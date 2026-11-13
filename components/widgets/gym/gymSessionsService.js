import axios from 'axios'
import Config from '@/config/config'

const gymSessionsService = {
  async list(params = {}) {
    try {
      const res = await axios.get(
        Config.endpoints.bodybuilding.sessions.publicList(params),
      )
      const payload = res.data?.data || {}
      const sessions = Array.isArray(payload.sessions)
        ? payload.sessions
        : Array.isArray(res.data)
          ? res.data
          : []
      return {
        success: true,
        data: {
          business_slug: payload.business_slug || 'site-bodybuilding',
          sessions,
        },
      }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری سانس‌ها',
        data: { business_slug: '', sessions: [] },
      }
    }
  },
}

export default gymSessionsService
