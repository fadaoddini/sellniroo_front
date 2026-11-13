'use client'

import React, { Suspense } from 'react'
import { InvoiceDesigner } from '../../../../modules/sales'
import SalePageGate from '../SalePageGate'

export default function SaleInvoicePage() {
  return (
    <SalePageGate>
      <Suspense
        fallback={
          <div dir="rtl" style={{ padding: '2rem', textAlign: 'center' }}>
            در حال بارگذاری...
          </div>
        }
      >
        <InvoiceDesigner />
      </Suspense>
    </SalePageGate>
  )
}
