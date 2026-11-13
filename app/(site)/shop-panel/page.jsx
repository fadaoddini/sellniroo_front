'use client'

import React, { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

/** مسیر قدیمی — همهٔ مدیریت فروشگاه در /dashboard/my-shop است. */
function ShopPanelRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tab = searchParams?.get('tab')
    const qs = tab ? `?tab=${encodeURIComponent(tab)}` : ''
    router.replace(`/dashboard/my-shop${qs}`)
  }, [router, searchParams])

  return (
    <div dir="rtl" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
      در حال انتقال به فروشگاه من…
    </div>
  )
}

export default function ShopPanelPage() {
  return (
    <Suspense
      fallback={
        <div dir="rtl" style={{ padding: '3rem', textAlign: 'center' }}>
          در حال انتقال…
        </div>
      }
    >
      <ShopPanelRedirect />
    </Suspense>
  )
}
