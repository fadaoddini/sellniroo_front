'use client'

import { useEffect, useMemo, useState, memo } from 'react'
import Link from 'next/link'
import { Boxes, ShoppingCart } from 'lucide-react'
import { useCartOptional } from '@/contexts/CartContext'
import { resolveCartMode } from '@/services/cartMode'
import {
  buildReboOrderNextPath,
  readReboPackageCart,
} from '@/utils/reboPackageCart'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import styles from './BreakingNews.module.css'

/**
 * آیکن سبد در نوار خبر فوری — استایل از تنظیمات ویجت
 */
function NavCartIcon({ settings = null } = {}) {
  const shopCart = useCartOptional()
  const [mode, setMode] = useState(null)
  const [reboCart, setReboCart] = useState(() => readReboPackageCart())

  const showCart = settings?.show_cart !== false
  const showEmpty = settings?.cart_show_empty !== false
  const showBadge = settings?.cart_show_badge !== false
  const iconSize = Math.max(12, Number(settings?.cart_icon_size) || 16)
  const Icon = resolveLucideIcon(
    settings?.cart_icon || 'ShoppingCart',
    mode === 'rebo' ? Boxes : ShoppingCart,
  )
  const customHref = String(settings?.cart_href || '').trim()

  useEffect(() => {
    if (!showCart) return undefined
    let cancelled = false
    const refresh = () => {
      resolveCartMode({ force: true }).then((next) => {
        if (!cancelled) setMode(next || 'none')
      })
    }
    refresh()
    window.addEventListener('site-modules-changed', refresh)
    window.addEventListener('checkout-pipelines-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', refresh)
      window.removeEventListener('checkout-pipelines-changed', refresh)
    }
  }, [showCart])

  useEffect(() => {
    if (!showCart || mode !== 'rebo') return undefined
    const refresh = () => setReboCart(readReboPackageCart())
    refresh()
    window.addEventListener('rebo-package-cart-changed', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('rebo-package-cart-changed', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [mode, showCart])

  const shopCount = shopCart?.itemsCount || 0
  const reboCount = useMemo(
    () => (reboCart.packages?.length || 0) + (reboCart.items?.length || 0),
    [reboCart],
  )

  if (!showCart) return null
  if (mode == null || mode === 'none') return null

  const count = mode === 'rebo' ? reboCount : shopCount
  if (!showEmpty && count <= 0) return null

  const href =
    customHref ||
    (mode === 'rebo' ? buildReboOrderNextPath() : '/cart')

  const labelBase = mode === 'rebo' ? 'سبد بسته‌ها' : 'سبد خرید'
  const aria =
    count > 0
      ? `${labelBase}، ${count.toLocaleString('fa-IR')} مورد`
      : labelBase

  return (
    <Link href={href} className={styles.cartBtn} aria-label={aria}>
      <Icon size={iconSize} strokeWidth={2.1} aria-hidden />
      {showBadge && count > 0 ? (
        <span className={styles.cartBadge}>
          {count > 99 ? '۹۹+' : count.toLocaleString('fa-IR')}
        </span>
      ) : null}
    </Link>
  )
}

export default memo(NavCartIcon)
