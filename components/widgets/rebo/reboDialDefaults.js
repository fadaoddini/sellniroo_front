/** آیتم‌های پیش‌فرض مدار هیرو ربو */
export const DEFAULT_REBO_DIAL_ITEMS = [
  {
    id: 'python',
    label: 'بک‌اند پایتون',
    title: 'هسته با پایتون و Django',
    desc: 'منطق کسب‌وکار، امنیت و مقیاس‌پذیری روی بک‌اند استاندارد پایتون — آماده رشد و توسعه اختصاصی.',
    color: '#26a680',
    color_soft: '#0f3d32',
  },
  {
    id: 'next',
    label: 'فرانت Next.js',
    title: 'تجربه کاربری با Next.js',
    desc: 'فرانت مدرن، سریع و واکنش‌گرا؛ ظاهر حرفه‌ای روی موبایل و دسکتاپ با عملکرد بهینه.',
    color: '#3b82f6',
    color_soft: '#0c2248',
  },
  {
    id: 'api',
    label: 'API تمیز',
    title: 'API یکپارچه و استاندارد',
    desc: 'اتصال شفاف سرویس‌ها، درگاه پرداخت، پیامک و پنل‌ها — معماری تمیز برای توسعه آینده.',
    color: '#14b8a6',
    color_soft: '#0a2f2c',
  },
  {
    id: 'quality',
    label: 'کیفیت',
    title: 'کیفیت محصول‌محور',
    desc: 'کد استاندارد، تست‌پذیر و بهینه؛ سامانه‌ای که مثل یک محصول واقعی ساخته و نگهداری می‌شود.',
    color: '#f59e0b',
    color_soft: '#3a2808',
  },
  {
    id: 'business',
    label: 'کسب‌وکارها',
    title: 'مخصوص هر کسب‌وکار',
    desc: 'فقط همان امکاناتی که نیاز دارید روشن می‌شود — کاریابی، فروشگاه، نوبت‌دهی، مدرسه و بیشتر.',
    color: '#ef4444',
    color_soft: '#3a1010',
  },
  {
    id: 'tech',
    label: 'تکنولوژی',
    title: 'تکنولوژی روز',
    desc: 'استک پیشرفته و به‌روز برای تحویل سامانه‌ای پایدار، امن و قابل گسترش در کمترین زمان.',
    color: '#8b5cf6',
    color_soft: '#1e1240',
  },
  {
    id: 'pwa',
    label: 'PWA',
    title: 'نسخه Progressive Web App',
    desc: 'همه سایت‌ها نسخه PWA دارند؛ نصب‌پذیر، سریع و نزدیک به تجربه اپلیکیشن موبایل.',
    color: '#06b6d4',
    color_soft: '#0a2c34',
  },
  {
    id: 'dashboard',
    label: 'داشبورد',
    title: 'پنل مدیریت ساده و روان',
    desc: 'داشبورد مدیریتی خلوت و قابل فهم تا تیم شما بدون پیچیدگی، سامانه را اداره کند.',
    color: '#f43f5e',
    color_soft: '#3a0f1a',
  },
]

export function normalizeDialItems(raw) {
  const list = Array.isArray(raw) ? raw : null
  if (!list || !list.length) return DEFAULT_REBO_DIAL_ITEMS.map((x) => ({ ...x }))
  return list
    .filter((x) => x && typeof x === 'object')
    .map((x, i) => {
      const fallback = DEFAULT_REBO_DIAL_ITEMS[i % DEFAULT_REBO_DIAL_ITEMS.length]
      return {
        id: String(x.id || fallback.id || `item_${i}`),
        label: String(x.label || fallback.label || '').trim() || fallback.label,
        title: String(x.title || fallback.title || '').trim() || fallback.title,
        desc: String(x.desc || fallback.desc || '').trim() || fallback.desc,
        color: String(x.color || fallback.color || '#26a680').trim(),
        color_soft: String(x.color_soft || fallback.color_soft || '#0f3d32').trim(),
      }
    })
    .filter((x) => x.label)
}

function hexToRgb(hex) {
  const raw = String(hex || '').replace('#', '').trim()
  if (!raw) return { r: 38, g: 166, b: 128 }
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((c) => c + c)
          .join('')
      : raw.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return { r: 38, g: 166, b: 128 }
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function rgbToHex({ r, g, b }) {
  const to = (v) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, '0')
  return `#${to(r)}${to(g)}${to(b)}`
}

/** ترکیب خطی دو رنگ — مثلاً سبز و قرمز در میانه قهوه‌ای می‌شود */
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
