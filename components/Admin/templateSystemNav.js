import {
  Layers,
  LayoutTemplate,
  Menu,
  PanelBottom,
  PanelTop,
  UserRound,
} from 'lucide-react'

/** لینک‌های زیرمجموعه طراحی قالب */
export const TEMPLATE_SYSTEM_LINKS = [
  {
    id: 'header',
    href: '/adminsettings?tab=header',
    label: 'هدر بالا',
    desc: 'بالاترین نوار سایت',
    icon: PanelTop,
  },
  {
    id: 'menu',
    href: '/adminsettings?tab=menu',
    label: 'منوی بالا',
    desc: 'نوار منو زیر هدر',
    icon: Menu,
  },
  {
    id: 'home',
    href: '/adminsettings',
    label: 'صفحه اصلی',
    desc: 'محتوای خانه + انتخاب هدر/منو',
    icon: LayoutTemplate,
  },
  {
    id: 'pages',
    href: '/adminsettings?tab=pages',
    label: 'صفحات داخلی',
    desc: 'محتوا و انتخاب هدر/منو هر صفحه',
    icon: Layers,
  },
  {
    id: 'footer',
    href: '/adminsettings?tab=footer',
    label: 'فوتر',
    desc: 'پایین‌ترین قسمت سایت',
    icon: PanelBottom,
  },
  {
    id: 'profile',
    href: '/adminsettings?tab=profile',
    label: 'طراحی و چیدمان پروفایل',
    desc: 'بخش‌های پروفایل + هدر/منو جدا',
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
      label:
        item.id === 'profile'
          ? 'پروفایل'
          : item.id === 'home'
            ? 'صفحه اصلی'
            : item.label,
      icon: item.icon,
      active: activeHref === item.href || activeHref === item.id,
    })),
  ]
}

/** تب‌های متعلق به بسته طراحی قالب */
export function isTemplateSystemTab(tab) {
  return (
    tab === 'home' ||
    tab === 'header' ||
    tab === 'menu' ||
    tab === 'pages' ||
    tab === 'footer' ||
    tab === 'profile' ||
    !tab
  )
}
