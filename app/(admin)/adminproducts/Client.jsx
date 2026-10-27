'use client'

import nextDynamic from 'next/dynamic'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'

const PlatformProductsManager = nextDynamic(
  () => import('@/components/Admin/PlatformProductsManager'),
  { ssr: false },
)

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
