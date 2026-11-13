'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import AuthorizedPersonList from '@/modules/inventory/components/authorized-persons/AuthorizedPersonList'

export default function Page() {
  return (
    <InventoryProvider>
      <AuthorizedPersonList />
    </InventoryProvider>
  )
}
