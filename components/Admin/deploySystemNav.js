import { FileCode2, Rocket } from 'lucide-react'

/** لینک‌های زیرمجموعه دیپلوی */
export const DEPLOY_SYSTEM_LINKS = [
  {
    id: 'local',
    href: '/adminsettings?tab=local',
    label: 'local_settings',
    desc: 'تنظیمات محلی استقرار',
    icon: FileCode2,
  },
]

export function getDeploySystemPageNav(activeHref = '/deploysystem') {
  return [
    {
      id: 'hub',
      href: '/deploysystem',
      label: 'دیپلوی',
      icon: Rocket,
      active: activeHref === '/deploysystem',
    },
    ...DEPLOY_SYSTEM_LINKS.map((item) => ({
      id: item.id,
      href: item.href,
      label: item.label,
      icon: item.icon,
      active: activeHref === item.href || activeHref === item.id,
    })),
  ]
}

export function isDeploySystemTab(tab) {
  return tab === 'local'
}
