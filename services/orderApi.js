// services/orderApi.js — سبد، آدرس، سفارش
import Config from '@/config/config'

function authHeaders(extra = {}) {
  if (typeof window === 'undefined') return { Accept: 'application/json', ...extra }
  const token = localStorage.getItem('accessToken')
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
}

function formatApiError(data, status) {
  if (!data) return `خطای سفارش (${status})`
  if (typeof data === 'string') return data
  if (data.error) return String(data.error)
  if (data.detail) {
    return typeof data.detail === 'string'
      ? data.detail
      : JSON.stringify(data.detail)
  }
  // خطاهای فیلدی DRF: { latitude: ['...'], mobile: ['...'] }
  if (typeof data === 'object') {
    const parts = []
    for (const [key, val] of Object.entries(data)) {
      if (key === 'status') continue
      const msg = Array.isArray(val) ? val.join('، ') : String(val)
      if (msg) parts.push(msg)
    }
    if (parts.length) return parts.join(' — ')
  }
  return `خطای سفارش (${status})`
}

async function parse(res) {
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    const err = new Error(formatApiError(data, res.status))
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

const orderApi = {
  async getCart(params = {}) {
    const url = Config.endpoints.order.cart(params)
    const res = await fetch(url, { headers: authHeaders(), cache: 'no-store' })
    return parse(res)
  },

  async upsertItem({ product_id, quantity, replace_shop = false }) {
    const res = await fetch(Config.endpoints.order.cartItems(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ product_id, quantity, replace_shop }),
    })
    return parse(res)
  },

  async deltaItem({ product_id, delta = 1, replace_shop = false }) {
    const res = await fetch(Config.endpoints.order.cartDelta(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ product_id, delta, replace_shop }),
    })
    return parse(res)
  },

  async clearCart(shopId) {
    const url = shopId
      ? `${Config.endpoints.order.cartClear()}?shop=${shopId}`
      : Config.endpoints.order.cartClear()
    const res = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(shopId ? { shop_id: shopId } : {}),
    })
    return parse(res)
  },

  async listAddresses() {
    const res = await fetch(Config.endpoints.order.addresses(), {
      headers: authHeaders(),
      cache: 'no-store',
    })
    return parse(res)
  },

  async createAddress(payload) {
    const res = await fetch(Config.endpoints.order.addresses(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return parse(res)
  },

  async updateAddress(id, payload) {
    const res = await fetch(Config.endpoints.order.addressDetail(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return parse(res)
  },

  async deleteAddress(id) {
    const res = await fetch(Config.endpoints.order.addressDetail(id), {
      method: 'DELETE',
      headers: authHeaders(),
    })
    if (!res.ok && res.status !== 204) return parse(res)
    return { success: true }
  },

  async checkout(payload) {
    const res = await fetch(Config.endpoints.order.checkout(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return parse(res)
  },

  async shippingEstimate(payload) {
    const res = await fetch(Config.endpoints.order.shippingEstimate(), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    return parse(res)
  },

  async getWalletBalance() {
    const res = await fetch(Config.endpoints.order.wallet(), {
      headers: authHeaders(),
      cache: 'no-store',
    })
    return parse(res)
  },

  async listOrders() {
    const res = await fetch(Config.endpoints.order.orders(), {
      headers: authHeaders(),
      cache: 'no-store',
    })
    return parse(res)
  },

  async getOrder(id) {
    const res = await fetch(Config.endpoints.order.orderDetail(id), {
      headers: authHeaders(),
      cache: 'no-store',
    })
    return parse(res)
  },

  async uploadReceipt(orderId, { file, note = '' }) {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const body = new FormData()
    body.append('receipt', file)
    if (note) body.append('note', note)
    const res = await fetch(Config.endpoints.order.orderReceipt(orderId), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
    })
    return parse(res)
  },

  async publicPaymentConfig() {
    const res = await fetch(Config.endpoints.payment.publicConfig(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    return parse(res)
  },
}

export default orderApi
