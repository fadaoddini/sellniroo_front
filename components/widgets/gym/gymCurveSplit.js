/**
 * یک مسیر مشترک برای هیرو + تایم‌لاین منحنی
 * ابتدا/انتها x=0 با مماس عمودی؛ شدت انحنا با intensity (۰…۱۰۰).
 */
export const GYM_EMERALD_DEEP = '#023c2c'

/** مقیاس نسبت به مسیر پیش‌فرض (~۵۰) */
function amp(x, scale) {
  const v = Number(x) * scale
  return Number.isFinite(v) ? String(Math.round(v * 10) / 10) : '0'
}

/**
 * @param {number} [intensity=50] ۰=خط صاف، ۵۰=پیش‌فرض، ۱۰۰=انحنای زیاد
 */
export function buildWaveEdge(intensity = 50) {
  const n = Number(intensity)
  const scale = Math.max(0, Math.min(100, Number.isFinite(n) ? n : 50)) / 50
  return (
    'M 0 0 ' +
    `C 0 90, ${amp(7, scale)} 170, ${amp(4, scale)} 250 ` +
    `S ${amp(-5, scale)} 410, ${amp(3, scale)} 490 ` +
    `S ${amp(-4, scale)} 650, ${amp(4, scale)} 730 ` +
    `S ${amp(-3, scale)} 870, ${amp(2, scale)} 940 ` +
    `C ${amp(1, scale)} 970, 0 990, 0 1000`
  )
}

export function buildSideFill(intensity = 50) {
  return `${buildWaveEdge(intensity)} L 400 1000 L 400 0 Z`
}

/** سازگاری با importهای قبلی */
export const WAVE_EDGE = buildWaveEdge(50)
export const SIDE_FILL = buildSideFill(50)
