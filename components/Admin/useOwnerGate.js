'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isPlatformOwner, OWNER_PROFILE } from '@/utils/ownerAccess'

/** گیت دسترسی مالک پلتفرم برای پورتال‌های admin* — فقط دو شماره */
export default function useOwnerGate(nextPath = '/adminweb') {
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()
  const allowed = useMemo(() => isPlatformOwner(user), [user])

  useEffect(() => {
    if (loading) return
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`)
      return
    }
    if (!allowed) {
      router.replace('/dashboard')
    }
  }, [loading, isAuthenticated, allowed, router, nextPath])

  const displayName =
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    OWNER_PROFILE.name

  return {
    user,
    loading,
    isAuthenticated,
    allowed,
    displayName,
  }
}
