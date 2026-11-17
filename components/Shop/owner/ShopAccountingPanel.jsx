'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowUpLeft,
  BarChart3,
  BookOpen,
  LayoutDashboard,
  Loader2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Receipt,
  RefreshCw,
  Store,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import { formatPersianDate, toPersianDate } from '@/utils/dateUtils'
import { useAuth } from '@/contexts/AuthContext'
import shopOwnerApi from '@/services/shopOwnerApi'
import aw from '@/app/(admin)/adminweb/AdminWeb.module.css'
import portal from '@/components/Admin/OwnerPortal.module.css'
import styles from './ShopAccounting.module.css'

function toJalaliLabel(iso) {
  if (!iso) return '—'
  const dateOnly = String(iso).slice(0, 10)
  const p = toPersianDate(dateOnly)
  return formatPersianDate(p, 'numeric') || dateOnly
}

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

function isoDaysAgo(days) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}

function isoToday() {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  return d.toISOString().slice(0, 10)
}

/** فقط حسابداری — مدیریت محصول/دسته/سینگل جای دیگری است */
const VIEW_TABS = [
  { id: 'overview', label: 'خلاصه و سود', icon: BarChart3 },
  { id: 'sales', label: 'فروش‌ها', icon: Receipt },
  { id: 'products', label: 'گزارش کالا', icon: TrendingUp },
  { id: 'expenses', label: 'هزینه‌ها', icon: Wallet },
  { id: 'ledger', label: 'دفتر روزنامه', icon: BookOpen },
]

const SIDE_LINKS = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/dashboard/my-shop', label: 'فروشگاه من', icon: Store },
  { href: '/shop', label: 'ویترین', icon: Store },
]

const emptyExpense = {
  title: '',
  amount: '',
  category: 'other',
  expense_date: isoToday(),
  note: '',
}

export default function ShopAccountingPanel({ embedded = false } = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const [from, setFrom] = useState(() => isoDaysAgo(29))
  const [to, setTo] = useState(() => isoToday())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const viewFromUrl = searchParams?.get('view') || ''
  const [view, setView] = useState(() =>
    VIEW_TABS.some((t) => t.id === viewFromUrl) ? viewFromUrl : 'overview',
  )
  const [expenseForm, setExpenseForm] = useState(emptyExpense)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(
        `/login?next=${encodeURIComponent('/dashboard/shop-accounting')}`,
      )
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (VIEW_TABS.some((t) => t.id === viewFromUrl) && viewFromUrl !== view) {
      setView(viewFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewFromUrl])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await shopOwnerApi.accounting({ from, to })
      setData(res)
    } catch (e) {
      setData(null)
      setError(e?.message || 'بارگذاری حسابداری ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    if (isAuthenticated && !authLoading) load()
  }, [load, isAuthenticated, authLoading])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 2800)
  }

  const summary = data?.summary || {}
  const pnl = data?.pnl || {}
  const categories = data?.expense_categories || []

  const maxDaily = useMemo(() => {
    const rows = data?.daily || []
    return Math.max(1, ...rows.map((r) => Math.max(r.sales || 0, r.expenses || 0)))
  }, [data?.daily])

  const pageTitle =
    VIEW_TABS.find((t) => t.id === view)?.label || 'حسابداری فروشگاه'

  const submitExpense = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await shopOwnerApi.createExpense({
        title: expenseForm.title.trim(),
        amount: Number(expenseForm.amount) || 0,
        category: expenseForm.category,
        expense_date: expenseForm.expense_date,
        note: expenseForm.note.trim(),
      })
      flash('هزینه ثبت شد')
      setExpenseForm({
        ...emptyExpense,
        expense_date: expenseForm.expense_date || isoToday(),
      })
      setShowExpenseForm(false)
      await load()
    } catch (err) {
      setError(err?.message || 'ثبت هزینه ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const removeExpense = async (id) => {
    if (!window.confirm('این هزینه حذف شود؟')) return
    setBusy(true)
    try {
      await shopOwnerApi.deleteExpense(id)
      flash('هزینه حذف شد')
      await load()
    } catch (err) {
      setError(err?.message || 'حذف ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const presets = [
    { id: '7', label: '۷ روز', days: 6 },
    { id: '30', label: '۳۰ روز', days: 29 },
    { id: '90', label: '۹۰ روز', days: 89 },
  ]

  const selectView = (id) => {
    if (!VIEW_TABS.some((t) => t.id === id)) return
    setView(id)
    setSidebarOpen(false)
    if (!embedded && typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('view', id)
      window.history.replaceState({}, '', url.toString())
    }
  }

  const periodBar = (
    <div className={styles.periodBar}>
      <div className={styles.presets}>
        {presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={
              from === isoDaysAgo(p.days) && to === isoToday()
                ? styles.presetOn
                : ''
            }
            onClick={() => {
              setFrom(isoDaysAgo(p.days))
              setTo(isoToday())
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className={styles.dateFields}>
        <label>
          از
          <PersianDatePicker value={from} onChange={(d) => setFrom(d || from)} />
        </label>
        <label>
          تا
          <PersianDatePicker value={to} onChange={(d) => setTo(d || to)} />
        </label>
      </div>
      <button
        type="button"
        className={styles.refreshBtn}
        onClick={load}
        disabled={loading}
        aria-label="بروزرسانی"
      >
        {loading ? (
          <Loader2 size={16} className={styles.spin} />
        ) : (
          <RefreshCw size={16} />
        )}
      </button>
    </div>
  )

  const content = (
    <div className={`${styles.accRoot} ${embedded ? styles.embedded : ''}`}>
      {msg ? <div className={styles.toast}>{msg}</div> : null}
      {error ? <div className={styles.err}>{error}</div> : null}

      {embedded ? (
        <nav className={portal.pageNav} aria-label="بخش‌های حسابداری">
          {VIEW_TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                className={`${portal.pageNavItem} ${
                  view === t.id ? portal.pageNavItemOn : ''
                }`}
                onClick={() => selectView(t.id)}
              >
                <Icon size={15} strokeWidth={2} />
                {t.label}
              </button>
            )
          })}
        </nav>
      ) : null}

      {periodBar}

      {loading && !data ? (
        <div className={styles.stateBox}>
          <Loader2 className={styles.spin} size={28} />
          <p>در حال آماده‌سازی دفتر حسابداری…</p>
        </div>
      ) : null}

      {data && view === 'overview' ? (
        <>
          <div className={aw.dashTopRow}>
            <div className={aw.statsStrip}>
              <div className={`${aw.statCard} ${aw.statForest}`}>
                <span className={aw.statValue}>
                  {formatPrice(summary.net_sales)}
                </span>
                <span className={aw.statLabel}>فروش خالص (تومان)</span>
                <span className={styles.statHint}>
                  {(summary.orders_paid || 0).toLocaleString('fa-IR')} سفارش
                  پرداخت‌شده
                </span>
              </div>
              <div className={`${aw.statCard} ${aw.statOlive}`}>
                <span className={aw.statValue}>
                  {formatPrice(summary.gross_profit)}
                </span>
                <span className={aw.statLabel}>سود ناخالص</span>
                <span className={styles.statHint}>
                  حاشیه {(summary.margin_pct || 0).toLocaleString('fa-IR')}٪
                </span>
              </div>
              <div className={`${aw.statCard} ${aw.statSand}`}>
                <span className={aw.statValue}>
                  {formatPrice(summary.net_profit)}
                </span>
                <span className={aw.statLabel}>سود خالص</span>
                <span className={styles.statHint}>پس از هزینه‌ها</span>
              </div>
              <div className={`${aw.statCard} ${aw.statCream}`}>
                <span className={aw.statValue}>
                  {formatPrice(summary.receivables)}
                </span>
                <span className={aw.statLabel}>مطالبات</span>
                <span className={styles.statHint}>
                  {(summary.orders_unpaid || 0).toLocaleString('fa-IR')} سفارش
                  پرداخت‌نشده
                </span>
              </div>
            </div>

            <div className={aw.dashChartsCol}>
              <section
                className={`${portal.chartCard} ${aw.dashChartForest} ${styles.pnlDark}`}
              >
                <div className={portal.chartHead}>
                  <div>
                    <h3 className={portal.chartTitle}>صورت سود و زیان</h3>
                    <p className={portal.chartSub}>
                      {toJalaliLabel(data.period?.from)} تا{' '}
                      {toJalaliLabel(data.period?.to)}
                    </p>
                  </div>
                </div>
                <ul className={styles.pnlList}>
                  <li>
                    <span>درآمد فروش</span>
                    <strong>{formatPrice(pnl.revenue)}</strong>
                  </li>
                  <li className={styles.pnlSub}>
                    <span>بهای تمام‌شده (COGS)</span>
                    <strong>-{formatPrice(pnl.cogs)}</strong>
                  </li>
                  <li className={styles.pnlTotal}>
                    <span>سود ناخالص</span>
                    <strong>{formatPrice(pnl.gross_profit)}</strong>
                  </li>
                  <li className={styles.pnlSub}>
                    <span>هزینه‌های عملیاتی</span>
                    <strong>-{formatPrice(pnl.operating_expenses)}</strong>
                  </li>
                  <li className={styles.pnlNet}>
                    <span>سود / زیان خالص</span>
                    <strong>{formatPrice(pnl.net_profit)}</strong>
                  </li>
                </ul>
              </section>

              <section className={styles.panel}>
                <h2>جزئیات درآمد</h2>
                <ul className={styles.metaList}>
                  <li>
                    <span>فروش ناخالص</span>
                    <strong>{formatPrice(summary.gross_sales)}</strong>
                  </li>
                  <li>
                    <span>تخفیف‌ها</span>
                    <strong>{formatPrice(summary.discounts)}</strong>
                  </li>
                  <li>
                    <span>ارسال دریافتی</span>
                    <strong>{formatPrice(summary.shipping)}</strong>
                  </li>
                  <li>
                    <span>مالیات</span>
                    <strong>{formatPrice(summary.tax)}</strong>
                  </li>
                  <li>
                    <span>کیف پول</span>
                    <strong>{formatPrice(summary.wallet_used)}</strong>
                  </li>
                </ul>
                <h3 className={styles.subHead}>روش پرداخت</h3>
                {!data.by_payment_mode?.length ? (
                  <p className={styles.emptyInline}>فروش پرداخت‌شده‌ای نیست.</p>
                ) : (
                  <ul className={styles.metaList}>
                    {data.by_payment_mode.map((m) => (
                      <li key={m.mode}>
                        <span>
                          {m.mode_label} ·{' '}
                          {(m.count || 0).toLocaleString('fa-IR')}
                        </span>
                        <strong>{formatPrice(m.amount)}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>

          <div className={styles.panel}>
            <h2>روند روزانه</h2>
            {!data.daily?.length ? (
              <div className={styles.empty}>داده‌ای برای نمودار نیست.</div>
            ) : (
              <div className={styles.bars}>
                {data.daily.map((d) => (
                  <div
                    key={d.date}
                    className={styles.barCol}
                    title={toJalaliLabel(d.date)}
                  >
                    <div className={styles.barStack}>
                      <div
                        className={styles.barSales}
                        style={{ height: `${(d.sales / maxDaily) * 100}%` }}
                      />
                      <div
                        className={styles.barExp}
                        style={{ height: `${(d.expenses / maxDaily) * 100}%` }}
                      />
                    </div>
                    <span>
                      {toJalaliLabel(d.date).split('/').slice(1).join('/')}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className={styles.legend}>
              <span>
                <i className={styles.dotSales} /> فروش
              </span>
              <span>
                <i className={styles.dotExp} /> هزینه
              </span>
            </div>
            <p className={styles.hint}>
              برای محاسبه بهای تمام‌شده، روی هر محصول «قیمت خرید» را در فروشگاه من
              وارد کنید.
            </p>
          </div>
        </>
      ) : null}

      {data && view === 'sales' ? (
        <>
          <div className={styles.panel}>
            <h2>فروش‌های پرداخت‌شده</h2>
            {!data.ledger?.filter((r) => r.type === 'sale').length ? (
              <div className={styles.empty}>فروشی در این بازه ثبت نشده.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>سفارش</th>
                      <th>تاریخ</th>
                      <th>مشتری</th>
                      <th>روش</th>
                      <th>مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.ledger
                      .filter((r) => r.type === 'sale')
                      .map((r) => (
                        <tr key={`sale-${r.id}`}>
                          <td>{r.ref}</td>
                          <td>{toJalaliLabel(r.date)}</td>
                          <td>{r.customer || '—'}</td>
                          <td>{r.payment_mode || '—'}</td>
                          <td className={styles.pos}>{formatPrice(r.credit)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {(data.unpaid_orders || []).length ? (
            <div className={styles.panel}>
              <h2>سفارش‌های پرداخت‌نشده (مطالبات)</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>سفارش</th>
                      <th>تاریخ</th>
                      <th>وضعیت رسید</th>
                      <th>مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.unpaid_orders.map((o) => (
                      <tr key={`u-${o.id}`}>
                        <td>#{o.id}</td>
                        <td>{toJalaliLabel(o.created_at)}</td>
                        <td>{o.payment_review_status || '—'}</td>
                        <td>{formatPrice(o.final_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </>
      ) : null}

      {data && view === 'products' ? (
        <div className={styles.panel}>
          <h2>چه فروختم؟ — گزارش کالا</h2>
          {!data.top_products?.length ? (
            <div className={styles.empty}>در این بازه کالایی فروخته نشده.</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>کالا</th>
                    <th>تعداد</th>
                    <th>فروش</th>
                    <th>بهای تمام‌شده</th>
                    <th>سود</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_products.map((p) => (
                    <tr key={p.product_id || p.title}>
                      <td>{p.title}</td>
                      <td>{(p.quantity || 0).toLocaleString('fa-IR')}</td>
                      <td>{formatPrice(p.revenue)}</td>
                      <td>{formatPrice(p.cogs)}</td>
                      <td className={p.profit >= 0 ? styles.pos : styles.neg}>
                        {formatPrice(p.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {data && view === 'expenses' ? (
        <>
          <div className={styles.panelHead}>
            <h2>هزینه‌های عملیاتی</h2>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setShowExpenseForm((v) => !v)}
            >
              <Plus size={15} />
              ثبت هزینه
            </button>
          </div>

          {showExpenseForm ? (
            <form className={styles.expenseForm} onSubmit={submitExpense}>
              <label>
                عنوان
                <input
                  required
                  value={expenseForm.title}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="مثلاً اجاره فروردین"
                />
              </label>
              <label>
                مبلغ (تومان)
                <input
                  required
                  type="number"
                  min="1"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, amount: e.target.value }))
                  }
                />
              </label>
              <label>
                دسته
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  {(categories.length
                    ? categories
                    : [{ id: 'other', label: 'سایر' }]
                  ).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                تاریخ
                <PersianDatePicker
                  value={expenseForm.expense_date}
                  onChange={(d) =>
                    setExpenseForm((f) => ({
                      ...f,
                      expense_date: d || f.expense_date,
                    }))
                  }
                />
              </label>
              <label className={styles.full}>
                توضیحات
                <input
                  value={expenseForm.note}
                  onChange={(e) =>
                    setExpenseForm((f) => ({ ...f, note: e.target.value }))
                  }
                />
              </label>
              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={busy}
                >
                  ذخیره
                </button>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => setShowExpenseForm(false)}
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : null}

          {(data.by_expense_category || []).length ? (
            <ul className={styles.catChips}>
              {data.by_expense_category.map((c) => (
                <li key={c.category}>
                  <span>{c.category_label}</span>
                  <strong>{formatPrice(c.amount)}</strong>
                </li>
              ))}
            </ul>
          ) : null}

          <div className={styles.panel}>
            {!data.expenses?.length ? (
              <div className={styles.empty}>هنوز هزینه‌ای در این بازه ثبت نشده.</div>
            ) : (
              <ul className={styles.expenseList}>
                {data.expenses.map((e) => (
                  <li key={e.id}>
                    <div>
                      <strong>{e.title}</strong>
                      <p>
                        {e.category_label} · {toJalaliLabel(e.expense_date)}
                        {e.note ? ` · ${e.note}` : ''}
                      </p>
                    </div>
                    <div className={styles.expenseSide}>
                      <strong className={styles.neg}>
                        {formatPrice(e.amount)}
                      </strong>
                      <button
                        type="button"
                        className={styles.iconDanger}
                        onClick={() => removeExpense(e.id)}
                        disabled={busy}
                        aria-label="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      ) : null}

      {data && view === 'ledger' ? (
        <div className={styles.panel}>
          <h2>دفتر روزنامه</h2>
          <p className={styles.hint}>
            ثبت ترکیبی فروش‌ها (بستانکار) و هزینه‌ها (بدهکار) به ترتیب تاریخ.
          </p>
          {!data.ledger?.length ? (
            <div className={styles.empty}>دفتر در این بازه خالی است.</div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>تاریخ</th>
                    <th>نوع</th>
                    <th>شرح</th>
                    <th>بدهکار</th>
                    <th>بستانکار</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ledger.map((r) => (
                    <tr key={`${r.type}-${r.id}`}>
                      <td>{toJalaliLabel(r.date)}</td>
                      <td>
                        <span
                          className={
                            r.type === 'sale' ? styles.badgeSale : styles.badgeExp
                          }
                        >
                          {r.type === 'sale' ? (
                            <TrendingUp size={12} />
                          ) : (
                            <TrendingDown size={12} />
                          )}
                          {r.type_label}
                        </span>
                      </td>
                      <td>
                        {r.ref}
                        {r.customer ? ` · ${r.customer}` : ''}
                        {r.category_label ? ` · ${r.category_label}` : ''}
                      </td>
                      <td className={styles.neg}>
                        {r.debit ? formatPrice(r.debit) : '—'}
                      </td>
                      <td className={styles.pos}>
                        {r.credit ? formatPrice(r.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )

  if (embedded) {
    if (authLoading || (!isAuthenticated && !authLoading)) {
      return (
        <div className={styles.stateBox}>
          <Loader2 className={styles.spin} size={24} />
        </div>
      )
    }
    return content
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className={portal.app} dir="rtl">
        <div className={styles.stateBox}>
          <Loader2 className={styles.spin} size={28} />
          <p>در حال بررسی دسترسی…</p>
        </div>
      </div>
    )
  }

  const shopTitle = data?.shop?.title || 'فروشگاه'
  const userLabel =
    user?.full_name ||
    user?.first_name ||
    user?.mobile ||
    'کاربر'

  return (
    <div className={portal.app} dir="rtl">
      <header className={portal.topBar}>
        <div className={portal.topBarInner}>
          <div className={portal.topBarStart}>
            <button
              type="button"
              className={portal.iconBtn}
              aria-label="منو"
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button
              type="button"
              className={`${portal.iconBtn} ${portal.collapseBtn}`}
              aria-label={
                sidebarCollapsed ? 'باز کردن سایدبار' : 'جمع کردن سایدبار'
              }
              onClick={() => setSidebarCollapsed((v) => !v)}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
            <Link href="/dashboard/shop-accounting" className={portal.brandLink}>
              <span className={portal.brandMark}>
                <Wallet size={14} />
              </span>
              <span className={portal.brandText}>
                <strong>
                  حسابداری <em>فروشگاه</em>
                </strong>
                <small>{shopTitle}</small>
              </span>
            </Link>
          </div>

          <div className={portal.topBarCenter}>
            <h1 className={portal.pageHeading}>{pageTitle}</h1>
          </div>

          <div className={portal.topBarEnd}>
            <div className={portal.userChip}>
              <span className={portal.userAvatar} aria-hidden>
                {String(userLabel).slice(0, 1)}
              </span>
              <span className={portal.userMeta}>
                <strong>{userLabel}</strong>
                <small dir="ltr">{user?.mobile || '—'}</small>
              </span>
            </div>
            <Link href="/" className={portal.siteBtn}>
              <ArrowUpLeft size={14} />
              سایت
            </Link>
          </div>
        </div>
      </header>

      <div
        className={`${portal.frame} ${
          sidebarCollapsed ? portal.frameCollapsed : ''
        } ${styles.accRoot} ${sidebarCollapsed ? styles.frameCollapsed : ''}`}
      >
        <aside
          className={`${portal.sidebar} ${
            sidebarOpen ? portal.sidebarOpen : ''
          }`}
          aria-label="منوی حسابداری"
        >
          <div className={portal.sideScroll}>
            <p className={styles.sideGroupLabel}>گزارش‌ها</p>
            {VIEW_TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.sideBtn} ${
                    view === t.id ? styles.sideBtnOn : ''
                  }`}
                  onClick={() => selectView(t.id)}
                  title={t.label}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  <span>{t.label}</span>
                </button>
              )
            })}

            <p className={styles.sideGroupLabel}>مرتبط</p>
            {SIDE_LINKS.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={portal.sideItem}
                  onClick={() => setSidebarOpen(false)}
                  title={item.label}
                >
                  <Icon size={18} strokeWidth={1.9} />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </Link>
              )
            })}
          </div>
          <div className={portal.sideFoot}>
            <span>حسابداری فروشگاه</span>
            {!sidebarCollapsed ? <small>{shopTitle}</small> : null}
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            className={portal.backdrop}
            aria-label="بستن منو"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <div className={portal.main}>
          <nav className={portal.pageNav} aria-label="منوی این صفحه">
            {VIEW_TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${portal.pageNavItem} ${
                    view === t.id ? portal.pageNavItemOn : ''
                  }`}
                  onClick={() => selectView(t.id)}
                >
                  <Icon size={15} strokeWidth={2} />
                  {t.label}
                </button>
              )
            })}
          </nav>

          <div className={portal.content} style={{ maxWidth: 'none' }}>
            {content}
          </div>

          <p className={portal.foot}>
            حسابداری فروشگاه
            {data?.period
              ? ` · ${toJalaliLabel(data.period.from)} تا ${toJalaliLabel(data.period.to)}`
              : ''}
          </p>
        </div>
      </div>
    </div>
  )
}
