'use client'

import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import PlatformProductsManager from '@/components/Admin/PlatformProductsManager'

/** فقط مالک پلتفرم (دو شماره) */
export default function AdminProductsPage() {
  const gate = useOwnerGate('/adminproducts')
  return (
    <PlatformProductsManager
      gate={gate}
      Shell={OwnerPortalShell}
      shopsHref="/adminshops"
      shellProps={{
        deniedHomeHref: '/dashboard',
      }}
    />
  )
}
