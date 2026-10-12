'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { isSiteModuleActive } from '@/services/siteModules'

const CHANGED_EVENT = 'site-modules-changed'

/**
 * اگر ماژول (با درنظر گرفتن والد) فعال باشد children را نشان می‌دهد.
 * اگر unlessKey داده شود، وقتی آن ماژول فعال باشد children مخفی می‌شود
 * (مثلاً هدر کاریابی وقتی header_by_menu_top روشن است).
 */
export default function ModuleGate({
  moduleKey,
  unlessKey = null,
  children,
  fallback = null,
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
    window.addEventListener(CHANGED_EVENT, onChanged)
    return () => window.removeEventListener(CHANGED_EVENT, onChanged)
  }, [load])

  if (active === null) return null
  if (!active) return fallback
  return children
}

export { CHANGED_EVENT as SITE_MODULES_CHANGED_EVENT }
