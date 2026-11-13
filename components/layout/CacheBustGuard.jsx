'use client'

/**
 * جلوگیری از دادهٔ کهنه:
 * - unregister سرویس‌ورکر قدیمی (مثلاً از پروژهٔ دیگر روی همان پورت)
 * - همگام‌سازی کش بین تب‌ها
 * - رفرش اجباری وقتی تب دوباره فعال می‌شود
 */
import { useEffect } from 'react'
import { clearSiteSettingsCache } from '@/services/siteSettings'
import { clearSiteModulesCache } from '@/services/siteModules'
import { clearHeaderMenuCache } from '@/services/headerMenu'

const SETTINGS_BUST = 'site-settings-bust'
const MODULES_BUST = 'site-modules-bust'

async function nukeServiceWorkers() {
  if (typeof window === 'undefined') return
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch {
    /* ignore */
  }
  try {
    if (window.caches?.keys) {
      const keys = await window.caches.keys()
      await Promise.all(keys.map((k) => window.caches.delete(k)))
    }
  } catch {
    /* ignore */
  }
}

function bustAndNotify(reason = 'focus') {
  clearSiteSettingsCache()
  clearSiteModulesCache()
  try {
    clearHeaderMenuCache()
  } catch {
    /* optional */
  }
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('site-data-bust', { detail: { reason } })
  )
  window.dispatchEvent(new CustomEvent('home-layout-changed'))
  window.dispatchEvent(new CustomEvent('site-modules-changed'))
}

export default function CacheBustGuard() {
  useEffect(() => {
    let lastBust = 0
    const softBust = (reason) => {
      const now = Date.now()
      // جلوگیری از رگبار رفرش
      if (now - lastBust < 1200) return
      lastBust = now
      bustAndNotify(reason)
    }

    nukeServiceWorkers()

    const onStorage = (ev) => {
      if (!ev?.key) return
      if (ev.key === SETTINGS_BUST || ev.key === MODULES_BUST) {
        softBust('storage')
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') softBust('visible')
    }

    const onPageShow = (ev) => {
      // برگشت از bfcache
      if (ev?.persisted) softBust('bfcache')
    }

    const onFocus = () => softBust('focus')

    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('focus', onFocus)

    return () => {
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  return null
}
