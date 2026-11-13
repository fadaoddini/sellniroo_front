'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import InventoryDashboard from '@/modules/inventory/components/InventoryDashboard'

export default function Page() {
  return (
    <InventoryProvider>
      <InventoryDashboard />
    </InventoryProvider>
  )
}
