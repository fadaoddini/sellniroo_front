import { Suspense } from 'react'
import AdminModuleClient from './Client'

export const dynamic = 'force-dynamic'

export default function AdminModulePage() {
  return (
    <Suspense fallback={null}>
      <AdminModuleClient />
    </Suspense>
  )
}
