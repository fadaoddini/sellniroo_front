'use client'

import React, { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import PlatformCategoriesManager from '@/components/Admin/PlatformCategoriesManager'
import OwnerCategoriesPanel from './OwnerCategoriesPanel'
import styles from './ShopAccounting.module.css'

function HubCategoriesShell({ children, loading, allowed, isAuthenticated }) {
  if (loading) {
    return <div className={styles.empty}>در حال بارگذاری دسته‌ها…</div>
  }
  if (!isAuthenticated) return null
  if (!allowed) {
    return (
      <div className={styles.panel}>
        <h2>دسته‌بندی‌ها</h2>
        <OwnerCategoriesPanel />
        <p className={styles.hint} style={{ marginTop: '0.75rem' }}>
          مدیریت پیشرفتهٔ پلتفرم فقط برای کارکنان است؛ اینجا دسته‌های فروشگاه شما
          را می‌بینید.
        </p>
      </div>
    )
  }
  return <div className={styles.catalogRoot}>{children}</div>
}

/** دسته‌ها داخل هاب فروشگاه — پلتفرم برای ادمین، در غیر این صورت پنل مالک */
export default function ShopCategoriesEmbed() {
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

  if (!allowed && isAuthenticated && !loading) {
    return (
      <div className={styles.panel}>
        <h2>دسته‌بندی محصولات</h2>
        <OwnerCategoriesPanel />
      </div>
    )
  }

  return (
    <PlatformCategoriesManager
      gate={gate}
      Shell={HubCategoriesShell}
      shellProps={{}}
    />
  )
}
