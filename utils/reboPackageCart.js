const STORAGE_KEY = 'rebo_package_cart_v1'

export function readReboPackageCart() {
  if (typeof window === 'undefined') {
    return { packages: [], items: [], total: 0, currency: 'تومان', updatedAt: null }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { packages: [], items: [], total: 0, currency: 'تومان', updatedAt: null }
    }
    const data = JSON.parse(raw)
    return {
      packages: Array.isArray(data.packages) ? data.packages : [],
      items: Array.isArray(data.items) ? data.items : [],
      total: Math.max(0, Number(data.total) || 0),
      currency: data.currency || 'تومان',
      note: typeof data.note === 'string' ? data.note : '',
      updatedAt: data.updatedAt || null,
    }
  } catch {
    return { packages: [], items: [], total: 0, currency: 'تومان', updatedAt: null }
  }
}

export function writeReboPackageCart(cart) {
  if (typeof window === 'undefined') return
  const payload = {
    packages: Array.isArray(cart?.packages) ? cart.packages : [],
    items: Array.isArray(cart?.items) ? cart.items : [],
    total: Math.max(0, Number(cart?.total) || 0),
    currency: cart?.currency || 'تومان',
    note: typeof cart?.note === 'string' ? cart.note : '',
    updatedAt: new Date().toISOString(),
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent('rebo-package-cart-changed', { detail: payload }))
  return payload
}

export function clearReboPackageCart() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('rebo-package-cart-changed', { detail: null }))
}

export function buildReboOrderNextPath() {
  return '/profile?tab=rebo'
}
