// app/(admin)/header-menu/page.jsx — ظاهر + لینک‌های سیستم شرکتی
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  PanelTop, Plus, Pencil, Trash2, RefreshCw, Shield, Save,
  CheckCircle2, X, LayoutDashboard, Power, ExternalLink,
  Palette, List, Upload, ImagePlus,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import { clearHeaderMenuCache } from '@/services/headerMenu'
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
  { key: 'header_text', fa: 'رنگ متن هدر', en: 'Header text' },
  { key: 'header_icon', fa: 'رنگ آیکون هدر', en: 'Header icons' },
  { key: 'header_hover', fa: 'رنگ هاور هدر', en: 'Header hover' },
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

export default function HeaderMenuPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [tab, setTab] = useState('appearance')
  const [items, setItems] = useState([])
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE)
  const [logoFile, setLogoFile] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [savingAppear, setSavingAppear] = useState(false)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'Corporate system',
    subtitle: 'Logo, colors and menu links for corporate header & mobile nav',
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
    adminweb: 'Modules',
    tabAppear: 'Appearance',
    tabLinks: 'Menu links',
    appearTitle: 'Logo & colors',
    appearDesc: 'Dedicated branding for corporate header (desktop) and bottom mobile nav',
    logo: 'Corporate logo',
    logoHint: 'Used only in Header With Menu (desktop)',
    pickFile: 'Choose image',
    clearFile: 'Clear file',
    headerColors: 'Desktop header colors',
    mobileColors: 'Mobile bottom nav colors',
    mobileStyles: 'Mobile menu layout',
    mobileStylesDesc: 'Pick how the bottom navigation looks on phones',
    preview: 'Live preview',
    saved: 'Appearance saved',
    headerLabel: 'Header',
    mobileLabel: 'Mobile',
  } : {
    title: 'سیستم شرکتی',
    subtitle: 'لوگو، رنگ‌ها و لینک‌های هدر و منوی موبایل شرکتی',
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
    adminweb: 'ماژول‌ها',
    tabAppear: 'ظاهر',
    tabLinks: 'لینک‌های منو',
    appearTitle: 'لوگو و رنگ‌ها',
    appearDesc: 'برند اختصاصی هدر دسکتاپ و نوار پایین موبایل سیستم شرکتی',
    logo: 'لوگوی سیستم شرکتی',
    logoHint: 'فقط در هدر دارای منو (دسکتاپ) نمایش داده می‌شود',
    pickFile: 'انتخاب تصویر',
    clearFile: 'حذف فایل',
    headerColors: 'رنگ‌های هدر دسکتاپ',
    mobileColors: 'رنگ‌های منوی پایین موبایل',
    mobileStyles: 'حالت نمایش منوی موبایل',
    mobileStylesDesc: 'یکی از ۴ ظاهر پایین صفحه را انتخاب کنید',
    preview: 'پیش‌نمایش',
    saved: 'ظاهر با موفقیت ذخیره شد',
    headerLabel: 'هدر',
    mobileLabel: 'موبایل',
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

  const handleSaveAppearance = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    try {
      setSavingAppear(true)
      const fd = new FormData()
      ;[
        'logo_url',
        'header_bg', 'header_text', 'header_icon', 'header_hover',
        'mobile_bg', 'mobile_text', 'mobile_icon', 'mobile_active', 'mobile_style',
      ].forEach((key) => {
        fd.append(key, appearance[key] ?? '')
      })
      if (logoFile) fd.append('logo', logoFile)

      const res = await axios.patch(
        Config.endpoints.news.corporateAppearance.update(),
        fd,
        { headers: getAuthHeaders() }
      )
      setAppearance(normalizeCorporateAppearance(res.data?.data || res.data))
      setLogoFile(null)
      clearCorporateAppearanceCache()
      setSuccess(t.saved)
    } catch (err) {
      setError(fmtErrors(err.response?.data))
    } finally {
      setSavingAppear(false)
    }
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
            <Link href="/adminweb" className={styles.headerGhost}>
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
                form="corporate-appear-form"
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
            className={`${local.tab} ${tab === 'appearance' ? local.tabActive : ''}`}
            onClick={() => setTab('appearance')}
          >
            <Palette size={15} /> {t.tabAppear}
          </button>
          <button
            type="button"
            className={`${local.tab} ${tab === 'links' ? local.tabActive : ''}`}
            onClick={() => setTab('links')}
          >
            <List size={15} /> {t.tabLinks} ({items.length})
          </button>
        </div>

        {error && <div className={styles.errorBar}>{error}</div>}
        {success && <div className={local.successBar}>{success}</div>}

        {tab === 'appearance' && (
          <form id="corporate-appear-form" className={local.appearCard} onSubmit={handleSaveAppearance}>
            <div className={local.appearHead}>
              <h2>{t.appearTitle}</h2>
              <p>{t.appearDesc}</p>
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
                  background: appearance.header_bg,
                  color: appearance.header_text,
                }}
              >
                <span style={{ color: appearance.header_icon }}>●</span>
                {t.headerLabel}
              </span>
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
                  {items.map((item) => (
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
