import { Suspense } from 'react'
import BookingClient from './Client'

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BookingClient />
    </Suspense>
  )
}
