'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { isSiteModuleActive } from '@/services/siteModules'

const CHANGED_EVENT = 'site-modules-changed'

/**
 * اگر ماژول (با درنظر گرفتن والد) فعال باشد children را نشان می‌دهد.
 * اگر unlessKey داده شود، وقتی آن ماژول فعال باشد children مخفی می‌شود
 * (مثلاً هدر کاریابی وقتی header_by_menu_top روشن است).
 * notFoundWhenInactive: به‌جای fallback، notFound() واقعی Next.
 */
export default function ModuleGate({
  moduleKey,
  unlessKey = null,
  children,
  fallback = null,
  notFoundWhenInactive = false,
}) {
  const [active, setActive] = useState(null)

  const load = useCallback(async () => {
    try {
      const v = await isSiteModuleActive(moduleKey, { force: true })
      let blocked = false
      if (unlessKey) {
        blocked = await isSiteModuleActive(unlessKey, { force: true })
      }
      setActive(!!v && !blocked)
    } catch {
      setActive(false)
    }
  }, [moduleKey, unlessKey])

  useEffect(() => {
    load()
    const onChanged = () => {
      load()
    }
    const onStorage = (e) => {
      if (e.key === 'site-modules-bust') load()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener(CHANGED_EVENT, onChanged)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener(CHANGED_EVENT, onChanged)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [load])

  if (active === null) return null
  if (!active) {
    if (notFoundWhenInactive) {
      notFound()
    }
    return fallback
  }
  return children
}

export { CHANGED_EVENT as SITE_MODULES_CHANGED_EVENT }
