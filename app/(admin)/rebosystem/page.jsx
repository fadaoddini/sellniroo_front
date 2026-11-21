'use client'

import Link from 'next/link'
import { Layers } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import {
  getReboSystemPageNav,
  REBO_SYSTEM_LINKS,
} from '@/components/Admin/reboSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import styles from '../adminweb/AdminWeb.module.css'

export default function ReboSystemPage() {
  const gate = useOwnerGate('/rebosystem')

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="سیستم ربو"
      title="سیستم ربو"
      wide
      pageNav={getReboSystemPageNav('/rebosystem')}
      {...gate}
    >
      <section className={`${styles.dashGroup} ${styles.dashGroupSystems}`}>
        <div className={styles.dashGroupHead}>
          <h2>
            <Layers size={16} strokeWidth={2} style={{ marginInlineEnd: 6 }} />
            سیستم ربو
          </h2>
          <span>
            {REBO_SYSTEM_LINKS.length.toLocaleString('fa-IR')} ابزار
          </span>
        </div>
        <p className={styles.dashLead}>
          آموزش، قیمت بسته‌ها، پشتیبانی و سرور، و مدیریت سفارش‌های ربو در یک محل.
        </p>
        <div className={`${styles.dashTiles} ${styles.dashTilesCols3}`}>
          {REBO_SYSTEM_LINKS.map((item) => {
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
