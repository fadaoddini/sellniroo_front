'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** مسیر قدیمی — مدیریت محصولات در فروشگاه من است. */
export default function ShopManageRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/my-shop?tab=products')
  }, [router])

  return (
    <div dir="rtl" style={{ padding: '3rem 1.25rem', textAlign: 'center' }}>
      در حال انتقال به فروشگاه من…
    </div>
  )
}
