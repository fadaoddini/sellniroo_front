'use client'

import ModulePageShell from '@/components/layout/ModulePageShell'
import '@/modules/gym/styles/bodybuilding-theme.css'

export default function GymBodybuildingLayout({ children }) {
  return (
    <ModulePageShell pageKey="profile">
      <div className="gymBbTheme">{children}</div>
    </ModulePageShell>
  )
}
