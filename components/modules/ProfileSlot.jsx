'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import ProfilePage from '@/modules/profile/components/ProfilePage'
import BasicProfilePage from '@/modules/profile/components/BasicProfilePage'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/**
 * پروفایل کاریابی فقط وقتی سیستم کاریابی + job_profile فعال باشند.
 * در غیر این صورت پروفایل عادی (بدون رزومه/شرکت/آگهی/ثبت آگهی).
 */
export default function ProfileSlot() {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.JOB_PROFILE}
      fallback={<BasicProfilePage />}
    >
      <ProfilePage />
    </ModuleGate>
  )
}
