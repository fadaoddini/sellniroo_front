'use client'

import { DomainProfilePage } from './DomainProfileShell'
import RepairsProfilePanel from './RepairsProfilePanel'
import domainStyles from '../styles/DomainProfilePage.module.css'

const TABS = [
  { key: 'requests', label: 'سفارش‌های من', icon: 'wrench' },
  { key: 'account', label: 'حساب', icon: 'user' },
]

export default function RepairsProfilePage() {
  return (
    <DomainProfilePage
      variant="repairs"
      tone="repairs"
      pageClass={domainStyles.pageRepairs}
      defaultTab="requests"
      tabs={TABS}
      panels={{
        requests: RepairsProfilePanel,
      }}
      hero={{
        title: 'سرویس و تعمیرات من',
        desc: 'وضعیت سفارش، پرداخت‌ها، پیشنهاد خرید و اقدامات لازم را اینجا ببینید.',
        href: '/repairs',
        cta: 'ثبت درخواست سرویس',
      }}
    />
  )
}
