// services/shopApi.js — کلاینت API فروشگاه
import Config from '@/config/config'

function abs(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path
  try {
    const base = Config.getApiBase?.() || Config.API_BASE || ''
    if (base && path.startsWith('/')) {
      return `${String(base).replace(/\/$/, '')}${path}`
    }
  } catch {
    /* ignore */
  }
  return path
}

async function getJson(url, opts = {}) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json', ...(opts.headers || {}) },
    ...opts,
  })
  if (!res.ok) {
    let msg = `خطای فروشگاه (${res.status})`
    try {
      const j = await res.json()
      msg = j?.error || j?.detail || msg
    } catch {
      /* ignore */
    }
    throw new Error(msg)
  }
  return res.json()
}

export const DEMO_PRODUCTS = [
  {
    id: 9001,
    title: 'محصول ویژه نمونه',
    price_one: 450000,
    discount: 15,
    final_price: 382500,
    has_discount: true,
    rate: 4.6,
    shop: 9000,
    shop_id: 9000,
    shop_title: 'فروشگاه نمونه',
    category_title: 'عمومی',
    is_featured: true,
    sales_count: 120,
    image: '',
  },
  {
    id: 9002,
    title: 'کالای پرفروش',
    price_one: 220000,
    discount: 0,
    final_price: 220000,
    has_discount: false,
    rate: 4.8,
    shop: 9000,
    shop_id: 9000,
    shop_title: 'فروشگاه نمونه',
    category_title: 'پرفروش',
    is_featured: false,
    sales_count: 340,
    image: '',
  },
  {
    id: 9003,
    title: 'آیتم تخفیف‌دار',
    price_one: 980000,
    discount: 30,
    final_price: 686000,
    has_discount: true,
    rate: 4.2,
    shop: 9000,
    shop_id: 9000,
    shop_title: 'فروشگاه نمونه',
    category_title: 'پیشنهاد',
    is_featured: true,
    sales_count: 55,
    image: '',
  },
  {
    id: 9004,
    title: 'محصول جدید',
    price_one: 175000,
    discount: 0,
    final_price: 175000,
    has_discount: false,
    rate: 4.0,
    shop: 9000,
    shop_id: 9000,
    shop_title: 'فروشگاه نمونه',
    category_title: 'تازه',
    is_featured: false,
    sales_count: 12,
    image: '',
  },
]

function demoBySource(source) {
  if (source === 'featured') return DEMO_PRODUCTS.filter((p) => p.is_featured)
  if (source === 'bestsellers')
    return [...DEMO_PRODUCTS].sort((a, b) => b.sales_count - a.sales_count)
  if (source === 'discounted') return DEMO_PRODUCTS.filter((p) => p.has_discount)
  if (source === 'stories') return DEMO_PRODUCTS
  return DEMO_PRODUCTS
}

const shopApi = {
  productsUrl(params = {}) {
    return Config.endpoints.shop.products(params)
  },
  async listProducts(params = {}, { demoFallback = true } = {}) {
    try {
      const data = await getJson(Config.endpoints.shop.products(params))
      const results = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []
      return { ...data, results }
    } catch (e) {
      if (!demoFallback) throw e
      const source = params.source || 'latest'
      const limit = Number(params.limit) || 8
      return {
        count: demoBySource(source).length,
        results: demoBySource(source).slice(0, limit),
        demo: true,
      }
    }
  },
  async widgetBundle(limit = 8, { demoFallback = true } = {}) {
    try {
      return await getJson(Config.endpoints.shop.widgets({ limit }))
    } catch (e) {
      if (!demoFallback) throw e
      return {
        latest: demoBySource('latest').slice(0, limit),
        featured: demoBySource('featured').slice(0, limit),
        bestsellers: demoBySource('bestsellers').slice(0, limit),
        discounted: demoBySource('discounted').slice(0, limit),
        stories: demoBySource('stories').slice(0, limit),
        demo: true,
        limit,
      }
    }
  },
  async getProduct(id, { demoFallback = true } = {}) {
    try {
      return await getJson(Config.endpoints.shop.productDetail(id))
    } catch (e) {
      if (!demoFallback) throw e
      const demo = DEMO_PRODUCTS.find((p) => String(p.id) === String(id)) || {
        ...DEMO_PRODUCTS[0],
        id: Number(id) || DEMO_PRODUCTS[0].id,
        description: 'توضیحات نمونه محصول برای پیش‌نمایش صفحه سینگل.',
        images: [],
      }
      return demo
    }
  },
  async listCategories({ demoFallback = true } = {}) {
    try {
      const data = await getJson(Config.endpoints.shop.categories())
      return Array.isArray(data) ? data : data?.results || []
    } catch (e) {
      if (!demoFallback) throw e
      return [
        { id: 1, title: 'عمومی' },
        { id: 2, title: 'پیشنهاد ویژه' },
        { id: 3, title: 'تازه رسیده' },
      ]
    }
  },
  productHref(product) {
    return `/shop/products/${product?.id || ''}`
  },
  resolveImage(product) {
    return abs(product?.image || product?.images?.[0]?.image_url || '')
  },
}

export default shopApi
