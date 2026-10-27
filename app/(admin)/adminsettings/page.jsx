import { Suspense } from 'react'
import AdminSettingsPage from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminSettingsPage />
    </Suspense>
  )
}
