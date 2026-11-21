import { CreditCard, Settings2 } from 'lucide-react'

/** نوار بالای صفحات زیرمجموعه تنظیمات پرداخت */
export function getPaymentSystemPageNav(activeHref = '/paymentsystem') {
  return [
    {
      id: 'hub',
      href: '/paymentsystem',
      label: 'تنظیمات پرداخت',
      icon: CreditCard,
      active: activeHref === '/paymentsystem',
    },
    {
      id: 'manage',
      href: '/payment-manage',
      label: 'ماژول پرداخت',
      icon: Settings2,
      active: activeHref === '/payment-manage',
    },
  ]
}
