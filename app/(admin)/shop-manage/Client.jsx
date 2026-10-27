// app/(admin)/shop-manage — مدیریت محصولات فروشگاه
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import axios from 'axios'
import {
  Package,
  LayoutDashboard,
  RefreshCw,
  Star,
  ExternalLink,
  Shield,
  Plus,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import useShopMode from '@/hooks/useShopMode'
import platformShopApi from '@/services/platformShopApi'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './ShopManage.module.css'

const AdminProductCreateForm = nextDynamic(
  () => import('@/components/Admin/AdminProductCreateForm'),
  { ssr: false },
)

function ShopManageInner() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } =
    useAuth()
  const { singleStore, multiVendor } = useShopMode()
  const canManage =
    user?.is_superuser || user?.is_staff || canManageEmployees

  const [items, setItems] = useState([])
  const [shops, setShops] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [err, setErr] = useState(null)
  const [msg, setMsg] = useState(null)
  const [q, setQ] = useState('')
  const [creating, setCreating] = useState(false)

  const primaryShopId = useMemo(
    () => (shops[0]?.id != null ? String(shops[0].id) : ''),
    [shops],
  )
  const lockedShopId = singleStore ? primaryShopId : ''

  const loadMeta = useCallback(async () => {
    try {
      const [shopRes, cats] = await Promise.all([
        platformShopApi.listShops(),
        platformShopApi.listCategories(),
      ])
      setShops(shopRes?.results || [])
      setCategories(Array.isArray(cats) ? cats : cats?.results || [])
    } catch {
      /* فرم ایجاد در صورت خطا هم باز می‌شود؛ ارسال بعداً خطا می‌دهد */
    }
  }, [])

  const load = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    try {
      const res = await axios.get(
        Config.endpoints.shop.adminProducts({ q: q || undefined, page_size: 40 }),
        { headers: getAuthHeaders() },
      )
      setItems(res.data?.results || [])
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'بارگذاری ناموفق')
      setItems([])
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders, q])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent('/shop-manage')}`)
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated || !canManage) return
    load()
    loadMeta()
  }, [isAuthenticated, canManage, load, loadMeta])

  const toggleFeatured = async (p) => {
    try {
      await axios.patch(
        Config.endpoints.shop.adminProductDetail(p.id),
        { is_featured: !p.is_featured },
        { headers: getAuthHeaders() },
      )
      setMsg(`محصول #${p.id} به‌روز شد`)
      await load()
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }

  const startCreate = () => {
    setCreating(true)
    setErr(null)
    setMsg(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.stateBox}>
          <RefreshCw size={22} className={styles.spin} />
          <p>در حال بررسی دسترسی…</p>
        </div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page}>
        <div className={styles.denied}>
          <Shield size={28} />
          <h1>دسترسی محدود</h1>
          <p style={{ marginTop: 8 }}>
            برای افزودن محصول فروشگاه خود به{' '}
            <Link href="/shop-panel">پنل فروشگاه</Link> بروید.
          </p>
          <Link href="/dashboard" className={styles.solidBtn}>
            داشبورد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>
              <Package size={22} />
            </span>
            <div>
              <h1 className={styles.pageTitle}>مدیریت محصولات</h1>
              <p className={styles.pageDesc}>
                کاتالوگ فروشگاه — ایجاد، ویژه، تخفیف و موجودی
              </p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={startCreate}
              disabled={creating}
            >
              <Plus size={15} />
              محصول جدید
            </button>
            <Link href="/shop-panel" className={styles.ghostBtn}>
              پنل فروشگاه
            </Link>
            <Link href="/product-single" className={styles.ghostBtn}>
              تنظیمات سینگل
            </Link>
            {multiVendor ? (
              <Link href="/shops-products" className={styles.ghostBtn}>
                همه فروشگاه‌ها
              </Link>
            ) : null}
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={14} />
              داشبورد
            </Link>
            <button type="button" className={styles.ghostBtn} onClick={load}>
              <RefreshCw size={14} />
              بروزرسانی
            </button>
          </div>
        </header>

        {msg ? <div className={styles.msg}>{msg}</div> : null}
        {err ? <div className={styles.err}>{err}</div> : null}

        {creating ? (
          <div className={styles.createPanel}>
            <AdminProductCreateForm
              shops={shops}
              categories={categories}
              singleStore={singleStore}
              lockedShopId={lockedShopId}
              defaultShopId={lockedShopId || primaryShopId}
              onCancel={() => setCreating(false)}
              onCreated={async (created) => {
                setCreating(false)
                setMsg(
                  created?.id
                    ? `محصول «${created.title || created.id}» ثبت شد`
                    : 'محصول ثبت شد',
                )
                await load()
              }}
            />
          </div>
        ) : null}

        <section className={styles.card}>
          <div className={styles.field}>
            <label>جستجو</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') load()
              }}
              placeholder="عنوان محصول…"
            />
          </div>
          <div className={styles.itemActions} style={{ marginTop: '0.65rem' }}>
            <button type="button" className={styles.solidBtn} onClick={load}>
              اعمال جستجو
            </button>
            {!creating ? (
              <button
                type="button"
                className={styles.solidBtn}
                onClick={startCreate}
              >
                <Plus size={14} />
                ایجاد محصول
              </button>
            ) : null}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle} style={{ margin: 0 }}>
              محصولات ({items.length})
            </h2>
            {!creating ? (
              <button
                type="button"
                className={styles.solidBtn}
                onClick={startCreate}
              >
                <Plus size={14} />
                محصول جدید
              </button>
            ) : null}
          </div>
          {loadingData ? (
            <div className={styles.loadingCard}>
              <RefreshCw size={18} className={styles.spin} />
              بارگذاری…
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyState}>
              <strong>محصولی نیست</strong>
              <p>اولین محصول را همین‌جا ثبت کنید یا از پنل فروشگاه اضافه کنید.</p>
              <div className={styles.itemActions} style={{ marginTop: '0.85rem' }}>
                <button
                  type="button"
                  className={styles.solidBtn}
                  onClick={startCreate}
                >
                  <Plus size={14} />
                  ایجاد محصول
                </button>
                <Link href="/shop-panel" className={styles.miniBtn}>
                  رفتن به پنل فروشگاه
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>عنوان</th>
                    <th>قیمت</th>
                    <th>تخفیف</th>
                    <th>فروش</th>
                    <th>وضعیت</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td className={styles.mono}>{p.id}</td>
                      <td>
                        {p.title}
                        {p.is_featured ? (
                          <span
                            className={`${styles.badge} ${styles.badgeInfo}`}
                            style={{ marginRight: 6 }}
                          >
                            ویژه
                          </span>
                        ) : null}
                      </td>
                      <td className={styles.amount}>
                        {Number(
                          p.final_price ?? p.price_one ?? 0,
                        ).toLocaleString('fa-IR')}
                      </td>
                      <td>{p.discount || 0}%</td>
                      <td>{p.sales_count || 0}</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            p.status === 'active'
                              ? styles.badgeOk
                              : styles.badgeOff
                          }`}
                        >
                          {p.status === 'active' ? 'فعال' : p.status}
                        </span>
                      </td>
                      <td>
                        <div className={styles.itemActions}>
                          <button
                            type="button"
                            className={styles.miniBtn}
                            onClick={() => toggleFeatured(p)}
                          >
                            <Star size={12} />
                            {p.is_featured ? 'حذف ویژه' : 'ویژه'}
                          </button>
                          <Link
                            href={`/shop/products/${p.id}`}
                            className={styles.miniBtn}
                            target="_blank"
                          >
                            <ExternalLink size={12} />
                            مشاهده
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default function ShopManagePage() {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.SHOP}
      notFoundWhenInactive
    >
      <ShopManageInner />
    </ModuleGate>
  )
}
