'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Store,
  Wallet,
  X,
} from 'lucide-react'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import platformShopApi from '@/services/platformShopApi'
import useShopMode from '@/hooks/useShopMode'
import { formatPersianDate, toPersianDate } from '@/utils/dateUtils'
import styles from '@/app/(admin)/adminshops/AdminShops.module.css'

const NeshanMapPicker = dynamic(
  () => import('@/components/Shop/NeshanMapPicker'),
  {
    ssr: false,
    loading: () => (
      <p className={styles.mapLoading}>در حال بارگذاری نقشه نشان…</p>
    ),
  },
)

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

function toJalaliLabel(iso) {
  if (!iso) return '—'
  const dateOnly = String(iso).slice(0, 10)
  const p = toPersianDate(dateOnly)
  return formatPersianDate(p, 'numeric') || dateOnly
}

const ALL_TABS = [
  { id: 'overview', label: 'خلاصه حسابداری', multiOnly: true },
  { id: 'shops', label: 'فروشگاه‌ها', multiOnly: false },
  { id: 'settle', label: 'تسویه جدید', multiOnly: true },
  { id: 'history', label: 'تاریخچه تسویه', multiOnly: true },
]

/**
 * پنل فروشگاه‌ها / تسویه — مشترک مالک و داشبورد چندفروشندگی
 * @param {{ gate: object, Shell: React.ComponentType, productsHref?: string, shellProps?: object }} props
 */
export default function PlatformShopsManager({
  gate,
  Shell,
  productsHref = '/adminproducts',
  shellProps = {},
}) {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const { loading: modeLoading, multiVendor } = useShopMode()

  const tabs = useMemo(
    () =>
      ALL_TABS.filter((t) => (multiVendor ? true : !t.multiOnly)).map(
        ({ id, label }) => ({
          id,
          label: !multiVendor && id === 'shops' ? 'تنظیمات فروشگاه' : label,
        }),
      ),
    [multiVendor],
  )

  const [tab, setTab] = useState('shops')

  useEffect(() => {
    if (modeLoading) return
    const allowed = tabs.map((t) => t.id)
    if (tabFromUrl && allowed.includes(tabFromUrl)) {
      setTab(tabFromUrl)
    } else if (!allowed.includes(tab)) {
      setTab(multiVendor ? 'overview' : 'shops')
    }
  }, [modeLoading, multiVendor, tabFromUrl, tabs, tab])

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [overview, setOverview] = useState(null)
  const [shops, setShops] = useState([])
  const [totals, setTotals] = useState(null)
  const [q, setQ] = useState('')
  const [selectedShop, setSelectedShop] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [settlements, setSettlements] = useState([])
  const [settleForm, setSettleForm] = useState({
    shop_id: '',
    start_date: '',
    end_date: '',
    description: '',
    tracking_code: '',
  })
  const [unsettled, setUnsettled] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [proofFile, setProofFile] = useState(null)
  const [shopDialogOpen, setShopDialogOpen] = useState(false)
  const [shopDialogQ, setShopDialogQ] = useState('')

  const flash = (t) => {
    setMsg(t)
    setTimeout(() => setMsg(''), 2800)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (multiVendor) {
        const [ov, list, hist] = await Promise.all([
          platformShopApi.overview(),
          platformShopApi.listShops(q ? { q } : {}),
          platformShopApi.listSettlements(),
        ])
        setOverview(ov)
        setShops(list.results || [])
        setTotals(list.totals || null)
        setSettlements(hist.results || [])
      } else {
        const list = await platformShopApi.listShops()
        const rows = list.results || []
        // تک‌فروشگاهی: فقط اولین فروشگاه
        const one = rows[0] ? [rows[0]] : []
        setOverview(null)
        setShops(one)
        setTotals(null)
        setSettlements([])
      }
    } catch (e) {
      setError(e.message || 'بارگذاری ناموفق')
    } finally {
      setLoading(false)
    }
  }, [q, multiVendor])

  useEffect(() => {
    if (gate.allowed && !modeLoading) load()
  }, [gate.allowed, load, modeLoading])

  const openShop = useCallback((s) => {
    if (!s) return
    setSelectedShop(s)
    setEditForm({
      title: s.title || '',
      status: s.status || 'active',
      open_close_status: s.open_close_status || 'open',
      service_fee_percentage: s.service_fee_percentage ?? 10,
      mobile: s.mobile || '',
      address: s.address || '',
      sheba_number: s.sheba_number || '',
      bank_card_number: s.bank_card_number || '',
      bank_account_number: s.bank_account_number || '',
      bank_account_holder_name: s.bank_account_holder_name || '',
      is_featured: !!s.is_featured,
      delivery_fee: s.delivery_fee ?? 0,
      free_delivery_threshold: s.free_delivery_threshold ?? 0,
      latitude: s.latitude != null ? Number(s.latitude) : null,
      longitude: s.longitude != null ? Number(s.longitude) : null,
    })
  }, [])

  // تک‌فروشگاهی: فروشگاه را خودکار باز کن
  useEffect(() => {
    if (modeLoading || multiVendor || loading) return
    if (shops[0] && selectedShop?.id !== shops[0].id) {
      openShop(shops[0])
    }
  }, [modeLoading, multiVendor, loading, shops, selectedShop?.id, openShop])

  const saveShop = async (e) => {
    e.preventDefault()
    if (!selectedShop) return
    setBusy(true)
    setError('')
    try {
      const lat =
        editForm.latitude != null && editForm.latitude !== ''
          ? Number(Number(editForm.latitude).toFixed(6))
          : null
      const lng =
        editForm.longitude != null && editForm.longitude !== ''
          ? Number(Number(editForm.longitude).toFixed(6))
          : null
      const updated = await platformShopApi.updateShop(selectedShop.id, {
        ...editForm,
        service_fee_percentage: Number(editForm.service_fee_percentage) || 0,
        delivery_fee: Number(editForm.delivery_fee) || 0,
        free_delivery_threshold: Number(editForm.free_delivery_threshold) || 0,
        latitude: lat,
        longitude: lng,
      })
      setShops((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      setSelectedShop(updated)
      openShop(updated)
      flash('فروشگاه به‌روز شد')
      if (multiVendor) {
        const ov = await platformShopApi.overview()
        setOverview(ov)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const rangeReady =
    !!settleForm.shop_id && !!settleForm.start_date && !!settleForm.end_date

  const previewUnsettled = useCallback(async () => {
    if (!settleForm.shop_id || !settleForm.start_date || !settleForm.end_date) {
      setUnsettled(null)
      setSelectedOrders([])
      return
    }
    if (settleForm.end_date < settleForm.start_date) {
      setError('تاریخ پایان باید بعد از تاریخ شروع باشد')
      setUnsettled(null)
      setSelectedOrders([])
      return
    }
    setCalcLoading(true)
    setError('')
    try {
      const data = await platformShopApi.unsettled({
        shop_id: settleForm.shop_id,
        start_date: settleForm.start_date,
        end_date: settleForm.end_date,
      })
      setUnsettled(data)
      setSelectedOrders((data.orders || []).map((o) => o.id))
    } catch (e) {
      setError(e.message)
      setUnsettled(null)
      setSelectedOrders([])
    } finally {
      setCalcLoading(false)
    }
  }, [settleForm.shop_id, settleForm.start_date, settleForm.end_date])

  // با انتخاب فروشگاه + بازه شمسی، مبلغ همان بازه خودکار محاسبه می‌شود
  useEffect(() => {
    if (tab !== 'settle') return undefined
    if (!rangeReady) {
      setUnsettled(null)
      setSelectedOrders([])
      return undefined
    }
    const t = setTimeout(() => {
      previewUnsettled()
    }, 280)
    return () => clearTimeout(t)
  }, [tab, rangeReady, previewUnsettled])

  const settleAmount = useMemo(() => {
    if (!unsettled?.orders) return 0
    return unsettled.orders
      .filter((o) => selectedOrders.includes(o.id))
      .reduce((s, o) => s + (Number(o.shop_portion) || 0), 0)
  }, [unsettled, selectedOrders])

  const createSettlement = async (e) => {
    e.preventDefault()
    if (!selectedOrders.length) {
      setError('حداقل یک سفارش انتخاب کنید')
      return
    }
    setBusy(true)
    setError('')
    try {
      const created = await platformShopApi.createSettlement(
        {
          shop_id: Number(settleForm.shop_id),
          start_date: settleForm.start_date,
          end_date: settleForm.end_date,
          order_ids: selectedOrders,
          description: settleForm.description,
          tracking_code: settleForm.tracking_code,
          amount: settleAmount,
        },
        proofFile,
      )
      flash(`تسویه #${created.id} ثبت شد`)
      setProofFile(null)
      setUnsettled(null)
      setSelectedOrders([])
      setTab('history')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const setSettlementStatus = async (id, status) => {
    setBusy(true)
    setError('')
    try {
      await platformShopApi.updateSettlement(id, { status })
      flash(
        status === 'completed'
          ? 'تسویه تکمیل و سفارش‌ها علامت‌گذاری شدند'
          : status === 'approved'
            ? 'تسویه تأیید شد'
            : status === 'rejected'
              ? 'تسویه رد شد'
              : 'وضعیت به‌روز شد',
      )
      await load()
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const selectedSettleShop = useMemo(
    () => shops.find((s) => String(s.id) === String(settleForm.shop_id)) || null,
    [shops, settleForm.shop_id],
  )

  const dialogShops = useMemo(() => {
    const term = shopDialogQ.trim().toLowerCase()
    if (!term) return shops
    return shops.filter(
      (s) =>
        (s.title || '').toLowerCase().includes(term) ||
        (s.owner?.mobile || '').includes(term) ||
        (s.mobile || '').includes(term),
    )
  }, [shops, shopDialogQ])

  const pickSettleShop = (shop) => {
    setSettleForm((f) => ({ ...f, shop_id: String(shop.id) }))
    setUnsettled(null)
    setSelectedOrders([])
    setShopDialogOpen(false)
    setShopDialogQ('')
  }

  return (
    <Shell
      brand="shops"
      brandAccent="shop"
      tagline={
        multiVendor
          ? 'مدیریت فروشگاه‌ها و تسویه با زیرمجموعه‌ها'
          : 'تنظیمات فروشگاه (تک‌فروشگاهی)'
      }
      title={multiVendor ? 'فروشگاه‌ها و تسویه' : 'فروشگاه'}
      subtitle={
        multiVendor
          ? 'مدیریت همه فروشگاه‌ها، سهم سیستم، و تسویه دوره'
          : 'ویرایش مشخصات، نقشه و وضعیت فروشگاه'
      }
      wide
      loading={gate.loading || modeLoading}
      allowed={gate.allowed}
      isAuthenticated={gate.isAuthenticated}
      user={gate.user}
      displayName={gate.displayName}
      moduleOn={gate.moduleOn !== false}
      {...shellProps}
    >
      <div className={styles.page} dir="rtl">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              {multiVendor
                ? 'پلتفرم · حسابداری فروشگاه'
                : 'تک‌فروشگاهی · تنظیمات'}
            </p>
            <h1>
              {multiVendor
                ? 'فروشگاه‌ها و تسویه تأمین‌کنندگان'
                : 'مدیریت فروشگاه'}
            </h1>
            <p className={styles.sub}>
              {multiVendor
                ? 'مدیریت همه فروشگاه‌ها، سهم سیستم، و تسویه دوره با زیرمجموعه‌ها'
                : 'تسویه فقط در حالت چندفروشندگی معنا دارد؛ اینجا مشخصات همان فروشگاه را ویرایش کنید.'}
            </p>
          </div>
          <button type="button" className={styles.refreshBtn} onClick={load}>
            <RefreshCw size={15} />
            بروزرسانی
          </button>
        </header>

        {tabs.length > 1 ? (
          <nav className={styles.tabs}>
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={tab === t.id ? styles.tabOn : ''}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        ) : null}

        {msg ? <div className={styles.ok}>{msg}</div> : null}
        {error ? <div className={styles.err}>{error}</div> : null}

        {loading ? (
          <div className={styles.state}>
            <Loader2 className={styles.spin} size={24} />
            در حال بارگذاری…
          </div>
        ) : null}

        {!loading && multiVendor && tab === 'overview' && overview ? (
          <section className={styles.section}>
            <div className={styles.statGrid}>
              <article>
                <Building2 size={18} />
                <span>فروشگاه فعال</span>
                <strong>
                  {(overview.shops_active || 0).toLocaleString('fa-IR')}
                  <small> / {(overview.shops_total || 0).toLocaleString('fa-IR')}</small>
                </strong>
              </article>
              <article>
                <Wallet size={18} />
                <span>GMV پرداخت‌شده</span>
                <strong>{formatPrice(overview.gmv_paid)} تومان</strong>
              </article>
              <article className={styles.statWarn}>
                <CreditCard size={18} />
                <span>بدهی به فروشگاه‌ها</span>
                <strong>
                  {formatPrice(overview.shop_portion_unsettled)} تومان
                </strong>
              </article>
              <article>
                <Store size={18} />
                <span>سهم سیستم</span>
                <strong>
                  {formatPrice(overview.system_portion_total)} تومان
                </strong>
              </article>
            </div>
            <div className={styles.hintRow}>
              <p>
                سفارش‌های پرداخت‌شده و تسویه‌نشده:{' '}
                <strong>
                  {(overview.unsettled_orders || 0).toLocaleString('fa-IR')}
                </strong>
                {' · '}
                تسویه در انتظار:{' '}
                <strong>
                  {(overview.settlements_pending || 0).toLocaleString('fa-IR')}
                </strong>
                {' · '}
                تکمیل‌شده:{' '}
                <strong>
                  {(overview.settlements_completed || 0).toLocaleString('fa-IR')}
                </strong>
              </p>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setTab('settle')}
              >
                شروع تسویه جدید
              </button>
            </div>
          </section>
        ) : null}

        {!loading && tab === 'shops' ? (
          <section className={styles.section}>
            {multiVendor ? (
              <div className={styles.toolbar}>
                <input
                  placeholder="جستجوی نام / موبایل…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && load()}
                />
                <button type="button" className={styles.ghostBtn} onClick={load}>
                  جستجو
                </button>
                {totals ? (
                  <span className={styles.meta}>
                    بدهی کل: {formatPrice(totals.unsettled_amount)} تومان
                  </span>
                ) : null}
              </div>
            ) : null}

            <div
              className={styles.split}
              style={!multiVendor ? { gridTemplateColumns: '1fr' } : undefined}
            >
              {multiVendor ? (
                <ul className={styles.shopList}>
                  {shops.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={
                          selectedShop?.id === s.id ? styles.shopOn : ''
                        }
                        onClick={() => openShop(s)}
                      >
                        <strong>{s.title}</strong>
                        <span>
                          {s.owner?.mobile || '—'} ·{' '}
                          {s.status === 'active' ? 'فعال' : 'غیرفعال'}
                        </span>
                        <em>
                          بدهی {formatPrice(s.unsettled_amount)} ·{' '}
                          {(s.unsettled_orders || 0).toLocaleString('fa-IR')}{' '}
                          سفارش
                        </em>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}

              {selectedShop && editForm ? (
                <form className={styles.editor} onSubmit={saveShop}>
                  <h2>
                    {multiVendor
                      ? `ویرایش · ${selectedShop.title}`
                      : selectedShop.title || 'تنظیمات فروشگاه'}
                  </h2>
                  <div className={styles.grid2}>
                    <label>
                      نام
                      <input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                      />
                    </label>
                    <label>
                      وضعیت
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, status: e.target.value }))
                        }
                      >
                        <option value="active">فعال</option>
                        <option value="inactive">غیرفعال</option>
                      </select>
                    </label>
                    <label>
                      باز/بسته
                      <select
                        value={editForm.open_close_status}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            open_close_status: e.target.value,
                          }))
                        }
                      >
                        <option value="open">باز</option>
                        <option value="closed">بسته</option>
                      </select>
                    </label>
                    {multiVendor ? (
                      <label>
                        کارمزد سیستم ٪
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editForm.service_fee_percentage}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              service_fee_percentage: e.target.value,
                            }))
                          }
                        />
                      </label>
                    ) : null}
                    <label>
                      موبایل
                      <input
                        value={editForm.mobile}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, mobile: e.target.value }))
                        }
                      />
                    </label>
                    {multiVendor ? (
                      <label>
                        ویژه
                        <select
                          value={editForm.is_featured ? '1' : '0'}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              is_featured: e.target.value === '1',
                            }))
                          }
                        >
                          <option value="0">خیر</option>
                          <option value="1">بله</option>
                        </select>
                      </label>
                    ) : null}
                    <label className={styles.full}>
                      آدرس
                      <textarea
                        rows={2}
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            address: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <div className={`${styles.full} ${styles.mapBlock}`}>
                      <div className={styles.mapHead}>
                        <MapPin size={15} />
                        <span>موقعیت روی نقشه نشان</span>
                        {editForm.latitude != null &&
                        editForm.longitude != null ? (
                          <small dir="ltr">
                            {Number(editForm.latitude).toFixed(5)},{' '}
                            {Number(editForm.longitude).toFixed(5)}
                          </small>
                        ) : (
                          <small>هنوز انتخاب نشده</small>
                        )}
                      </div>
                      <p className={styles.mapHint}>
                        نقشه را جابه‌جا کنید تا پین روی محل فروشگاه قرار گیرد.
                        متن آدرس در صورت خالی بودن از نقشه پر می‌شود.
                      </p>
                      <NeshanMapPicker
                        key={`shop-map-${selectedShop.id}`}
                        height={280}
                        initialLat={editForm.latitude ?? 35.6892}
                        initialLng={editForm.longitude ?? 51.389}
                        onLocationSelect={(lat, lng) =>
                          setEditForm((f) => ({
                            ...f,
                            latitude: lat,
                            longitude: lng,
                          }))
                        }
                        onAddressDetected={(text) =>
                          setEditForm((f) => ({
                            ...f,
                            address: f.address?.trim() ? f.address : text,
                          }))
                        }
                      />
                    </div>
                    <label className={styles.full}>
                      نام صاحب حساب
                      <input
                        placeholder="نام فردی که حساب به نام اوست"
                        value={editForm.bank_account_holder_name}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            bank_account_holder_name: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      کارت
                      <input
                        dir="ltr"
                        value={editForm.bank_card_number}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            bank_card_number: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      شبا
                      <input
                        dir="ltr"
                        value={editForm.sheba_number}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            sheba_number: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label>
                      حساب
                      <input
                        dir="ltr"
                        value={editForm.bank_account_number}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            bank_account_number: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                  <div className={styles.statsMini}>
                    <span>
                      محصولات:{' '}
                      {(selectedShop.products_active || 0).toLocaleString('fa-IR')}
                    </span>
                    {multiVendor ? (
                      <>
                        <span>
                          GMV: {formatPrice(selectedShop.paid_gmv)}
                        </span>
                        <span>
                          بدهی: {formatPrice(selectedShop.unsettled_amount)}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div className={styles.actions}>
                    <button
                      type="submit"
                      className={styles.primaryBtn}
                      disabled={busy}
                    >
                      ذخیره
                    </button>
                    <Link
                      href={`${productsHref}?shop=${selectedShop.id}`}
                      className={styles.ghostBtn}
                    >
                      مدیریت محصولات
                    </Link>
                    {multiVendor ? (
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        onClick={() => {
                          setSettleForm((f) => ({
                            ...f,
                            shop_id: String(selectedShop.id),
                          }))
                          setTab('settle')
                        }}
                      >
                        تسویه این فروشگاه
                      </button>
                    ) : null}
                  </div>
                </form>
              ) : (
                <div className={styles.emptyPane}>
                  {multiVendor
                    ? 'یک فروشگاه را از لیست انتخاب کنید'
                    : 'فروشگاهی یافت نشد. با روشن بودن تک‌فروشگاهی، فروشگاه به‌صورت خودکار ساخته می‌شود.'}
                </div>
              )}
            </div>
          </section>
        ) : null}

        {!loading && multiVendor && tab === 'settle' ? (
          <section className={styles.section}>
            <form className={styles.settleCard} onSubmit={createSettlement}>
              <h2>ایجاد تسویه با فروشگاه</h2>
              <p className={styles.stepHint}>
                ۱) فروشگاه را انتخاب کنید · ۲) بازه شمسی را مشخص کنید · مبلغ
                همان بازه خودکار محاسبه می‌شود
              </p>

              <div className={styles.shopPickBlock}>
                <span className={styles.fieldLabel}>فروشگاه *</span>
                <button
                  type="button"
                  className={`${styles.shopPickBtn} ${
                    selectedSettleShop ? styles.shopPickBtnFilled : ''
                  }`}
                  onClick={() => setShopDialogOpen(true)}
                >
                  {selectedSettleShop ? (
                    <span className={styles.shopPickInfo}>
                      <strong>{selectedSettleShop.title}</strong>
                      <small>
                        بدهی {formatPrice(selectedSettleShop.unsettled_amount)}{' '}
                        تومان
                        {selectedSettleShop.owner?.mobile
                          ? ` · ${selectedSettleShop.owner.mobile}`
                          : ''}
                      </small>
                    </span>
                  ) : (
                    <span className={styles.shopPickPlaceholder}>
                      <Store size={18} strokeWidth={1.75} />
                      انتخاب فروشگاه از لیست…
                    </span>
                  )}
                  <ChevronDown size={18} className={styles.shopPickChevron} />
                </button>
                {selectedSettleShop ? (
                  <button
                    type="button"
                    className={styles.shopPickChange}
                    onClick={() => setShopDialogOpen(true)}
                  >
                    تغییر فروشگاه
                  </button>
                ) : null}
              </div>

              <div className={styles.dateRangeCard}>
                <div className={styles.dateRangeHead}>
                  <span>بازه تسویه (شمسی)</span>
                  {settleForm.start_date && settleForm.end_date ? (
                    <small>
                      {toJalaliLabel(settleForm.start_date)} تا{' '}
                      {toJalaliLabel(settleForm.end_date)}
                    </small>
                  ) : (
                    <small>هر دو تاریخ را انتخاب کنید</small>
                  )}
                </div>
                <div className={styles.dateRangeGrid}>
                  <label className={styles.jalaliField}>
                    <span>از تاریخ</span>
                    <PersianDatePicker
                      value={settleForm.start_date}
                      onChange={(date) => {
                        setSettleForm((f) => ({
                          ...f,
                          start_date: date || '',
                        }))
                        setUnsettled(null)
                        setSelectedOrders([])
                      }}
                      placeholder="شروع بازه"
                    />
                  </label>
                  <span className={styles.dateRangeSep} aria-hidden>
                    تا
                  </span>
                  <label className={styles.jalaliField}>
                    <span>تا تاریخ</span>
                    <PersianDatePicker
                      value={settleForm.end_date}
                      onChange={(date) => {
                        setSettleForm((f) => ({
                          ...f,
                          end_date: date || '',
                        }))
                        setUnsettled(null)
                        setSelectedOrders([])
                      }}
                      placeholder="پایان بازه"
                    />
                  </label>
                </div>
              </div>

              {!rangeReady ? (
                <div className={`${styles.emptyPane} ${styles.emptyPaneTight}`}>
                  ابتدا فروشگاه و بازه تاریخ شمسی را کامل کنید تا مبلغ تسویه
                  محاسبه شود.
                </div>
              ) : null}

              {rangeReady && calcLoading ? (
                <div className={`${styles.state} ${styles.stateTight}`}>
                  <Loader2 className={styles.spin} size={20} />
                  در حال محاسبه مبلغ بازه…
                </div>
              ) : null}

              {rangeReady && !calcLoading && unsettled ? (
                <div className={styles.unsettledBox}>
                  <div className={styles.amountBanner}>
                    <div>
                      <span className={styles.amountLabel}>
                        مبلغ تسویه این بازه
                      </span>
                      <p className={styles.rangeLabel}>
                        {toJalaliLabel(settleForm.start_date)} تا{' '}
                        {toJalaliLabel(settleForm.end_date)}
                        {' · '}
                        {(unsettled.count || 0).toLocaleString('fa-IR')} سفارش
                      </p>
                    </div>
                    <div className={styles.amountBig}>
                      {formatPrice(settleAmount)}
                      <small> تومان · سهم فروشگاه</small>
                    </div>
                  </div>

                  <div className={styles.unsettledHead}>
                    <div>
                      <strong>{unsettled.shop?.title}</strong>
                      <p>
                        شبا: {unsettled.shop?.sheba_number || '—'} · کارت:{' '}
                        {unsettled.shop?.bank_card_number || '—'}
                      </p>
                    </div>
                  </div>

                  {!unsettled.orders?.length ? (
                    <p className={styles.emptyPane}>
                      در این بازه سفارش پرداخت‌شده و تسویه‌نشده‌ای نیست.
                    </p>
                  ) : (
                    <>
                      <p className={styles.meta}>
                        سفارش‌های همین بازه (می‌توانید از انتخاب خارج کنید؛ مبلغ
                        به‌روز می‌شود):
                      </p>
                      <ul className={styles.orderPick}>
                        {unsettled.orders.map((o) => (
                          <li key={o.id}>
                            <label>
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(o.id)}
                                onChange={() => toggleOrder(o.id)}
                              />
                              <span>
                                #{o.id} · {toJalaliLabel(o.created_at)} ·{' '}
                                {formatPrice(o.final_price)} کل · سهم فروشگاه{' '}
                                {formatPrice(o.shop_portion)} · سیستم{' '}
                                {formatPrice(o.system_portion)}
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>

                      <div className={styles.grid2}>
                        <label>
                          کد رهگیری واریز
                          <input
                            value={settleForm.tracking_code}
                            onChange={(e) =>
                              setSettleForm((f) => ({
                                ...f,
                                tracking_code: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          فیش پرداخت (اختیاری)
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              setProofFile(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        <label className={styles.full}>
                          توضیحات
                          <textarea
                            rows={2}
                            value={settleForm.description}
                            onChange={(e) =>
                              setSettleForm((f) => ({
                                ...f,
                                description: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>

                      <button
                        type="submit"
                        className={styles.primaryBtn}
                        disabled={busy || !selectedOrders.length || !settleAmount}
                      >
                        ثبت تسویه {formatPrice(settleAmount)} تومان (
                        {selectedOrders.length.toLocaleString('fa-IR')} سفارش)
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </form>
          </section>
        ) : null}

        {!loading && multiVendor && tab === 'history' ? (
          <section className={styles.section}>
            {!settlements.length ? (
              <div className={styles.emptyPane}>هنوز تسویه‌ای ثبت نشده است.</div>
            ) : (
              <ul className={styles.histList}>
                {settlements.map((s) => (
                  <li key={s.id} className={styles.histCard}>
                    <div className={styles.histTop}>
                      <div>
                        <strong>
                          تسویه #{s.id} · {s.supplier_title}
                        </strong>
                        <p>
                          {toJalaliLabel(s.start_date)} تا{' '}
                          {toJalaliLabel(s.end_date)} ·{' '}
                          {(s.orders_count || 0).toLocaleString('fa-IR')} سفارش
                          {s.settlement_date
                            ? ` · ثبت ${toJalaliLabel(s.settlement_date)}`
                            : ''}
                        </p>
                      </div>
                      <div className={styles.histSide}>
                        <span
                          className={`${styles.badge} ${
                            styles[`st_${s.status}`] || ''
                          }`}
                        >
                          {s.status_label || s.status}
                        </span>
                        <strong>{formatPrice(s.amount)} تومان</strong>
                      </div>
                    </div>
                    {s.tracking_code ? (
                      <p className={styles.meta}>رهگیری: {s.tracking_code}</p>
                    ) : null}
                    {s.payment_proof_url ? (
                      <a
                        href={s.payment_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        مشاهده فیش
                      </a>
                    ) : null}
                    <div className={styles.actions}>
                      {s.status === 'pending' ? (
                        <>
                          <button
                            type="button"
                            className={styles.okBtn}
                            disabled={busy}
                            onClick={() => setSettlementStatus(s.id, 'approved')}
                          >
                            تأیید
                          </button>
                          <button
                            type="button"
                            className={styles.primaryBtn}
                            disabled={busy}
                            onClick={() => setSettlementStatus(s.id, 'completed')}
                          >
                            <Check size={14} /> تکمیل و بستن بدهی
                          </button>
                          <button
                            type="button"
                            className={styles.dangerBtn}
                            disabled={busy}
                            onClick={() => setSettlementStatus(s.id, 'rejected')}
                          >
                            رد
                          </button>
                        </>
                      ) : null}
                      {s.status === 'approved' ? (
                        <button
                          type="button"
                          className={styles.primaryBtn}
                          disabled={busy}
                          onClick={() => setSettlementStatus(s.id, 'completed')}
                        >
                          تکمیل تسویه
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={shellProps.homeHref || '/dashboard'}
              className={styles.link}
            >
              {shellProps.homeLabel || 'بازگشت به داشبورد'}
            </Link>
          </section>
        ) : null}

        {shopDialogOpen ? (
          <div
            className={styles.dialogOverlay}
            role="presentation"
            onClick={() => {
              setShopDialogOpen(false)
              setShopDialogQ('')
            }}
          >
            <div
              className={styles.dialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shop-pick-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.dialogHead}>
                <div>
                  <h3 id="shop-pick-title">انتخاب فروشگاه</h3>
                  <p>
                    {(shops.length || 0).toLocaleString('fa-IR')} فروشگاه موجود
                  </p>
                </div>
                <button
                  type="button"
                  className={styles.dialogClose}
                  aria-label="بستن"
                  onClick={() => {
                    setShopDialogOpen(false)
                    setShopDialogQ('')
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.dialogSearch}>
                <Search size={16} />
                <input
                  autoFocus
                  placeholder="جستجوی نام یا موبایل…"
                  value={shopDialogQ}
                  onChange={(e) => setShopDialogQ(e.target.value)}
                />
              </div>

              <ul className={styles.dialogList}>
                {!dialogShops.length ? (
                  <li className={styles.dialogEmpty}>فروشگاهی یافت نشد.</li>
                ) : (
                  dialogShops.map((s) => {
                    const active =
                      String(s.id) === String(settleForm.shop_id)
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          className={`${styles.dialogShop} ${
                            active ? styles.dialogShopOn : ''
                          }`}
                          onClick={() => pickSettleShop(s)}
                        >
                          <span className={styles.dialogShopIcon}>
                            <Store size={18} strokeWidth={1.75} />
                          </span>
                          <span className={styles.dialogShopBody}>
                            <strong>{s.title}</strong>
                            <small>
                              {s.owner?.mobile || s.mobile || '—'}
                              {s.status === 'active' ? ' · فعال' : ' · غیرفعال'}
                              {' · '}
                              {(s.unsettled_orders || 0).toLocaleString('fa-IR')}{' '}
                              سفارش باز
                            </small>
                          </span>
                          <span className={styles.dialogShopDebt}>
                            <em>بدهی</em>
                            <strong>
                              {formatPrice(s.unsettled_amount)}
                            </strong>
                            <small>تومان</small>
                          </span>
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </Shell>
  )
}
