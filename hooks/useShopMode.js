'use client'

import { useEffect, useState } from 'react'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import { fetchSiteModules } from '@/services/siteModules'

const CHANGED = 'site-modules-changed'

/**
 * وضعیت مؤثر سیاست فروشگاه (وابسته به والد shop)
 */
export default function useShopMode() {
  const [state, setState] = useState({
    loading: true,
    shopOn: true,
    singleStore: true,
    multiVendor: false,
  })

  useEffect(() => {
    let cancelled = false
    const load = async ({ force = false } = {}) => {
      try {
        const { map } = await fetchSiteModules({ force })
        if (cancelled) return
        const shopOn = !!map?.[SITE_MODULE_KEYS.SHOP]
        const multiVendor =
          shopOn && !!map?.[SITE_MODULE_KEYS.MULTI_VENDOR]
        const singleStore =
          shopOn &&
          !!map?.[SITE_MODULE_KEYS.SINGLE_STORE] &&
          !multiVendor
        setState({
          loading: false,
          shopOn,
          singleStore,
          multiVendor,
        })
      } catch {
        if (!cancelled) {
          setState({
            loading: false,
            shopOn: true,
            singleStore: true,
            multiVendor: false,
          })
        }
      }
    }
    load()
    const onChanged = () => load({ force: true })
    window.addEventListener(CHANGED, onChanged)
    return () => {
      cancelled = true
      window.removeEventListener(CHANGED, onChanged)
    }
  }, [])

  return state
}
