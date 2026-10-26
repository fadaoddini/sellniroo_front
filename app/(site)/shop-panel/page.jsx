'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Check,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Settings2,
  ShoppingBag,
  Store,
  Wallet,
  X,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import shopOwnerApi from '@/services/shopOwnerApi'
import ProductFormExtras from './ProductFormExtras'
import {
  buildCategoryIndex,
  filterAssignableCategories,
  isLeafCategory,
} from './categoryTree'
import styles from './ShopPanel.module.css'

const NeshanMapPicker = dynamic(
  () => import('@/components/Shop/NeshanMapPicker'),
  {
    ssr: false,
    loading: () => (
      <p className={styles.mapLoading}>در حال بارگذاری نقشه نشان…</p>
    ),
  },
)

const CKEditorWrapper = dynamic(
  () => import('@/components/newsAdmin/CKEditorWrapper'),
  {
    ssr: false,
    loading: () => (
      <p className={styles.editorLoading}>در حال بارگذاری ویرایشگر…</p>
    ),
  },
)

const TABS = [
  { id: 'overview', label: 'نمای کلی', icon: LayoutDashboard },
  { id: 'orders', label: 'سفارش‌ها', icon: ShoppingBag },
  { id: 'products', label: 'محصولات', icon: Package },
  { id: 'settings', label: 'تنظیمات', icon: Settings2 },
]

const TRACK_STEPS = [
  { id: 'pending', label: 'در انتظار' },
  { id: 'getorder', label: 'دریافت' },
  { id: 'preparing', label: 'آماده‌سازی' },
  { id: 'picked_up', label: 'پیک' },
  { id: 'on_the_way', label: 'ارسال' },
  { id: 'delivered', label: 'تحویل' },
  { id: 'finished', label: 'پایان' },
]

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('fa-IR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return '—'
  }
}

function ShopPanelInner() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [dash, setDash] = useState(null)
  const [orders, setOrders] = useState([])
  const [orderFilter, setOrderFilter] = useState('all')
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [shopForm, setShopForm] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [needsCreate, setNeedsCreate] = useState(false)
  const [cities, setCities] = useState([])
  const [createForm, setCreateForm] = useState({
    title: '',
    city: '',
    mobile: '',
    address: '',
    bank_account_holder_name: '',
    bank_card_number: '',
    sheba_number: '',
    bank_account_number: '',
    latitude: null,
    longitude: null,
  })
  const emptyProductForm = {
    title: '',
    category: '',
    price_one: '',
    discount: '0',
    stock: '',
    lid: '',
    description: '',
    has_colors: false,
    has_sizes: false,
    is_virtual: false,
    has_warranty: false,
    warranty_until: '',
    is_featured: false,
    featured_until: '',
  }
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [priceTiers, setPriceTiers] = useState([])
  const [productImageFiles, setProductImageFiles] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [posterFile, setPosterFile] = useState(null)

  const resetProductForm = () => {
    setProductForm(emptyProductForm)
    setPriceTiers([])
    setProductImageFiles([])
    setSelectedColors([])
    setSelectedSizes([])
    setVideoFile(null)
    setPosterFile(null)
  }

  const [imageEditorId, setImageEditorId] = useState(null)
  const [productImages, setProductImages] = useState([])

  const productImagePreviews = useMemo(
    () =>
      productImageFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [productImageFiles],
  )

  useEffect(() => {
    return () => {
      productImagePreviews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [productImagePreviews])

  const shop = dash?.shop
  const stats = dash?.stats

  const applyShopForm = (s) => {
    setShopForm({
      title: s?.title || '',
      mobile: s?.mobile || '',
      address: s?.address || '',
      open_close_status: s?.open_close_status || 'open',
      delivery_fee: s?.delivery_fee ?? 0,
      free_delivery_threshold: s?.free_delivery_threshold ?? 0,
      preparation_time: s?.preparation_time ?? 0,
      bank_account_holder_name: s?.bank_account_holder_name || '',
      sheba_number: s?.sheba_number || '',
      bank_card_number: s?.bank_card_number || '',
      bank_account_number: s?.bank_account_number || '',
      morning_opening_time: s?.morning_opening_time || '09:00',
      morning_closing_time: s?.morning_closing_time || '13:00',
      evening_opening_time: s?.evening_opening_time || '16:00',
      evening_closing_time: s?.evening_closing_time || '21:00',
      latitude: s?.latitude != null ? Number(s.latitude) : null,
      longitude: s?.longitude != null ? Number(s.longitude) : null,
    })
  }

  const loadDashboard = useCallback(async () => {
    const data = await shopOwnerApi.dashboard()
    setDash(data)
    setNeedsCreate(false)
    applyShopForm(data.shop)
    return data
  }, [])

  const loadOrders = useCallback(async (filter = orderFilter) => {
    const params = {}
    if (filter === 'paid') params.payment = 'paid'
    if (filter === 'unpaid') params.payment = 'unpaid'
    if (filter === 'review') params.payment = 'review'
    const data = await shopOwnerApi.listOrders(params)
    setOrders(data.results || [])
  }, [orderFilter])

  const loadProducts = useCallback(async () => {
    const [p, c] = await Promise.all([
      shopOwnerApi.listProducts(),
      shopOwnerApi.listCategories(),
    ])
    setProducts(p.results || [])
    setCategories(Array.isArray(c) ? c : [])
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const me = await shopOwnerApi.getShop()
      const multiVendor = me?.multi_vendor === true
      const canCreate = me?.can_create === true || multiVendor

      if (!me?.has_shop) {
        // تک‌فروشگاهی: ساخت خودکار در بک‌اند؛ فرم ایجاد فقط برای چندفروشندگی
        if (!canCreate) {
          setNeedsCreate(false)
          setDash(null)
          setOrders([])
          setProducts([])
          setError(
            me?.single_store
              ? 'فروشگاه هنوز آماده نشده — دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.'
              : 'فروشگاهی به حساب شما متصل نیست. ماژول تک‌فروشگاهی یا چندفروشندگی را در adminmodule بررسی کنید.',
          )
          return
        }
        setNeedsCreate(true)
        setDash(null)
        setOrders([])
        setProducts([])
        setCities(Array.isArray(me?.cities) ? me.cities : [])
        setCreateForm((f) => ({
          ...f,
          mobile: me?.suggested_mobile || user?.mobile || f.mobile || '',
          city: me?.cities?.[0]?.id ? String(me.cities[0].id) : f.city,
        }))
        return
      }
      setNeedsCreate(false)
      await loadDashboard()
      await Promise.all([loadOrders(), loadProducts()])
    } catch (e) {
      if (e?.data?.code === 'no_owned_shop' || e?.status === 404) {
        const canCreate =
          e?.data?.can_create !== false && e?.data?.multi_vendor === true
        if (canCreate) {
          setNeedsCreate(true)
          setDash(null)
          setCities(Array.isArray(e?.data?.cities) ? e.data.cities : [])
          setError('')
        } else {
          setNeedsCreate(false)
          setDash(null)
          setError(
            e?.data?.single_store
              ? 'فروشگاه هنوز آماده نشده — صفحه را تازه کنید.'
              : e.message || 'فروشگاهی به حساب شما متصل نیست.',
          )
        }
      } else {
        setError(e.message || 'بارگذاری ناموفق')
        setDash(null)
      }
    } finally {
      setLoading(false)
    }
  }, [loadDashboard, loadOrders, loadProducts, user?.mobile])

  const createShop = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await shopOwnerApi.createShop({
        title: createForm.title.trim(),
        city: createForm.city ? Number(createForm.city) : undefined,
        mobile: createForm.mobile.trim(),
        address: createForm.address.trim(),
        bank_account_holder_name:
          createForm.bank_account_holder_name.trim() || undefined,
        bank_card_number: createForm.bank_card_number.trim() || undefined,
        sheba_number: createForm.sheba_number.trim() || undefined,
        bank_account_number: createForm.bank_account_number.trim() || undefined,
        latitude:
          createForm.latitude != null
            ? Number(Number(createForm.latitude).toFixed(6))
            : undefined,
        longitude:
          createForm.longitude != null
            ? Number(Number(createForm.longitude).toFixed(6))
            : undefined,
      })
      flash('فروشگاه شما ساخته شد')
      setNeedsCreate(false)
      await refreshAll()
    } catch (err) {
      setError(err.message || 'ثبت فروشگاه ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent('/shop-panel')}`)
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && !authLoading) refreshAll()
  }, [isAuthenticated, authLoading, refreshAll])

  useEffect(() => {
    if (!isAuthenticated || tab !== 'orders') return
    loadOrders(orderFilter).catch((e) => setError(e.message))
  }, [orderFilter, tab, isAuthenticated, loadOrders])

  const flash = (text) => {
    setMsg(text)
    setTimeout(() => setMsg(''), 2800)
  }

  const toggleOpen = async () => {
    if (!shopForm) return
    setBusy(true)
    setError('')
    try {
      const next = shopForm.open_close_status === 'open' ? 'closed' : 'open'
      const updated = await shopOwnerApi.updateShop({ open_close_status: next })
      setShopForm((s) => ({ ...s, open_close_status: updated.open_close_status }))
      setDash((d) =>
        d
          ? {
              ...d,
              shop: { ...d.shop, ...updated },
              stats: { ...d.stats, is_open: updated.open_close_status === 'open' },
            }
          : d,
      )
      flash(next === 'open' ? 'فروشگاه باز شد' : 'فروشگاه بسته شد')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const saveSettings = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const lat =
        shopForm.latitude != null && shopForm.latitude !== ''
          ? Number(Number(shopForm.latitude).toFixed(6))
          : null
      const lng =
        shopForm.longitude != null && shopForm.longitude !== ''
          ? Number(Number(shopForm.longitude).toFixed(6))
          : null
      const updated = await shopOwnerApi.updateShop({
        ...shopForm,
        delivery_fee: Number(shopForm.delivery_fee) || 0,
        free_delivery_threshold: Number(shopForm.free_delivery_threshold) || 0,
        preparation_time: Number(shopForm.preparation_time) || 0,
        latitude: lat,
        longitude: lng,
      })
      setDash((d) => (d ? { ...d, shop: { ...d.shop, ...updated } } : d))
      applyShopForm(updated)
      flash('تنظیمات ذخیره شد')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const setTracking = async (orderId, tracking_status) => {
    setBusy(true)
    setError('')
    try {
      await shopOwnerApi.updateOrder(orderId, { tracking_status })
      await loadOrders()
      flash('وضعیت سفارش به‌روز شد')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const reviewReceipt = async (orderId, payment_review_status) => {
    setBusy(true)
    setError('')
    try {
      await shopOwnerApi.updateOrder(orderId, { payment_review_status })
      await loadOrders()
      await loadDashboard()
      flash(
        payment_review_status === 'approved'
          ? 'رسید تأیید شد'
          : 'رسید رد شد',
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const openImageEditor = async (productId) => {
    setBusy(true)
    setError('')
    try {
      const detail = await shopOwnerApi.getProduct(productId)
      setImageEditorId(productId)
      setProductImages(detail?.images || [])
    } catch (err) {
      setError(err.message || 'بارگذاری تصاویر ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const uploadProductImage = async (productId, file) => {
    if (!productId || !file) return
    setBusy(true)
    setError('')
    try {
      await shopOwnerApi.uploadProductImage(productId, file)
      const detail = await shopOwnerApi.getProduct(productId)
      setProductImages(detail?.images || [])
      await loadProducts()
      flash('تصویر افزوده شد')
    } catch (err) {
      setError(err.message || 'آپلود تصویر ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const deleteProductImage = async (productId, imageId) => {
    setBusy(true)
    setError('')
    try {
      await shopOwnerApi.deleteProductImage(productId, imageId)
      const detail = await shopOwnerApi.getProduct(productId)
      setProductImages(detail?.images || [])
      await loadProducts()
      flash('تصویر حذف شد')
    } catch (err) {
      setError(err.message || 'حذف تصویر ناموفق')
    } finally {
      setBusy(false)
    }
  }

  const createProduct = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const tiersPayload = priceTiers
        .map((t) => ({
          min_quantity: Number(t.min_quantity) || 0,
          unit_price: Number(t.unit_price) || 0,
        }))
        .filter((t) => t.min_quantity >= 1 && t.unit_price >= 0)

      const stockNum = Number(productForm.stock)
      if (productForm.stock === '' || Number.isNaN(stockNum) || stockNum < 0) {
        throw new Error('موجودی محصول را وارد کنید')
      }

      if (!productForm.category) {
        throw new Error('دسته‌بندی را انتخاب کنید')
      }
      {
        const assignable = filterAssignableCategories(categories)
        const { byId, childrenOf } = buildCategoryIndex(assignable)
        const cat = byId.get(String(productForm.category))
        if (!cat || !isLeafCategory(cat, childrenOf)) {
          throw new Error(
            'فقط زیرمجموعه نهایی فعال قابل انتخاب است — دسته والد یا غیرفعال مجاز نیست',
          )
        }
      }
      if (productForm.has_colors && !selectedColors.length) {
        throw new Error('حداقل یک رنگ انتخاب کنید یا گزینه رنگ را خاموش کنید')
      }
      if (productForm.has_sizes && !selectedSizes.length) {
        throw new Error('حداقل یک سایز انتخاب کنید یا گزینه سایز را خاموش کنید')
      }
      if (productForm.has_warranty && !productForm.warranty_until) {
        throw new Error('تاریخ پایان ضمانت را مشخص کنید')
      }
      if (videoFile && videoFile.size > 50 * 1024 * 1024) {
        throw new Error('حجم ویدیو نباید بیشتر از ۵۰ مگابایت باشد')
      }

      const created = await shopOwnerApi.createProduct({
        title: productForm.title,
        category: Number(productForm.category),
        price_one: Number(productForm.price_one) || 0,
        discount: Number(productForm.discount) || 0,
        stock: stockNum,
        stock_remaining: stockNum,
        stock_total: stockNum,
        number_max: Math.max(stockNum, 1),
        lid: productForm.lid,
        description: productForm.description,
        price_tiers: tiersPayload,
        has_colors: !!productForm.has_colors,
        colors: productForm.has_colors ? selectedColors : [],
        has_sizes: !!productForm.has_sizes,
        sizes: productForm.has_sizes ? selectedSizes : [],
        is_virtual: !!productForm.is_virtual,
        has_warranty: !!productForm.has_warranty,
        warranty_until: productForm.has_warranty
          ? productForm.warranty_until
          : null,
        is_featured: !!productForm.is_featured,
        featured_until: productForm.is_featured
          ? productForm.featured_until || null
          : null,
      })
      if (created?.id && productImageFiles.length) {
        for (const file of productImageFiles) {
          await shopOwnerApi.uploadProductImage(created.id, file)
        }
      }
      if (created?.id && (videoFile || posterFile)) {
        await shopOwnerApi.uploadProductMedia(created.id, {
          video: videoFile || undefined,
          poster: posterFile || undefined,
        })
      }
      setShowProductForm(false)
      resetProductForm()
      setImageEditorId(created?.id || null)
      if (created?.id) {
        const detail = await shopOwnerApi.getProduct(created.id)
        setProductImages(detail?.images || [])
      }
      await loadProducts()
      await loadDashboard()
      flash(
        productImageFiles.length
          ? 'محصول و تصاویر ثبت شدند'
          : 'محصول اضافه شد',
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleProduct = async (p) => {
    setBusy(true)
    try {
      if (p.status === 'active') {
        await shopOwnerApi.deactivateProduct(p.id)
      } else {
        await shopOwnerApi.updateProduct(p.id, { status: 'active' })
      }
      await loadProducts()
      flash('وضعیت محصول تغییر کرد')
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleFeatured = async (p) => {
    try {
      await shopOwnerApi.updateProduct(p.id, { is_featured: !p.is_featured })
      await loadProducts()
    } catch (e) {
      setError(e.message)
    }
  }

  const unpaidReview = useMemo(
    () => orders.filter((o) => o.payment_review_status === 'under_review').length,
    [orders],
  )

  if (authLoading || (loading && !dash)) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <Loader2 className={styles.spin} size={26} />
          <p>در حال آماده‌سازی پنل فروشگاه…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (needsCreate) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.createHero}>
          <span className={styles.createIcon} aria-hidden>
            <Store size={20} strokeWidth={1.75} />
          </span>
          <h1>فروشگاه خودت را بساز</h1>
          <p>
            هنوز فروشگاهی به این حساب وصل نیست. با چند مشخصه ساده فروشگاهت را
            ثبت کن و سفارش‌ها را از همین‌جا مدیریت کن.
          </p>
        </div>

        {error ? <div className={styles.err}>{error}</div> : null}
        {msg ? <div className={styles.toast}>{msg}</div> : null}

        <form className={styles.formCard} onSubmit={createShop}>
          <h2>مشخصات فروشگاه</h2>
          <div className={styles.formGrid}>
            <label>
              نام فروشگاه *
              <input
                required
                placeholder="مثلاً سوپرمارکت نگین"
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </label>
            <label>
              شهر
              <select
                value={createForm.city}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, city: e.target.value }))
                }
              >
                <option value="">انتخاب شهر</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              موبایل تماس
              <input
                placeholder="09xxxxxxxxx"
                value={createForm.mobile}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, mobile: e.target.value }))
                }
              />
            </label>
            <label className={styles.full}>
              آدرس فروشگاه
              <textarea
                rows={2}
                placeholder="آدرس دقیق برای مشتریان و پیک"
                value={createForm.address}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, address: e.target.value }))
                }
              />
            </label>
            <div className={`${styles.full} ${styles.mapBlock}`}>
              <div className={styles.mapHead}>
                <MapPin size={15} />
                <span>موقعیت روی نقشه نشان</span>
              </div>
              <p className={styles.mapHint}>
                پین را روی محل فروشگاه بگذارید تا فاصله ارسال درست محاسبه شود.
              </p>
              <NeshanMapPicker
                key="create-shop-map"
                height={260}
                initialLat={createForm.latitude ?? 35.6892}
                initialLng={createForm.longitude ?? 51.389}
                onLocationSelect={(lat, lng) =>
                  setCreateForm((f) => ({
                    ...f,
                    latitude: lat,
                    longitude: lng,
                  }))
                }
                onAddressDetected={(text) =>
                  setCreateForm((f) => ({
                    ...f,
                    address: f.address?.trim() ? f.address : text,
                  }))
                }
              />
            </div>
            <label className={styles.full}>
              نام صاحب حساب (اختیاری)
              <input
                placeholder="نامی که روی کارت / شبا دیده می‌شود"
                value={createForm.bank_account_holder_name}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    bank_account_holder_name: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              شماره کارت (اختیاری)
              <input
                dir="ltr"
                value={createForm.bank_card_number}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    bank_card_number: e.target.value,
                  }))
                }
              />
            </label>
            <label>
              شبا (اختیاری)
              <input
                dir="ltr"
                value={createForm.sheba_number}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, sheba_number: e.target.value }))
                }
              />
            </label>
            <label className={styles.full}>
              شماره حساب (اختیاری)
              <input
                dir="ltr"
                value={createForm.bank_account_number}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    bank_account_number: e.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={busy}>
              {busy ? 'در حال ثبت…' : 'ایجاد فروشگاه'}
            </button>
            <Link href="/profile?tab=shop" className={styles.ghostBtn}>
              بازگشت به پروفایل
            </Link>
          </div>
        </form>
      </div>
    )
  }

  if (error && !dash) {
    return (
      <div className={styles.page}>
        <div className={styles.denied}>
          <Store size={32} />
          <h1>خطا در بارگذاری پنل</h1>
          <p>{error}</p>
          <div className={styles.deniedActions}>
            <button type="button" className={styles.primaryBtn} onClick={refreshAll}>
              تلاش دوباره
            </button>
            <Link href="/profile?tab=shop" className={styles.ghostBtn}>
              پروفایل مشتری
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.logoWrap}>
            {shop?.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shop.logo_url} alt="" />
            ) : (
              <Store size={18} strokeWidth={1.75} />
            )}
          </div>
          <div>
            <p className={styles.eyebrow}>پنل فروشگاه</p>
            <h1>{shop?.title || 'فروشگاه'}</h1>
            <p className={styles.sub}>
              {stats?.is_open ? 'باز' : 'بسته'}
              {user?.mobile || user?.username
                ? ` · ${user?.mobile || user?.username}`
                : ''}
            </p>
          </div>
        </div>
        <div className={styles.heroActions}>
          <button
            type="button"
            className={`${styles.toggleOpen} ${
              stats?.is_open ? styles.toggleOpenOn : ''
            }`}
            disabled={busy}
            onClick={toggleOpen}
          >
            {stats?.is_open ? 'بستن فروشگاه' : 'باز کردن'}
          </button>
          <button
            type="button"
            className={styles.iconRound}
            onClick={refreshAll}
            aria-label="بازنشانی"
          >
            <RefreshCw size={15} />
          </button>
          <Link href="/shop" className={styles.ghostBtn}>
            ویترین
          </Link>
        </div>
      </header>

      <nav className={styles.tabs} role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? styles.tabOn : ''}
              onClick={() => setTab(t.id)}
            >
              <Icon size={15} />
              {t.label}
              {t.id === 'orders' && unpaidReview > 0 ? (
                <span className={styles.tabBadge}>{unpaidReview}</span>
              ) : null}
            </button>
          )
        })}
      </nav>

      {msg ? <div className={styles.toast}>{msg}</div> : null}
      {error ? <div className={styles.err}>{error}</div> : null}

      {tab === 'overview' ? (
        <section className={styles.section}>
          <div className={styles.statGrid}>
            <article className={styles.statCard}>
              <span>سفارش امروز</span>
              <strong>{(stats?.orders_today || 0).toLocaleString('fa-IR')}</strong>
            </article>
            <article className={styles.statCard}>
              <span>درآمد پرداخت‌شده</span>
              <strong>{formatPrice(stats?.revenue_paid)} تومان</strong>
            </article>
            <article className={`${styles.statCard} ${styles.statWarn}`}>
              <span>پرداخت‌نشده</span>
              <strong>{(stats?.orders_unpaid || 0).toLocaleString('fa-IR')}</strong>
            </article>
            <article className={styles.statCard}>
              <span>محصولات فعال</span>
              <strong>
                {(stats?.products_active || 0).toLocaleString('fa-IR')}
                <small> / {(stats?.products_total || 0).toLocaleString('fa-IR')}</small>
              </strong>
            </article>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.panel}>
              <h2>وضعیت آماده‌سازی</h2>
              <div className={styles.trackStats}>
                {TRACK_STEPS.map((s) => (
                  <div key={s.id} className={styles.trackStat}>
                    <span>{s.label}</span>
                    <strong>
                      {(stats?.tracking?.[s.id] || 0).toLocaleString('fa-IR')}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.panel}>
              <h2>اقدام سریع</h2>
              <div className={styles.quickList}>
                <button type="button" onClick={() => setTab('orders')}>
                  مدیریت سفارش‌ها
                  {(stats?.awaiting_receipt || 0) + (stats?.under_review || 0) > 0
                    ? ` · ${(stats.awaiting_receipt || 0) + (stats.under_review || 0)} در صف رسید`
                    : ''}
                </button>
                <button type="button" onClick={() => { setTab('products'); setShowProductForm(true) }}>
                  افزودن محصول جدید
                </button>
                <button type="button" onClick={() => setTab('settings')}>
                  ویرایش حساب و ارسال
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'orders' ? (
        <section className={styles.section}>
          <div className={styles.filterRow}>
            {[
              { id: 'all', label: 'همه' },
              { id: 'paid', label: 'پرداخت‌شده' },
              { id: 'unpaid', label: 'پرداخت‌نشده' },
              { id: 'review', label: 'بررسی رسید' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={orderFilter === f.id ? styles.filterOn : ''}
                onClick={() => setOrderFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!orders.length ? (
            <div className={styles.empty}>هنوز سفارشی برای این فروشگاه نیست.</div>
          ) : (
            <ul className={styles.orderList}>
              {orders.map((o) => {
                const paid = o.is_paid || o.status === 'paid'
                const track = o.tracking?.status || o.fulfillment_status || 'pending'
                return (
                  <li key={o.id} className={styles.orderCard}>
                    <div className={styles.orderTop}>
                      <div>
                        <strong>سفارش #{o.id}</strong>
                        <p>
                          {o.customer?.name || 'مشتری'}
                          {o.customer?.mobile ? ` · ${o.customer.mobile}` : ''}
                        </p>
                        <time>{formatDate(o.created_at)}</time>
                      </div>
                      <div className={styles.orderSide}>
                        <span
                          className={`${styles.badge} ${
                            paid ? styles.badgePaid : styles.badgeUnpaid
                          }`}
                        >
                          {o.status_label || (paid ? 'پرداخت‌شده' : 'پرداخت‌نشده')}
                        </span>
                        <strong className={styles.orderPrice}>
                          {formatPrice(o.final_price)} تومان
                        </strong>
                      </div>
                    </div>

                    <div className={styles.chips}>
                      {o.payment_mode === 'wallet' ? (
                        <span className={styles.chipWallet}>
                          <Wallet size={12} /> کیف پول
                        </span>
                      ) : (
                        <span className={styles.chip}>
                          {o.payment_mode_label || o.payment_mode}
                        </span>
                      )}
                      {o.pickup_from_shop ? (
                        <span className={styles.chip}>حضوری</span>
                      ) : (
                        <span className={styles.chip}>ارسال</span>
                      )}
                      {Number(o.wallet_amount) > 0 ? (
                        <span className={styles.chip}>
                          کیف پول {formatPrice(o.wallet_amount)}
                        </span>
                      ) : null}
                    </div>

                    {o.items?.length ? (
                      <ul className={styles.itemMini}>
                        {o.items.map((it) => (
                          <li key={it.id}>
                            {it.product_name} ×{' '}
                            {(it.quantity || 0).toLocaleString('fa-IR')}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <div className={styles.trackRow}>
                      {TRACK_STEPS.filter((s) => s.id !== 'archived').map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          disabled={busy}
                          className={track === s.id ? styles.trackOn : ''}
                          onClick={() => setTracking(o.id, s.id)}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>

                    {o.payment_mode === 'manual' &&
                    (o.payment_review_status === 'under_review' ||
                      o.payment_review_status === 'awaiting_receipt' ||
                      o.payment_receipt_url) ? (
                      <div className={styles.receiptBox}>
                        <div>
                          <strong>رسید واریز دستی</strong>
                          <p>
                            {o.payment_review_status === 'under_review'
                              ? 'در انتظار تأیید شما'
                              : o.payment_review_status === 'awaiting_receipt'
                                ? 'مشتری هنوز رسید نفرستاده'
                                : o.payment_review_status}
                          </p>
                          {o.payment_receipt_note ? (
                            <small>{o.payment_receipt_note}</small>
                          ) : null}
                        </div>
                        <div className={styles.receiptActions}>
                          {o.payment_receipt_url ? (
                            <a
                              href={o.payment_receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.ghostBtn}
                            >
                              مشاهده رسید
                            </a>
                          ) : null}
                          {o.payment_review_status === 'under_review' ? (
                            <>
                              <button
                                type="button"
                                className={styles.okBtn}
                                disabled={busy}
                                onClick={() => reviewReceipt(o.id, 'approved')}
                              >
                                <Check size={14} /> تأیید
                              </button>
                              <button
                                type="button"
                                className={styles.noBtn}
                                disabled={busy}
                                onClick={() => reviewReceipt(o.id, 'rejected')}
                              >
                                <X size={14} /> رد
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ) : null}

      {tab === 'products' ? (
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <h2>محصولات فروشگاه</h2>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setShowProductForm((v) => !v)}
            >
              <Plus size={15} />
              محصول جدید
            </button>
          </div>

          {showProductForm ? (
            <form
              className={`${styles.formCard} ${styles.productForm}`}
              onSubmit={createProduct}
            >
              <div className={styles.formHead}>
                <div>
                  <h3>محصول جدید</h3>
                  <p>عنوان، دسته، قیمت، تصویر و ویژگی‌ها</p>
                </div>
                <button
                  type="button"
                  className={styles.iconRound}
                  aria-label="بستن"
                  onClick={() => {
                    setShowProductForm(false)
                    resetProductForm()
                  }}
                >
                  <X size={15} />
                </button>
              </div>

              <div className={styles.productFormCols} dir="rtl">
                <div className={`${styles.fieldGroup} ${styles.colMain}`}>
                  <p className={styles.fieldGroupTitle}>محصول</p>
                  <div className={styles.formStack}>
                    <label>
                      عنوان محصول
                      <input
                        required
                        placeholder="مثلاً برنج طارم یک کیلو"
                        value={productForm.title}
                        onChange={(e) =>
                          setProductForm((f) => ({
                            ...f,
                            title: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className={`${styles.fieldGroup} ${styles.colPrice}`}>
                  <p className={styles.fieldGroupTitle}>قیمت و موجودی</p>
                  <div className={styles.formStack}>
                    <label>
                      قیمت پایه هر عدد (تومان)
                      <input
                        required
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="0"
                        value={productForm.price_one}
                        onChange={(e) =>
                          setProductForm((f) => ({
                            ...f,
                            price_one: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <div className={styles.priceRow}>
                      <label>
                        تخفیف ٪
                        <input
                          type="number"
                          min="0"
                          max="100"
                          inputMode="numeric"
                          value={productForm.discount}
                          onChange={(e) =>
                            setProductForm((f) => ({
                              ...f,
                              discount: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label>
                        موجودی *
                        <input
                          required
                          type="number"
                          min="0"
                          inputMode="numeric"
                          placeholder="مثلاً ۵۰"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm((f) => ({
                              ...f,
                              stock: e.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                    <div className={styles.tierBlock}>
                      <div className={styles.tierHead}>
                        <span>قیمت تعدادی (اختیاری)</span>
                        <button
                          type="button"
                          className={styles.tierAddBtn}
                          onClick={() =>
                            setPriceTiers((rows) => [
                              ...rows,
                              { min_quantity: '', unit_price: '' },
                            ])
                          }
                        >
                          <Plus size={13} />
                          پله جدید
                        </button>
                      </div>
                      <p className={styles.fileHint}>
                        مثال: از ۳ عدد به بالا هر عدد قیمت جداگانه
                      </p>
                      {priceTiers.map((tier, idx) => (
                        <div key={`tier-${idx}`} className={styles.tierRow}>
                          <label>
                            از تعداد
                            <input
                              type="number"
                              min="2"
                              inputMode="numeric"
                              placeholder="۳"
                              value={tier.min_quantity}
                              onChange={(e) =>
                                setPriceTiers((rows) =>
                                  rows.map((r, i) =>
                                    i === idx
                                      ? { ...r, min_quantity: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </label>
                          <label>
                            قیمت هر عدد
                            <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              placeholder="تومان"
                              value={tier.unit_price}
                              onChange={(e) =>
                                setPriceTiers((rows) =>
                                  rows.map((r, i) =>
                                    i === idx
                                      ? { ...r, unit_price: e.target.value }
                                      : r,
                                  ),
                                )
                              }
                            />
                          </label>
                          <button
                            type="button"
                            className={styles.tierRemoveBtn}
                            title="حذف پله"
                            onClick={() =>
                              setPriceTiers((rows) =>
                                rows.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`${styles.fieldGroup} ${styles.colMedia}`}>
                  <p className={styles.fieldGroupTitle}>تصاویر</p>
                  <label className={styles.dropZone}>
                    <input
                      className={styles.dropZoneInput}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        setProductImageFiles(
                          Array.from(e.target.files || []).slice(0, 8),
                        )
                      }
                    />
                    <span className={styles.dropZoneIcon}>
                      <ImagePlus size={20} strokeWidth={1.6} />
                    </span>
                    <strong>انتخاب تصویر</strong>
                    <span>حداکثر ۸ تصویر</span>
                  </label>
                  {productImagePreviews.length ? (
                    <div className={styles.previewGrid}>
                      {productImagePreviews.map((item, idx) => (
                        <div
                          key={`${item.name}-${idx}`}
                          className={styles.previewThumb}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.url} alt="" />
                          <button
                            type="button"
                            title="حذف"
                            onClick={() =>
                              setProductImageFiles((files) =>
                                files.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.fileHint}>
                      بعداً هم می‌توانید تصویر اضافه کنید.
                    </p>
                  )}
                </div>

                <div className={`${styles.fieldGroup} ${styles.colDesc}`}>
                  <p className={styles.fieldGroupTitle}>توضیحات</p>
                  <div className={styles.formStack}>
                    <div className={styles.editorField}>
                      <span className={styles.editorLabel}>توضیح کوتاه</span>
                      <div className={styles.editorShell}>
                        <CKEditorWrapper
                          key="product-lid"
                          value={productForm.lid}
                          placeholder="خلاصه کوتاه برای کارت محصول…"
                          onChange={(html) =>
                            setProductForm((f) => ({ ...f, lid: html }))
                          }
                        />
                      </div>
                    </div>
                    <div className={styles.editorField}>
                      <span className={styles.editorLabel}>توضیحات کامل</span>
                      <div className={styles.editorShell}>
                        <CKEditorWrapper
                          key="product-description"
                          value={productForm.description}
                          placeholder="جزئیات، ویژگی‌ها یا شرایط ارسال…"
                          onChange={(html) =>
                            setProductForm((f) => ({
                              ...f,
                              description: html,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <ProductFormExtras
                form={productForm}
                setForm={setProductForm}
                categories={categories}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                videoFile={videoFile}
                setVideoFile={setVideoFile}
                posterFile={posterFile}
                setPosterFile={setPosterFile}
              />

              <div className={styles.formActions}>
                <button
                  type="submit"
                  className={styles.primaryBtn}
                  disabled={busy}
                >
                  {busy ? (
                    <>
                      <Loader2 size={15} className={styles.spin} />
                      در حال ثبت…
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      ثبت محصول
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => {
                    setShowProductForm(false)
                    resetProductForm()
                  }}
                >
                  انصراف
                </button>
              </div>
            </form>
          ) : null}

          <div className={styles.productGrid}>
            {products.map((p) => (
              <article key={p.id} className={styles.productCard}>
                <div className={styles.productImg}>
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt="" />
                  ) : (
                    <Package size={22} />
                  )}
                </div>
                <div className={styles.productBody}>
                  <h3>{p.title}</h3>
                  <p>{p.category_title}</p>
                  <strong>
                    {formatPrice(p.final_price ?? p.price_one)} تومان
                    {p.discount ? (
                      <span className={styles.disc}> {p.discount}٪</span>
                    ) : null}
                  </strong>
                  <p>
                    موجودی:{' '}
                    {p.stock_remaining != null
                      ? Number(p.stock_remaining).toLocaleString('fa-IR')
                      : '—'}
                    {p.price_tiers?.length
                      ? ` · ${p.price_tiers.length.toLocaleString('fa-IR')} پله قیمت`
                      : ''}
                  </p>
                  <div className={styles.metaChips}>
                    {p.is_currently_featured || p.is_featured ? (
                      <span className={styles.metaChip}>ویژه</span>
                    ) : null}
                    {p.is_virtual ? (
                      <span className={styles.metaChip}>مجازی</span>
                    ) : null}
                    {p.has_colors ? (
                      <span className={styles.metaChip}>رنگ</span>
                    ) : null}
                    {p.has_sizes ? (
                      <span className={styles.metaChip}>سایز</span>
                    ) : null}
                    {p.has_warranty ? (
                      <span className={styles.metaChip}>ضمانت</span>
                    ) : null}
                    {p.has_video || p.video_url ? (
                      <span className={styles.metaChip}>ویدیو</span>
                    ) : null}
                  </div>
                  <div className={styles.productActions}>
                    <button
                      type="button"
                      className={
                        imageEditorId === p.id ? styles.chipOn : styles.chip
                      }
                      onClick={() =>
                        imageEditorId === p.id
                          ? setImageEditorId(null)
                          : openImageEditor(p.id)
                      }
                      disabled={busy}
                    >
                      <ImagePlus size={13} />
                      تصویر
                    </button>
                    <button
                      type="button"
                      className={p.is_featured ? styles.chipOn : styles.chip}
                      onClick={() => toggleFeatured(p)}
                    >
                      ویژه
                    </button>
                    <button
                      type="button"
                      className={
                        p.status === 'active' ? styles.okBtn : styles.noBtn
                      }
                      onClick={() => toggleProduct(p)}
                    >
                      {p.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </button>
                  </div>
                  {imageEditorId === p.id ? (
                    <div className={styles.imageEditor}>
                      <div className={styles.imagesGrid}>
                        {productImages.map((img) => (
                          <div key={img.id} className={styles.imageCard}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.image_url || img.image} alt="" />
                            <button
                              type="button"
                              title="حذف"
                              disabled={busy}
                              onClick={() => deleteProductImage(p.id, img.id)}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                        <label className={styles.imageAdd}>
                          <ImagePlus size={18} />
                          <span>افزودن</span>
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={busy}
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              e.target.value = ''
                              if (file) uploadProductImage(p.id, file)
                            }}
                          />
                        </label>
                      </div>
                      {!productImages.length ? (
                        <p className={styles.fileHint}>
                          هنوز تصویری ثبت نشده — یکی اضافه کنید.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'settings' && shopForm ? (
        <section className={styles.section}>
          <form className={styles.formCard} onSubmit={saveSettings}>
            <h2>تنظیمات فروشگاه</h2>
            <div className={styles.formGrid}>
              <label>
                نام فروشگاه
                <input
                  value={shopForm.title}
                  onChange={(e) =>
                    setShopForm((s) => ({ ...s, title: e.target.value }))
                  }
                />
              </label>
              <label>
                موبایل
                <input
                  value={shopForm.mobile}
                  onChange={(e) =>
                    setShopForm((s) => ({ ...s, mobile: e.target.value }))
                  }
                />
              </label>
              <label className={styles.full}>
                آدرس
                <textarea
                  rows={2}
                  value={shopForm.address}
                  onChange={(e) =>
                    setShopForm((s) => ({ ...s, address: e.target.value }))
                  }
                />
              </label>
              <div className={`${styles.full} ${styles.mapBlock}`}>
                <div className={styles.mapHead}>
                  <MapPin size={15} />
                  <span>موقعیت روی نقشه نشان</span>
                  {shopForm.latitude != null && shopForm.longitude != null ? (
                    <small dir="ltr">
                      {Number(shopForm.latitude).toFixed(5)},{' '}
                      {Number(shopForm.longitude).toFixed(5)}
                    </small>
                  ) : (
                    <small>هنوز انتخاب نشده</small>
                  )}
                </div>
                <p className={styles.mapHint}>
                  نقشه را جابه‌جا کنید تا پین روی محل فروشگاه قرار گیرد.
                </p>
                <NeshanMapPicker
                  key={`owner-shop-map-${shop?.id || 'x'}`}
                  height={280}
                  initialLat={shopForm.latitude ?? 35.6892}
                  initialLng={shopForm.longitude ?? 51.389}
                  onLocationSelect={(lat, lng) =>
                    setShopForm((s) => ({
                      ...s,
                      latitude: lat,
                      longitude: lng,
                    }))
                  }
                  onAddressDetected={(text) =>
                    setShopForm((s) => ({
                      ...s,
                      address: s.address?.trim() ? s.address : text,
                    }))
                  }
                />
              </div>
              <label>
                هزینه ارسال پایه
                <input
                  type="number"
                  value={shopForm.delivery_fee}
                  onChange={(e) =>
                    setShopForm((s) => ({ ...s, delivery_fee: e.target.value }))
                  }
                />
              </label>
              <label>
                آستانه ارسال رایگان
                <input
                  type="number"
                  value={shopForm.free_delivery_threshold}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      free_delivery_threshold: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                زمان آماده‌سازی (دقیقه)
                <input
                  type="number"
                  value={shopForm.preparation_time}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      preparation_time: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                وضعیت
                <select
                  value={shopForm.open_close_status}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      open_close_status: e.target.value,
                    }))
                  }
                >
                  <option value="open">باز</option>
                  <option value="closed">بسته</option>
                </select>
              </label>
              <label>
                ساعت صبح (از)
                <input
                  type="time"
                  value={shopForm.morning_opening_time}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      morning_opening_time: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                ساعت صبح (تا)
                <input
                  type="time"
                  value={shopForm.morning_closing_time}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      morning_closing_time: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                ساعت عصر (از)
                <input
                  type="time"
                  value={shopForm.evening_opening_time}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      evening_opening_time: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                ساعت عصر (تا)
                <input
                  type="time"
                  value={shopForm.evening_closing_time}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      evening_closing_time: e.target.value,
                    }))
                  }
                />
              </label>
              <label className={styles.full}>
                نام صاحب حساب
                <input
                  placeholder="نام فردی که حساب / کارت به نام اوست"
                  value={shopForm.bank_account_holder_name}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      bank_account_holder_name: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                شماره کارت
                <input
                  dir="ltr"
                  value={shopForm.bank_card_number}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      bank_card_number: e.target.value,
                    }))
                  }
                />
              </label>
              <label>
                شبا
                <input
                  dir="ltr"
                  value={shopForm.sheba_number}
                  onChange={(e) =>
                    setShopForm((s) => ({ ...s, sheba_number: e.target.value }))
                  }
                />
              </label>
              <label>
                شماره حساب
                <input
                  dir="ltr"
                  value={shopForm.bank_account_number}
                  onChange={(e) =>
                    setShopForm((s) => ({
                      ...s,
                      bank_account_number: e.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryBtn} disabled={busy}>
                ذخیره تنظیمات
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  )
}

export default function ShopPanelPage() {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.SHOP}
      notFoundWhenInactive
    >
      <ShopPanelInner />
    </ModuleGate>
  )
}
