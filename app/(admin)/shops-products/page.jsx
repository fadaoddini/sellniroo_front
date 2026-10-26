'use client'

import MultiVendorShell from '@/components/Admin/MultiVendorShell'
import useMultiVendorGate from '@/components/Admin/useMultiVendorGate'
import PlatformProductsManager from '@/components/Admin/PlatformProductsManager'

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
