'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import SchoolSlot from '@/components/modules/SchoolSlot'

/** پنل دانش‌آموز به تب پروفایل منتقل شده است */
export default function SchoolStudentPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/profile?tab=students')
  }, [router])

  return (
    <SchoolSlot>
      <div
        style={{
          minHeight: '40vh',
          display: 'grid',
          placeItems: 'center',
          color: '#004733',
        }}
        role="status"
      >
        <Loader2 size={28} style={{ animation: 'spin 0.85s linear infinite' }} />
      </div>
    </SchoolSlot>
  )
}
