'use client'

import { useEffect, useMemo, useState } from 'react'
import { notFound, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { fetchSiteModules } from '@/services/siteModules'
import {
  isOwnerPathAllowedOnSite,
  isOwnerOnlyPath,
  isPlatformOwner,
  OWNER_PROFILE,
} from '@/utils/ownerAccess'

/**
 * گیت دسترسی مالک پلتفرم.
 * — فقط دو شمارهٔ OWNER
 * — روی سایت غیرربو فقط مسیرهای tenant مجازند
 * — غیرمجاز → 404 (نه ریدایرکت به داشبورد)
 */
export default function useOwnerGate(nextPath = '/adminweb') {
  const router = useRouter()
  const pathname = usePathname() || nextPath
  const searchParams = useSearchParams()
  const { user, isAuthenticated, loading } = useAuth()
  const [moduleMap, setModuleMap] = useState(null)
  const [modulesReady, setModulesReady] = useState(false)

  const isOwner = useMemo(() => isPlatformOwner(user), [user])

  const hrefForCheck = useMemo(() => {
    const base = String(nextPath || pathname || '/adminweb')
    if (base.includes('?')) return base
    const tab = searchParams?.get('tab')
    if (tab && (base === '/adminmodule' || base === '/adminsettings')) {
      return `${base}?tab=${encodeURIComponent(tab)}`
    }
    const qs = searchParams?.toString()
    return qs ? `${pathname}?${qs}` : pathname || base
  }, [nextPath, pathname, searchParams])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
    }
  }, [loading, isAuthenticated, router, nextPath])

  useEffect(() => {
    if (loading || !isAuthenticated || !isOwner) {
      setModulesReady(true)
      return undefined
    }
    let cancelled = false
    fetchSiteModules({ force: false })
      .then(({ map }) => {
        if (!cancelled) {
          setModuleMap(map || {})
          setModulesReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setModuleMap({})
          setModulesReady(true)
        }
      })
    const onModules = () => {
      fetchSiteModules({ force: true })
        .then(({ map }) => {
          if (!cancelled) setModuleMap(map || {})
        })
        .catch(() => {})
    }
    window.addEventListener('site-modules-changed', onModules)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onModules)
    }
  }, [loading, isAuthenticated, isOwner])

  const pathAllowed = useMemo(() => {
    if (!isOwner) return false
    if (!isOwnerOnlyPath(hrefForCheck) && !isOwnerOnlyPath(nextPath)) {
      return true
    }
    if (!modulesReady || moduleMap == null) return true
    return isOwnerPathAllowedOnSite(hrefForCheck, moduleMap)
  }, [isOwner, hrefForCheck, nextPath, modulesReady, moduleMap])

  const ready = !loading && isAuthenticated && modulesReady
  const allowed = ready && isOwner && pathAllowed

  // غیرمالک یا مسیر ممنوع روی این سایت → 404
  if (ready && isAuthenticated && (!isOwner || !pathAllowed)) {
    notFound()
  }

  const displayName =
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    OWNER_PROFILE.name

  return {
    user,
    loading: loading || (isAuthenticated && isOwner && !modulesReady),
    isAuthenticated,
    allowed,
    displayName,
    moduleMap: moduleMap || {},
    isReboHub: !!(moduleMap && moduleMap.data_pack_rebo_theme_one),
  }
}
