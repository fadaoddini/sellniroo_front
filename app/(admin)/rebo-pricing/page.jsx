'use client'

import { Suspense } from 'react'
import ReboPricingClient from './ReboPricingClient'

export default function ReboPricingPage() {
  return (
    <Suspense fallback={null}>
      <ReboPricingClient />
    </Suspense>
  )
}
