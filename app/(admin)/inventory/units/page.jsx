'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import UnitList from '@/modules/inventory/components/Units/UnitList'

export default function Page() {
  return (
    <InventoryProvider>
      <UnitList />
    </InventoryProvider>
  )
}
