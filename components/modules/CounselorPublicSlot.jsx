'use client'

import React from 'react'
import ModulePageShell from '@/components/layout/ModulePageShell'
import SchoolSlot from '@/components/modules/SchoolSlot'
import CounselorPublicProfile from '@/components/School/CounselorPublicProfile'

/** صفحه پروفایل عمومی مشاور — /counselors/:slug */
export default function CounselorPublicSlot({ slug }) {
  return (
    <ModulePageShell pageKey="counselor">
      <SchoolSlot>
        <CounselorPublicProfile slug={slug} />
      </SchoolSlot>
    </ModulePageShell>
  )
}
