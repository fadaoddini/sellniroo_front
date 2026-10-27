'use client'

import nextDynamic from 'next/dynamic'
import MultiVendorShell from '@/components/Admin/MultiVendorShell'
import useMultiVendorGate from '@/components/Admin/useMultiVendorGate'

const PlatformProductsManager = nextDynamic(
  () => import('@/components/Admin/PlatformProductsManager'),
  { ssr: false },
)

/** نسخهٔ داشبورد — با ماژول چندفروشندگی */
export default function ShopsProductsPage() {
  const gate = useMultiVendorGate('/shops-products')
  return (
    <PlatformProductsManager
      gate={gate}
      Shell={MultiVendorShell}
      shopsHref="/shops-accounting"
    />
  )
}
