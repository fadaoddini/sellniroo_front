'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Rocket } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import {
  DEPLOY_SYSTEM_LINKS,
  getDeploySystemPageNav,
} from '@/components/Admin/deploySystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import styles from '../adminweb/AdminWeb.module.css'

function DeploySystemInner() {
  const gate = useOwnerGate('/deploysystem')

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="استقرار و تنظیمات محلی"
      title="دیپلوی"
      wide
      pageNav={getDeploySystemPageNav('/deploysystem')}
      {...gate}
    >
      <section className={`${styles.dashGroup} ${styles.dashGroupSystems}`}>
        <div className={styles.dashGroupHead}>
          <h2>
            <Rocket size={16} strokeWidth={2} style={{ marginInlineEnd: 6 }} />
            دیپلوی
          </h2>
          <span>
            {DEPLOY_SYSTEM_LINKS.length.toLocaleString('fa-IR')} زیرمجموعه
          </span>
        </div>
        <p className={styles.dashLead}>
          ابزارهای استقرار — فعلاً ویرایش local_settings.
        </p>
        <div className={`${styles.dashTiles} ${styles.dashTilesCols3}`}>
          {DEPLOY_SYSTEM_LINKS.map((item) => {
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

export default function DeploySystemPage() {
  return (
    <Suspense fallback={null}>
      <DeploySystemInner />
    </Suspense>
  )
}
