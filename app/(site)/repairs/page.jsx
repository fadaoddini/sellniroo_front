import { Suspense } from 'react'
import RepairsRequestPage from '@/components/Repairs/RepairsRequestPage'

export const metadata = {
  title: 'درخواست تعمیر و سرویس | سلنیرو',
  description: 'ثبت درخواست تعمیر، رزرو سرویسکار و پیگیری پرداخت مرحله‌ای',
}

export const dynamic = 'force-dynamic'

export default function RepairsRoutePage() {
  return (
    <Suspense fallback={null}>
      <RepairsRequestPage />
    </Suspense>
  )
}
