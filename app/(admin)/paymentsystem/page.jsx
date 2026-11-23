'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { CreditCard, Settings2 } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import { getPaymentSystemPageNav } from '@/components/Admin/paymentSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import styles from '../adminweb/AdminWeb.module.css'

const PAYMENT_TOOLS = [
  {
    href: '/payment-manage',
    title: 'ماژول پرداخت',
    desc: 'درگاه‌ها، اهداف پرداخت و تراکنش‌های اخیر',
    icon: Settings2,
  },
]

function PaymentSystemInner() {
  const gate = useOwnerGate('/paymentsystem')

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="تنظیمات پرداخت"
      title="تنظیمات پرداخت"
      wide
      pageNav={getPaymentSystemPageNav('/paymentsystem')}
      {...gate}
    >
      <section className={`${styles.dashGroup} ${styles.dashGroupSystems}`}>
        <div className={styles.dashGroupHead}>
          <h2>
            <CreditCard size={16} strokeWidth={2} style={{ marginInlineEnd: 6 }} />
            تنظیمات پرداخت
          </h2>
          <span>{PAYMENT_TOOLS.length.toLocaleString('fa-IR')} ابزار</span>
        </div>
        <p className={styles.dashLead}>
          درگاه سراسری و تنظیمات پرداخت سایت در یک محل.
        </p>
        <div className={`${styles.dashTiles} ${styles.dashTilesCols3}`}>
          {PAYMENT_TOOLS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={styles.dashTile}>
                <span className={styles.dashTileIcon}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className={styles.dashTileBody}>
                  <strong>{item.title}</strong>
                  {item.desc ? <em>{item.desc}</em> : null}
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </OwnerPortalShell>
  )
}

export default function PaymentSystemPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSystemInner />
    </Suspense>
  )
}
