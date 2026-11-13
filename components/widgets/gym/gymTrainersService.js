import axios from 'axios'
import Config from '@/config/config'

const gymTrainersService = {
  async list(params = {}) {
    try {
      const res = await axios.get(
        Config.endpoints.bodybuilding.trainers.publicList(params),
      )
      const payload = res.data?.data || {}
      const trainers = Array.isArray(payload.trainers)
        ? payload.trainers
        : Array.isArray(res.data)
          ? res.data
          : []
      return {
        success: true,
        data: {
          business_slug: payload.business_slug || 'site-bodybuilding',
          trainers,
        },
      }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری مربیان',
        data: { business_slug: '', trainers: [] },
      }
    }
  },
}

export default gymTrainersService
