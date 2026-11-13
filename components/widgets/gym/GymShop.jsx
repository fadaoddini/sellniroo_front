'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, ShoppingCart } from 'lucide-react'
import {
  DEFAULT_GYM_SHOP,
  normalizeGymSettings,
} from '@/config/gymWidgetSettings'
import { useCartOptional } from '@/contexts/CartContext'
import gymShopService from './gymShopService'
import styles from './GymShop.module.css'

function formatPrice(n) {
  return `${(Number(n) || 0).toLocaleString('fa-IR')} تومان`
}

function toCartProduct(p) {
  if (!p?.id) return null
  return {
    id: p.id,
    title: p.title,
    shop: p.shop,
    shop_id: p.shop,
    shop_title: p.shop_title,
    price_one: p.price_one,
    final_price: p.final_price,
    discount: p.discount,
    image: p.image,
    stock_remaining: p.stock_remaining,
    price_tiers: p.price_tiers || [],
    number_min: 1,
    number_max: Math.max(1, Number(p.stock_remaining) || 99),
  }
}

export default function GymShop({ settings: raw = {} }) {
  const s = normalizeGymSettings(raw, DEFAULT_GYM_SHOP)
  const cart = useCartOptional()
  const [products, setProducts] = useState([])
  const [shopMeta, setShopMeta] = useState({ shop_id: null, shop_title: '' })
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    gymShopService.listProducts().then((res) => {
      if (cancelled) return
      setProducts(res.data?.products || [])
      setShopMeta({
        shop_id: res.data?.shop_id || null,
        shop_title: res.data?.shop_title || '',
      })
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const categories = useMemo(() => {
    const map = new Map()
    products.forEach((p) => {
      const key = p.category_title || 'سایر'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).map(([title, count]) => ({ title, count }))
  }, [products])

  const visible = useMemo(() => {
    if (filter === 'all') return products
    return products.filter((p) => (p.category_title || 'سایر') === filter)
  }, [products, filter])

  const flash = useCallback((msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }, [])

  const onAdd = useCallback(
    async (product) => {
      if (!cart?.delta) {
        flash('سبد خرید در دسترس نیست')
        return
      }
      const payload = toCartProduct(product)
      if (!payload) return
      const stock = Number(product.stock_remaining)
      if (Number.isFinite(stock) && stock <= 0) {
        flash('ناموجود')
        return
      }
      setBusyId(product.id)
      try {
        await cart.delta(payload, 1, { replaceShop: true })
        flash('به سبد اضافه شد')
      } catch (e) {
        flash(e?.data?.error || e?.message || 'خطا در افزودن به سبد')
      } finally {
        setBusyId(null)
      }
    },
    [cart, flash],
  )

  const onDelta = useCallback(
    async (product, step) => {
      if (!cart?.delta) return
      const payload = toCartProduct(product)
      if (!payload) return
      setBusyId(product.id)
      try {
        await cart.delta(payload, step, { replaceShop: true })
      } catch (e) {
        flash(e?.data?.error || e?.message || 'خطا')
      } finally {
        setBusyId(null)
      }
    },
    [cart, flash],
  )

  return (
    <section
      id="gym-shop"
      className={styles.section}
      dir="rtl"
      lang="fa"
      data-gym-shop="1"
    >
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>{s.eyebrow}</p>
          <h2>{s.title}</h2>
          <p className={styles.subtitle}>{s.subtitle}</p>
          {shopMeta.shop_title ? (
            <p className={styles.shopLine}>{shopMeta.shop_title}</p>
          ) : null}
        </header>

        <div className={styles.toolbar}>
          <div className={styles.filters} role="tablist" aria-label="دسته محصول">
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === 'all' ? styles.filterOn : ''}`}
              onClick={() => setFilter('all')}
            >
              همه <em>{products.length}</em>
            </button>
            {categories.map((c) => (
              <button
                key={c.title}
                type="button"
                className={`${styles.filterBtn} ${filter === c.title ? styles.filterOn : ''}`}
                onClick={() => setFilter(c.title)}
              >
                {c.title} <em>{c.count}</em>
              </button>
            ))}
          </div>
          <Link href="/cart" className={styles.cartLink}>
            <ShoppingCart size={15} aria-hidden />
            سبد خرید
            {cart?.itemsCount ? <em>{cart.itemsCount}</em> : null}
          </Link>
        </div>

        {loading ? (
          <div className={styles.state}>در حال بارگذاری فروشگاه…</div>
        ) : !visible.length ? (
          <div className={styles.state}>
            هنوز محصولی ثبت نشده. از داشبورد باشگاه → فروشگاه محصول اضافه کنید.
          </div>
        ) : (
          <div className={styles.grid}>
            {visible.map((p) => {
              const qty = cart?.getQty?.(p.id) || 0
              const busy = busyId === p.id || cart?.busyProductId === p.id
              const stock = Number(p.stock_remaining)
              const out = Number.isFinite(stock) && stock <= 0
              return (
                <article key={p.id} className={styles.card}>
                  <div className={styles.media}>
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} />
                    ) : (
                      <span className={styles.mediaFallback} aria-hidden>
                        <ShoppingBag size={28} />
                      </span>
                    )}
                    {p.category_title ? (
                      <span className={styles.cat}>{p.category_title}</span>
                    ) : null}
                  </div>
                  <div className={styles.body}>
                    <h3>{p.title}</h3>
                    {p.lid ? <p className={styles.lid}>{p.lid}</p> : null}
                    <div className={styles.priceRow}>
                      <strong>{formatPrice(p.final_price ?? p.price_one)}</strong>
                      {Number(p.discount) > 0 ? (
                        <span className={styles.discount}>{p.discount}٪</span>
                      ) : null}
                    </div>
                    <div className={styles.stock}>
                      {out
                        ? 'ناموجود'
                        : Number.isFinite(stock)
                          ? `${stock.toLocaleString('fa-IR')} عدد`
                          : 'موجود'}
                    </div>

                    {qty > 0 ? (
                      <div className={styles.qtyRow}>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          disabled={busy}
                          onClick={() => onDelta(p, -1)}
                          aria-label="کم کردن"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{qty.toLocaleString('fa-IR')}</span>
                        <button
                          type="button"
                          className={styles.qtyBtn}
                          disabled={busy || out}
                          onClick={() => onDelta(p, 1)}
                          aria-label="افزودن"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className={styles.addBtn}
                        disabled={busy || out}
                        onClick={() => onAdd(p)}
                      >
                        <ShoppingCart size={14} aria-hidden />
                        {out ? 'ناموجود' : 'افزودن به سبد'}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {toast ? <div className={styles.toast}>{toast}</div> : null}
      </div>
    </section>
  )
}
