/**
 * رفتن به بخش هش‌دار صفحه اصلی (مثل /#rebo-cost).
 * Link معمولی Next اغلب از /profile هش را اسکرول نمی‌کند.
 */
export function goHomeHash(hash, { replace = false } = {}) {
  const raw = String(hash || '').trim()
  if (!raw) return
  const id = raw.replace(/^#/, '')
  const target = `/#${id}`

  if (typeof window === 'undefined') return

  const onHome = window.location.pathname === '/' || window.location.pathname === ''
  if (onHome) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (replace) window.history.replaceState(null, '', target)
      else window.history.pushState(null, '', target)
      return
    }
  }

  window.location.assign(target)
}

export function homeHashHref(hash) {
  const id = String(hash || '').replace(/^#/, '').trim()
  return id ? `/#${id}` : '/'
}
