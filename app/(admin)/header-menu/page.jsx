// app/(admin)/header-menu/page.jsx — ظاهر + لینک‌های سیستم شرکتی
'use client'

import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  PanelTop, Plus, Pencil, Trash2, RefreshCw, Shield, Save,
  CheckCircle2, X, LayoutDashboard, Power, ExternalLink,
  List, Upload, ImagePlus, ChevronUp, ChevronDown, Star,
  Monitor, Smartphone,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import {
  clearHeaderMenuCache,
  reorderHeaderMenu,
  arrangeMobileNavItems,
  findMobileNavCenterIndex,
  sortHeaderMenuItems,
} from '@/services/headerMenu'

const VALID_TABS = new Set(['desktop', 'mobile', 'links'])

function normalizeTab(raw) {
  if (raw === 'appearance') return 'desktop'
  if (VALID_TABS.has(raw)) return raw
  return 'desktop'
}
import {
  DEFAULT_CORPORATE_APPEARANCE,
  MOBILE_STYLES,
  normalizeCorporateAppearance,
  clearCorporateAppearanceCache,
} from '@/services/corporateAppearance'
import { getFullImageUrl } from '@/utils/imageUrl'
import styles from '../ticker/Ticker.module.css'
import local from './HeaderMenu.module.css'

const ICON_OPTIONS = [
  'Home', 'Info', 'Briefcase', 'Newspaper', 'PlusCircle', 'HelpCircle', 'GraduationCap',
  'Building2', 'Users', 'Phone', 'Search', 'LayoutDashboard',
  'Calculator', 'Target', 'Zap', 'Award', 'Shield', 'User',
]

const emptyForm = {
  label_fa: '',
  label_en: '',
  href: '/',
  icon: 'Home',
  sort_order: 100,
  is_active: true,
}

const COLOR_FIELDS_HEADER = [
  { key: 'header_bg', fa: 'پس‌زمینه هدر', en: 'Header background' },
  { key: 'header_text', fa: 'رنگ متن (عادی)', en: 'Text (normal)' },
  { key: 'header_hover', fa: 'رنگ متن (هاور)', en: 'Text (hover)' },
  { key: 'header_icon', fa: 'رنگ آیکون (عادی)', en: 'Icon (normal)' },
  { key: 'header_icon_hover', fa: 'رنگ آیکون (هاور)', en: 'Icon (hover)' },
]

const COLOR_FIELDS_MOBILE = [
  { key: 'mobile_bg', fa: 'پس‌زمینه منوی موبایل', en: 'Mobile background' },
  { key: 'mobile_text', fa: 'رنگ متن موبایل', en: 'Mobile text' },
  { key: 'mobile_icon', fa: 'رنگ آیکون موبایل', en: 'Mobile icons' },
  { key: 'mobile_active', fa: 'رنگ آیتم فعال', en: 'Mobile active' },
]

function resolvePreview(src) {
  if (!src) return null
  if (typeof src === 'string' && src.startsWith('/images/')) return src
  if (typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:'))) return src
  return getFullImageUrl(src)
}

function ColorField({ label, value, onChange }) {
  return (
    <div className={local.colorField}>
      <label>{label}</label>
      <div className={local.colorRow}>
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value || '') ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          dir="ltr"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

function HeaderMenuPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const initialTab = normalizeTab(searchParams?.get('tab'))
  const [tab, setTab] = useState(initialTab)
  const [items, setItems] = useState([])
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE)
  const [logoFile, setLogoFile] = useState(null)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    const next = normalizeTab(searchParams?.get('tab'))
    if (typeof window !== 'undefined' && window.location.hash === '#mobile') {
      setTab('mobile')
      router.replace('/header-menu?tab=mobile', { scroll: false })
      return
    }
    setTab(next)
  }, [searchParams, router])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingAppear, setSavingAppear] = useState(false)
  const [reordering, setReordering] = useState(false)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const allSorted = useMemo(() => sortHeaderMenuItems(items, 'desktop'), [items])

  const desktopActiveSorted = useMemo(
    () => sortHeaderMenuItems((items || []).filter((i) => i.is_active), 'desktop'),
    [items]
  )

  const mobileActiveSorted = useMemo(
    () => sortHeaderMenuItems((items || []).filter((i) => i.is_active), 'mobile'),
    [items]
  )

  const mobilePreviewItems = useMemo(() => {
    const styleKey = appearance.mobile_style || 'classic'
    return arrangeMobileNavItems(mobileActiveSorted, {
      centerItemId: styleKey === 'center_circle' ? appearance.mobile_center_item_id : null,
      maxItems: 5,
    })
  }, [mobileActiveSorted, appearance.mobile_style, appearance.mobile_center_item_id])

  const mobilePreviewCenterIdx = useMemo(() => {
    if ((appearance.mobile_style || 'classic') !== 'center_circle') return -1
    return findMobileNavCenterIndex(mobilePreviewItems, appearance.mobile_center_item_id)
  }, [mobilePreviewItems, appearance.mobile_style, appearance.mobile_center_item_id])

  const t = language === 'en' ? {
    title: 'Site menu & appearance',
    subtitle: 'Logo, colors and links for top menu and mobile bottom nav',
    add: 'New item',
    edit: 'Edit item',
    labelFa: 'Persian label',
    labelEn: 'English label',
    href: 'Link',
    icon: 'Icon',
    order: 'Order',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    loading: 'Loading...',
    empty: 'No menu items yet',
    back: 'Back to dashboard',
    confirmDelete: 'Delete this menu item?',
    accessDenied: 'Access denied',
    needManager: 'Only managers and staff can manage this section',
    adminweb: 'adminsettings',
    tabDesktop: 'Desktop',
    tabMobile: 'Mobile',
    tabLinks: 'Menu links',
    desktopTitle: 'Desktop appearance',
    desktopDesc: 'Logo, colors and top-menu order for desktop — independent from mobile',
    mobileTitle: 'Mobile appearance',
    mobileDesc: 'Bottom-nav style, colors and order for phones — independent from desktop',
    logo: 'Site logo',
    logoHint: 'Shown in the top site menu (desktop)',
    pickFile: 'Choose image',
    clearFile: 'Clear file',
    headerColors: 'Desktop header colors',
    mobileColors: 'Mobile bottom nav colors',
    mobileStyles: 'Mobile menu layout',
    mobileStylesDesc: 'Pick how the bottom navigation looks on phones',
    preview: 'Live preview',
    savedDesktop: 'Desktop appearance saved',
    savedMobile: 'Mobile appearance saved',
    headerLabel: 'Header',
    mobileLabel: 'Mobile',
    orderDesktopTitle: 'Desktop menu order',
    orderDesktopDesc: 'Order of items in the desktop top menu',
    orderMobileTitle: 'Mobile bottom nav order',
    orderMobileDesc: 'Independent from desktop. First 5 active items appear on the phone bar.',
    centerTitle: 'Center item (circle style)',
    centerDesc: 'Which menu item sits in the raised center circle',
    centerAuto: 'Automatic (middle of list)',
    centerBadge: 'Center',
    orderSaved: 'Order updated',
    moveUp: 'Move up',
    moveDown: 'Move down',
    previewOrder: 'Mobile bar preview',
    previewDesktop: 'Desktop menu preview',
  } : {
    title: 'منوی سایت و ظاهر',
    subtitle: 'لوگو، رنگ‌ها و لینک‌های منوی بالا و نوار پایین موبایل',
    add: 'آیتم جدید',
    edit: 'ویرایش آیتم',
    labelFa: 'عنوان فارسی',
    labelEn: 'عنوان انگلیسی',
    href: 'لینک',
    icon: 'آیکون',
    order: 'ترتیب',
    status: 'وضعیت',
    active: 'فعال',
    inactive: 'غیرفعال',
    actions: 'عملیات',
    save: 'ذخیره',
    cancel: 'انصراف',
    saving: 'در حال ذخیره...',
    loading: 'در حال بارگذاری...',
    empty: 'هنوز آیتمی ثبت نشده است',
    back: 'بازگشت به داشبورد',
    confirmDelete: 'آیا از حذف این آیتم اطمینان دارید؟',
    accessDenied: 'دسترسی محدود',
    needManager: 'مدیریت این بخش فقط برای مدیر و staff است',
    adminweb: 'تنظیمات ادمین',
    tabDesktop: 'دسکتاپ',
    tabMobile: 'موبایل',
    tabLinks: 'لینک‌های منو',
    desktopTitle: 'ظاهر دسکتاپ',
    desktopDesc: 'لوگو، رنگ‌ها و ترتیب منوی بالای دسکتاپ — کاملاً مستقل از موبایل',
    mobileTitle: 'ظاهر موبایل',
    mobileDesc: 'استایل، رنگ‌ها و ترتیب نوار پایین موبایل — کاملاً مستقل از دسکتاپ',
    logo: 'لوگوی سایت',
    logoHint: 'در منوی بالای سایت (دسکتاپ) نمایش داده می‌شود',
    pickFile: 'انتخاب تصویر',
    clearFile: 'حذف فایل',
    headerColors: 'رنگ‌های هدر دسکتاپ',
    mobileColors: 'رنگ‌های منوی پایین موبایل',
    mobileStyles: 'حالت نمایش منوی موبایل',
    mobileStylesDesc: 'یکی از ۴ ظاهر پایین صفحه را انتخاب کنید',
    preview: 'پیش‌نمایش',
    savedDesktop: 'ظاهر دسکتاپ ذخیره شد',
    savedMobile: 'ظاهر موبایل ذخیره شد',
    headerLabel: 'هدر',
    mobileLabel: 'موبایل',
    orderDesktopTitle: 'ترتیب منوی دسکتاپ',
    orderDesktopDesc: 'ترتیب آیتم‌ها در منوی بالای دسکتاپ',
    orderMobileTitle: 'ترتیب نوار پایین موبایل',
    orderMobileDesc: 'مستقل از دسکتاپ. تا ۵ آیتم فعال اول در نوار موبایل نمایش داده می‌شود.',
    centerTitle: 'آیتم وسط (دایره وسط)',
    centerDesc: 'کدام آیتم در دایره برجسته وسط باشد',
    centerAuto: 'خودکار (وسط لیست)',
    centerBadge: 'وسط',
    orderSaved: 'ترتیب ذخیره شد',
    moveUp: 'بالا',
    moveDown: 'پایین',
    previewOrder: 'پیش‌نمایش نوار پایین',
    previewDesktop: 'پیش‌نمایش منوی دسکتاپ',
  }

  const logoPreview = useMemo(() => {
    if (logoFile) return URL.createObjectURL(logoFile)
    return resolvePreview(appearance.logo_display || appearance.logo_url)
  }, [logoFile, appearance.logo_display, appearance.logo_url])

  useEffect(() => {
    if (!logoFile || !logoPreview?.startsWith('blob:')) return undefined
    const url = logoPreview
    return () => URL.revokeObjectURL(url)
  }, [logoFile, logoPreview])

  const fetchAll = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const [menuRes, appearRes] = await Promise.all([
        axios.get(Config.endpoints.news.headerMenu.list(), { headers: getAuthHeaders() }),
        axios.get(Config.endpoints.news.corporateAppearance.get(), { headers: getAuthHeaders() }),
      ])
      const list = Array.isArray(menuRes.data?.data)
        ? menuRes.data.data
        : Array.isArray(menuRes.data)
          ? menuRes.data
          : []
      setItems(list)
      setAppearance(normalizeCorporateAppearance(appearRes.data?.data || appearRes.data))
      setLogoFile(null)
    } catch (err) {
      setError(err.response?.data?.detail || err.message || t.empty)
      setItems([])
      setAppearance(DEFAULT_CORPORATE_APPEARANCE)
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders, t.empty])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canManage) fetchAll()
    else if (isAuthenticated) setLoadingData(false)
  }, [isAuthenticated, canManage, fetchAll])

  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(null), 3500)
    return () => clearTimeout(timer)
  }, [success])

  const setAppearField = (key, value) => {
    setAppearance((prev) => ({ ...prev, [key]: value }))
  }

  const handleMoveItem = async (itemId, direction, { scope = 'desktop', activeOnly = true } = {}) => {
    const orderScope = scope === 'mobile' ? 'mobile' : 'desktop'
    const activePool = orderScope === 'mobile' ? mobileActiveSorted : desktopActiveSorted
    const pool = activeOnly ? activePool : sortHeaderMenuItems(items, orderScope)
    const ids = pool.map((i) => i.id)
    const idx = ids.indexOf(itemId)
    const next = idx + direction
    if (idx < 0 || next < 0 || next >= ids.length) return
    const swapped = ids.slice()
    ;[swapped[idx], swapped[next]] = [swapped[next], swapped[idx]]
    const payload = activeOnly
      ? [
          ...swapped,
          ...sortHeaderMenuItems((items || []).filter((i) => !i.is_active), orderScope).map((i) => i.id),
        ]
      : swapped
    try {
      setReordering(true)
      setError(null)
      const list = await reorderHeaderMenu(payload, getAuthHeaders(), { scope: orderScope })
      setItems(Array.isArray(list) ? list : [])
      clearHeaderMenuCache()
      setSuccess(t.orderSaved)
    } catch (err) {
      setError(err.message || 'خطا در تغییر ترتیب')
    } finally {
      setReordering(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm,
      sort_order: items.length ? Math.max(...items.map((i) => i.sort_order || 0)) + 10 : 10,
    })
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      label_fa: item.label_fa || '',
      label_en: item.label_en || '',
      href: item.href || '/',
      icon: item.icon || 'Home',
      sort_order: item.sort_order ?? 100,
      is_active: item.is_active ?? true,
    })
    setFormError(null)
    setShowForm(true)
  }

  const fmtErrors = (data) => {
    if (!data) return 'خطا در ذخیره'
    if (typeof data === 'string') return data
    if (data.detail) return Array.isArray(data.detail) ? data.detail.join('، ') : data.detail
    const parts = []
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'status') return
      parts.push(`${k}: ${Array.isArray(v) ? v.join('، ') : v}`)
    })
    return parts.join(' | ') || 'خطا در ذخیره'
  }

  const patchAppearance = async (keys, { includeLogo = false, successMsg } = {}) => {
    setError(null)
    setSuccess(null)
    try {
      setSavingAppear(true)
      const fd = new FormData()
      keys.forEach((key) => {
        if (key === 'mobile_center_item_id') {
          fd.append(
            key,
            appearance.mobile_center_item_id != null && appearance.mobile_center_item_id !== ''
              ? String(appearance.mobile_center_item_id)
              : ''
          )
          return
        }
        fd.append(key, appearance[key] ?? '')
      })
      if (includeLogo && logoFile) fd.append('logo', logoFile)

      const res = await axios.patch(
        Config.endpoints.news.corporateAppearance.update(),
        fd,
        { headers: getAuthHeaders() }
      )
      setAppearance(normalizeCorporateAppearance(res.data?.data || res.data))
      if (includeLogo) setLogoFile(null)
      clearCorporateAppearanceCache()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('corporate-appearance-changed'))
      }
      setSuccess(successMsg)
    } catch (err) {
      setError(fmtErrors(err.response?.data))
    } finally {
      setSavingAppear(false)
    }
  }

  const handleSaveDesktop = async (e) => {
    e.preventDefault()
    await patchAppearance(
      [
        'logo_url',
        'header_bg', 'header_text', 'header_hover',
        'header_icon', 'header_icon_hover',
      ],
      { includeLogo: true, successMsg: t.savedDesktop }
    )
  }

  const handleSaveMobile = async (e) => {
    e.preventDefault()
    await patchAppearance(
      [
        'mobile_bg', 'mobile_text', 'mobile_icon', 'mobile_active',
        'mobile_style', 'mobile_center_item_id',
      ],
      { successMsg: t.savedMobile }
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setFormError(null)
    if (!form.label_fa.trim()) {
      setFormError(language === 'en' ? 'Persian label is required' : 'عنوان فارسی الزامی است')
      return
    }
    if (!form.href.trim()) {
      setFormError(language === 'en' ? 'Link is required' : 'لینک الزامی است')
      return
    }
    try {
      setSaving(true)
      const payload = {
        label_fa: form.label_fa.trim(),
        label_en: form.label_en.trim(),
        href: form.href.trim(),
        icon: form.icon || 'Home',
        sort_order: Number(form.sort_order) || 100,
        is_active: !!form.is_active,
      }
      if (editing) {
        await axios.patch(
          Config.endpoints.news.headerMenu.update(editing.id),
          payload,
          { headers: getAuthHeaders() }
        )
      } else {
        await axios.post(
          Config.endpoints.news.headerMenu.create(),
          payload,
          { headers: getAuthHeaders() }
        )
      }
      clearHeaderMenuCache()
      setShowForm(false)
      fetchAll()
    } catch (err) {
      setFormError(fmtErrors(err.response?.data))
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (item) => {
    try {
      const res = await axios.post(
        Config.endpoints.news.headerMenu.toggleActive(item.id),
        {},
        { headers: getAuthHeaders() }
      )
      const isActive = res.data?.is_active
      clearHeaderMenuCache()
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, is_active: isActive ?? !it.is_active } : it))
      )
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`${t.confirmDelete}\n${item.label_fa}`)) return
    try {
      await axios.delete(Config.endpoints.news.headerMenu.delete(item.id), {
        headers: getAuthHeaders(),
      })
      clearHeaderMenuCache()
      setItems((prev) => prev.filter((it) => it.id !== item.id))
    } catch (err) {
      alert(fmtErrors(err.response?.data))
    }
  }

  if (loading || loadingData) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.loadingBox}>
            <RefreshCw size={28} className={styles.spinner} />
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canManage) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.denied}>
            <span className={styles.deniedIcon}><Shield size={40} /></span>
            <h3>{t.accessDenied}</h3>
            <p>{t.needManager}</p>
            <Link href="/dashboard" className={styles.primaryBtn}>{t.back}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><PanelTop size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title}</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/adminsettings" className={styles.headerGhost}>
              <ExternalLink size={15} /> {t.adminweb}
            </Link>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.back}
            </Link>
            <button type="button" className={styles.headerGhost} onClick={fetchAll} aria-label="refresh">
              <RefreshCw size={15} />
            </button>
            {tab === 'links' ? (
              <button type="button" className={styles.headerPrimary} onClick={openCreate}>
                <Plus size={16} /> {t.add}
              </button>
            ) : (
              <button
                type="submit"
                form={tab === 'mobile' ? 'corporate-mobile-form' : 'corporate-desktop-form'}
                className={styles.headerPrimary}
                disabled={savingAppear}
              >
                <Save size={15} /> {savingAppear ? t.saving : t.save}
              </button>
            )}
          </div>
        </div>

        <div className={local.tabs}>
          <button
            type="button"
            className={`${local.tab} ${tab === 'desktop' ? local.tabActive : ''}`}
            onClick={() => {
              setTab('desktop')
              router.replace('/header-menu?tab=desktop', { scroll: false })
            }}
          >
            <Monitor size={15} /> {t.tabDesktop}
          </button>
          <button
            type="button"
            className={`${local.tab} ${tab === 'mobile' ? local.tabActive : ''}`}
            onClick={() => {
              setTab('mobile')
              router.replace('/header-menu?tab=mobile', { scroll: false })
            }}
          >
            <Smartphone size={15} /> {t.tabMobile}
          </button>
          <button
            type="button"
            className={`${local.tab} ${tab === 'links' ? local.tabActive : ''}`}
            onClick={() => {
              setTab('links')
              router.replace('/header-menu?tab=links', { scroll: false })
            }}
          >
            <List size={15} /> {t.tabLinks} ({items.length})
          </button>
        </div>

        {error && <div className={styles.errorBar}>{error}</div>}
        {success && <div className={local.successBar}>{success}</div>}

        {tab === 'desktop' && (
          <form id="corporate-desktop-form" className={local.appearCard} onSubmit={handleSaveDesktop}>
            <div className={local.appearHead}>
              <h2>{t.desktopTitle}</h2>
              <p>{t.desktopDesc}</p>
            </div>

            <div className={local.logoBlock}>
              <div className={local.logoPreview}>
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="" />
                ) : (
                  <ImagePlus size={28} color="#666" />
                )}
              </div>
              <div className={local.logoControls}>
                <p>{t.logo}</p>
                <small>{t.logoHint}</small>
                <label className={local.uploadBtn}>
                  <Upload size={14} />
                  <span>{t.pickFile}</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </label>
                {logoFile ? (
                  <button type="button" className={styles.ghostBtn} onClick={() => setLogoFile(null)}>
                    <X size={14} /> {t.clearFile}
                  </button>
                ) : null}
                <input
                  className={styles.formGroup}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    border: '1.5px solid rgba(90,60,20,0.12)',
                    borderRadius: 11,
                    fontSize: 12,
                    direction: 'ltr',
                  }}
                  dir="ltr"
                  value={appearance.logo_url || ''}
                  onChange={(e) => setAppearField('logo_url', e.target.value)}
                  placeholder="/images/logo.png"
                />
              </div>
            </div>

            <p className={local.subTitle}>{t.headerColors}</p>
            <div className={local.colorGrid}>
              {COLOR_FIELDS_HEADER.map((f) => (
                <ColorField
                  key={f.key}
                  label={language === 'en' ? f.en : f.fa}
                  value={appearance[f.key]}
                  onChange={(v) => setAppearField(f.key, v)}
                />
              ))}
            </div>

            <div className={local.orderBlock}>
              <p className={local.subTitle}>{t.orderDesktopTitle}</p>
              <p className={local.orderHint}>{t.orderDesktopDesc}</p>
              {desktopActiveSorted.length === 0 ? (
                <p className={local.orderHint}>{t.empty}</p>
              ) : (
                <ul className={local.orderList}>
                  {desktopActiveSorted.map((item, index) => (
                    <li key={item.id} className={local.orderRow}>
                      <span className={local.orderIndex}>{index + 1}</span>
                      <div className={local.orderMeta}>
                        <strong>
                          {language === 'en' && item.label_en ? item.label_en : item.label_fa}
                        </strong>
                        <span dir="ltr">{item.href}</span>
                      </div>
                      <div className={local.orderActions}>
                        <button
                          type="button"
                          className={local.orderBtn}
                          disabled={reordering || index === 0}
                          title={t.moveUp}
                          onClick={() => handleMoveItem(item.id, -1, { scope: 'desktop' })}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          type="button"
                          className={local.orderBtn}
                          disabled={reordering || index === desktopActiveSorted.length - 1}
                          title={t.moveDown}
                          onClick={() => handleMoveItem(item.id, 1, { scope: 'desktop' })}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {desktopActiveSorted.length > 0 ? (
                <>
                  <p className={local.orderHint} style={{ marginTop: 12 }}>{t.previewDesktop}</p>
                  <div
                    className={local.desktopPreview}
                    style={{
                      background: appearance.header_bg,
                      color: appearance.header_text,
                    }}
                  >
                    {desktopActiveSorted.map((item) => (
                      <span
                        key={item.id}
                        className={local.desktopPreviewItem}
                        style={{ color: appearance.header_text }}
                      >
                        <span
                          className={local.desktopPreviewDot}
                          style={{ background: appearance.header_icon }}
                        />
                        {language === 'en' && item.label_en ? item.label_en : item.label_fa}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <p className={local.subTitle}>{t.preview}</p>
            <div className={local.previewStrip}>
              <span
                className={local.previewChip}
                style={{
                  background: appearance.header_bg,
                  color: appearance.header_text,
                }}
              >
                <span style={{ color: appearance.header_icon }}>●</span>
                {t.headerLabel}
              </span>
            </div>

            <div className={local.saveBar}>
              <button type="submit" className={styles.primaryBtn} disabled={savingAppear}>
                <Save size={14} /> {savingAppear ? t.saving : t.save}
              </button>
            </div>
          </form>
        )}

        {tab === 'mobile' && (
          <form id="corporate-mobile-form" className={local.appearCard} onSubmit={handleSaveMobile}>
            <div className={local.appearHead}>
              <h2>{t.mobileTitle}</h2>
              <p>{t.mobileDesc}</p>
            </div>

            <div id="mobile-nav-customize" />
            <p className={local.subTitle}>{t.mobileStyles}</p>
            <p style={{ margin: '0 0 10px', fontSize: 11, color: '#6f675c' }}>{t.mobileStylesDesc}</p>
            <div className={local.styleGrid}>
              {MOBILE_STYLES.map((s) => {
                const active = (appearance.mobile_style || 'classic') === s.key
                const mockClass =
                  s.key === 'center_circle'
                    ? local.mockCircle
                    : s.key === 'rounded_square'
                      ? local.mockSquare
                      : s.key === 'glow_dock'
                        ? local.mockGlow
                        : local.mockClassic
                return (
                  <button
                    key={s.key}
                    type="button"
                    className={`${local.styleCard} ${active ? local.styleCardActive : ''}`}
                    onClick={() => setAppearField('mobile_style', s.key)}
                  >
                    <div className={`${local.styleMock} ${mockClass}`}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className={`${local.styleDot} ${i === 2 ? local.styleDotActive : ''}`}
                        />
                      ))}
                    </div>
                    <strong>{language === 'en' ? s.name_en : s.name_fa}</strong>
                    <span>{language === 'en' ? s.desc_en : s.desc_fa}</span>
                  </button>
                )
              })}
            </div>

            {(appearance.mobile_style || 'classic') === 'center_circle' ? (
              <div className={local.orderBlock}>
                <p className={local.subTitle}>{t.centerTitle}</p>
                <p className={local.orderHint}>{t.centerDesc}</p>
                <select
                  className={local.centerSelect}
                  value={appearance.mobile_center_item_id ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setAppearField('mobile_center_item_id', v === '' ? null : Number(v))
                  }}
                >
                  <option value="">{t.centerAuto}</option>
                  {mobileActiveSorted.map((item) => (
                    <option key={item.id} value={item.id}>
                      {language === 'en' && item.label_en ? item.label_en : item.label_fa}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={local.orderBlock}>
              <p className={local.subTitle}>{t.orderMobileTitle}</p>
              <p className={local.orderHint}>{t.orderMobileDesc}</p>
              {mobileActiveSorted.length === 0 ? (
                <p className={local.orderHint}>{t.empty}</p>
              ) : (
                <ul className={local.orderList}>
                  {mobileActiveSorted.map((item, index) => {
                    const previewCenterId =
                      mobilePreviewCenterIdx >= 0
                        ? mobilePreviewItems[mobilePreviewCenterIdx]?.id
                        : null
                    const isCenter =
                      (appearance.mobile_style || 'classic') === 'center_circle' &&
                      previewCenterId != null &&
                      String(previewCenterId) === String(item.id)
                    return (
                      <li
                        key={item.id}
                        className={`${local.orderRow} ${isCenter ? local.orderRowCenter : ''}`}
                      >
                        <span className={local.orderIndex}>{index + 1}</span>
                        <div className={local.orderMeta}>
                          <strong>
                            {language === 'en' && item.label_en ? item.label_en : item.label_fa}
                          </strong>
                          <span dir="ltr">{item.href}</span>
                        </div>
                        {isCenter ? (
                          <span className={local.centerBadge}>
                            <Star size={11} /> {t.centerBadge}
                          </span>
                        ) : null}
                        <div className={local.orderActions}>
                          <button
                            type="button"
                            className={local.orderBtn}
                            disabled={reordering || index === 0}
                            title={t.moveUp}
                            onClick={() => handleMoveItem(item.id, -1, { scope: 'mobile' })}
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            className={local.orderBtn}
                            disabled={reordering || index === mobileActiveSorted.length - 1}
                            title={t.moveDown}
                            onClick={() => handleMoveItem(item.id, 1, { scope: 'mobile' })}
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}

              {mobilePreviewItems.length > 0 ? (
                <>
                  <p className={local.orderHint} style={{ marginTop: 12 }}>{t.previewOrder}</p>
                  <div
                    className={local.barPreview}
                    style={{
                      background: appearance.mobile_bg,
                      color: appearance.mobile_text,
                    }}
                  >
                    {mobilePreviewItems.map((item, i) => {
                      const raised = i === mobilePreviewCenterIdx
                      return (
                        <span
                          key={item.id}
                          className={`${local.barPreviewItem} ${raised ? local.barPreviewCenter : ''}`}
                          style={{
                            color: raised || i === 0
                              ? appearance.mobile_active
                              : appearance.mobile_icon,
                          }}
                        >
                          {language === 'en' && item.label_en ? item.label_en : item.label_fa}
                        </span>
                      )
                    })}
                  </div>
                </>
              ) : null}
            </div>

            <p className={local.subTitle}>{t.mobileColors}</p>
            <div className={local.colorGrid}>
              {COLOR_FIELDS_MOBILE.map((f) => (
                <ColorField
                  key={f.key}
                  label={language === 'en' ? f.en : f.fa}
                  value={appearance[f.key]}
                  onChange={(v) => setAppearField(f.key, v)}
                />
              ))}
            </div>

            <p className={local.subTitle}>{t.preview}</p>
            <div className={local.previewStrip}>
              <span
                className={local.previewChip}
                style={{
                  background: appearance.mobile_bg,
                  color: appearance.mobile_text,
                }}
              >
                <span style={{ color: appearance.mobile_icon }}>●</span>
                {t.mobileLabel}
                <span style={{ color: appearance.mobile_active, marginInlineStart: 6 }}>✓</span>
              </span>
            </div>

            <div className={local.saveBar}>
              <button type="submit" className={styles.primaryBtn} disabled={savingAppear}>
                <Save size={14} /> {savingAppear ? t.saving : t.save}
              </button>
            </div>
          </form>
        )}

        {tab === 'links' && (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{t.labelFa}</th>
                    <th>{t.href}</th>
                    <th>{t.icon}</th>
                    <th>{t.order}</th>
                    <th>{t.status}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {allSorted.map((item, index) => (
                    <tr key={item.id} className={!item.is_active ? styles.rowInactive : ''}>
                      <td>
                        <strong>{item.label_fa}</strong>
                        {item.label_en ? (
                          <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>{item.label_en}</div>
                        ) : null}
                      </td>
                      <td><span className={styles.codeBadge} dir="ltr">{item.href}</span></td>
                      <td>{item.icon}</td>
                      <td><span className={styles.codeBadge}>{item.sort_order}</span></td>
                      <td>
                        <span className={`${styles.statusPill} ${item.is_active ? styles.on : styles.off}`}>
                          {item.is_active ? <CheckCircle2 size={12} /> : <X size={12} />}
                          {item.is_active ? t.active : t.inactive}
                        </span>
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title={t.moveUp}
                            disabled={reordering || index === 0}
                            onClick={() => handleMoveItem(item.id, -1, { scope: 'desktop', activeOnly: false })}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            title={t.moveDown}
                            disabled={reordering || index === allSorted.length - 1}
                            onClick={() => handleMoveItem(item.id, 1, { scope: 'desktop', activeOnly: false })}
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button type="button" className={styles.iconBtn} title={t.edit} onClick={() => openEdit(item)}>
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${item.is_active ? styles.warn : styles.ok}`}
                            title={item.is_active ? t.inactive : t.active}
                            onClick={() => handleToggle(item)}
                          >
                            <Power size={14} />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconBtn} ${styles.danger}`}
                            title={t.confirmDelete}
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 && !error && (
                <div className={styles.emptyBox}>
                  <PanelTop size={28} />
                  <span>{t.empty}</span>
                </div>
              )}
            </div>
          </>
        )}

        {showForm && (
          <div className={styles.overlay} onClick={() => setShowForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHead}>
                <h2>{editing ? t.edit : t.add}</h2>
                <button type="button" className={styles.iconBtn} onClick={() => setShowForm(false)}>
                  <X size={16} />
                </button>
              </div>
              {formError && <div className={styles.errorBar}>{formError}</div>}
              <form onSubmit={handleSave}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.labelFa} *</label>
                    <input
                      value={form.label_fa}
                      onChange={(e) => setForm({ ...form, label_fa: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.labelEn}</label>
                    <input
                      value={form.label_en}
                      onChange={(e) => setForm({ ...form, label_en: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>{t.href} *</label>
                  <input
                    value={form.href}
                    onChange={(e) => setForm({ ...form, href: e.target.value })}
                    dir="ltr"
                    placeholder="/about"
                    required
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>{t.icon}</label>
                    <select
                      value={form.icon}
                      onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    >
                      {ICON_OPTIONS.map((icon) => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.order}</label>
                    <input
                      type="number"
                      dir="ltr"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    />
                  </div>
                </div>
                <label className={styles.switchRow}>
                  <span>{t.active}</span>
                  <span className={`${styles.switch} ${form.is_active ? styles.switchOn : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    />
                  </span>
                </label>
                <div className={styles.formActions}>
                  <button type="button" className={styles.ghostBtn} onClick={() => setShowForm(false)}>
                    {t.cancel}
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={saving}>
                    {saving ? t.saving : t.save}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function HeaderMenuPageSuspense() {
  return (
    <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}>…</div>}>
      <HeaderMenuPage />
    </Suspense>
  )
}
