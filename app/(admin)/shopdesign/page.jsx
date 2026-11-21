'use client'

import Link from 'next/link'
import { Store } from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import {
  getShopDesignPageNav,
  SHOP_DESIGN_LINKS,
} from '@/components/Admin/shopDesignNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import styles from '../adminweb/AdminWeb.module.css'

export default function ShopDesignPage() {
  const gate = useOwnerGate('/shopdesign')

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline="لیست، سینگل و مسیر خرید"
      title="طراحی فروشگاه"
      wide
      pageNav={getShopDesignPageNav('/shopdesign')}
      {...gate}
    >
      <section className={`${styles.dashGroup} ${styles.dashGroupSystems}`}>
        <div className={styles.dashGroupHead}>
          <h2>
            <Store size={16} strokeWidth={2} style={{ marginInlineEnd: 6 }} />
            طراحی فروشگاه
          </h2>
          <span>
            {SHOP_DESIGN_LINKS.length.toLocaleString('fa-IR')} زیرمجموعه
          </span>
        </div>
        <p className={styles.dashLead}>
          همهٔ تنظیمات ظاهری فروشگاه، صفحه محصول و سفارش/سبد در یک بسته.
        </p>
        <div className={`${styles.dashTiles} ${styles.dashTilesCols3}`}>
          {SHOP_DESIGN_LINKS.map((item) => {
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
