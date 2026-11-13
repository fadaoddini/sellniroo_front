'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import StockOut from '@/modules/inventory/components/stock/StockOut'

export default function Page() {
  return (
    <InventoryProvider>
      <StockOut />
    </InventoryProvider>
  )
}
