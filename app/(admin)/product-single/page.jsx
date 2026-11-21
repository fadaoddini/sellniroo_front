// app/(admin)/product-single — تنظیمات کامل سینگل محصول (تب‌بندی)
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
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import { getShopDesignPageNav } from '@/components/Admin/shopDesignNav'
import {
  isPlatformOwner,
  OWNER_PROFILE,
} from '@/utils/ownerAccess'
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
  PRODUCT_SINGLE_ADMIN_TABS,
  PRODUCT_SINGLE_BLOCK_TOGGLES,
  PRODUCT_SINGLE_COLOR_FIELDS,
  PRODUCT_SINGLE_COLOR_GROUPS,
  PRODUCT_SINGLE_CTA_STYLES,
  PRODUCT_SINGLE_FONTS,
  PRODUCT_SINGLE_GALLERY_FITS,
  PRODUCT_SINGLE_GALLERY_RATIOS,
  PRODUCT_SINGLE_IMAGE_HOVERS,
  PRODUCT_SINGLE_SKELETONS,
  PRODUCT_SINGLE_THUMB_PLACEMENTS,
  PRODUCT_SINGLE_THUMB_POSITIONS,
  PRODUCT_SINGLE_TITLE_SIZES,
  PRODUCT_SINGLE_DETAIL_BLOCKS,
  applyProductSingleComposition,
  moveProductSingleDetailBlock,
  normalizeProductSingleDetailBlocksOrder,
  normalizeProductSinglePageSettings,
  productSingleIsTwoCol,
  productSingleLayoutFamily,
} from '@/config/productSinglePageSettings'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from './ProductSingle.module.css'

function SkeletonPreview({ skeleton, family }) {
  const fam =
    family ||
    (skeleton === 'pdp_cover'
      ? 'cover'
      : skeleton === 'pdp_magazine'
        ? 'stack'
        : skeleton === 'pdp_classic'
          ? 'classic'
          : 'two_col')

  if (fam === 'cover') {
    return (
      <div className={`${styles.skel} ${styles.skelCover}`} aria-hidden>
        <i className={styles.skelImg} />
        <div className={styles.skelThumbsV}>
          <i /><i /><i />
        </div>
        <i className={styles.skelLine} />
      </div>
    )
  }
  if (fam === 'stack') {
    return (
      <div className={`${styles.skel} ${styles.skelMag}`} aria-hidden>
        <i className={styles.skelLineWide} />
        <i className={styles.skelLine} />
        <div className={styles.skelMagImg}>
          <i className={styles.skelImgWide} />
          <div className={styles.skelThumbsH}>
            <i /><i /><i />
          </div>
        </div>
        <i className={styles.skelBtn} />
      </div>
    )
  }
  if (fam === 'classic' || skeleton === 'pdp_classic') {
    return (
      <div className={`${styles.skel} ${styles.skelClassic}`} aria-hidden>
        <div className={styles.skelThumbsV}>
          <i /><i /><i />
        </div>
        <i className={styles.skelImg} />
        <div className={styles.skelSide}>
          <i className={styles.skelLineWide} />
          <i className={styles.skelLine} />
          <i className={styles.skelBtn} />
        </div>
      </div>
    )
  }
  return (
    <div className={`${styles.skel} ${styles.skelSplit}`} aria-hidden>
      <div className={styles.skelGalCol}>
        <i className={styles.skelImg} />
        <div className={styles.skelThumbsH}>
          <i /><i /><i />
        </div>
      </div>
      <div className={styles.skelSide}>
        <i className={styles.skelLineWide} />
        <i className={styles.skelLine} />
        <i className={styles.skelBtn} />
      </div>
    </div>
  )
}

function Seg({ options, value, onChange, cols }) {
  return (
    <div
      className={styles.seg}
      style={{
        gridTemplateColumns: `repeat(${cols || Math.min(options.length, 4)}, 1fr)`,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={value === opt.id ? styles.segOn : undefined}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ColorField({ label, value, fallback, allowTransparent, onChange }) {
  const isTransparent = String(value || '').toLowerCase() === 'transparent'
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value || '')
    ? value
    : fallback
  return (
    <div className={styles.colorField}>
      <div className={styles.colorFieldTop}>
        <span>{label}</span>
        {allowTransparent ? (
          <button
            type="button"
            className={`${styles.chip} ${isTransparent ? styles.chipOn : ''}`}
            onClick={() => onChange(isTransparent ? fallback : 'transparent')}
          >
            شفاف
          </button>
        ) : null}
      </div>
      <div className={styles.colorControls}>
        <input
          className={styles.colorHex}
          dir="ltr"
          value={isTransparent ? 'transparent' : value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fallback}
        />
        <input
          className={styles.colorSwatch}
          type="color"
          disabled={isTransparent}
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
      </div>
    </div>
  )
}

function PxField({ label, value, onChange, min = 0, max = 200 }) {
  return (
    <label className={styles.pxField}>
      <span>{label}</span>
      <span className={styles.pxInput}>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          dir="ltr"
        />
        <em>px</em>
      </span>
    </label>
  )
}

export default function ProductSingleAdminPage({ embedded = false } = {}) {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } =
    useAuth()
  const canAccess =
    user?.is_superuser || user?.is_staff || canManageEmployees
  const isOwner = isPlatformOwner(user)
  const inPortal = !embedded && isOwner
  const nestChrome = embedded || inPortal

  const displayName =
    user?.display_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    OWNER_PROFILE.name

  const [form, setForm] = useState(() =>
    normalizeProductSinglePageSettings(DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS)
  )
  const [tab, setTab] = useState('skeleton')
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [moduleOn, setModuleOn] = useState(null)

  const wrapPortal = (node) => {
    if (!inPortal) return node
    return (
      <OwnerPortalShell
        brand="وب"
        brandAccent="ادمین "
        tagline="اجزای صفحه محصول"
        title="سینگل محصول"
        wide
        pageNav={getShopDesignPageNav('/product-single')}
        loading={loading}
        isAuthenticated={isAuthenticated}
        allowed={!!canAccess}
        user={user}
        displayName={displayName}
        deniedTitle="دسترسی محدود"
        deniedMessage="تنظیمات سینگل فقط برای کارکنان مجاز است."
        deniedHomeHref="/dashboard"
      >
        {node}
      </OwnerPortalShell>
    )
  }

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
  const patchMany = (obj) => setForm((prev) => ({ ...prev, ...obj }))

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
    return wrapPortal(
      <div className={styles.page} dir="rtl">
        <div className={styles.stateBox}>در حال بررسی دسترسی…</div>
      </div>,
    )
  }

  if (!canAccess) {
    return wrapPortal(
      <div className={styles.page} dir="rtl">
        <div className={styles.denied}>
          <Shield size={28} />
          <h1>دسترسی محدود</h1>
          {!nestChrome ? <Link href="/dashboard">داشبورد</Link> : null}
          <p style={{ marginTop: 8, fontSize: 13 }}>
            تنظیمات سینگل فقط برای کارکنان مجاز است.
          </p>
        </div>
      </div>,
    )
  }

  if (moduleOn === false) {
    if (nestChrome) {
      return wrapPortal(
        <div
          className={styles.page}
          dir="rtl"
          style={
            inPortal
              ? { minHeight: 0, padding: 0, background: 'transparent' }
              : undefined
          }
        >
          <div className={styles.denied}>
            <h1>ماژول فروشگاه خاموش است</h1>
          </div>
        </div>,
      )
    }
    notFound()
  }

  const groups = {
    nav: 'ناوبری',
    media: 'رسانه',
    meta: 'متادیتا',
    content: 'محتوا',
    price: 'قیمت',
    actions: 'اکشن‌ها',
    share: 'پیام‌رسان‌ها',
    extra: 'سایر',
  }

  return wrapPortal(
    <div
      className={`${styles.page}${nestChrome ? ` ${styles.embeddedInHub || ''}` : ''}`}
      dir="rtl"
      style={
        nestChrome
          ? { minHeight: 0, padding: 0, background: 'transparent' }
          : undefined
      }
    >
      <div
        className={styles.wrap}
        style={nestChrome ? { maxWidth: 'none', padding: 0 } : undefined}
      >
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <ShoppingBag size={22} /> صفحه سینگل محصول
            </h1>
            <p className={styles.subtitle}>
              اسکلتون، اجزا، گالری، سبد/علاقه، فونت، اندازه و رنگ — همه از اینجا
            </p>
          </div>
          <div className={styles.actions}>
            {!nestChrome ? (
              <>
                <Link href="/adminweb?mode=product_single" className={styles.ghostBtn}>
                  چیدمان صفحه‌ساز <ExternalLink size={13} />
                </Link>
                <Link href="/dashboard/my-shop?tab=products" className={styles.ghostBtn}>
                  محصولات
                </Link>
                <Link href="/dashboard/my-shop" className={styles.ghostBtn}>
                  فروشگاه من
                </Link>
                <Link href="/dashboard" className={styles.ghostBtn}>
                  <LayoutDashboard size={14} />
                  داشبورد
                </Link>
              </>
            ) : (
              <Link href="/shopdesign" className={styles.ghostBtn}>
                طراحی فروشگاه <ExternalLink size={13} />
              </Link>
            )}
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
            <nav className={styles.tabs} aria-label="بخش‌های تنظیمات">
              {PRODUCT_SINGLE_ADMIN_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`${styles.tab} ${
                    tab === t.id ? styles.tabOn : ''
                  }`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {tab === 'skeleton' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>۴ اسکلتون با جانمایی متفاوت</h2>
                <p className={styles.cardHint}>
                  هر اسکلتون چیدمان، درصد ستون، ارتفاع تصویر و سبک دکمه را پایه
                  می‌گذارد؛ بعد در تب گالری جزئیات را عوض کنید.
                </p>
                <div className={styles.compGrid}>
                  {PRODUCT_SINGLE_SKELETONS.map((c) => (
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
                      <SkeletonPreview
                        skeleton={c.skeleton}
                        family={c.family}
                      />
                      <strong>{c.label}</strong>
                      <small>{c.desc}</small>
                    </button>
                  ))}
                </div>
                <div className={styles.toggleGrid} style={{ marginTop: '1rem' }}>
                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={!!form.show_on_desktop}
                      onChange={(e) => patch('show_on_desktop', e.target.checked)}
                    />
                    نمایش در دسکتاپ
                  </label>
                  <label className={styles.toggleRow}>
                    <input
                      type="checkbox"
                      checked={!!form.show_on_mobile}
                      onChange={(e) => patch('show_on_mobile', e.target.checked)}
                    />
                    نمایش در موبایل
                  </label>
                </div>
              </section>
            ) : null}

            {tab === 'blocks' ? (
              <>
                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>چینش کنار تصویر</h2>
                  <p className={styles.cardHint}>
                    ترتیب ردیف‌های ستون اطلاعات کنار گالری را تنظیم کنید.
                  </p>
                  <div className={styles.orderList}>
                    {normalizeProductSingleDetailBlocksOrder(
                      form.detail_blocks_order
                    ).map((blockId, index, list) => {
                      const meta =
                        PRODUCT_SINGLE_DETAIL_BLOCKS.find(
                          (b) => b.id === blockId
                        ) || { id: blockId, label: blockId, showKey: null }
                      const showKey = meta.showKey
                      const enabled = showKey ? !!form[showKey] : true
                      return (
                        <div key={blockId} className={styles.orderRow}>
                          <span className={styles.orderIndex}>
                            {(index + 1).toLocaleString('fa-IR')}
                          </span>
                          <span className={styles.orderText}>
                            <strong>{meta.label}</strong>
                            {meta.desc ? <small>{meta.desc}</small> : null}
                          </span>
                          <span className={styles.orderActions}>
                            <button
                              type="button"
                              className={styles.orderBtn}
                              disabled={index === 0}
                              onClick={() =>
                                patch(
                                  'detail_blocks_order',
                                  moveProductSingleDetailBlock(
                                    form.detail_blocks_order,
                                    blockId,
                                    'up'
                                  )
                                )
                              }
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className={styles.orderBtn}
                              disabled={index === list.length - 1}
                              onClick={() =>
                                patch(
                                  'detail_blocks_order',
                                  moveProductSingleDetailBlock(
                                    form.detail_blocks_order,
                                    blockId,
                                    'down'
                                  )
                                )
                              }
                            >
                              ↓
                            </button>
                          </span>
                          {showKey ? (
                            <label className={styles.orderToggle}>
                              <input
                                type="checkbox"
                                checked={enabled}
                                onChange={(e) =>
                                  patch(showKey, e.target.checked)
                                }
                              />
                              {enabled ? 'روشن' : 'خاموش'}
                            </label>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                </section>
                <section className={styles.card}>
                  <h2 className={styles.cardTitle}>سایر اجزا و جزئیات</h2>
                  {Object.entries(groups).map(([gid, glabel]) => {
                    const skip = new Set([
                      'show_badges',
                      'show_title',
                      'show_rating',
                      'show_lid',
                      'show_price',
                      'show_stock',
                      'show_add_to_cart',
                      'show_category',
                      'show_shop',
                      'show_description',
                      'show_specs',
                      'show_similar',
                    ])
                    const items = PRODUCT_SINGLE_BLOCK_TOGGLES.filter(
                      (f) => f.group === gid && !skip.has(f.key)
                    )
                    if (!items.length) return null
                    return (
                      <div key={gid} className={styles.blockGroup}>
                        <h3 className={styles.groupTitle}>{glabel}</h3>
                        <div className={styles.toggleGrid}>
                          {items.map((f) => (
                            <label key={f.key} className={styles.toggleRow}>
                              <input
                                type="checkbox"
                                checked={!!form[f.key]}
                                onChange={(e) =>
                                  patch(f.key, e.target.checked)
                                }
                              />
                              {f.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </section>
              </>
            ) : null}

            {tab === 'gallery' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>گالری و بندانگشتی</h2>
                {productSingleIsTwoCol(productSingleLayoutFamily(form)) ? (
                  <>
                    <p className={styles.fieldLabel}>
                      عرض ستون‌ها — تصویر {form.gallery_col_pct}٪ / اطلاعات{' '}
                      {100 - form.gallery_col_pct}٪
                    </p>
                    <label className={styles.pxField}>
                      <span>درصد ستون تصویر</span>
                      <span className={styles.pxInput}>
                        <input
                          type="range"
                          min={28}
                          max={72}
                          step={1}
                          value={form.gallery_col_pct}
                          onChange={(e) =>
                            patch('gallery_col_pct', Number(e.target.value))
                          }
                          dir="ltr"
                          style={{ width: '100%' }}
                        />
                        <em>{form.gallery_col_pct}%</em>
                      </span>
                    </label>
                  </>
                ) : null}
                <p className={styles.fieldLabel}>سقف ارتفاع و برش</p>
                <div className={styles.pxGrid}>
                  <PxField
                    label="سقف ارتفاع گالری"
                    value={form.gallery_max_h}
                    onChange={(v) => patch('gallery_max_h', v)}
                    min={240}
                    max={720}
                  />
                </div>
                <Seg
                  options={PRODUCT_SINGLE_GALLERY_FITS}
                  value={form.gallery_fit}
                  onChange={(id) => patch('gallery_fit', id)}
                  cols={2}
                />
                <p className={styles.fieldLabel}>نسبت تصویر</p>
                <Seg
                  options={PRODUCT_SINGLE_GALLERY_RATIOS}
                  value={form.gallery_ratio}
                  onChange={(id) => patch('gallery_ratio', id)}
                />
                <p className={styles.fieldLabel}>افکت هاور تصویر</p>
                <Seg
                  options={PRODUCT_SINGLE_IMAGE_HOVERS}
                  value={form.image_hover}
                  onChange={(id) => patch('image_hover', id)}
                  cols={5}
                />
                <p className={styles.fieldLabel}>جایگاه بندانگشتی</p>
                <Seg
                  options={PRODUCT_SINGLE_THUMB_PLACEMENTS}
                  value={form.thumbs_placement}
                  onChange={(id) => patch('thumbs_placement', id)}
                  cols={2}
                />
                <p className={styles.fieldLabel}>موقعیت بندانگشتی</p>
                <Seg
                  options={PRODUCT_SINGLE_THUMB_POSITIONS}
                  value={form.thumbs_position}
                  onChange={(id) => patch('thumbs_position', id)}
                />
                <div className={styles.pxGrid}>
                  <PxField
                    label="شعاع گالری"
                    value={form.gallery_radius}
                    onChange={(v) => patch('gallery_radius', v)}
                    max={48}
                  />
                  <PxField
                    label="اندازه بندانگشتی"
                    value={form.thumbs_size}
                    onChange={(v) => patch('thumbs_size', v)}
                    min={36}
                    max={96}
                  />
                  <PxField
                    label="فاصله بندانگشتی"
                    value={form.thumbs_gap}
                    onChange={(v) => patch('thumbs_gap', v)}
                    max={24}
                  />
                  <PxField
                    label="شعاع بندانگشتی"
                    value={form.thumbs_radius}
                    onChange={(v) => patch('thumbs_radius', v)}
                    max={40}
                  />
                </div>
              </section>
            ) : null}

            {tab === 'actions' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>سبد خرید، علاقه و اشتراک</h2>
                <p className={styles.fieldLabel}>سبک دکمه افزودن به سبد</p>
                <Seg
                  options={PRODUCT_SINGLE_CTA_STYLES}
                  value={form.cta_style}
                  onChange={(id) => patch('cta_style', id)}
                />
                <p className={styles.fieldLabel}>سبک دکمه علاقه</p>
                <Seg
                  options={PRODUCT_SINGLE_CTA_STYLES}
                  value={form.wish_style}
                  onChange={(id) => patch('wish_style', id)}
                />
                <p className={styles.fieldLabel}>سبک دکمه اشتراک</p>
                <Seg
                  options={PRODUCT_SINGLE_CTA_STYLES}
                  value={form.share_style}
                  onChange={(id) => patch('share_style', id)}
                />
                <div className={styles.pxGrid}>
                  <PxField
                    label="ارتفاع دکمه"
                    value={form.btn_height}
                    onChange={(v) => patch('btn_height', v)}
                    min={28}
                    max={64}
                  />
                  <PxField
                    label="شعاع دکمه"
                    value={form.btn_radius}
                    onChange={(v) => patch('btn_radius', v)}
                    max={40}
                  />
                  <PxField
                    label="سایز فونت دکمه"
                    value={form.btn_font_size}
                    onChange={(v) => patch('btn_font_size', v)}
                    min={10}
                    max={22}
                  />
                  <PxField
                    label="فاصله اکشن‌ها"
                    value={form.action_gap}
                    onChange={(v) => patch('action_gap', v)}
                    max={32}
                  />
                </div>
                <div className={styles.toggleGrid} style={{ marginTop: '0.85rem' }}>
                  {[
                    ['show_qty', 'نمایش تعداد'],
                    ['show_add_to_cart', 'دکمه سبد'],
                    ['show_wishlist', 'علاقه‌مندی'],
                    ['show_share', 'اشتراک'],
                  ].map(([key, label]) => (
                    <label key={key} className={styles.toggleRow}>
                      <input
                        type="checkbox"
                        checked={!!form[key]}
                        onChange={(e) => patch(key, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {form.show_share ? (
                  <>
                    <p className={styles.fieldLabel}>پیام‌رسان‌های اشتراک</p>
                    <div className={styles.toggleGrid}>
                      {[
                        ['share_bale', 'بله'],
                        ['share_eitaa', 'ایتا'],
                        ['share_rubika', 'روبیکا'],
                        ['share_soroush', 'سروش'],
                      ].map(([key, label]) => (
                        <label key={key} className={styles.toggleRow}>
                          <input
                            type="checkbox"
                            checked={!!form[key]}
                            onChange={(e) => patch(key, e.target.checked)}
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
            ) : null}

            {tab === 'type' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>فونت و اندازه</h2>
                <p className={styles.fieldLabel}>فونت عنوان</p>
                <Seg
                  options={PRODUCT_SINGLE_FONTS}
                  value={form.title_font}
                  onChange={(id) => patch('title_font', id)}
                  cols={3}
                />
                <p className={styles.fieldLabel}>فونت متن</p>
                <Seg
                  options={PRODUCT_SINGLE_FONTS}
                  value={form.body_font}
                  onChange={(id) => patch('body_font', id)}
                  cols={3}
                />
                <p className={styles.fieldLabel}>فونت قیمت</p>
                <Seg
                  options={PRODUCT_SINGLE_FONTS}
                  value={form.price_font}
                  onChange={(id) => patch('price_font', id)}
                  cols={3}
                />
                <p className={styles.fieldLabel}>فونت دکمه</p>
                <Seg
                  options={PRODUCT_SINGLE_FONTS}
                  value={form.btn_font}
                  onChange={(id) => patch('btn_font', id)}
                  cols={3}
                />
                <p className={styles.fieldLabel}>پیش‌فرض اندازه عنوان</p>
                <Seg
                  options={PRODUCT_SINGLE_TITLE_SIZES}
                  value={form.title_size}
                  onChange={(id) => {
                    const meta = PRODUCT_SINGLE_TITLE_SIZES.find((x) => x.id === id)
                    patchMany({
                      title_size: id,
                      title_font_size: meta?.px || 28,
                    })
                  }}
                />
                <div className={styles.pxGrid}>
                  <PxField
                    label="سایز عنوان"
                    value={form.title_font_size}
                    onChange={(v) => patch('title_font_size', v)}
                    min={14}
                    max={72}
                  />
                  <PxField
                    label="سایز متن"
                    value={form.content_font_size}
                    onChange={(v) => patch('content_font_size', v)}
                    min={11}
                    max={28}
                  />
                  <PxField
                    label="سایز قیمت"
                    value={form.price_font_size}
                    onChange={(v) => patch('price_font_size', v)}
                    min={12}
                    max={48}
                  />
                  <PxField
                    label="عرض محتوا"
                    value={form.section_max_width}
                    onChange={(v) => patch('section_max_width', v)}
                    min={480}
                    max={1600}
                  />
                  <PxField
                    label="فاصله داخلی"
                    value={form.content_gap}
                    onChange={(v) => patch('content_gap', v)}
                    max={48}
                  />
                  <PxField
                    label="پدینگ بخش"
                    value={form.section_pad}
                    onChange={(v) => patch('section_pad', v)}
                    max={48}
                  />
                </div>
                <p className={styles.fieldLabel}>شعاع گوشه‌ها (جدا)</p>
                <p className={styles.cardHint}>
                  «همه گوشه‌ها» هر چهار طرف را یکسان می‌کند؛ یا هر گوشه را جدا
                  تنظیم کنید.
                </p>
                <div className={styles.pxGrid}>
                  <PxField
                    label="همه گوشه‌ها"
                    value={form.section_radius}
                    onChange={(v) =>
                      setForm((prev) =>
                        normalizeProductSinglePageSettings({
                          ...prev,
                          section_radius: v,
                          section_radius_tl: v,
                          section_radius_tr: v,
                          section_radius_br: v,
                          section_radius_bl: v,
                        })
                      )
                    }
                    max={48}
                  />
                  <PxField
                    label="بالا راست"
                    value={form.section_radius_tr}
                    onChange={(v) => patch('section_radius_tr', v)}
                    max={48}
                  />
                  <PxField
                    label="بالا چپ"
                    value={form.section_radius_tl}
                    onChange={(v) => patch('section_radius_tl', v)}
                    max={48}
                  />
                  <PxField
                    label="پایین راست"
                    value={form.section_radius_br}
                    onChange={(v) => patch('section_radius_br', v)}
                    max={48}
                  />
                  <PxField
                    label="پایین چپ"
                    value={form.section_radius_bl}
                    onChange={(v) => patch('section_radius_bl', v)}
                    max={48}
                  />
                </div>
              </section>
            ) : null}

            {tab === 'colors' ? (
              <section className={styles.card}>
                <h2 className={styles.cardTitle}>رنگ‌ها</h2>
                <p className={styles.cardHint}>
                  برای پس‌زمینه کلی دکمه «شفاف» را بزنید تا بدون بک‌گراند شود.
                  رنگ‌های ردیف قیمت را از بخش «ردیف قیمت» تنظیم کنید.
                </p>
                {PRODUCT_SINGLE_COLOR_GROUPS.map((group) => {
                  const fields = PRODUCT_SINGLE_COLOR_FIELDS.filter(
                    (f) => (f.group || 'general') === group.id
                  )
                  if (!fields.length) return null
                  return (
                    <div key={group.id} className={styles.blockGroup}>
                      <h3 className={styles.groupTitle}>{group.label}</h3>
                      <div className={styles.colorGridRich}>
                        {fields.map((f) => (
                          <ColorField
                            key={f.key}
                            label={f.label}
                            value={form[f.key]}
                            fallback={f.fallback}
                            allowTransparent={!!f.allowTransparent}
                            onChange={(v) => patch(f.key, v)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </section>
            ) : null}
          </>
        )}
      </div>
    </div>,
  )
}
