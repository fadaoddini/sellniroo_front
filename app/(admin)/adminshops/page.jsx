import { Suspense } from 'react'
import AdminShopsPage from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminShopsPage />
    </Suspense>
  )
}
