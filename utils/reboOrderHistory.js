const STORAGE_KEY = 'rebo_package_orders_v1'
const MAX_ORDERS = 40

function emptyList() {
  return []
}

export function readReboOrderHistory() {
  if (typeof window === 'undefined') return emptyList()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyList()
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data.filter((row) => row && row.request_number) : emptyList()
  } catch {
    return emptyList()
  }
}

export function writeReboOrderHistory(list) {
  if (typeof window === 'undefined') return emptyList()
  const next = (Array.isArray(list) ? list : [])
    .filter((row) => row && row.request_number)
    .slice(0, MAX_ORDERS)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(
    new CustomEvent('rebo-package-orders-changed', { detail: next }),
  )
  return next
}

export function pushReboOrderHistory(entry) {
  if (!entry?.request_number) return readReboOrderHistory()
  const prev = readReboOrderHistory().filter(
    (row) => row.request_number !== entry.request_number,
  )
  const row = {
    request_number: String(entry.request_number),
    title: entry.title || 'سفارش ربو',
    total: Number(entry.total) || 0,
    currency: entry.currency || 'تومان',
    package_count: Number(entry.package_count) || 0,
    item_count: Number(entry.item_count) || 0,
    summary: entry.summary || '',
    created_at: entry.created_at || new Date().toISOString(),
  }
  return writeReboOrderHistory([row, ...prev])
}

export function clearReboOrderHistory() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(
    new CustomEvent('rebo-package-orders-changed', { detail: [] }),
  )
}
