// app/news-management/page.jsx
'use client'

import React, { Suspense } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import NewsManagement from '@/components/newsAdmin/NewsManagement'

function LoadingBox({ dir, text }) {
  return (
    <div
      dir={dir}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--macos-bg)',
        color: '#6f675c',
        fontFamily: 'var(--font-iran)',
        fontSize: 13,
      }}
    >
      {text}
    </div>
  )
}

const NewsManagementPage = () => {
  const { isAuthenticated, loading, user, hasPermission } = useAuth()
  const { dir } = useLanguage()
  const router = useRouter()

  const canAccess = user?.is_superuser || user?.is_staff || hasPermission('news')

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <LoadingBox dir={dir} text="در حال بارگذاری..." />
  }

  if (!isAuthenticated) return null

  if (!canAccess) {
    return (
      <div
        dir={dir}
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--macos-bg)',
          color: '#6f675c',
          fontFamily: 'var(--font-iran)',
          fontSize: 13,
          textAlign: 'center',
          padding: 40,
        }}
      >
        دسترسی به بخش اخبار برای شما فعال نیست.
      </div>
    )
  }

  return (
    <div dir={dir}>
      <Suspense fallback={<LoadingBox dir={dir} text="در حال بارگذاری..." />}>
        <NewsManagement />
      </Suspense>
    </div>
  )
}

export default NewsManagementPage
