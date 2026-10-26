// services/platformShopApi.js — مدیریت فروشگاه‌ها و تسویه پلتفرم
import Config from '@/config/config'

function authHeaders(json = true) {
  if (typeof window === 'undefined') return { Accept: 'application/json' }
  const token = localStorage.getItem('accessToken')
  const h = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  if (json) h['Content-Type'] = 'application/json'
  return h
}

async function parse(res) {
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const err = new Error(
      data?.error || data?.detail || `خطای مدیریت فروشگاه (${res.status})`,
    )
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

const platformShopApi = {
  overview() {
    return fetch(Config.endpoints.shop.platformOverview(), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  listShops(params = {}) {
    return fetch(Config.endpoints.shop.platformShops(params), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  getShop(id) {
    return fetch(Config.endpoints.shop.platformShopDetail(id), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  updateShop(id, payload) {
    return fetch(Config.endpoints.shop.platformShopDetail(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  unsettled(params = {}) {
    return fetch(Config.endpoints.order.platformUnsettled(params), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  listSettlements(params = {}) {
    return fetch(Config.endpoints.order.platformSettlements(params), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  createSettlement(payload, file) {
    if (file) {
      const body = new FormData()
      Object.entries(payload || {}).forEach(([k, v]) => {
        if (v == null || v === '') return
        if (Array.isArray(v)) body.append(k, JSON.stringify(v))
        else body.append(k, String(v))
      })
      body.append('payment_proof', file)
      return fetch(Config.endpoints.order.platformSettlements(), {
        method: 'POST',
        headers: authHeaders(false),
        body,
      }).then(parse)
    }
    return fetch(Config.endpoints.order.platformSettlements(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  getSettlement(id) {
    return fetch(Config.endpoints.order.platformSettlementDetail(id), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  updateSettlement(id, payload, file) {
    if (file) {
      const body = new FormData()
      Object.entries(payload || {}).forEach(([k, v]) => {
        if (v == null || v === '') return
        body.append(k, String(v))
      })
      body.append('payment_proof', file)
      return fetch(Config.endpoints.order.platformSettlementDetail(id), {
        method: 'PATCH',
        headers: authHeaders(false),
        body,
      }).then(parse)
    }
    return fetch(Config.endpoints.order.platformSettlementDetail(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  listProducts(params = {}) {
    return fetch(Config.endpoints.shop.platformProducts(params), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  getProduct(id) {
    return fetch(Config.endpoints.shop.platformProductDetail(id), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  createProduct(payload) {
    return fetch(Config.endpoints.shop.platformProducts(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  updateProduct(id, payload) {
    return fetch(Config.endpoints.shop.platformProductDetail(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  deactivateProduct(id) {
    return fetch(Config.endpoints.shop.platformProductDetail(id), {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(parse)
  },

  uploadProductImage(id, file) {
    const body = new FormData()
    body.append('image', file)
    return fetch(Config.endpoints.shop.platformProductImages(id), {
      method: 'POST',
      headers: authHeaders(false),
      body,
    }).then(parse)
  },

  deleteProductImage(id, imageId) {
    return fetch(Config.endpoints.shop.platformProductImageDetail(id, imageId), {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(parse)
  },

  uploadProductMedia(id, { video, poster } = {}) {
    const body = new FormData()
    if (video) body.append('video', video)
    if (poster) body.append('poster', poster)
    return fetch(Config.endpoints.shop.platformProductMedia(id), {
      method: 'POST',
      headers: authHeaders(false),
      body,
    }).then(parse)
  },

  listCategories(params = {}) {
    return fetch(Config.endpoints.shop.platformCategories(params), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  createCategory(payload) {
    return fetch(Config.endpoints.shop.platformCategories(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  updateCategory(id, payload) {
    return fetch(Config.endpoints.shop.platformCategoryDetail(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  deleteCategory(id, { cascade = false } = {}) {
    const url = `${Config.endpoints.shop.platformCategoryDetail(id)}${
      cascade ? '?cascade=1' : ''
    }`
    return fetch(url, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(parse)
  },

  listCategoryTemplates() {
    return fetch(Config.endpoints.shop.platformCategoryTemplates(), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  injectCategoryTemplates(payload) {
    return fetch(Config.endpoints.shop.platformCategoryTemplates(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },
}

export default platformShopApi
