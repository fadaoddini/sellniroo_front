'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { OWNER_PROFILE } from '@/utils/ownerAccess'
import {
  canManageMultiVendor,
  MULTI_VENDOR_MODULE_KEY,
} from '@/utils/multiVendorAccess'
import { fetchSiteModules, isSiteModuleActive } from '@/services/siteModules'

/**
 * گیت صفحات داشبوردی چندفروشندگی (/shops-manage, /shops-accounting, …)
 * — ماژول فروشگاه (shop) و سیاست multi_vendor باید مؤثر روشن باشند
 * — مسیرهای /admin* فقط با useOwnerGate برای دو شمارهٔ مالک‌اند
 */
export default function useMultiVendorGate(nextPath = '/shops-manage') {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    hasPermission,
    canManageEmployees,
  } = useAuth()

  const [moduleLoading, setModuleLoading] = useState(true)
  const [moduleOn, setModuleOn] = useState(false)

  const roleAllowed = useMemo(
    () =>
      canManageMultiVendor(user, {
        hasPermission,
        canManageEmployees,
      }),
    [user, hasPermission, canManageEmployees],
  )

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
    }
  }, [authLoading, isAuthenticated, router, nextPath])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setModuleLoading(true)
      try {
        await fetchSiteModules()
        const on = await isSiteModuleActive(MULTI_VENDOR_MODULE_KEY)
        if (!cancelled) setModuleOn(!!on)
      } catch {
        if (!cancelled) setModuleOn(false)
      } finally {
        if (!cancelled) setModuleLoading(false)
      }
    })()
    const onChanged = () => {
      isSiteModuleActive(MULTI_VENDOR_MODULE_KEY, { force: true }).then((on) => {
        if (!cancelled) setModuleOn(!!on)
      })
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('site-modules-changed', onChanged)
    }
    return () => {
      cancelled = true
      if (typeof window !== 'undefined') {
        window.removeEventListener('site-modules-changed', onChanged)
      }
    }
  }, [])

  const loading = authLoading || moduleLoading
  const allowed = !loading && isAuthenticated && roleAllowed && moduleOn

  const displayName =
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    OWNER_PROFILE.name

  return {
    user,
    loading,
    isAuthenticated,
    allowed,
    roleAllowed,
    moduleOn,
    displayName,
  }
}
