import { Suspense } from 'react'
import AdminProductsPage from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminProductsPage />
    </Suspense>
  )
}
