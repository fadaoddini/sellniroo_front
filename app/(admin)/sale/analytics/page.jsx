'use client'

import React, { Suspense } from 'react'
import { SaleAnalytics } from '../../../../modules/sales'
import SalePageGate from '../SalePageGate'

export default function SaleAnalyticsPage() {
  return (
    <SalePageGate>
      <Suspense
        fallback={
          <div dir="rtl" style={{ padding: '2rem', textAlign: 'center' }}>
            در حال بارگذاری گزارش...
          </div>
        }
      >
        <SaleAnalytics />
      </Suspense>
    </SalePageGate>
  )
}
