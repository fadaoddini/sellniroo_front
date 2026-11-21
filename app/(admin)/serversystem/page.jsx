'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Cloud } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import {
  getServerSystemPageNav,
  SERVER_SYSTEM_LINKS,
} from '@/components/Admin/serverSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import styles from '../adminweb/AdminWeb.module.css'

function ServerSystemInner() {
  const gate = useOwnerGate('/serversystem')

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="مدیریت سرور"
      title="سرور"
      wide
      pageNav={getServerSystemPageNav('/serversystem')}
      {...gate}
    >
      <section className={`${styles.dashGroup} ${styles.dashGroupSystems}`}>
        <div className={styles.dashGroupHead}>
          <h2>
            <Cloud size={16} strokeWidth={2} style={{ marginInlineEnd: 6 }} />
            سرور
          </h2>
          <span>
            {SERVER_SYSTEM_LINKS.length.toLocaleString('fa-IR')} زیرمجموعه
          </span>
        </div>
        <p className={styles.dashLead}>
          سایت‌های نصب‌شده، گیت، و مدیریت سرور ابری (تنظیمات، مشترکین، حسابداری)
          در یک محل.
        </p>
        <div className={`${styles.dashTiles} ${styles.dashTilesCols3}`}>
          {SERVER_SYSTEM_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={styles.dashTile}>
                <span className={styles.dashTileIcon}>
                  <Icon size={18} strokeWidth={2} />
                </span>
                <span className={styles.dashTileBody}>
                  <strong>{item.label}</strong>
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

export default function ServerSystemPage() {
  return (
    <Suspense fallback={null}>
      <ServerSystemInner />
    </Suspense>
  )
}
