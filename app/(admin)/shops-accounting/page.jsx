import { Suspense } from 'react'
import ShopsAccountingPage from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopsAccountingPage />
    </Suspense>
  )
}
