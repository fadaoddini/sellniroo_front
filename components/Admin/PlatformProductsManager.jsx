'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import platformShopApi from '@/services/platformShopApi'
import useShopMode from '@/hooks/useShopMode'
import CategoryPicker, {
  useCategoryLabel,
} from '@/app/(site)/shop-panel/CategoryPicker'
import AdminProductCreateForm from '@/components/Admin/AdminProductCreateForm'
import styles from '@/app/(admin)/adminproducts/AdminProducts.module.css'

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

function emptyForm(shopId = '') {
  return {
    shop: shopId ? String(shopId) : '',
    category: '',
    title: '',
    title_en: '',
    price_one: '',
    discount: '0',
    lid: '',
    description: '',
    status: 'active',
    position: '0',
    sales_count: '0',
    number_min: '1',
    number_max: '100',
    weight_one: '',
    is_featured: false,
    show_in_stories: false,
    stock_total: '',
    stock_remaining: '',
  }
}

function formFromProduct(p) {
  return {
    shop: p.shop ? String(p.shop) : '',
    category: p.category ? String(p.category) : '',
    title: p.title || '',
    title_en: p.title_en || '',
    price_one: p.price_one != null ? String(p.price_one) : '',
    discount: p.discount != null ? String(p.discount) : '0',
    lid: p.lid || '',
    description: p.description || '',
    status: p.status || 'active',
    position: p.position != null ? String(p.position) : '0',
    sales_count: p.sales_count != null ? String(p.sales_count) : '0',
    number_min: p.number_min != null ? String(p.number_min) : '1',
    number_max: p.number_max != null ? String(p.number_max) : '100',
    weight_one: p.weight_one != null ? String(p.weight_one) : '',
    is_featured: !!p.is_featured,
    show_in_stories: !!p.show_in_stories,
    stock_total:
      p.stock?.total != null && p.stock.total !== ''
        ? String(p.stock.total)
        : '',
    stock_remaining:
      p.stock?.remaining != null && p.stock.remaining !== ''
        ? String(p.stock.remaining)
        : '',
  }
}

function payloadFromForm(form, { creating }) {
  const body = {
    shop: Number(form.shop),
    category: Number(form.category),
    title: form.title.trim(),
    title_en: form.title_en.trim() || null,
    price_one: Number(form.price_one) || 0,
    discount: Number(form.discount) || 0,
    lid: form.lid,
    description: form.description,
    status: form.status,
    position: Number(form.position) || 0,
    sales_count: Number(form.sales_count) || 0,
    number_min: Number(form.number_min) || 1,
    number_max: Number(form.number_max) || 100,
    is_featured: !!form.is_featured,
    show_in_stories: !!form.show_in_stories,
  }
  if (form.weight_one !== '') body.weight_one = Number(form.weight_one) || 0
  if (form.stock_total !== '') body.stock_total = Number(form.stock_total) || 0
  if (form.stock_remaining !== '') {
    body.stock_remaining = Number(form.stock_remaining) || 0
  }
  if (!creating) {
    // keep shop/category even when editing
  }
  return body
}

export default function PlatformProductsManager({
  gate,
  Shell,
  shopsHref = '/adminshops',
  shellProps = {},
}) {
  const searchParams = useSearchParams()
  const initialShop = searchParams.get('shop') || ''
  const { loading: modeLoading, singleStore, multiVendor } = useShopMode()

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [shops, setShops] = useState([])
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(24)
  const [q, setQ] = useState('')
  const [shopFilter, setShopFilter] = useState(initialShop)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [detail, setDetail] = useState(null)
  const [form, setForm] = useState(() => emptyForm(initialShop))
  const [creating, setCreating] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const categoryLabel = useCategoryLabel(categories, form.category)

  const primaryShopId = useMemo(() => {
    if (!shops.length) return ''
    if (initialShop && shops.some((s) => String(s.id) === String(initialShop))) {
      return String(initialShop)
    }
    return String(shops[0].id)
  }, [shops, initialShop])

  const lockedShopId = singleStore ? primaryShopId : ''

  const flash = (t) => {
    setMsg(t)
    setTimeout(() => setMsg(''), 2800)
  }

  const loadMeta = useCallback(async () => {
    const [shopRes, cats] = await Promise.all([
      platformShopApi.listShops(),
      platformShopApi.listCategories(),
    ])
    setShops(shopRes.results || [])
    setCategories(Array.isArray(cats) ? cats : cats?.results || [])
  }, [])

  const loadProducts = useCallback(async () => {
    const params = {
      page,
      page_size: pageSize,
    }
    if (q.trim()) params.q = q.trim()
    const shopId = lockedShopId || shopFilter
    if (shopId) params.shop = shopId
    if (statusFilter) params.status = statusFilter
    const data = await platformShopApi.listProducts(params)
    setProducts(data.results || [])
    setCount(data.count || 0)
  }, [page, pageSize, q, shopFilter, statusFilter, lockedShopId])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadMeta(), loadProducts()])
    } catch (e) {
      setError(e.message || 'بارگذاری ناموفق')
    } finally {
      setLoading(false)
    }
  }, [loadMeta, loadProducts])

  useEffect(() => {
    if (!gate.allowed) return
    loadMeta().catch((e) => setError(e.message || 'بارگذاری ناموفق'))
  }, [gate.allowed, loadMeta])

  useEffect(() => {
    if (!gate.allowed) return
    let cancelled = false
    const t = setTimeout(async () => {
      setLoading(true)
      setError('')
      try {
        await loadProducts()
      } catch (e) {
        if (!cancelled) setError(e.message || 'بارگذاری ناموفق')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 220)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [gate.allowed, loadProducts])

  useEffect(() => {
    if (initialShop) setShopFilter(initialShop)
  }, [initialShop])

  useEffect(() => {
    if (!singleStore || !primaryShopId) return
    setShopFilter(primaryShopId)
  }, [singleStore, primaryShopId])

  const openProduct = async (id) => {
    setCreating(false)
    setSelectedId(id)
    setDetailLoading(true)
    setError('')
    try {
      const p = await platformShopApi.getProduct(id)
      setDetail(p)
      setForm(formFromProduct(p))
    } catch (e) {
      setError(e.message || 'بارگذاری محصول ناموفق')
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }

  const startCreate = () => {
    setCreating(true)
    setSelectedId(null)
    setDetail(null)
    const shopId = lockedShopId || shopFilter || shops[0]?.id || ''
    setForm(emptyForm(shopId))
  }

  const finalPrice = useMemo(() => {
    const price = Number(form.price_one) || 0
    const disc = Number(form.discount) || 0
    if (disc > 0) return Math.round(price - (price * disc) / 100)
    return price
  }, [form.price_one, form.discount])

  const save = async (e) => {
    e.preventDefault()
    if (!selectedId) return
    const shopId = singleStore
      ? lockedShopId || form.shop
      : form.shop
    if (!form.title.trim() || !shopId || !form.category) {
      setError('عنوان، فروشگاه و دسته الزامی است')
      return
    }
    setBusy(true)
    setError('')
    try {
      const body = payloadFromForm({ ...form, shop: shopId }, { creating: false })
      const updated = await platformShopApi.updateProduct(selectedId, body)
      setDetail(updated)
      setForm(formFromProduct(updated))
      flash('تغییرات ذخیره شد')
      await loadProducts()
    } catch (err) {
      setError(err.message || 'ذخیره ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const deactivate = async () => {
    if (!selectedId) return
    if (!window.confirm('این محصول غیرفعال شود؟')) return
    setBusy(true)
    try {
      await platformShopApi.deactivateProduct(selectedId)
      flash('محصول غیرفعال شد')
      await loadProducts()
      await openProduct(selectedId)
    } catch (err) {
      setError(err.message || 'عملیات ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const onUploadImage = async (file) => {
    if (!selectedId || !file) return
    setBusy(true)
    setError('')
    try {
      await platformShopApi.uploadProductImage(selectedId, file)
      flash('تصویر افزوده شد')
      await openProduct(selectedId)
      await loadProducts()
    } catch (err) {
      setError(err.message || 'آپلود ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const onDeleteImage = async (imageId) => {
    if (!selectedId) return
    setBusy(true)
    try {
      await platformShopApi.deleteProductImage(selectedId, imageId)
      flash('تصویر حذف شد')
      await openProduct(selectedId)
      await loadProducts()
    } catch (err) {
      setError(err.message || 'حذف تصویر ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(count / pageSize))
  const heroImage =
    detail?.images?.[0]?.image_url || detail?.image || ''

  return (
    <Shell
      brand="محصولات"
      brandAccent="admin"
      tagline={
        singleStore
          ? 'کاتالوگ فروشگاه (تک‌فروشگاهی)'
          : 'کاتالوگ همه فروشگاه‌ها'
      }
      title="محصولات فروشگاه‌ها"
      subtitle={
        singleStore
          ? 'ویرایش محصولات همان فروشگاه'
          : 'ویرایش کاتالوگ همه فروشگاه‌ها'
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
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>
              {singleStore ? 'تک‌فروشگاهی · کاتالوگ' : 'پلتفرم · کاتالوگ'}
            </p>
            <h1>
              {singleStore
                ? shops.find((s) => String(s.id) === String(lockedShopId))
                    ?.title || 'محصولات فروشگاه'
                : 'محصولات همه فروشگاه‌ها'}
            </h1>
            <p className={styles.sub}>
              {singleStore
                ? 'فقط محصولات همین فروشگاه — قیمت، موجودی و تصاویر.'
                : 'جستجو، فیلتر بر اساس فروشگاه، ویرایش کامل قیمت و موجودی، و مدیریت تصاویر.'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={refresh}
              disabled={loading || busy}
            >
              <RefreshCw size={15} className={loading ? styles.spin : undefined} />
              بروزرسانی
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={startCreate}
              disabled={busy || !shops.length}
            >
              <Plus size={15} />
              محصول جدید
            </button>
          </div>
        </header>

        {error ? <div className={styles.alert}>{error}</div> : null}
        {msg ? <div className={styles.flash}>{msg}</div> : null}

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} />
            <input
              value={q}
              onChange={(e) => {
                setPage(1)
                setQ(e.target.value)
              }}
              placeholder={
                singleStore ? 'جستجوی عنوان…' : 'جستجوی عنوان یا فروشگاه…'
              }
            />
          </div>
          {multiVendor ? (
            <select
              value={shopFilter}
              onChange={(e) => {
                setPage(1)
                setShopFilter(e.target.value)
              }}
            >
              <option value="">همه فروشگاه‌ها</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          ) : null}
          <div className={styles.filterChips}>
            {[
              { id: '', label: 'همه' },
              { id: 'active', label: 'فعال' },
              { id: 'inactive', label: 'غیرفعال' },
            ].map((c) => (
              <button
                key={c.id || 'all'}
                type="button"
                className={`${styles.chip} ${statusFilter === c.id ? styles.chipOn : ''}`}
                onClick={() => {
                  setPage(1)
                  setStatusFilter(c.id)
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
          <span className={styles.meta}>
            {(count || 0).toLocaleString('fa-IR')} محصول
          </span>
        </div>

        {loading ? (
          <div className={styles.stateBox}>
            <Loader2 size={22} className={styles.spin} />
            <p>در حال بارگذاری…</p>
          </div>
        ) : (
          <div className={styles.layout}>
            <aside className={styles.listPane}>
              {products.length === 0 ? (
                <div className={styles.emptyPane}>
                  محصولی پیدا نشد.
                  <br />
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    style={{ marginTop: '0.85rem' }}
                    onClick={startCreate}
                  >
                    <Plus size={14} /> ساخت اولین محصول
                  </button>
                </div>
              ) : (
                <>
                  <ul className={styles.productList}>
                    {products.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          className={`${styles.productBtn} ${
                            !creating && selectedId === p.id ? styles.productOn : ''
                          }`}
                          onClick={() => openProduct(p.id)}
                        >
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image}
                              alt=""
                              className={styles.thumb}
                            />
                          ) : (
                            <span
                              className={`${styles.thumb} ${styles.thumbEmpty}`}
                            >
                              <Package size={18} />
                            </span>
                          )}
                          <div className={styles.productMeta}>
                            <strong>{p.title}</strong>
                            <span>{p.shop_title || '—'}</span>
                            <em>
                              {formatPrice(p.final_price ?? p.price_one)} تومان
                            </em>
                            <div className={styles.badges}>
                              {p.status === 'active' ? (
                                <span className={`${styles.badge} ${styles.badgeOk}`}>
                                  فعال
                                </span>
                              ) : (
                                <span className={`${styles.badge} ${styles.badgeOff}`}>
                                  غیرفعال
                                </span>
                              )}
                              {p.is_featured ? (
                                <span className={`${styles.badge} ${styles.badgeWarn}`}>
                                  ویژه
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {totalPages > 1 ? (
                    <div className={styles.pager}>
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                      >
                        قبلی
                      </button>
                      <span className={styles.meta}>
                        {page.toLocaleString('fa-IR')} /{' '}
                        {totalPages.toLocaleString('fa-IR')}
                      </span>
                      <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                      >
                        بعدی
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </aside>

            <section className={styles.editor}>
              {creating ? (
                <div className={styles.createWrap}>
                  <AdminProductCreateForm
                    shops={shops}
                    categories={categories}
                    singleStore={singleStore}
                    lockedShopId={lockedShopId}
                    defaultShopId={
                      lockedShopId || shopFilter || primaryShopId || ''
                    }
                    onCancel={() => {
                      setCreating(false)
                      setForm(emptyForm(shopFilter || lockedShopId))
                    }}
                    onCreated={async (created) => {
                      flash(
                        created?.id
                          ? 'محصول با موفقیت ثبت شد'
                          : 'محصول ثبت شد',
                      )
                      setCreating(false)
                      await loadProducts()
                      if (created?.id) await openProduct(created.id)
                    }}
                  />
                </div>
              ) : !selectedId ? (
                <div className={styles.emptyPane} style={{ margin: '1.2rem' }}>
                  یک محصول از لیست انتخاب کنید یا محصول جدید بسازید.
                  <div style={{ marginTop: '0.75rem' }}>
                    <Link href={shopsHref} className={styles.link}>
                      {singleStore
                        ? 'بازگشت به تنظیمات فروشگاه'
                        : 'بازگشت به فروشگاه‌ها و تسویه'}
                    </Link>
                  </div>
                </div>
              ) : detailLoading ? (
                <div className={styles.stateBox}>
                  <Loader2 size={22} className={styles.spin} />
                  <p>بارگذاری جزئیات…</p>
                </div>
              ) : (
                <form onSubmit={save}>
                  <div
                    className={styles.editorHero}
                    style={
                      heroImage
                        ? { backgroundImage: `url(${heroImage})` }
                        : undefined
                    }
                  >
                    <div>
                      <h2>
                        {form.title || detail?.title || 'ویرایش محصول'}
                      </h2>
                      <p>
                        {`${detail?.shop_title || shops.find((s) => String(s.id) === form.shop)?.title || '—'} · #${selectedId}`}
                      </p>
                    </div>
                  </div>

                  <div className={styles.editorBody}>
                    <div className={styles.sectionBlock}>
                      <p className={styles.sectionTitle}>اطلاعات اصلی</p>
                      <div className={styles.grid2}>
                        <label>
                          فروشگاه
                          <select
                            required
                            value={
                              singleStore
                                ? lockedShopId || form.shop
                                : form.shop
                            }
                            disabled={singleStore}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, shop: e.target.value }))
                            }
                          >
                            {!singleStore ? (
                              <option value="">انتخاب…</option>
                            ) : null}
                            {(singleStore
                              ? shops.filter(
                                  (s) => String(s.id) === String(lockedShopId),
                                )
                              : shops
                            ).map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          دسته (فقط برگ فعال)
                          <button
                            type="button"
                            className={styles.pickerTrigger}
                            onClick={() => setCategoryDialog(true)}
                          >
                            <span>
                              {categoryLabel || 'انتخاب دسته نهایی…'}
                            </span>
                            <Plus size={14} />
                          </button>
                        </label>
                        <label className={styles.full}>
                          عنوان
                          <input
                            required
                            value={form.title}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, title: e.target.value }))
                            }
                          />
                        </label>
                        <label className={styles.full}>
                          عنوان انگلیسی
                          <input
                            dir="ltr"
                            value={form.title_en}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                title_en: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label className={styles.full}>
                          خلاصه / لید
                          <textarea
                            rows={2}
                            value={form.lid}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, lid: e.target.value }))
                            }
                          />
                        </label>
                        <label className={styles.full}>
                          توضیحات
                          <textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                description: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className={styles.sectionBlock}>
                      <p className={styles.sectionTitle}>قیمت و موجودی</p>
                      <div className={styles.grid2}>
                        <label>
                          قیمت (تومان)
                          <input
                            type="number"
                            min="0"
                            value={form.price_one}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                price_one: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          تخفیف٪
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={form.discount}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                discount: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <div className={styles.full}>
                          <p className={styles.pricePreview}>
                            قیمت نهایی: {formatPrice(finalPrice)} تومان
                            {Number(form.discount) > 0 ? (
                              <s>{formatPrice(form.price_one)}</s>
                            ) : null}
                          </p>
                        </div>
                        <label>
                          موجودی کل
                          <input
                            type="number"
                            min="0"
                            value={form.stock_total}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                stock_total: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          باقی‌مانده
                          <input
                            type="number"
                            min="0"
                            value={form.stock_remaining}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                stock_remaining: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          حداقل سفارش
                          <input
                            type="number"
                            min="1"
                            value={form.number_min}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                number_min: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          حداکثر سفارش
                          <input
                            type="number"
                            min="1"
                            value={form.number_max}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                number_max: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className={styles.sectionBlock}>
                      <p className={styles.sectionTitle}>نمایش و وضعیت</p>
                      <div className={styles.grid2}>
                        <label>
                          وضعیت
                          <select
                            value={form.status}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                status: e.target.value,
                              }))
                            }
                          >
                            <option value="active">فعال</option>
                            <option value="inactive">غیرفعال</option>
                          </select>
                        </label>
                        <label>
                          ترتیب نمایش
                          <input
                            type="number"
                            value={form.position}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                position: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          تعداد فروش (نمایشی)
                          <input
                            type="number"
                            min="0"
                            value={form.sales_count}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                sales_count: e.target.value,
                              }))
                            }
                          />
                        </label>
                        <label>
                          وزن واحد
                          <input
                            type="number"
                            step="0.1"
                            value={form.weight_one}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                weight_one: e.target.value,
                              }))
                            }
                          />
                        </label>
                      </div>
                      <div className={styles.checkRow}>
                        <label>
                          <input
                            type="checkbox"
                            checked={form.is_featured}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                is_featured: e.target.checked,
                              }))
                            }
                          />
                          محصول ویژه
                        </label>
                        <label>
                          <input
                            type="checkbox"
                            checked={form.show_in_stories}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                show_in_stories: e.target.checked,
                              }))
                            }
                          />
                          نمایش در استوری
                        </label>
                      </div>
                    </div>

                    {selectedId ? (
                      <div className={styles.sectionBlock}>
                        <p className={styles.sectionTitle}>تصاویر</p>
                        <div className={styles.imagesGrid}>
                          {(detail?.images || []).map((img) => (
                            <div key={img.id} className={styles.imageCard}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.image_url || img.image}
                                alt=""
                              />
                              <button
                                type="button"
                                title="حذف"
                                onClick={() => onDeleteImage(img.id)}
                                disabled={busy}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <label className={styles.uploadBox}>
                            <ImagePlus size={20} />
                            افزودن
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                e.target.value = ''
                                if (file) onUploadImage(file)
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ) : null}

                    <div className={styles.actions}>
                      <button
                        type="submit"
                        className={styles.primaryBtn}
                        disabled={busy}
                      >
                        {busy ? (
                          <Loader2 size={15} className={styles.spin} />
                        ) : (
                          <Check size={15} />
                        )}
                        ذخیره تغییرات
                      </button>
                      <Link
                        href={`/shop/products/${selectedId}`}
                        className={styles.ghostBtn}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink size={14} />
                        مشاهده در سایت
                      </Link>
                      <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={deactivate}
                        disabled={busy || form.status === 'inactive'}
                      >
                        <Trash2 size={14} />
                        غیرفعال‌سازی
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </section>
          </div>
        )}
      </div>

      <CategoryPicker
        open={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        categories={categories}
        value={form.category}
        assignableOnly
        onSelect={(id) => setForm((f) => ({ ...f, category: id }))}
      />
    </Shell>
  )
}
