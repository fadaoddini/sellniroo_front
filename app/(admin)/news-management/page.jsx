// app/news-management/page.jsx
'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import NewsManagement from '@/components/newsAdmin/NewsManagement'

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
    return (
      <div dir={dir} style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--macos-bg)',
        color: '#6f675c',
        fontFamily: 'var(--font-iran)',
        fontSize: 13,
      }}>
        در حال بارگذاری...
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canAccess) {
    return (
      <div dir={dir} style={{
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
      }}>
        دسترسی به بخش اخبار برای شما فعال نیست.
      </div>
    )
  }

  return (
    <div dir={dir}>
      <NewsManagement />
    </div>
  )
}

export default NewsManagementPage