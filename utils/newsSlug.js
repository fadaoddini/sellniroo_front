/**
 * ساخت اسلاگ خبر — نزدیک به Django slugify(..., allow_unicode=True)
 * مثال: «افتتاح فاز جدید شهرک صنعتی»
 * → «افتتاح-فاز-جدید-شهرک-صنعتی»
 */
export function slugifyNewsTitle(title) {
  if (!title) return '';

  let s = String(title).normalize('NFC').trim();

  // ی/ک عربی → فارسی
  s = s.replace(/\u064A/g, '\u06CC').replace(/\u0643/g, '\u06A9');
  // اعراب، کشیده، نیم‌فاصله (ZWNJ/ZWJ)
  s = s.replace(/[\u064B-\u065F\u0670\u0640\u200C\u200D]/g, '');
  // فاصله و زیرخط → خط تیره
  s = s.replace(/[\s_]+/g, '-');
  // فقط حروف/اعداد لاتین و فارسی/عربی و خط تیره
  s = s.replace(/[^\u0600-\u06FFa-zA-Z0-9-]+/g, '');
  s = s.replace(/-+/g, '-').replace(/^-|-$/g, '');

  // lowercase فقط برای لاتین
  s = s.replace(/[A-Z]/g, (ch) => ch.toLowerCase());

  return s;
}

/** اسلاگ نهایی خبر از فیلد API یا از عنوان */
export function getNewsSlug(news) {
  if (!news) return '';
  const fromApi = typeof news.slug === 'string' ? news.slug.trim() : '';
  if (fromApi) return fromApi;
  const fromTitle = slugifyNewsTitle(news.title);
  if (fromTitle) return fromTitle;
  return news.id != null ? String(news.id) : '';
}

/** مسیر عمومی صفحه سینگل خبر */
export function getNewsHref(news) {
  const slug = getNewsSlug(news);
  return slug ? `/news/${slug}` : '/news';
}

export function isNumericNewsParam(param) {
  return /^\d+$/.test(String(param || '').trim());
}
