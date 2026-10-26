// utils/deliveryCalculator.js — فرمول هزینه ارسال (منطق foodpik / Kotlin)

const CONFIG = {
  BASE_PRICE: 60000, // تا ۱ کیلومتر
  BASE_DISTANCE: 1.0,
  PRICE_1_4_KM: 700, // هر ۱۰۰ متر از ۱ تا ۴ کیلومتر
  PRICE_OVER_4_KM: 900, // هر ۱۰۰ متر بعد از ۴ کیلومتر
  DISTANCE_4_KM: 4.0,
}

/** محاسبه هزینه بر اساس فاصله (کیلومتر) */
export function calculateDeliveryPrice(distanceKm) {
  const d = Math.max(0, Number(distanceKm) || 0)
  if (d <= CONFIG.BASE_DISTANCE) return CONFIG.BASE_PRICE

  if (d <= CONFIG.DISTANCE_4_KM) {
    const extraDistanceMeters = (d - CONFIG.BASE_DISTANCE) * 1000
    const extra100Meters = Math.ceil(extraDistanceMeters / 100)
    return CONFIG.BASE_PRICE + extra100Meters * CONFIG.PRICE_1_4_KM
  }

  const meters1To4 = (CONFIG.DISTANCE_4_KM - CONFIG.BASE_DISTANCE) * 1000
  const price1To4 = Math.ceil(meters1To4 / 100) * CONFIG.PRICE_1_4_KM
  const metersOver4 = (d - CONFIG.DISTANCE_4_KM) * 1000
  const priceOver4 = Math.ceil(metersOver4 / 100) * CONFIG.PRICE_OVER_4_KM
  return CONFIG.BASE_PRICE + price1To4 + priceOver4
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** فاصله مسیر از پروکسی نشان (سمت سرور Next) */
export async function fetchDistanceFromNeshan(origin, destination) {
  try {
    const qs = new URLSearchParams({
      originLat: String(origin.lat),
      originLng: String(origin.lng),
      destLat: String(destination.lat),
      destLng: String(destination.lng),
    })
    const res = await fetch(`/api/neshan/direction?${qs}`, { cache: 'no-store' })
    if (!res.ok) return 0
    const data = await res.json()
    return Number(data.distance_km) || 0
  } catch {
    return 0
  }
}

export function formatDistance(distanceKm) {
  const d = Number(distanceKm) || 0
  if (d < 1) return `${Math.round(d * 1000)} متر`
  return `${d.toFixed(1)} کیلومتر`
}

/**
 * فاصله + قیمت — اول نشان، در صورت شکست haversine
 * origin = فروشگاه، destination = کاربر
 */
export async function getDeliveryCost(shopLat, shopLng, userLat, userLng) {
  let distance = await fetchDistanceFromNeshan(
    { lat: shopLat, lng: shopLng },
    { lat: userLat, lng: userLng },
  )
  let source = 'neshan'
  if (!distance || distance <= 0) {
    distance = haversineKm(shopLat, shopLng, userLat, userLng)
    source = 'haversine'
  }
  const price = calculateDeliveryPrice(distance)
  return {
    distance,
    price,
    source,
    formattedDistance: formatDistance(distance),
  }
}

export default {
  calculateDeliveryPrice,
  fetchDistanceFromNeshan,
  getDeliveryCost,
  formatDistance,
  haversineKm,
  CONFIG,
}
