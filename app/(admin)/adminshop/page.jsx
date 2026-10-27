import { Suspense } from 'react'
import AdminShopPage from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminShopPage />
    </Suspense>
  )
}
