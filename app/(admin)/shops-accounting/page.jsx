'use client'

import MultiVendorShell from '@/components/Admin/MultiVendorShell'
import useMultiVendorGate from '@/components/Admin/useMultiVendorGate'
import PlatformShopsManager from '@/components/Admin/PlatformShopsManager'

/** نسخهٔ داشبورد — با ماژول چندفروشندگی */
export default function ShopsAccountingPage() {
  const gate = useMultiVendorGate('/shops-accounting')
  return (
    <PlatformShopsManager
      gate={gate}
      Shell={MultiVendorShell}
      productsHref="/shops-products"
      shellProps={{
        homeHref: '/shops-manage',
        homeLabel: 'بازگشت به مدیریت فروشگاه‌ها',
      }}
    />
  )
}
