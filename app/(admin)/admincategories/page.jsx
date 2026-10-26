'use client'

import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import PlatformCategoriesManager from '@/components/Admin/PlatformCategoriesManager'

/** مدیریت کامل دسته‌بندی محصولات + تزریق قالب مشاغل */
export default function AdminCategoriesPage() {
  const gate = useOwnerGate('/admincategories')
  return (
    <PlatformCategoriesManager
      gate={gate}
      Shell={OwnerPortalShell}
      shellProps={{
        deniedHomeHref: '/dashboard',
      }}
    />
  )
}
