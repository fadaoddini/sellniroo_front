'use client'

import React, { useContext } from 'react'
import InventoryContext, {
  InventoryProvider,
} from '@/modules/inventory/context/InventoryContext'

/**
 * اگر از layout به Context رسیده باشیم، همان را استفاده می‌کند؛
 * وگرنه یک Provider محلی می‌سازد تا صفحه کرش نکند.
 */
export default function EnsureInventory({ children }) {
  const ctx = useContext(InventoryContext)
  if (ctx) return children
  return <InventoryProvider>{children}</InventoryProvider>
}
