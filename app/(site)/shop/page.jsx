import { Suspense } from 'react'
import ShopPageSlot from '@/components/modules/ShopPageSlot'
import ShopPageClient from './ShopPageClient'

export const metadata = {
  title: 'فروشگاه',
}

export default function ShopPage() {
  return (
    <ShopPageSlot>
      <Suspense
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            بارگذاری فروشگاه…
          </div>
        }
      >
        <ShopPageClient />
      </Suspense>
    </ShopPageSlot>
  )
}
