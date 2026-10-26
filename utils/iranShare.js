/** لینک اشتراک‌گذاری پیام‌رسان‌های ایرانی */

export function iranShareTargets(pageUrl, title, flags = {}) {
  const url = encodeURIComponent(pageUrl || '')
  const text = encodeURIComponent(title || 'خبر')
  const all = [
    {
      id: 'bale',
      label: 'بله',
      href: `https://ble.ir/share/url?url=${url}`,
      on: flags.share_bale,
    },
    {
      id: 'eitaa',
      label: 'ایتا',
      href: `https://eitaa.com/share/url?url=${url}&text=${text}`,
      on: flags.share_eitaa,
    },
    {
      id: 'rubika',
      label: 'روبیکا',
      href: `https://rubika.ir/share?url=${url}&text=${text}`,
      on: flags.share_rubika,
    },
    {
      id: 'soroush',
      label: 'سروش',
      href: `https://splus.ir/share/url?url=${url}&text=${text}`,
      on: flags.share_soroush,
    },
  ]
  return all.filter((x) => x.on !== false)
}
