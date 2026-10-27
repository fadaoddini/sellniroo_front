import { Suspense } from 'react'
import AdminNewsPage from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminNewsPage />
    </Suspense>
  )
}
