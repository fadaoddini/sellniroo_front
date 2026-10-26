'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Loader2,
  MapPin,
  Package,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  Wallet,
} from 'lucide-react'
import orderApi from '@/services/orderApi'
import AddressForm from '@/components/Shop/AddressForm'
import { useAuth } from '@/contexts/AuthContext'
import styles from '../styles/ShopProfilePanel.module.css'

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

function formatDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

const REVIEW_FA = {
  awaiting_receipt: 'در انتظار رسید',
  under_review: 'در حال بررسی رسید',
  approved: 'رسید تأیید شد',
  rejected: 'رسید رد شد',
}

const MODE_FA = {
  gateway: 'درگاه آنلاین',
  manual: 'واریز دستی',
  wallet: 'کیف پول',
}

const FULFILL_FA = {
  pending: 'در انتظار پردازش',
  getorder: 'دریافت سفارش',
  preparing: 'آماده‌سازی',
  picked_up: 'تحویل به پیک',
  on_the_way: 'در مسیر',
  delivered: 'تحویل شده',
  finished: 'پایان',
  archived: 'آرشیو',
}

function isOrderPaid(o) {
  if (o?.is_paid === true) return true
  if (o?.status === 'paid') return true
  if (o?.payment_mode === 'wallet' && Number(o?.payable_amount || 0) === 0) {
    return true
  }
  if (Number(o?.wallet_amount || 0) > 0 && Number(o?.payable_amount || 0) === 0) {
    return true
  }
  return false
}

function paymentLabel(o) {
  if (o?.status_label) return o.status_label
  if (isOrderPaid(o)) {
    return o?.payment_mode === 'wallet' ? 'پرداخت‌شده (کیف پول)' : 'پرداخت‌شده'
  }
  return 'پرداخت‌نشده'
}

export default function ShopProfilePanel() {
  const { user } = useAuth()
  const [section, setSection] = useState('orders')
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [o, a] = await Promise.all([
        orderApi.listOrders().catch(() => []),
        orderApi.listAddresses().catch(() => []),
      ])
      setOrders(Array.isArray(o) ? o : [])
      setAddresses(Array.isArray(a) ? a : [])
    } catch (e) {
      setError(e.message || 'خطا در بارگذاری')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveAddr = async (payload) => {
    setBusy(true)
    setError('')
    try {
      const created = await orderApi.createAddress(payload)
      setAddresses((prev) => [created, ...prev])
      setShowForm(false)
    } catch (e) {
      setError(e.message || 'ثبت آدرس ناموفق')
      throw e
    } finally {
      setBusy(false)
    }
  }

  const removeAddr = async (id) => {
    if (!window.confirm('این آدرس حذف شود؟')) return
    try {
      await orderApi.deleteAddress(id)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch (e) {
      setError(e.message || 'حذف ناموفق')
    }
  }

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className={styles.spin} size={22} />
        <span>در حال بارگذاری…</span>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.toolbar}>
        <div className={styles.seg} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={section === 'orders'}
            className={section === 'orders' ? styles.segOn : ''}
            onClick={() => setSection('orders')}
          >
            <Package size={15} strokeWidth={2} />
            سفارش‌ها
            {orders.length ? (
              <span className={styles.segCount}>{orders.length}</span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={section === 'addresses'}
            className={section === 'addresses' ? styles.segOn : ''}
            onClick={() => setSection('addresses')}
          >
            <MapPin size={15} strokeWidth={2} />
            آدرس‌ها
            {addresses.length ? (
              <span className={styles.segCount}>{addresses.length}</span>
            ) : null}
          </button>
        </div>
        <div className={styles.toolbarLinks}>
          <Link href="/shop-panel" className={styles.ownerLink}>
            <Store size={15} strokeWidth={2} />
            پنل صاحب فروشگاه
          </Link>
          <Link href="/cart" className={styles.cartLink}>
            <ShoppingBag size={15} strokeWidth={2} />
            سبد خرید
          </Link>
        </div>
      </header>

      {error ? <p className={styles.err}>{error}</p> : null}

      {section === 'orders' ? (
        !orders.length ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden>
              <Package size={28} strokeWidth={1.5} />
            </span>
            <p>هنوز سفارشی ثبت نکرده‌اید.</p>
            <Link href="/shop" className={styles.emptyCta}>
              رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          <ul className={styles.list}>
            {orders.map((o, idx) => {
              const paid = isOrderPaid(o)
              const mode =
                o.payment_mode_label ||
                MODE_FA[o.payment_mode] ||
                o.payment_mode ||
                ''
              const fulfill =
                FULFILL_FA[o.fulfillment_status] ||
                FULFILL_FA[o.tracking?.status] ||
                ''
              const review =
                o.payment_review_status && REVIEW_FA[o.payment_review_status]
                  ? REVIEW_FA[o.payment_review_status]
                  : ''
              const itemCount = (o.items || []).reduce(
                (s, it) => s + (Number(it.quantity) || 0),
                0,
              )
              return (
                <li
                  key={o.id}
                  className={`${styles.card} ${paid ? styles.cardPaid : styles.cardUnpaid}`}
                  style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                >
                  <div className={styles.cardAccent} aria-hidden />
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardTitleBlock}>
                        <span className={styles.orderId}>سفارش #{o.id}</span>
                        <span className={styles.shopName}>
                          {o.shop_title || 'فروشگاه'}
                        </span>
                      </div>
                      <span
                        className={`${styles.badge} ${
                          paid ? styles.badgePaid : styles.badgeUnpaid
                        }`}
                      >
                        {paymentLabel(o)}
                      </span>
                    </div>

                    <div className={styles.priceRow}>
                      <strong className={styles.price}>
                        {formatPrice(o.final_price)}
                        <small> تومان</small>
                      </strong>
                      {formatDate(o.created_at) ? (
                        <time className={styles.date} dateTime={o.created_at}>
                          {formatDate(o.created_at)}
                        </time>
                      ) : null}
                    </div>

                    <div className={styles.chips}>
                      {mode ? (
                        <span
                          className={`${styles.chip} ${
                            o.payment_mode === 'wallet' ? styles.chipWallet : ''
                          }`}
                        >
                          {o.payment_mode === 'wallet' ? (
                            <Wallet size={12} strokeWidth={2.25} />
                          ) : null}
                          {mode}
                        </span>
                      ) : null}
                      {o.pickup_from_shop ? (
                        <span className={styles.chip}>حضوری</span>
                      ) : (
                        <span className={styles.chip}>ارسال</span>
                      )}
                      {itemCount > 0 ? (
                        <span className={styles.chip}>
                          {itemCount.toLocaleString('fa-IR')} قلم
                        </span>
                      ) : null}
                      {fulfill ? (
                        <span className={`${styles.chip} ${styles.chipMuted}`}>
                          {fulfill}
                        </span>
                      ) : null}
                      {review ? (
                        <span className={`${styles.chip} ${styles.chipWarn}`}>
                          {review}
                        </span>
                      ) : null}
                    </div>

                    {Number(o.wallet_amount) > 0 ||
                    (Number(o.payable_amount) > 0 && !paid) ? (
                      <div className={styles.splitRow}>
                        {Number(o.wallet_amount) > 0 ? (
                          <span>
                            کیف پول:{' '}
                            <strong>
                              {formatPrice(o.wallet_amount)} تومان
                            </strong>
                          </span>
                        ) : null}
                        {Number(o.payable_amount) > 0 && !paid ? (
                          <span>
                            باقیمانده:{' '}
                            <strong>
                              {formatPrice(o.payable_amount)} تومان
                            </strong>
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {o.items?.length ? (
                      <ul className={styles.items}>
                        {o.items.map((it) => (
                          <li key={it.id}>
                            <span className={styles.itemName}>
                              {it.product_name}
                            </span>
                            <span className={styles.itemQty}>
                              ×{(it.quantity || 0).toLocaleString('fa-IR')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )
      ) : null}

      {section === 'addresses' ? (
        <>
          {!addresses.length && !showForm ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden>
                <MapPin size={28} strokeWidth={1.5} />
              </span>
              <p>آدرسی ذخیره نشده است.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {addresses.map((a, idx) => (
                <li
                  key={a.id}
                  className={styles.card}
                  style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                >
                  <div className={styles.cardAccent} aria-hidden />
                  <div className={styles.cardBody}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardTitleBlock}>
                        <span className={styles.orderId}>
                          {a.name} {a.family}
                        </span>
                        {a.mobile ? (
                          <span className={styles.shopName} dir="ltr">
                            {a.mobile}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className={styles.iconBtn}
                        aria-label="حذف آدرس"
                        onClick={() => removeAddr(a.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <p className={styles.addrText}>
                      {a.address}
                      {a.description ? (
                        <span className={styles.addrDesc}>
                          {' '}
                          · {a.description}
                        </span>
                      ) : null}
                    </p>
                    <div className={styles.chips}>
                      {a.latitude != null ? (
                        <span className={`${styles.chip} ${styles.chipOk}`}>
                          موقعیت نقشه
                        </span>
                      ) : (
                        <span className={`${styles.chip} ${styles.chipWarn}`}>
                          بدون مختصات
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!showForm ? (
            <button
              type="button"
              className={styles.addBtn}
              onClick={() => setShowForm(true)}
            >
              <Plus size={16} strokeWidth={2.25} />
              آدرس جدید روی نقشه
            </button>
          ) : (
            <div className={styles.formShell}>
              <AddressForm
                user={user}
                busy={busy}
                onCancel={() => setShowForm(false)}
                onSubmit={saveAddr}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
