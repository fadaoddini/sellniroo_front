import {
  Cloud,
  GitBranch,
  Server,
  Settings2,
  Users,
  Wallet,
} from 'lucide-react'

/** نوار و لینک‌های زیرمجموعه بخش سرور */
export const SERVER_SYSTEM_LINKS = [
  {
    id: 'sites',
    href: '/adminmodule?tab=sites',
    label: 'سایت‌های سرور',
    desc: 'نصب‌ها و دامنه‌های روی سرور',
    icon: Server,
  },
  {
    id: 'git',
    href: '/adminmodule?tab=git',
    label: 'گیت',
    desc: 'مخزن و استقرار از گیت',
    icon: GitBranch,
  },
  {
    id: 'cloud-settings',
    href: '/cloud-manage?tab=settings',
    label: 'تنظیمات',
    desc: 'نرخ، هشدار و پذیرش سفارش سرور ابری',
    icon: Settings2,
  },
  {
    id: 'cloud-subs',
    href: '/cloud-manage?tab=subs',
    label: 'مشترکین',
    desc: 'اشتراک‌ها و موجودی سرور ابری',
    icon: Users,
  },
  {
    id: 'cloud-ledger',
    href: '/cloud-manage?tab=topups',
    label: 'حسابداری',
    desc: 'شارژها، فیش‌ها و تأیید واریز',
    icon: Wallet,
  },
]

export function getServerSystemPageNav(activeHref = '/serversystem') {
  return [
    {
      id: 'hub',
      href: '/serversystem',
      label: 'سرور',
      icon: Cloud,
      active: activeHref === '/serversystem',
    },
    ...SERVER_SYSTEM_LINKS.map((item) => ({
      id: item.id,
      href: item.href,
      label: item.label,
      icon: item.icon,
      active: activeHref === item.href || activeHref === item.id,
    })),
  ]
}
