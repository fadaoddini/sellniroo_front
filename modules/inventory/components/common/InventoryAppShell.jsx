'use client'

import React from 'react'
import { InventoryProvider } from '@/modules/inventory/context/InventoryContext'

/**
 * شِل کلاینت برای اطمینان از در دسترس بودن Context
 * حتی وقتی صفحه Server Component است.
 */
export default function InventoryAppShell({ children }) {
  return <InventoryProvider>{children}</InventoryProvider>
}
