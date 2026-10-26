// services/shopOwnerApi.js — API پنل صاحب فروشگاه
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
      data?.error || data?.detail || `خطای پنل فروشگاه (${res.status})`,
    )
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

const shopOwnerApi = {
  dashboard() {
    return fetch(Config.endpoints.shop.ownerDashboard(), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  getShop() {
    return fetch(Config.endpoints.shop.ownerMe(), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  createShop(payload) {
    return fetch(Config.endpoints.shop.ownerMe(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  updateShop(payload) {
    return fetch(Config.endpoints.shop.ownerMe(), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  listProducts(params = {}) {
    return fetch(Config.endpoints.shop.ownerProducts(params), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  getProduct(id) {
    return fetch(Config.endpoints.shop.ownerProductDetail(id), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  createProduct(payload) {
    return fetch(Config.endpoints.shop.ownerProducts(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  updateProduct(id, payload) {
    return fetch(Config.endpoints.shop.ownerProductDetail(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },

  deactivateProduct(id) {
    return fetch(Config.endpoints.shop.ownerProductDetail(id), {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(parse)
  },

  uploadProductImage(id, file) {
    const body = new FormData()
    body.append('image', file)
    return fetch(Config.endpoints.shop.ownerProductImages(id), {
      method: 'POST',
      headers: authHeaders(false),
      body,
    }).then(parse)
  },

  deleteProductImage(id, imageId) {
    return fetch(Config.endpoints.shop.ownerProductImageDetail(id, imageId), {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(parse)
  },

  uploadProductMedia(id, { video, poster } = {}) {
    const body = new FormData()
    if (video) body.append('video', video)
    if (poster) body.append('poster', poster)
    return fetch(Config.endpoints.shop.ownerProductMedia(id), {
      method: 'POST',
      headers: authHeaders(false),
      body,
    }).then(parse)
  },

  deleteProductMedia(id, kind = 'video') {
    const url = `${Config.endpoints.shop.ownerProductMedia(id)}?kind=${encodeURIComponent(kind)}`
    return fetch(url, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(parse)
  },

  listCategories() {
    return fetch(Config.endpoints.shop.ownerCategories(), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  listOrders(params = {}) {
    return fetch(Config.endpoints.order.ownerOrders(params), {
      headers: authHeaders(),
      cache: 'no-store',
    }).then(parse)
  },

  updateOrder(id, payload) {
    return fetch(Config.endpoints.order.ownerOrderDetail(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(parse)
  },
}

export default shopOwnerApi
