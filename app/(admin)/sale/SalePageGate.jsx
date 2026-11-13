'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Shield, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ModulePageShell from '@/components/layout/ModulePageShell'
import './sale-theme.css'

function SaleLoading() {
  return (
    <div className="saleScope">
      <div
        className="container"
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          color: '#6f675c',
        }}
      >
        <RefreshCw
          size={28}
          style={{
            animation: 'spin 0.8s linear infinite',
            color: '#c27800',
          }}
        />
        <span style={{ fontSize: 13 }}>در حال بارگذاری...</span>
      </div>
    </div>
  )
}

function SaleGateInner({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, hasPermission, loading, isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)
  const canAccess =
    !!user?.is_superuser ||
    !!user?.is_staff ||
    hasPermission('marketing') ||
    hasPermission('sales')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/sale')}`)
    }
  }, [mounted, loading, isAuthenticated, router, pathname])

  if (!mounted || loading || !isAuthenticated) {
    return <SaleLoading />
  }

  if (!canAccess) {
    return (
      <div className="saleScope">
        <div
          className="container"
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            textAlign: 'center',
            padding: '2rem 1rem',
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#fde8ea',
              color: '#c62828',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={32} />
          </div>
          <h3 style={{ margin: 0, fontSize: 15, color: '#2a241c' }}>
            دسترسی محدود
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: '#6f675c',
              maxWidth: 360,
            }}
          >
            دسترسی به بخش فروش / بازاریابی برای شما فعال نیست. از پنل کارمندان
            بخش «بازاریابی» یا «فروش» را برای حسابتان فعال کنید.
          </p>
          <Link
            href="/dashboard"
            style={{
              marginTop: 8,
              padding: '10px 18px',
              borderRadius: 12,
              background: '#3a2a00',
              color: '#fff8e7',
              textDecoration: 'none',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="saleScope">
      <div className="container">{children}</div>
    </div>
  )
}

export default function SalePageGate({ children }) {
  return (
    <ModulePageShell pageKey="sale">
      <SaleGateInner>{children}</SaleGateInner>
    </ModulePageShell>
  )
}
