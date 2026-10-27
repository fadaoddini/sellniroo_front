import { Suspense } from 'react'
import ShopsProductsPage from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopsProductsPage />
    </Suspense>
  )
}
