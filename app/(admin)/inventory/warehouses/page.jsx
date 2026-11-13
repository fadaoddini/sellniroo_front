'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import WarehousesList from '@/modules/inventory/components/warehouses/WarehousesList'

export default function Page() {
  return (
    <InventoryProvider>
      <WarehousesList />
    </InventoryProvider>
  )
}
