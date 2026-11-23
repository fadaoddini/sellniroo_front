'use client'

import React from 'react'
import ModulePageShell from '@/components/layout/ModulePageShell'
import SchoolSlot from '@/components/modules/SchoolSlot'
import TeacherPublicProfile from '@/components/School/TeacherPublicProfile'

/** صفحه پروفایل عمومی معلم — /teachers/:slug */
export default function TeacherPublicSlot({ slug }) {
  return (
    <ModulePageShell pageKey="teacher">
      <SchoolSlot>
        <TeacherPublicProfile slug={slug} />
      </SchoolSlot>
    </ModulePageShell>
  )
}
