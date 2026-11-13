'use client'

import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'
import ProductList from '@/modules/inventory/components/products/ProductList'

export default function Page() {
  return (
    <InventoryProvider>
      <ProductList />
    </InventoryProvider>
  )
}
