import axios from 'axios'
import Config from '@/config/config'

const gymShopService = {
  async listProducts(params = {}) {
    try {
      const res = await axios.get(
        Config.endpoints.bodybuilding.shopProducts.publicList(params),
      )
      const payload = res.data?.data || {}
      const products = Array.isArray(payload.products) ? payload.products : []
      return {
        success: true,
        data: {
          business_slug: payload.business_slug || 'site-bodybuilding',
          shop_id: payload.shop_id || null,
          shop_title: payload.shop_title || '',
          products,
        },
      }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا در بارگذاری فروشگاه',
        data: {
          business_slug: '',
          shop_id: null,
          shop_title: '',
          products: [],
        },
      }
    }
  },
}

export default gymShopService
