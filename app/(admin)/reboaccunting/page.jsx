import { Suspense } from 'react'
import { ReboAccountingModule } from '@/modules/reboaccunting'

export const metadata = {
  title: 'حسابداری ربو',
  description: 'دفتر روزنامه و سود و زیان سفارش‌های ربو',
}

export default function ReboAccountingPage() {
  return (
    <Suspense fallback={null}>
      <ReboAccountingModule />
    </Suspense>
  )
}
