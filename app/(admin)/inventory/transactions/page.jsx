'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import TransactionList from '@/modules/inventory/components/Transactions/TransactionList'

export default function Page() {
  return (
    <InventoryProvider>
      <TransactionList />
    </InventoryProvider>
  )
}
