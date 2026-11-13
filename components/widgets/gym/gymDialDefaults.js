/** آیتم‌های پیش‌فرض هیرو — خطاب به عضو باشگاه + تصویر */
export const DEFAULT_GYM_DIAL_ITEMS = [
  {
    id: 'sessions',
    label: 'سانس',
    title: 'سانس دلخواهت رو رزرو کن',
    desc: 'آقایان و بانوان، ظرفیت مشخص — جات می‌مونه تا سر وقت بیای.',
    color: '#10b981',
    color_soft: '#023c2c',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'coach',
    label: 'مربی',
    title: 'مربی کنارت هست',
    desc: 'برنامه تمرین و رژیم مخصوص خودت — فقط انجام بده.',
    color: '#34d399',
    color_soft: '#023c2c',
    image:
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'members',
    label: 'عضویت',
    title: 'عضویت ساده و شفاف',
    desc: 'ثبت‌نام سریع، سطح مشخص، تمدید بدون دردسر.',
    color: '#a7f3d0',
    color_soft: '#023c2c',
    image:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'shop',
    label: 'فروشگاه',
    title: 'فروشگاه اعضا',
    desc: 'مکمل و پوشاک با قیمت ویژه — همون‌جایی که تمرین می‌کنی.',
    color: '#6ee7b7',
    color_soft: '#023c2c',
    image:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'alerts',
    label: 'یادآوری',
    title: 'یادآوری تمدید',
    desc: 'قبل از تموم شدن عضویت بهت خبر می‌دیم تا تمرینت قطع نشه.',
    color: '#059669',
    color_soft: '#023c2c',
    image:
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'profile',
    label: 'پروفایل',
    title: 'پروفایل خودت',
    desc: 'وضعیت عضویت، برنامه و سانس‌هات همیشه جلو چشمت.',
    color: '#047857',
    color_soft: '#023c2c',
    image:
      'https://images.unsplash.com/photo-1599058945522-28d584b6f14f?auto=format&fit=crop&w=1200&q=80',
  },
]

export function normalizeGymDialItems(raw) {
  const list = Array.isArray(raw) ? raw : null
  if (!list || !list.length) {
    return DEFAULT_GYM_DIAL_ITEMS.map((x) => ({ ...x }))
  }
  return list
    .filter((x) => x && typeof x === 'object')
    .map((x, i) => {
      const fallback = DEFAULT_GYM_DIAL_ITEMS[i % DEFAULT_GYM_DIAL_ITEMS.length]
      return {
        id: String(x.id || fallback.id || `item_${i}`),
        label: String(x.label || fallback.label || '').trim() || fallback.label,
        title: String(x.title || fallback.title || '').trim() || fallback.title,
        desc: String(x.desc || fallback.desc || '').trim() || fallback.desc,
        color: String(x.color || fallback.color || '#10b981').trim(),
        color_soft: String(
          x.color_soft || fallback.color_soft || '#023c2c',
        ).trim(),
        image: String(x.image || fallback.image || '').trim(),
      }
    })
    .filter((x) => x.label)
}

function hexToRgb(hex) {
  const raw = String(hex || '').replace('#', '').trim()
  if (!raw) return { r: 16, g: 185, b: 129 }
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return { r: 16, g: 185, b: 129 }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex({ r, g, b }) {
  const to = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

export function mixHex(a, b, t) {
  const u = Math.max(0, Math.min(1, Number(t) || 0))
  const A = hexToRgb(a)
  const B = hexToRgb(b)
  return rgbToHex({
    r: A.r + (B.r - A.r) * u,
    g: A.g + (B.g - A.g) * u,
    b: A.b + (B.b - A.b) * u,
  })
}
