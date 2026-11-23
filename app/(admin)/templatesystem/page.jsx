'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { LayoutTemplate } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import {
  getTemplateSystemPageNav,
  TEMPLATE_SYSTEM_LINKS,
} from '@/components/Admin/templateSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import styles from '../adminweb/AdminWeb.module.css'

function TemplateSystemInner() {
  const gate = useOwnerGate('/templatesystem')

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="هدر، منو، خانه، صفحات داخلی و فوتر"
      title="طراحی قالب"
      wide
      pageNav={getTemplateSystemPageNav('/templatesystem')}
      {...gate}
    >
      <section className={`${styles.dashGroup} ${styles.dashGroupSystems}`}>
        <div className={styles.dashGroupHead}>
          <h2>
            <LayoutTemplate
              size={16}
              strokeWidth={2}
              style={{ marginInlineEnd: 6 }}
            />
            طراحی قالب
          </h2>
          <span>
            {TEMPLATE_SYSTEM_LINKS.length.toLocaleString('fa-IR')} زیرمجموعه
          </span>
        </div>
        <p className={styles.dashLead}>
          هدر و منو را جدا طراحی کنید؛ روی هر صفحه انتخاب کنید نمایش داده شوند
          یا نه. فوتر در پایین سایت.
        </p>
        <div className={`${styles.dashTiles} ${styles.dashTilesCols3}`}>
          {TEMPLATE_SYSTEM_LINKS.map((item) => {
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

export default function TemplateSystemPage() {
  return (
    <Suspense fallback={null}>
      <TemplateSystemInner />
    </Suspense>
  )
}