// app/news-management/page.jsx
'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'
import NewsManagement from '@/components/newsAdmin/NewsManagement'

const NewsManagementPage = () => {
  const { isAuthenticated, loading, user } = useAuth()
  const { dir } = useLanguage()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center' }}>در حال بارگذاری...</div>
  }

  if (!isAuthenticated) return null

  return (
    <div dir={dir}>
      <NewsManagement />
    </div>
  )
}

export default NewsManagementPage