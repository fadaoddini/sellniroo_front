/**
 * هماهنگی ارتفاع هیرو و تایم‌لاین تا یک مسیر SVG بدون شکستگی برش بخورد.
 * همچنین حالت پس‌زمینه (منحنی/ساده/گرادیان) و شدت انحنا را بین ویجت‌ها پخش می‌کند.
 */
import { GYM_EMERALD_DEEP } from './gymCurveSplit'

let heroH = 0
let featH = 0
const listeners = new Set()

let curveStyle = {
  mode: 'curve',
  intensity: 50,
  color: GYM_EMERALD_DEEP,
  colorAlt: '#ffffff',
}
const styleListeners = new Set()

function emit() {
  const total = Math.max(1, heroH + featH)
  const payload = { heroH, featH, total }
  listeners.forEach((fn) => {
    try {
      fn(payload)
    } catch {
      /* ignore */
    }
  })
}

function emitStyle() {
  const payload = { ...curveStyle }
  styleListeners.forEach((fn) => {
    try {
      fn(payload)
    } catch {
      /* ignore */
    }
  })
}

export function reportGymCurveHeight(role, height) {
  const h = Math.max(0, Math.round(height || 0))
  if (role === 'hero') {
    if (h === heroH) return
    heroH = h
  } else {
    if (h === featH) return
    featH = h
  }
  emit()
}

export function subscribeGymCurveHeights(fn) {
  listeners.add(fn)
  fn({
    heroH,
    featH,
    total: Math.max(1, heroH + featH),
  })
  return () => listeners.delete(fn)
}

export function reportGymCurveStyle(next = {}) {
  const mode = ['curve', 'simple', 'gradient'].includes(next.mode)
    ? next.mode
    : curveStyle.mode
  const intensity = Math.max(
    0,
    Math.min(100, Number(next.intensity) || curveStyle.intensity),
  )
  const color = String(next.color || curveStyle.color || GYM_EMERALD_DEEP)
  const colorAlt = String(next.colorAlt || curveStyle.colorAlt || '#ffffff')
  if (
    mode === curveStyle.mode &&
    intensity === curveStyle.intensity &&
    color === curveStyle.color &&
    colorAlt === curveStyle.colorAlt
  ) {
    return
  }
  curveStyle = { mode, intensity, color, colorAlt }
  emitStyle()
}

export function subscribeGymCurveStyle(fn) {
  styleListeners.add(fn)
  fn({ ...curveStyle })
  return () => styleListeners.delete(fn)
}

export function getGymCurveStyle() {
  return { ...curveStyle }
}

/** viewBox برش‌خورده از مسیر ۰…۱۰۰۰ برای هر بخش */
export function curveViewBoxSlice(role, { heroH: h1, featH: h2, total }) {
  const t = Math.max(1, total || h1 + h2 || 1)
  const a = Math.max(0, h1 || 0)
  const b = Math.max(0, h2 || 0)
  /* اگر فقط یکی باشد، کل مسیر */
  if (role === 'hero') {
    if (!b) return '-20 0 420 1000'
    const span = Math.max(8, (a / t) * 1000)
    return `-20 0 420 ${span}`
  }
  if (!a) return '-20 0 420 1000'
  const y0 = (a / t) * 1000
  const span = Math.max(8, (b / t) * 1000)
  return `-20 ${y0} 420 ${span}`
}
