'use client'

import React, { useEffect, useState } from 'react'
import ModulePageShell from '@/components/layout/ModulePageShell'
import ProfilePage from '@/modules/profile/components/ProfilePage'
import BasicProfilePage from '@/modules/profile/components/BasicProfilePage'
import ShopProfilePage from '@/modules/profile/components/ShopProfilePage'
import BookingProfilePage from '@/modules/profile/components/BookingProfilePage'
import RepairsProfilePage from '@/modules/profile/components/RepairsProfilePage'
import SchoolProfilePage from '@/modules/profile/components/SchoolProfilePage'
import ReboProfilePage from '@/modules/profile/components/ReboProfilePage'
import CrmProfilePage from '@/modules/profile/components/CrmProfilePage'
import InventoryProfilePage from '@/modules/profile/components/InventoryProfilePage'
import GymBodybuildingProfilePage from '@/modules/profile/components/GymBodybuildingProfilePage'
import CompositeProfilePage from '@/modules/profile/components/CompositeProfilePage'
import { resolveProfileSystemId } from '@/services/profileSystem'

const SHELLS = {
  rebo: ReboProfilePage,
  sales: CrmProfilePage,
  crm: CrmProfilePage,
  inventory: InventoryProfilePage,
  gym_bodybuilding: GymBodybuildingProfilePage,
  job: ProfilePage,
  shop: ShopProfilePage,
  booking: BookingProfilePage,
  repairs: RepairsProfilePage,
  school: SchoolProfilePage,
  composite: CompositeProfilePage,
  basic: BasicProfilePage,
}

/**
 * /profile متناسب با چیدمان ادمین + سیستم‌های فعال سایت
 */
export default function ProfileSlot() {
  const [systemId, setSystemId] = useState(null)

  useEffect(() => {
    let cancelled = false
    const refresh = () => {
      resolveProfileSystemId({ force: true }).then((id) => {
        if (!cancelled) setSystemId(id || 'basic')
      })
    }
    refresh()
    window.addEventListener('site-modules-changed', refresh)
    window.addEventListener('profile-layout-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', refresh)
      window.removeEventListener('profile-layout-changed', refresh)
    }
  }, [])

  const Shell = SHELLS[systemId] || BasicProfilePage

  return (
    <ModulePageShell pageKey="profile">
      {systemId == null ? null : <Shell />}
    </ModulePageShell>
  )
}
