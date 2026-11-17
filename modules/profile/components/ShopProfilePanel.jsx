'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
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

export default function ShopProfilePanel({
  /** اگر ست شود، سگمنت داخلی مخفی و همین بخش نشان داده می‌شود */
  section: controlledSection,
  showOwnerLinks = true,
}) {
  const { user } = useAuth()
  const [section, setSection] = useState(controlledSection || 'orders')
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [openOrderId, setOpenOrderId] = useState(null)
  const controlled = Boolean(controlledSection)

  useEffect(() => {
    if (controlledSection) setSection(controlledSection)
  }, [controlledSection])

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
      {!controlled || showOwnerLinks ? (
        <header className={styles.toolbar}>
          {!controlled ? (
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
          ) : (
            <div className={styles.seg} />
          )}
          {showOwnerLinks ? (
            <div className={styles.toolbarLinks}>
              <Link href="/dashboard/my-shop" className={styles.ownerLink}>
                <Store size={15} strokeWidth={2} />
                فروشگاه من
              </Link>
              <Link href="/cart" className={styles.cartLink}>
                <ShoppingBag size={15} strokeWidth={2} />
                سبد خرید
              </Link>
            </div>
          ) : null}
        </header>
      ) : null}

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
          <ul className={styles.orderList}>
            {orders.map((o, idx) => {
              const paid = isOrderPaid(o)
              const open = openOrderId === o.id
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
              const panelId = `shop-order-panel-${o.id}`
              const triggerId = `shop-order-trigger-${o.id}`
              return (
                <li
                  key={o.id}
                  className={`${styles.orderRow} ${
                    paid ? styles.orderPaid : styles.orderUnpaid
                  } ${open ? styles.orderOpen : ''}`}
                  style={{ animationDelay: `${Math.min(idx, 8) * 35}ms` }}
                >
                  <button
                    type="button"
                    id={triggerId}
                    className={styles.orderTrigger}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() =>
                      setOpenOrderId((cur) => (cur === o.id ? null : o.id))
                    }
                  >
                    <span
                      className={styles.orderAccent}
                      aria-hidden
                    />
                    <span className={styles.orderMain}>
                      <span className={styles.orderTitleLine}>
                        <strong className={styles.orderId}>
                          سفارش #{o.id}
                        </strong>
                        <span className={styles.shopName}>
                          {o.shop_title || 'فروشگاه'}
                        </span>
                      </span>
                      <span className={styles.orderMetaLine}>
                        {formatDate(o.created_at) ? (
                          <time dateTime={o.created_at}>
                            {formatDate(o.created_at)}
                          </time>
                        ) : null}
                        {itemCount > 0 ? (
                          <span>
                            {itemCount.toLocaleString('fa-IR')} قلم
                          </span>
                        ) : null}
                        {fulfill ? <span>{fulfill}</span> : null}
                      </span>
                    </span>
                    <span className={styles.orderSide}>
                      <strong className={styles.price}>
                        {formatPrice(o.final_price)}
                        <small> ت</small>
                      </strong>
                      <span
                        className={`${styles.badge} ${
                          paid ? styles.badgePaid : styles.badgeUnpaid
                        }`}
                      >
                        {paymentLabel(o)}
                      </span>
                    </span>
                    <ChevronDown
                      className={`${styles.chevron} ${
                        open ? styles.chevronOpen : ''
                      }`}
                      size={18}
                      strokeWidth={2.2}
                      aria-hidden
                    />
                  </button>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={triggerId}
                    aria-hidden={!open}
                    className={`${styles.orderPanel} ${
                      open ? styles.orderPanelOpen : ''
                    }`}
                  >
                    <div className={styles.orderPanelInner}>
                      <div className={styles.orderDetailGrid}>
                        <div className={styles.orderInfoCol}>
                          <div className={styles.chips}>
                            {mode ? (
                              <span
                                className={`${styles.chip} ${
                                  o.payment_mode === 'wallet'
                                    ? styles.chipWallet
                                    : ''
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
                              <span
                                className={`${styles.chip} ${styles.chipMuted}`}
                              >
                                {fulfill}
                              </span>
                            ) : null}
                            {review ? (
                              <span
                                className={`${styles.chip} ${styles.chipWarn}`}
                              >
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

                          <div className={styles.detailFooter}>
                            <span>
                              مبلغ کل:{' '}
                              <strong>
                                {formatPrice(o.final_price)} تومان
                              </strong>
                            </span>
                            {formatDate(o.created_at) ? (
                              <time dateTime={o.created_at}>
                                {formatDate(o.created_at)}
                              </time>
                            ) : null}
                          </div>
                        </div>

                        <aside className={styles.invoiceCol} aria-label="فاکتور">
                          <div className={styles.invoiceHead}>
                            <span>فاکتور</span>
                            <strong>#{o.id}</strong>
                          </div>
                          {o.items?.length ? (
                            <table className={styles.invoiceTable}>
                              <thead>
                                <tr>
                                  <th scope="col">کالا</th>
                                  <th scope="col">تعداد</th>
                                  <th scope="col">فی</th>
                                  <th scope="col">مبلغ</th>
                                </tr>
                              </thead>
                              <tbody>
                                {o.items.map((it) => {
                                  const unit = Number(
                                    it.unit_price ?? it.price ?? 0,
                                  )
                                  const qty = Number(it.quantity) || 0
                                  const line = unit * qty
                                  return (
                                    <tr key={it.id}>
                                      <td className={styles.invName}>
                                        {it.product_name}
                                      </td>
                                      <td className={styles.invNum}>
                                        {qty.toLocaleString('fa-IR')}
                                      </td>
                                      <td className={styles.invNum}>
                                        {formatPrice(unit)}
                                      </td>
                                      <td className={styles.invNum}>
                                        {formatPrice(line)}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot>
                                <tr>
                                  <td colSpan={3}>جمع</td>
                                  <td className={styles.invNum}>
                                    {formatPrice(o.final_price)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          ) : (
                            <p className={styles.noItems}>
                              جزئیات اقلام در دسترس نیست.
                            </p>
                          )}
                        </aside>
                      </div>
                    </div>
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
            <ul className={styles.addrList}>
              {addresses.map((a, idx) => (
                <li
                  key={a.id}
                  className={styles.addrRow}
                  style={{ animationDelay: `${Math.min(idx, 8) * 35}ms` }}
                >
                  <span className={styles.addrAccent} aria-hidden />
                  <span className={styles.addrIcon} aria-hidden>
                    <MapPin size={14} strokeWidth={2.1} />
                  </span>
                  <div className={styles.addrMain}>
                    <span className={styles.addrName}>
                      {[a.name, a.family].filter(Boolean).join(' ') || 'آدرس'}
                    </span>
                    {a.mobile ? (
                      <span className={styles.addrMobile} dir="ltr">
                        {a.mobile}
                      </span>
                    ) : null}
                    <span className={styles.addrLine} title={a.address || ''}>
                      {a.address || '—'}
                      {a.description ? (
                        <em className={styles.addrDesc}> · {a.description}</em>
                      ) : null}
                    </span>
                  </div>
                  <span
                    className={`${styles.addrBadge} ${
                      a.latitude != null ? styles.addrBadgeOk : styles.addrBadgeWarn
                    }`}
                  >
                    {a.latitude != null ? 'نقشه' : 'بدون نقشه'}
                  </span>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    aria-label="حذف آدرس"
                    onClick={() => removeAddr(a.id)}
                  >
                    <Trash2 size={14} />
                  </button>
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
