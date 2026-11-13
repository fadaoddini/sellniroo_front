'use client'

import { lazy } from 'react'
import { DomainProfilePage } from './DomainProfileShell'
import domainStyles from '../styles/DomainProfilePage.module.css'

const BookingProfilePanel = lazy(() => import('./BookingProfilePanel'))

const TABS = [
  { key: 'bookings', label: 'نوبت‌های من', icon: 'calendar' },
  { key: 'account', label: 'حساب', icon: 'user' },
]

export default function BookingProfilePage() {
  return (
    <DomainProfilePage
      variant="sadra"
      tone="sadra"
      pageClass={domainStyles.pageBooking}
      defaultTab="bookings"
      tabs={TABS}
      panels={{ bookings: BookingProfilePanel }}
      hero={{
        title: 'نوبت‌های شما',
        desc: 'رزرو جدید بگیرید یا با کد پیگیری، نوبت قبلی را دنبال کنید.',
        href: '/booking',
        cta: 'رفتن به نوبت‌دهی',
      }}
    />
  )
}
