'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import StockIn from '@/modules/inventory/components/stock/StockIn'

export default function Page() {
  return (
    <InventoryProvider>
      <StockIn />
    </InventoryProvider>
  )
}
