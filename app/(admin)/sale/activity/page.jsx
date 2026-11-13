'use client'

import React, { Suspense } from 'react'
import { SaleActivityReport } from '../../../../modules/sales'
import SalePageGate from '../SalePageGate'

export default function SaleActivityPage() {
  return (
    <SalePageGate>
      <Suspense
        fallback={
          <div dir="rtl" style={{ padding: '2rem', textAlign: 'center' }}>
            در حال بارگذاری گزارش فعالیت...
          </div>
        }
      >
        <SaleActivityReport />
      </Suspense>
    </SalePageGate>
  )
}
