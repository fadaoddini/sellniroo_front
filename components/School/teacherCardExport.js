/**
 * خروجی JPG کارت معلم با Canvas (بدون وابستگی خارجی)
 * فونت‌ها: iran / iran_bold / iran_extra
 */

const FONT_IRAN = 'iran, Tahoma, sans-serif'
const FONT_BOLD = 'iran_bold, iran, Tahoma, sans-serif'
const FONT_EXTRA = 'iran_extra, iran_bold, iran, Tahoma, sans-serif'

async function ensureIranFonts() {
  if (typeof document === 'undefined' || !document.fonts?.load) return
  try {
    await Promise.all([
      document.fonts.load(`16px iran`),
      document.fonts.load(`16px iran_bold`),
      document.fonts.load(`16px iran_extra`),
    ])
  } catch {
    /* ignore */
  }
}

async function toDataUrl(src) {
  if (!src) return null
  if (src.startsWith('data:') || src.startsWith('blob:')) return src
  try {
    const res = await fetch(src, { mode: 'cors', credentials: 'omit', cache: 'no-store' })
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

function loadImageFromData(dataUrl) {
  return new Promise((resolve) => {
    if (!dataUrl) {
      resolve(null)
      return
    }
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

async function loadImage(src) {
  const data = await toDataUrl(src)
  if (!data) {
    // fallback: try direct load (may taint canvas if CORS fails)
    return new Promise((resolve) => {
      if (!src) {
        resolve(null)
        return
      }
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = () => resolve(null)
      img.src = src
    })
  }
  return loadImageFromData(data)
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length >= maxLines) break
    } else {
      line = test
    }
  }
  if (lines.length < maxLines && line) lines.push(line)
  if (lines.length > maxLines) return lines.slice(0, maxLines)
  return lines
}

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '')
  if (h.length !== 6) return { r: 15, g: 23, b: 42 }
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function paintGradient(ctx, w, h, theme) {
  const c1 = hexToRgb(theme.swatch)
  // darken for top
  const g = ctx.createLinearGradient(0, 0, w * 0.2, h)
  g.addColorStop(0, `rgb(${Math.max(0, c1.r - 90)}, ${Math.max(0, c1.g - 90)}, ${Math.max(0, c1.b - 90)})`)
  g.addColorStop(0.45, `rgb(${Math.max(0, c1.r - 40)}, ${Math.max(0, c1.g - 40)}, ${Math.max(0, c1.b - 40)})`)
  g.addColorStop(1, `rgb(${c1.r}, ${c1.g}, ${c1.b})`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // soft orbs
  const orb = ctx.createRadialGradient(80, 60, 10, 80, 60, 220)
  orb.addColorStop(0, 'rgba(255,255,255,0.18)')
  orb.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = orb
  ctx.fillRect(0, 0, w, h)

  const orb2 = ctx.createRadialGradient(w - 40, h - 120, 10, w - 40, h - 120, 180)
  orb2.addColorStop(0, 'rgba(255,255,255,0.12)')
  orb2.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = orb2
  ctx.fillRect(0, 0, w, h)
}

function drawCircleImage(ctx, img, cx, cy, r) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  if (img) {
    const size = r * 2
    // cover fit
    const iw = img.width
    const ih = img.height
    const scale = Math.max(size / iw, size / ih)
    const dw = iw * scale
    const dh = ih * scale
    ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh)
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.25)'
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }
  ctx.restore()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 4
  ctx.stroke()
}

/**
 * @returns {Promise<string>} data URL jpeg
 */
export async function renderTeacherCardJpeg({
  theme,
  name,
  specialty,
  bio,
  avatarUrl,
  education,
  honor,
  publicUrl,
  qrSrc,
  cardLabel = 'کارت معرفی معلم',
  brandLabel = 'school',
}) {
  const W = 720
  const H = 1140
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'right'
  ctx.direction = 'rtl'

  await ensureIranFonts()
  const [avatar, qr] = await Promise.all([
    loadImage(avatarUrl),
    loadImage(qrSrc),
  ])

  paintGradient(ctx, W, H, theme)

  // badge
  ctx.fillStyle = 'rgba(255,255,255,0.12)'
  roundRect(ctx, W - 48 - 200, 36, 200, 36, 18)
  ctx.fill()
  ctx.fillStyle = theme.accent
  ctx.font = `20px ${FONT_BOLD}`
  ctx.fillText(cardLabel, W - 64, 61)

  ctx.font = `22px ${FONT_EXTRA}`
  ctx.fillStyle = theme.accent
  ctx.textAlign = 'left'
  ctx.fillText(brandLabel, 48, 62)
  ctx.textAlign = 'right'

  // photo
  const cx = W / 2
  const cy = 210
  const pr = 92
  ctx.beginPath()
  ctx.arc(cx, cy, pr + 8, 0, Math.PI * 2)
  ctx.strokeStyle = theme.accent
  ctx.lineWidth = 3
  ctx.stroke()
  drawCircleImage(ctx, avatar, cx, cy, pr)

  if (!avatar) {
    ctx.fillStyle = theme.accent
    ctx.font = `64px ${FONT_EXTRA}`
    ctx.textAlign = 'center'
    ctx.fillText((name || 'م').trim().charAt(0), cx, cy + 22)
    ctx.textAlign = 'right'
  }

  // name
  let y = 340
  ctx.fillStyle = theme.ink
  ctx.font = `44px ${FONT_EXTRA}`
  ctx.textAlign = 'center'
  ctx.fillText(name || 'نام معلم', cx, y)
  y += 40

  if (specialty) {
    ctx.fillStyle = theme.accent
    ctx.font = `26px ${FONT_BOLD}`
    ctx.fillText(specialty, cx, y)
    y += 36
  }

  if (bio) {
    ctx.fillStyle = theme.muted
    ctx.font = `22px ${FONT_IRAN}`
    const lines = wrapText(ctx, bio, W - 120, 3)
    lines.forEach((ln) => {
      ctx.fillText(ln, cx, y)
      y += 32
    })
    y += 12
  } else {
    y += 16
  }

  const drawFact = (label, title, sub) => {
    if (!title) return
    const boxX = 48
    const boxW = W - 96
    const boxH = sub ? 110 : 88
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    roundRect(ctx, boxX, y, boxW, boxH, 18)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.textAlign = 'right'
    ctx.fillStyle = theme.accent
    ctx.font = `18px ${FONT_BOLD}`
    ctx.fillText(label, boxX + boxW - 22, y + 32)

    ctx.fillStyle = theme.ink
    ctx.font = `24px ${FONT_BOLD}`
    ctx.fillText(title, boxX + boxW - 22, y + 64)

    if (sub) {
      ctx.fillStyle = theme.muted
      ctx.font = `18px ${FONT_IRAN}`
      ctx.fillText(sub, boxX + boxW - 22, y + 92)
    }
    y += boxH + 16
  }

  if (education) {
    const title = education.field
      ? `${education.degree} · ${education.field}`
      : education.degree
    const sub = [education.institution, education.year].filter(Boolean).join(' · ')
    drawFact('مدرک', title, sub)
  }

  if (honor) {
    const sub = [honor.organization, honor.year].filter(Boolean).join(' · ')
    drawFact('افتخار / سابقه', honor.title, sub)
  }

  // footer
  const footerY = H - 160
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'
  ctx.beginPath()
  ctx.moveTo(48, footerY)
  ctx.lineTo(W - 48, footerY)
  ctx.stroke()

  const qrSize = 110
  const qrX = 48
  const qrY = footerY + 22
  roundRect(ctx, qrX, qrY, qrSize, qrSize, 14)
  ctx.fillStyle = '#fff'
  ctx.fill()
  if (qr) {
    ctx.drawImage(qr, qrX + 8, qrY + 8, qrSize - 16, qrSize - 16)
  } else {
    ctx.fillStyle = '#94a3b8'
    ctx.font = `22px ${FONT_BOLD}`
    ctx.textAlign = 'center'
    ctx.fillText('QR', qrX + qrSize / 2, qrY + qrSize / 2 + 8)
  }

  ctx.textAlign = 'right'
  ctx.fillStyle = theme.accent
  ctx.font = `24px ${FONT_BOLD}`
  ctx.fillText('اسکن کنید', W - 48, footerY + 88)

  return canvas.toDataURL('image/jpeg', 0.94)
}

export function triggerJpegDownload(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}
