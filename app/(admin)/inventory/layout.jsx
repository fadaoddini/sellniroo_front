'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ModuleGate from '@/components/modules/ModuleGate'
import ModulePageShell from '@/components/layout/ModulePageShell'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import InventoryNav from '@/modules/inventory/components/common/InventoryNav'
import InventoryBottomNav from '@/modules/inventory/components/common/InventoryBottomNav'
import styles from './inventory.module.css'
import './inventory-theme.css'

function InventoryLayoutInner({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    checkingEmployee,
    hasPermission,
  } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  const canAccess =
    hasPermission('warehouse') ||
    hasPermission('all') ||
    !!user?.is_superuser ||
    !!user?.is_staff

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (authLoading || checkingEmployee) return
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/inventory')}`)
      return
    }
    if (!canAccess) {
      router.replace('/dashboard')
    }
  }, [
    authLoading,
    checkingEmployee,
    isAuthenticated,
    canAccess,
    router,
    pathname,
  ])

  useEffect(() => {
    if (!isMobile) return undefined
    const main = document.querySelector('main')
    if (!main) return undefined
    const prev = main.style.paddingBottom
    main.style.paddingBottom = 'calc(92px + env(safe-area-inset-bottom, 0px))'
    return () => {
      main.style.paddingBottom = prev
    }
  }, [isMobile])

  if (authLoading || checkingEmployee || !isAuthenticated || !canAccess) {
    return (
      <div className={`invTheme ${styles.gate}`}>
        <Loader2 className={styles.spin} size={28} />
        <p>در حال بررسی دسترسی انبار...</p>
      </div>
    )
  }

  return (
    <div className={`invTheme ${styles.shell} ${isMobile ? styles.shellMobile : ''}`}>
      {!isMobile ? (
        <div className={styles.desktopNavWrap}>
          <InventoryNav />
        </div>
      ) : null}
      <div className={styles.content}>{children}</div>
      {isMobile ? <InventoryBottomNav /> : null}
    </div>
  )
}

export default function InventoryLayout({ children }) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.ADVANCED_INVENTORY}
      notFoundWhenInactive
    >
      <ModulePageShell pageKey="inventory">
        <InventoryLayoutInner>{children}</InventoryLayoutInner>
      </ModulePageShell>
    </ModuleGate>
  )
}
