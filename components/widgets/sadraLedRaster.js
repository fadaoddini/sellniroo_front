/**
 * رندر متن واقعی (فارسی/لاتین) → ماتریس پیکسل LED
 */

const FONT_STACK =
  'Vazirmatn, IRANSansX, IRANSans, Tahoma, Segoe UI, sans-serif'

function averageAlpha(data, width, height, x0, y0, x1, y1) {
  let sum = 0
  let count = 0
  const xStart = Math.max(0, Math.floor(x0))
  const yStart = Math.max(0, Math.floor(y0))
  const xEnd = Math.min(width, Math.ceil(x1))
  const yEnd = Math.min(height, Math.ceil(y1))
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      sum += data[(y * width + x) * 4 + 3]
      count++
    }
  }
  return count ? sum / count : 0
}

/**
 * @returns {{ cols: number, rows: number, cells: Uint8Array } | null}
 */
export function rasterizeTextToLedGrid(text, options = {}) {
  if (typeof document === 'undefined') return null
  const raw = String(text || '').trim()
  if (!raw) return null

  const {
    fontSize = 56,
    sample = 3,
    threshold = 48,
    direction = 'rtl',
    paddingX = 8,
    paddingY = 6,
  } = options

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.font = `800 ${fontSize}px ${FONT_STACK}`
  const metrics = ctx.measureText(raw)
  const textW = Math.max(8, Math.ceil(metrics.width))
  const textH = Math.ceil(
    (metrics.actualBoundingBoxAscent || fontSize * 0.8) +
      (metrics.actualBoundingBoxDescent || fontSize * 0.25)
  )
  const width = textW + paddingX * 2
  const height = Math.max(fontSize, textH) + paddingY * 2

  canvas.width = width
  canvas.height = height
  ctx.clearRect(0, 0, width, height)
  ctx.font = `800 ${fontSize}px ${FONT_STACK}`
  ctx.fillStyle = '#ffffff'
  ctx.textBaseline = 'middle'
  try {
    ctx.direction = direction === 'ltr' ? 'ltr' : 'rtl'
  } catch {
    /* ignore */
  }
  if (direction === 'rtl') {
    ctx.textAlign = 'right'
    ctx.fillText(raw, width - paddingX, height / 2)
  } else {
    ctx.textAlign = 'left'
    ctx.fillText(raw, paddingX, height / 2)
  }

  const { data } = ctx.getImageData(0, 0, width, height)
  const cols = Math.max(1, Math.floor(width / sample))
  const rows = Math.max(1, Math.floor(height / sample))
  const cells = new Uint8Array(cols * rows)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const avg = averageAlpha(
        data,
        width,
        height,
        c * sample,
        r * sample,
        (c + 1) * sample,
        (r + 1) * sample
      )
      cells[r * cols + c] = avg >= threshold ? 1 : 0
    }
  }

  let minC = cols
  let maxC = -1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r * cols + c]) {
        if (c < minC) minC = c
        if (c > maxC) maxC = c
      }
    }
  }
  if (maxC < minC) {
    return { cols: 4, rows, cells: new Uint8Array(4 * rows) }
  }
  const pad = 1
  const left = Math.max(0, minC - pad)
  const right = Math.min(cols - 1, maxC + pad)
  const newCols = right - left + 1
  const trimmed = new Uint8Array(newCols * rows)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < newCols; c++) {
      trimmed[r * newCols + c] = cells[r * cols + (left + c)]
    }
  }
  return { cols: newCols, rows, cells: trimmed }
}

function parseCssColor(input, fallbackRgb) {
  const s = String(input || '').trim()
  const hex = /^#([0-9a-f]{6})$/i.exec(s)
  if (hex) {
    const n = parseInt(hex[1], 16)
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a: 1 }
  }
  const rgba = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i.exec(
    s
  )
  if (rgba) {
    return {
      r: Number(rgba[1]),
      g: Number(rgba[2]),
      b: Number(rgba[3]),
      a: rgba[4] !== undefined ? Number(rgba[4]) : 1,
    }
  }
  return fallbackRgb
}

function rgbaString({ r, g, b, a }) {
  return `rgba(${r|0},${g|0},${b|0},${a})`
}

/**
 * یک فریم ماتریس LED: همه چراغ‌ها خاموش، فقط پیکسل‌های متن روشن
 */
export function paintLedMatrixFrame(canvas, opts) {
  if (!canvas) return
  const {
    viewCols,
    viewRows,
    pattern,
    scrollX = 0,
    gapCols = 12,
    cell = 6,
    gap = 1.5,
    color = '#dbbe00',
    glow = '#f5e08a',
    dim = 'rgba(219, 190, 0, 0.18)',
    time = 0,
    flicker = true,
  } = opts

  if (!viewCols || !viewRows || !pattern) return

  const step = cell + gap
  const w = Math.max(1, Math.ceil(viewCols * step - gap))
  const h = Math.max(1, Math.ceil(viewRows * step - gap))
  const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

  if (canvas.width !== Math.ceil(w * dpr) || canvas.height !== Math.ceil(h * dpr)) {
    canvas.width = Math.ceil(w * dpr)
    canvas.height = Math.ceil(h * dpr)
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const onRgb = parseCssColor(color, { r: 219, g: 190, b: 0, a: 1 })
  const glowRgb = parseCssColor(glow, { r: 245, g: 224, b: 138, a: 1 })
  const dimRgb = parseCssColor(dim, { r: 219, g: 190, b: 0, a: 0.18 })
  const period = Math.max(1, pattern.cols + Math.max(4, gapCols))
  // اسکرول کسری برای حرکت روان (بدون پرش ستون‌به‌ستون)
  const wrapped = ((scrollX % period) + period) % period
  const baseScroll = Math.floor(wrapped)
  const frac = wrapped - baseScroll
  const rr = Math.min(1.15, cell * 0.22)

  const samplePat = (sx, pr) => {
    if (pr < 0 || pr >= pattern.rows) return 0
    const x = ((sx % period) + period) % period
    if (x >= pattern.cols) return 0
    return pattern.cells[pr * pattern.cols + x] ? 1 : 0
  }

  // مرکز عمودی متن داخل ماتریس
  const rowOffset = Math.max(0, Math.floor((viewRows - pattern.rows) / 2))

  for (let r = 0; r < viewRows; r++) {
    for (let c = 0; c < viewCols; c++) {
      const pr = r - rowOffset
      const a = samplePat(baseScroll + c, pr)
      const b = samplePat(baseScroll + c + 1, pr)
      // محو نرم بین دو ستون → حرکت روان‌تر
      const lit = a * (1 - frac) + b * frac

      const x = c * step
      const y = r * step

      if (lit < 0.04) {
        ctx.fillStyle = rgbaString(dimRgb)
        if (ctx.roundRect) {
          ctx.beginPath()
          ctx.roundRect(x, y, cell, cell, rr)
          ctx.fill()
        } else {
          ctx.fillRect(x, y, cell, cell)
        }
        continue
      }

      // روشنایی ضعیف ↔ قوی مثل LED واقعی (ملایم‌تر تا حرکت یکدست بماند)
      let pulse = 1
      if (flicker) {
        const wave =
          Math.sin(time * 6.5 + c * 0.4 + r * 0.7) * 0.5 +
          Math.sin(time * 11 + c * 0.9 - r * 0.8) * 0.5
        pulse = 0.55 + (wave * 0.5 + 0.5) * 0.45
      }
      const bright = Math.min(1, lit * pulse)

      const mixR = Math.round(onRgb.r * bright + glowRgb.r * (1 - bright) * 0.35)
      const mixG = Math.round(onRgb.g * bright * 0.85)
      const mixB = Math.round(onRgb.b * bright * 0.85)

      ctx.shadowColor = rgbaString({
        r: glowRgb.r,
        g: glowRgb.g,
        b: glowRgb.b,
        a: 0.2 + bright * 0.65,
      })
      ctx.shadowBlur = cell * (0.5 + bright * 2)
      ctx.fillStyle = rgbaString({
        r: mixR,
        g: mixG,
        b: mixB,
        a: 0.5 + bright * 0.5,
      })
      if (ctx.roundRect) {
        ctx.beginPath()
        ctx.roundRect(x, y, cell, cell, rr)
        ctx.fill()
      } else {
        ctx.fillRect(x, y, cell, cell)
      }
      if (bright > 0.72 && cell >= 2) {
        ctx.shadowBlur = 0
        const inset = Math.max(0.35, cell * 0.2)
        ctx.fillStyle = rgbaString({
          r: Math.min(255, mixR + 40),
          g: Math.min(255, mixG + 20),
          b: Math.min(255, mixB + 20),
          a: (bright - 0.72) * 1.6,
        })
        ctx.fillRect(x + inset, y + inset, cell - inset * 2, cell - inset * 2)
      }
      ctx.shadowBlur = 0
    }
  }
}

export async function waitForLedFonts(fontSize = 56) {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await document.fonts.load(`800 ${fontSize}px Vazirmatn`)
    await document.fonts.ready
  } catch {
    /* ignore */
  }
}
