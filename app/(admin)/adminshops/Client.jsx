'use client'

import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import PlatformShopsManager from '@/components/Admin/PlatformShopsManager'

/** فقط مالک پلتفرم (دو شماره) */
export default function AdminShopsPage() {
  const gate = useOwnerGate('/adminshops')
  return (
    <PlatformShopsManager
      gate={gate}
      Shell={OwnerPortalShell}
      productsHref="/adminproducts"
      shellProps={{
        homeHref: '/adminweb',
        homeLabel: 'بازگشت به adminweb',
        deniedHomeHref: '/dashboard',
      }}
    />
  )
}
