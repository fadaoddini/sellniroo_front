'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import VoucherList from '@/modules/inventory/components/vouchers/VoucherList'

export default function Page() {
  return (
    <InventoryProvider>
      <VoucherList />
    </InventoryProvider>
  )
}
