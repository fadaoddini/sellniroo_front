'use client'

import { useCallback, useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { isSiteModuleActive } from '@/services/siteModules'
import { SITE_MODULES_CHANGED_EVENT } from '@/components/modules/ModuleGate'

/**
 * صفحات سبد/فروشگاه — فعال اگر shop روشن باشد،
 * یا باشگاه بدنسازی (فروشگاه یکپارچهٔ باشگاه) فعال باشد.
 */
export default function ShopPageSlot({ children }) {
  const [active, setActive] = useState(null)

  const load = useCallback(async () => {
    try {
      const shopOn = await isSiteModuleActive(SITE_MODULE_KEYS.SHOP, {
        force: true,
      })
      if (shopOn) {
        setActive(true)
        return
      }
      const gymOn = await isSiteModuleActive(
        SITE_MODULE_KEYS.GYM_BODYBUILDING,
        { force: true },
      )
      setActive(!!gymOn)
    } catch {
      setActive(false)
    }
  }, [])

  useEffect(() => {
    load()
    const onChanged = () => load()
    const onStorage = (e) => {
      if (e.key === 'site-modules-bust') load()
    }
    window.addEventListener(SITE_MODULES_CHANGED_EVENT, onChanged)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(SITE_MODULES_CHANGED_EVENT, onChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [load])

  if (active === null) return null
  if (!active) notFound()
  return children
}
