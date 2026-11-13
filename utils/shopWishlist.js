/** علاقه‌مندی محصولات فروشگاه — localStorage + همگام‌سازی تب‌ها */

export const SHOP_WISHLIST_KEY = 'shop_likes'
export const SHOP_WISHLIST_EVENT = 'shop-wishlist-changed'

function readMap() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(SHOP_WISHLIST_KEY)
    const map = raw ? JSON.parse(raw) : {}
    return map && typeof map === 'object' ? map : {}
  } catch {
    return {}
  }
}

function writeMap(map) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SHOP_WISHLIST_KEY, JSON.stringify(map))
    window.dispatchEvent(
      new CustomEvent(SHOP_WISHLIST_EVENT, { detail: { map } })
    )
  } catch {
    /* ignore quota / private mode */
  }
}

export function isProductWishlisted(productId) {
  if (productId == null) return false
  return !!readMap()[String(productId)]
}

export function toggleProductWishlist(productId) {
  if (productId == null) return false
  const key = String(productId)
  const map = readMap()
  const next = !map[key]
  if (next) map[key] = 1
  else delete map[key]
  writeMap(map)
  return next
}

export function listWishlistedProductIds() {
  return Object.keys(readMap())
}
