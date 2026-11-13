'use client'

import React, { Suspense } from 'react'
import { SaleMonitor } from '../../../../modules/sales'
import SalePageGate from '../SalePageGate'

export default function SaleMonitorPage() {
  return (
    <SalePageGate>
      <Suspense
        fallback={
          <div dir="rtl" style={{ padding: '2rem', textAlign: 'center' }}>
            در حال بارگذاری مانیتور مسیر...
          </div>
        }
      >
        <SaleMonitor />
      </Suspense>
    </SalePageGate>
  )
}
