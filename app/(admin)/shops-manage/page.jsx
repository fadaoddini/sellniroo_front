'use client'

import React from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Package,
  Store,
  Wallet,
} from 'lucide-react'
import MultiVendorShell from '@/components/Admin/MultiVendorShell'
import useMultiVendorGate from '@/components/Admin/useMultiVendorGate'
import styles from './ShopsManage.module.css'

const CARDS = [
  {
    href: '/shops-accounting',
    title: 'فروشگاه‌ها',
    desc: 'ویرایش مشخصات، کارمزد، نقشه و وضعیت همه فروشگاه‌ها',
    icon: Store,
    tone: 'amber',
  },
  {
    href: '/shops-accounting?tab=settle',
    title: 'تسویه و حسابداری',
    desc: 'محاسبه بدهی، ثبت تسویه، تاریخچه و تأیید پرداخت‌ها',
    icon: Wallet,
    tone: 'green',
  },
  {
    href: '/shops-products',
    title: 'محصولات',
    desc: 'ویرایش کاتالوگ همه فروشگاه‌ها؛ قیمت، موجودی و تصاویر',
    icon: Package,
    tone: 'brown',
  },
  {
    href: '/shops-accounting?tab=overview',
    title: 'خلاصه حسابداری',
    desc: 'نمای کلی GMV، سهم سیستم و بدهی تسویه‌نشده',
    icon: Building2,
    tone: 'slate',
  },
]

export default function ShopsManagePage() {
  const gate = useMultiVendorGate('/shops-manage')

  return (
    <MultiVendorShell
      title="مدیریت فروشگاه‌ها"
      subtitle="فروشگاه‌ها، تسویه و محصولات — از داشبورد، بدون دسترسی به adminweb"
      loading={gate.loading}
      allowed={gate.allowed}
      isAuthenticated={gate.isAuthenticated}
      moduleOn={gate.moduleOn}
    >
      <div className={styles.page} dir="rtl">
        <div className={styles.grid}>
          {CARDS.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`${styles.card} ${styles[card.tone] || ''}`}
              >
                <span className={styles.cardIcon}>
                  <Icon size={22} strokeWidth={1.7} />
                </span>
                <div className={styles.cardBody}>
                  <h2>{card.title}</h2>
                  <p>{card.desc}</p>
                </div>
                <span className={styles.cardGo}>
                  ورود
                  <ArrowLeft size={14} />
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </MultiVendorShell>
  )
}
