'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, BarChart3, Loader2, Route } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import karmandanService from '../services/karmandanService'
import SalePathMonitor from './SalePathMonitor'
import styles from '../styles/SaleMonitor.module.css'

export default function SaleMonitor() {
  const router = useRouter()
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    checkingEmployee,
    employeeData,
  } = useAuth()

  const accessLevel = Number(employeeData?.access_level ?? user?.access_level ?? 0)
  const isSaleManager = !!user?.is_superuser || accessLevel >= 3

  const [employees, setEmployees] = useState([])
  const [staffLoading, setStaffLoading] = useState(true)

  useEffect(() => {
    if (authLoading || checkingEmployee) return
    if (!isAuthenticated) {
      router.replace('/login?next=/sale/monitor')
      return
    }
    if (!isSaleManager) {
      router.replace('/sale')
    }
  }, [authLoading, checkingEmployee, isAuthenticated, isSaleManager, router])

  useEffect(() => {
    if (!isSaleManager) return undefined
    let cancelled = false
    ;(async () => {
      setStaffLoading(true)
      try {
        const res = await karmandanService.getAssignableStaff()
        if (!cancelled) {
          setEmployees(Array.isArray(res?.data) ? res.data : [])
        }
      } catch {
        if (!cancelled) setEmployees([])
      } finally {
        if (!cancelled) setStaffLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isSaleManager])

  if (authLoading || checkingEmployee || (isSaleManager && staffLoading)) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.loading}>
          <Loader2 size={22} className={styles.spin} />
          <p>در حال آماده‌سازی رصد مسیر...</p>
        </div>
      </div>
    )
  }

  if (!isSaleManager) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.gate}>
          <h2>دسترسی محدود</h2>
          <p>فقط مدیر می‌تواند رصد مسیر موارد را ببیند.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <button type="button" className={styles.backBtn} onClick={() => router.push('/sale')}>
            <ArrowRight size={14} />
            فروش
          </button>
          <div className={styles.titleBlock}>
            <h1>
              <Route size={22} />
              رصد مسیر موارد
            </h1>
            <p>
              هر مورد را جستجو کنید و مرحله فعلی، گزارش‌ها، پیوست‌ها و مسیر مسئولیت را ببینید
            </p>
          </div>
        </div>
        <div className={styles.topRight}>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => router.push('/sale/analytics')}
          >
            <BarChart3 size={14} />
            گزارش تحلیلی
          </button>
        </div>
      </div>

      <div className={styles.body}>
        <SalePathMonitor employees={employees} variant="full" />
      </div>
    </div>
  )
}
