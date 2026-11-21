import { Suspense } from 'react'
import CloudManageClient from './CloudManageClient'

export const dynamic = 'force-dynamic'

export default function CloudManagePage() {
  return (
    <Suspense fallback={null}>
      <CloudManageClient />
    </Suspense>
  )
}
