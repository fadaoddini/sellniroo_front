import {
  BookOpen,
  Boxes,
  Calculator,
  Cloud,
  Headphones,
  Layers,
} from 'lucide-react'

/** لینک‌های زیرمجموعه سیستم ربو */
export const REBO_SYSTEM_LINKS = [
  {
    id: 'learn',
    href: '/rebolearn',
    label: 'آموزش‌های ربو',
    desc: 'استقرار، CLI و راهنمای عملیاتی',
    icon: BookOpen,
  },
  {
    id: 'pricing',
    href: '/rebo-pricing',
    label: 'قیمت ربو',
    desc: 'موضوع‌ها و بسته‌ها',
    icon: Calculator,
  },
  {
    id: 'support',
    href: '/rebo-pricing?tab=ops',
    label: 'پشتیبانی و سرور',
    desc: 'پلن‌های پشتیبانی و قیمت سرور ابری',
    icon: Headphones,
  },
  {
    id: 'manage',
    href: '/rebo-manage',
    label: 'مدیریت ربو',
    desc: 'سفارش‌ها، فیش‌ها و پرداخت',
    icon: Boxes,
  },
]

/** نوار بالای صفحات زیرمجموعه سیستم ربو */
export function getReboSystemPageNav(activeHref = '/rebosystem') {
  return [
    {
      id: 'hub',
      href: '/rebosystem',
      label: 'سیستم ربو',
      icon: Layers,
      active: activeHref === '/rebosystem',
    },
    ...REBO_SYSTEM_LINKS.map((item) => ({
      id: item.id,
      href: item.href,
      label: item.id === 'support' ? 'پشتیبانی' : item.label.replace(' ربو', ''),
      icon: item.icon,
      active:
        activeHref === item.href ||
        activeHref === item.id ||
        (item.id === 'support' &&
          (activeHref === 'ops' || activeHref === '/rebo-pricing?tab=ops')),
    })),
  ]
}

export { Cloud }
