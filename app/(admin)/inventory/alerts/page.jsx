'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import AlertList from '@/modules/inventory/components/Alerts/AlertList'

export default function Page() {
  return (
    <InventoryProvider>
      <AlertList />
    </InventoryProvider>
  )
}
