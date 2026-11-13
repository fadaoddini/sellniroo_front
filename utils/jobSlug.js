/**
 * ساخت اسلاگ آگهی — نزدیک به Django slugify(..., allow_unicode=True)
 * مثال: «مدیر فروش منطقه‌ای با ۷ سال تجربه»
 * → «مدیر-فروش-منطقهای-با-۷-سال-تجربه»
 */
export function slugifyJobTitle(title) {
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

/** اسلاگ نهایی آگهی از فیلد API یا از عنوان */
export function getJobSlug(job) {
  if (!job) return '';
  const fromApi = typeof job.slug === 'string' ? job.slug.trim() : '';
  if (fromApi) return fromApi;
  const fromTitle = slugifyJobTitle(job.title);
  if (fromTitle) return fromTitle;
  return job.id != null ? String(job.id) : '';
}

/** مسیر عمومی صفحه سینگل آگهی */
export function getJobHref(job) {
  const slug = getJobSlug(job);
  return slug ? `/jobs/${slug}` : '/jobs';
}

export function isNumericJobParam(param) {
  return /^\d+$/.test(String(param || '').trim());
}
