import { Layers, LayoutTemplate, UserRound } from 'lucide-react'

/** لینک‌های زیرمجموعه طراحی قالب */
export const TEMPLATE_SYSTEM_LINKS = [
  {
    id: 'home',
    href: '/adminsettings',
    label: 'طراحی قالب',
    desc: 'خانه و ویجت‌های صفحه اصلی',
    icon: LayoutTemplate,
  },
  {
    id: 'pages',
    href: '/adminsettings?tab=pages',
    label: 'صفحات داخلی',
    desc: 'هدر مشترک و چیدمان صفحات',
    icon: Layers,
  },
  {
    id: 'profile',
    href: '/adminsettings?tab=profile',
    label: 'طراحی و چیدمان پروفایل',
    desc: 'بخش‌ها و ترتیب پروفایل',
    icon: UserRound,
  },
]

export function getTemplateSystemPageNav(activeHref = '/templatesystem') {
  return [
    {
      id: 'hub',
      href: '/templatesystem',
      label: 'طراحی قالب',
      icon: LayoutTemplate,
      active: activeHref === '/templatesystem',
    },
    ...TEMPLATE_SYSTEM_LINKS.map((item) => ({
      id: item.id,
      href: item.href,
      label: item.id === 'profile' ? 'پروفایل' : item.label,
      icon: item.icon,
      active: activeHref === item.href || activeHref === item.id,
    })),
  ]
}

/** تب‌های متعلق به بسته طراحی قالب */
export function isTemplateSystemTab(tab) {
  return tab === 'home' || tab === 'pages' || tab === 'profile' || !tab
}
