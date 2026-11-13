'use client'

import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Tags } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import PlatformCategoriesManager from '@/components/Admin/PlatformCategoriesManager'
import styles from './ShopCategories.module.css'

function CategoriesShell({
  loading = false,
  allowed = false,
  isAuthenticated = false,
  children,
}) {
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.replace('/login?next=/shop-categories')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className={styles.shell} dir="rtl">
        <p className={styles.muted}>در حال بارگذاری…</p>
      </div>
    )
  }

  if (!allowed) {
    return (
      <div className={styles.shell} dir="rtl">
        <div className={styles.denied}>
          <Tags size={28} />
          <h1>دسترسی محدود</h1>
          <p>مدیریت دسته‌بندی فقط برای کارکنان مجاز است.</p>
          <Link href="/dashboard" className={styles.linkBtn}>
            <LayoutDashboard size={14} />
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.shell} dir="rtl">
      <div className={styles.topBar}>
        <Link href="/dashboard" className={styles.backLink}>
          <LayoutDashboard size={14} />
          داشبورد
        </Link>
        <Link href="/shop-manage" className={styles.backLink}>
          <Package size={14} />
          محصولات
        </Link>
      </div>
      {children}
    </div>
  )
}

export default function ShopCategoriesPage() {
  const { user, isAuthenticated, loading, canManageEmployees } = useAuth()
  const allowed = useMemo(
    () => !!(user?.is_superuser || user?.is_staff || canManageEmployees),
    [user, canManageEmployees],
  )

  const gate = {
    loading,
    allowed,
    isAuthenticated,
    user,
    displayName:
      user?.display_name ||
      [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
      '',
  }

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SHOP} fallback={null}>
      <PlatformCategoriesManager
        gate={gate}
        Shell={CategoriesShell}
        shellProps={{}}
      />
    </ModuleGate>
  )
}
