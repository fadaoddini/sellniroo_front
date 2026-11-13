'use client'

import React from 'react'
import { MarketingModule } from '../../../modules/sales'
import SalePageGate from './SalePageGate'

export default function SalesPage() {
  return (
    <SalePageGate>
      <MarketingModule />
    </SalePageGate>
  )
}
