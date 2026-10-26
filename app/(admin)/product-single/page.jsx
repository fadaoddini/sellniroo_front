// app/(admin)/product-single — تنظیمات ظاهر سینگل محصول
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, notFound } from 'next/navigation'
import {
  ShoppingBag,
  LayoutDashboard,
  RefreshCw,
  Save,
  CheckCircle2,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchSiteSettings,
  saveProductSinglePageSettings,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import {
  fetchSiteModules,
  isSiteModuleActive,
} from '@/services/siteModules'
import {
  DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS,
  PRODUCT_SINGLE_COMPOSITIONS,
  PRODUCT_SINGLE_TITLE_SIZES,
  applyProductSingleComposition,
  normalizeProductSinglePageSettings,
} from '@/config/productSinglePageSettings'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './ProductSingle.module.css'

const TOGGLE_FIELDS = [
  { key: 'show_breadcrumb', label: 'مسیر (breadcrumb)' },
  { key: 'show_back_link', label: 'لینک بازگشت' },
  { key: 'show_gallery', label: 'گالری تصویر' },
  { key: 'show_badges', label: 'نشان‌ها' },
  { key: 'show_featured_badge', label: 'نشان ویژه' },
  { key: 'show_discount_badge', label: 'نشان تخفیف' },
  { key: 'show_title', label: 'عنوان' },
  { key: 'show_shop', label: 'نام فروشگاه' },
  { key: 'show_category', label: 'دسته' },
  { key: 'show_rating', label: 'امتیاز' },
  { key: 'show_price', label: 'قیمت' },
  { key: 'show_old_price', label: 'قیمت قبل تخفیف' },
  { key: 'show_stock', label: 'موجودی' },
  { key: 'show_lid', label: 'خلاصه' },
  { key: 'show_description', label: 'توضیحات' },
  { key: 'show_add_to_cart', label: 'دکمه افزودن به سبد' },
  { key: 'show_wishlist', label: 'علاقه‌مندی' },
  { key: 'show_share', label: 'اشتراک‌گذاری' },
  { key: 'show_similar', label: 'محصولات مشابه' },
]

export default function ProductSingleAdminPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } =
    useAuth()
  const canAccess =
    user?.is_superuser ||
    user?.is_staff ||
    canManageEmployees

  const [form, setForm] = useState(() =>
    normalizeProductSinglePageSettings(DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS)
  )
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [moduleOn, setModuleOn] = useState(null)

  const load = useCallback(async () => {
    setLoadingData(true)
    setError('')
    try {
      await fetchSiteModules({ force: true })
      const active = await isSiteModuleActive(SITE_MODULE_KEYS.SHOP, {
        force: true,
      })
      setModuleOn(!!active)
      if (!active) return
      clearSiteSettingsCache()
      const settings = await fetchSiteSettings({ force: true })
      setForm(
        normalizeProductSinglePageSettings(
          settings?.product_single_page || DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS
        )
      )
    } catch (e) {
      setError(e?.message || 'خطا در بارگذاری')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccess) load()
  }, [isAuthenticated, canAccess, load])

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      const saved = await saveProductSinglePageSettings(form, getAuthHeaders())
      setForm(normalizeProductSinglePageSettings(saved))
      setToast('تنظیمات ذخیره شد')
      window.setTimeout(() => setToast(null), 2800)
    } catch (e) {
      setError(e?.message || 'ذخیره ناموفق')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !isAuthenticated) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.stateBox}>در حال بررسی دسترسی…</div>
      </div>
    )
  }

  if (!canAccess) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.denied}>
          <Shield size={28} />
          <h1>دسترسی محدود</h1>
          <Link href="/dashboard">داشبورد</Link>
        </div>
      </div>
    )
  }

  if (moduleOn === false) {
    notFound()
  }

  return (
    <div className={styles.page} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <ShoppingBag size={22} /> صفحه سینگل محصول
            </h1>
            <p className={styles.subtitle}>
              قالب نمایش، اجزا و رنگ‌های صفحهٔ محصول
            </p>
          </div>
          <div className={styles.actions}>
            <Link href="/shop-manage" className={styles.ghostBtn}>
              مدیریت محصولات
            </Link>
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={14} />
              داشبورد
            </Link>
            <button type="button" className={styles.ghostBtn} onClick={load}>
              <RefreshCw size={14} />
              بروزرسانی
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onSave}
              disabled={saving || moduleOn !== true}
            >
              <Save size={14} />
              {saving ? 'در حال ذخیره…' : 'ذخیره'}
            </button>
          </div>
        </header>

        {toast ? (
          <div className={styles.toastOk}>
            <CheckCircle2 size={16} /> {toast}
          </div>
        ) : null}
        {error ? <div className={styles.toastErr}>{error}</div> : null}

        {loadingData ? (
          <div className={styles.card}>در حال بارگذاری…</div>
        ) : (
          <>
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>قالب ترکیب</h2>
              <div className={styles.compGrid}>
                {PRODUCT_SINGLE_COMPOSITIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.compCard} ${
                      form.layout === c.id ? styles.compCardOn : ''
                    }`}
                    onClick={() =>
                      setForm(applyProductSingleComposition(form, c.id))
                    }
                  >
                    <strong>{c.label}</strong>
                    <small>{c.desc}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>اندازه عنوان</h2>
              <div className={styles.seg}>
                {PRODUCT_SINGLE_TITLE_SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={
                      form.title_size === s.id ? styles.segOn : undefined
                    }
                    onClick={() => {
                      patch('title_size', s.id)
                      patch('title_font_size', s.px)
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>نمایش اجزا</h2>
              <div className={styles.toggleGrid}>
                {TOGGLE_FIELDS.map((f) => (
                  <label key={f.key} className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={!!form[f.key]}
                      onChange={(e) => patch(f.key, e.target.checked)}
                    />
                    {f.label}
                  </label>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.cardTitle}>رنگ‌ها</h2>
              <div className={styles.colorGrid}>
                {[
                  ['ink_color', 'متن'],
                  ['muted_color', 'متن فرعی'],
                  ['accent_color', 'اکسنت'],
                  ['surface_bg', 'پس‌زمینه'],
                ].map(([key, label]) => (
                  <label key={key} className={styles.colorRow}>
                    <span>{label}</span>
                    <input
                      type="color"
                      value={
                        /^#[0-9a-fA-F]{6}$/.test(form[key])
                          ? form[key]
                          : '#ff00a6'
                      }
                      onChange={(e) => patch(key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
