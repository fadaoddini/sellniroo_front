'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartOptional } from '@/contexts/CartContext'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './CartFab.module.css'

function CartFabInner() {
  const cart = useCartOptional()
  const count = cart?.itemsCount || 0
  if (!count) return null

  return (
    <Link href="/cart" className={styles.fab} aria-label="سبد خرید">
      <ShoppingCart size={20} />
      <span className={styles.badge}>{count.toLocaleString('fa-IR')}</span>
      {cart?.subtotal ? (
        <span className={styles.total}>
          {(cart.subtotal || 0).toLocaleString('fa-IR')}
        </span>
      ) : null}
    </Link>
  )
}

/** فقط وقتی ماژول فروشگاه روشن است */
export default function CartFab() {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SHOP} fallback={null}>
      <CartFabInner />
    </ModuleGate>
  )
}
