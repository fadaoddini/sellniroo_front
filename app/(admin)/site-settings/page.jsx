// app/(admin)/site-settings/page.jsx — مدیریت لوگو، هدر و سئو
'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Settings2, RefreshCw, Shield, LayoutDashboard, Save, X, Tags,
  Palette, Phone, Search, Share2, ImagePlus, Upload, PhoneCall,
  Smartphone, Mail, ChevronLeft,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import {
  DEFAULT_SITE_SETTINGS,
  normalizeSiteSettings,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import { getFullImageUrl } from '@/utils/imageUrl'
import styles from './SiteSettings.module.css'

const resolvePreview = (src) => {
  if (!src) return null
  if (typeof src === 'string' && src.startsWith('/images/')) return src
  return getFullImageUrl(src)
}

const SECTIONS = [
  { id: 'brand', icon: Palette },
  { id: 'contact', icon: Phone },
  { id: 'seo', icon: Search },
  { id: 'social', icon: Share2 },
]

function SwitchField({ label, hint, checked, onChange, className }) {
  return (
    <label className={`${styles.switchRow} ${className || ''}`}>
      <span className={styles.switchText}>
        <span className={styles.switchLabel}>{label}</span>
        {hint ? <span className={styles.switchHint}>{hint}</span> : null}
      </span>
      <span className={`${styles.switch} ${checked ? styles.switchOn : ''}`}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      </span>
    </label>
  )
}

function MediaPicker({
  label,
  hint,
  preview,
  previewClass,
  file,
  onFile,
  onClear,
  urlValue,
  onUrlChange,
  urlPlaceholder,
  clearLabel,
  pickLabel,
}) {
  return (
    <div className={styles.mediaBlock}>
      <div className={styles.mediaPreview}>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className={previewClass} />
        ) : (
          <div className={styles.mediaEmpty}>
            <ImagePlus size={28} />
          </div>
        )}
      </div>
      <div className={styles.mediaControls}>
        <p className={styles.mediaLabel}>{label}</p>
        {hint ? <p className={styles.mediaHint}>{hint}</p> : null}
        <label className={styles.uploadBtn}>
          <Upload size={14} />
          <span>{pickLabel}</span>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
        </label>
        {file ? (
          <button type="button" className={styles.ghostBtn} onClick={onClear}>
            <X size={14} /> {clearLabel}
          </button>
        ) : null}
        <input
          className={styles.urlInput}
          dir="ltr"
          value={urlValue || ''}
          onChange={(e) => onUrlChange(e.target.value)}
          placeholder={urlPlaceholder}
        />
      </div>
    </div>
  )
}

export default function SiteSettingsPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [form, setForm] = useState(DEFAULT_SITE_SETTINGS)
  const [logoFile, setLogoFile] = useState(null)
  const [ogFile, setOgFile] = useState(null)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeSection, setActiveSection] = useState('brand')
  const formRef = useRef(null)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'Site settings',
    subtitle: 'Brand, contact, SEO and social previews',
    back: 'Dashboard',
    save: 'Save changes',
    saving: 'Saving...',
    loading: 'Loading...',
    accessDenied: 'Access denied',
    needManager: 'Only managers and staff can edit site settings',
    brand: 'Brand & header',
    brandDesc: 'Logo, site name and header controls',
    contact: 'Contact section',
    contactDesc: 'Homepage contact block and channels',
    manageTypes: 'Request types',
    manageTypesHint: 'Add or edit options in the contact form dialog',
    contactActive: 'Show contact section',
    contactActiveHint: 'Hide the whole block on the homepage',
    showPhone: 'Visible on site',
    showMobile: 'Visible on site',
    showEmail: 'Visible on site',
    contactTitle: 'Contact title',
    contactTitleEn: 'Contact title (EN)',
    contactDescLabel: 'Contact description',
    contactDescEn: 'Contact description (EN)',
    contactMobile: 'Mobile number',
    contactEmail: 'Contact email',
    phoneLabel: 'Phone label',
    mobileLabel: 'Mobile label',
    emailLabel: 'Email label',
    submitLabel: 'Submit button label',
    channelPhone: 'Landline',
    channelMobile: 'Mobile',
    channelEmail: 'Email',
    seo: 'SEO',
    seoDesc: 'Search indexing and meta tags',
    social: 'Social share',
    socialDesc: 'Open Graph and Twitter cards',
    siteName: 'Site name',
    siteNameEn: 'English name',
    logo: 'Logo',
    logoHint: 'Upload a file or paste a fallback URL',
    logoAlt: 'Logo alt text',
    logoTitle: 'Logo link title',
    searchPlaceholder: 'Search placeholder',
    ctaLabel: 'Header CTA label',
    ctaHref: 'Header CTA link',
    phone: 'Phone number',
    siteUrl: 'Site URL',
    seoTitle: 'SEO title',
    seoTemplate: 'Title template',
    seoDescField: 'SEO description',
    keywords: 'Keywords',
    keywordsHint: 'One keyword per line (or comma-separated)',
    category: 'Category',
    author: 'Author / publisher',
    robots: 'Allow search indexing',
    robotsHint: 'Turn off to keep pages out of search results',
    ogTitle: 'OG title',
    ogDesc: 'OG description',
    ogImage: 'Share image',
    ogImageHint: 'Recommended 1200×630',
    twTitle: 'Twitter title',
    twDesc: 'Twitter description',
    saved: 'Settings saved successfully',
    clearFile: 'Clear file',
    pickFile: 'Choose image',
    navBrand: 'Brand',
    navContact: 'Contact',
    navSeo: 'SEO',
    navSocial: 'Social',
    contentGroup: 'Texts',
    channelsGroup: 'Contact channels',
    formGroup: 'Form',
  } : {
    title: 'تنظیمات سایت',
    subtitle: 'برند، تماس، سئو و پیش‌نمایش شبکه‌های اجتماعی',
    back: 'داشبورد',
    save: 'ذخیره تغییرات',
    saving: 'در حال ذخیره...',
    loading: 'در حال بارگذاری...',
    accessDenied: 'دسترسی محدود',
    needManager: 'ویرایش تنظیمات سایت فقط برای مدیر و staff است',
    brand: 'برند و هدر',
    brandDesc: 'لوگو، نام سایت و کنترل‌های هدر',
    contact: 'بخش تماس',
    contactDesc: 'بلاک تماس صفحه اصلی و کانال‌های ارتباطی',
    manageTypes: 'انواع درخواست',
    manageTypesHint: 'گزینه‌های دیالوگ فرم تماس را اضافه یا ویرایش کنید',
    contactActive: 'نمایش بخش تماس',
    contactActiveHint: 'کل بلاک تماس را در صفحه اصلی مخفی می‌کند',
    showPhone: 'نمایش در سایت',
    showMobile: 'نمایش در سایت',
    showEmail: 'نمایش در سایت',
    contactTitle: 'عنوان بخش تماس',
    contactTitleEn: 'عنوان انگلیسی',
    contactDescLabel: 'توضیحات بخش تماس',
    contactDescEn: 'توضیحات انگلیسی',
    contactMobile: 'شماره موبایل',
    contactEmail: 'ایمیل تماس',
    phoneLabel: 'برچسب تلفن',
    mobileLabel: 'برچسب موبایل',
    emailLabel: 'برچسب ایمیل',
    submitLabel: 'متن دکمه ارسال',
    channelPhone: 'تلفن ثابت',
    channelMobile: 'موبایل',
    channelEmail: 'ایمیل',
    seo: 'سئو',
    seoDesc: 'ایندکس جستجو و متاتگ‌ها',
    social: 'اشتراک‌گذاری',
    socialDesc: 'کارت Open Graph و توییتر',
    siteName: 'نام سایت',
    siteNameEn: 'نام انگلیسی',
    logo: 'لوگو',
    logoHint: 'فایل آپلود کنید یا آدرس جایگزین وارد کنید',
    logoAlt: 'متن جایگزین لوگو',
    logoTitle: 'عنوان لینک لوگو',
    searchPlaceholder: 'Placeholder جستجو',
    ctaLabel: 'متن دکمه هدر',
    ctaHref: 'لینک دکمه هدر',
    phone: 'شماره تماس',
    siteUrl: 'آدرس سایت',
    seoTitle: 'عنوان سئو',
    seoTemplate: 'قالب عنوان صفحات',
    seoDescField: 'توضیحات سئو',
    keywords: 'کلمات کلیدی',
    keywordsHint: 'هر کلمه در یک خط (یا با ویرگول جدا کنید)',
    category: 'دسته‌بندی',
    author: 'نویسنده / ناشر',
    robots: 'اجازه ایندکس در موتورهای جستجو',
    robotsHint: 'با خاموش کردن، صفحات در نتایج جستجو دیده نمی‌شوند',
    ogTitle: 'عنوان OG',
    ogDesc: 'توضیحات OG',
    ogImage: 'تصویر اشتراک',
    ogImageHint: 'ابعاد پیشنهادی ۱۲۰۰×۶۳۰',
    twTitle: 'عنوان توییتر',
    twDesc: 'توضیحات توییتر',
    saved: 'تنظیمات با موفقیت ذخیره شد',
    clearFile: 'حذف فایل',
    pickFile: 'انتخاب تصویر',
    navBrand: 'برند',
    navContact: 'تماس',
    navSeo: 'سئو',
    navSocial: 'اجتماعی',
    contentGroup: 'متن‌ها',
    channelsGroup: 'کانال‌های تماس',
    formGroup: 'فرم',
  }

  const navLabels = {
    brand: t.navBrand,
    contact: t.navContact,
    seo: t.navSeo,
    social: t.navSocial,
  }

  const logoPreview = useMemo(() => {
    if (logoFile) return URL.createObjectURL(logoFile)
    return resolvePreview(form.logo_display || form.logo_url)
  }, [logoFile, form.logo_display, form.logo_url])

  const ogPreview = useMemo(() => {
    if (ogFile) return URL.createObjectURL(ogFile)
    return resolvePreview(form.og_image_display || form.og_image_url || form.logo_display)
  }, [ogFile, form.og_image_display, form.og_image_url, form.logo_display])

  useEffect(() => {
    if (!logoFile || !logoPreview?.startsWith('blob:')) return undefined
    const url = logoPreview
    return () => URL.revokeObjectURL(url)
  }, [logoFile, logoPreview])

  useEffect(() => {
    if (!ogFile || !ogPreview?.startsWith('blob:')) return undefined
    const url = ogPreview
    return () => URL.revokeObjectURL(url)
  }, [ogFile, ogPreview])

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const res = await axios.get(Config.endpoints.news.siteSettings.get(), {
        headers: getAuthHeaders(),
      })
      setForm(normalizeSiteSettings(res.data?.data || res.data))
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      setForm(normalizeSiteSettings(DEFAULT_SITE_SETTINGS))
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canManage) fetchData()
    else if (isAuthenticated) setLoadingData(false)
  }, [isAuthenticated, canManage, fetchData])

  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(null), 4000)
    return () => clearTimeout(timer)
  }, [success])

  useEffect(() => {
    const root = formRef.current
    if (!root) return undefined
    const nodes = SECTIONS.map((s) => root.querySelector(`#section-${s.id}`)).filter(Boolean)
    if (!nodes.length) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) {
          setActiveSection(visible.target.id.replace('section-', ''))
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.15, 0.4, 0.7] }
    )
    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [loadingData, canManage])

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const scrollToSection = (id) => {
    setActiveSection(id)
    const el = document.getElementById(`section-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!form.site_name?.trim()) {
      setError(language === 'en' ? 'Site name is required' : 'نام سایت الزامی است')
      scrollToSection('brand')
      return
    }
    try {
      setSaving(true)
      const fd = new FormData()
      const fields = [
        'site_name', 'site_name_en', 'logo_url', 'logo_alt', 'logo_title',
        'search_placeholder', 'header_cta_label', 'header_cta_href',
        'contact_phone', 'contact_mobile', 'contact_email',
        'contact_title', 'contact_title_en',
        'contact_description', 'contact_description_en',
        'contact_phone_label', 'contact_mobile_label', 'contact_email_label',
        'contact_submit_label',
        'site_url', 'seo_title', 'seo_title_template', 'seo_description',
        'seo_keywords', 'seo_category', 'author_name',
        'og_title', 'og_description', 'og_image_url',
        'twitter_title', 'twitter_description',
      ]
      fields.forEach((key) => {
        fd.append(key, form[key] ?? '')
      })
      fd.append('robots_index', form.robots_index ? 'true' : 'false')
      fd.append('contact_section_active', form.contact_section_active ? 'true' : 'false')
      fd.append('show_contact_phone', form.show_contact_phone ? 'true' : 'false')
      fd.append('show_contact_mobile', form.show_contact_mobile ? 'true' : 'false')
      fd.append('show_contact_email', form.show_contact_email ? 'true' : 'false')
      if (logoFile) fd.append('logo', logoFile)
      if (ogFile) fd.append('og_image', ogFile)

      const res = await axios.patch(
        Config.endpoints.news.siteSettings.update(),
        fd,
        { headers: getAuthHeaders() }
      )
      const next = normalizeSiteSettings(res.data?.data || res.data)
      setForm(next)
      setLogoFile(null)
      setOgFile(null)
      clearSiteSettingsCache()
      setSuccess(t.saved)
    } catch (err) {
      setError(fmtErrors(err.response?.data))
    } finally {
      setSaving(false)
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
            <span className={styles.headerIcon}><Settings2 size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title}</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.back}
            </Link>
            <button type="button" className={styles.headerGhost} onClick={fetchData} aria-label="refresh">
              <RefreshCw size={15} />
            </button>
            <button
              type="submit"
              form="site-settings-form"
              className={styles.headerPrimary}
              disabled={saving}
            >
              <Save size={15} /> {saving ? t.saving : t.save}
            </button>
          </div>
        </div>

        <nav className={styles.sectionNav} aria-label="sections">
          {SECTIONS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.navChip} ${activeSection === id ? styles.navChipActive : ''}`}
              onClick={() => scrollToSection(id)}
            >
              <Icon size={15} />
              {navLabels[id]}
            </button>
          ))}
        </nav>

        {error && <div className={styles.errorBar}>{error}</div>}
        {success && <div className={styles.successBar}>{success}</div>}

        <form
          id="site-settings-form"
          ref={formRef}
          className={styles.sections}
          onSubmit={handleSave}
        >
          {/* Brand */}
          <section id="section-brand" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconBrand}`}><Palette size={18} /></span>
              <div>
                <h2 className={styles.sectionTitle}>{t.brand}</h2>
                <p className={styles.sectionDesc}>{t.brandDesc}</p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t.siteName} *</label>
                <input value={form.site_name || ''} onChange={(e) => setField('site_name', e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label>{t.siteNameEn}</label>
                <input dir="ltr" value={form.site_name_en || ''} onChange={(e) => setField('site_name_en', e.target.value)} />
              </div>
            </div>

            <MediaPicker
              label={t.logo}
              hint={t.logoHint}
              preview={logoPreview}
              previewClass={styles.logoPreview}
              file={logoFile}
              onFile={setLogoFile}
              onClear={() => setLogoFile(null)}
              urlValue={form.logo_url}
              onUrlChange={(v) => setField('logo_url', v)}
              urlPlaceholder="/images/logo.png"
              clearLabel={t.clearFile}
              pickLabel={t.pickFile}
            />

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t.logoAlt}</label>
                <input value={form.logo_alt || ''} onChange={(e) => setField('logo_alt', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{t.logoTitle}</label>
                <input value={form.logo_title || ''} onChange={(e) => setField('logo_title', e.target.value)} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t.searchPlaceholder}</label>
              <input value={form.search_placeholder || ''} onChange={(e) => setField('search_placeholder', e.target.value)} />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t.ctaLabel}</label>
                <input value={form.header_cta_label || ''} onChange={(e) => setField('header_cta_label', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{t.ctaHref}</label>
                <input dir="ltr" value={form.header_cta_href || ''} onChange={(e) => setField('header_cta_href', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section id="section-contact" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconContact}`}><Phone size={18} /></span>
              <div className={styles.sectionHeadMain}>
                <div>
                  <h2 className={styles.sectionTitle}>{t.contact}</h2>
                  <p className={styles.sectionDesc}>{t.contactDesc}</p>
                </div>
                <Link href="/request-types" className={styles.linkCard}>
                  <span className={styles.linkCardIcon}><Tags size={16} /></span>
                  <span className={styles.linkCardBody}>
                    <strong>{t.manageTypes}</strong>
                    <small>{t.manageTypesHint}</small>
                  </span>
                  <ChevronLeft size={16} className={styles.linkCardChevron} />
                </Link>
              </div>
            </div>

            <SwitchField
              label={t.contactActive}
              hint={t.contactActiveHint}
              checked={form.contact_section_active}
              onChange={(v) => setField('contact_section_active', v)}
            />

            <div className={styles.subGroup}>
              <h3 className={styles.subGroupTitle}>{t.contentGroup}</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>{t.contactTitle}</label>
                  <input value={form.contact_title || ''} onChange={(e) => setField('contact_title', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.contactTitleEn}</label>
                  <input dir="ltr" value={form.contact_title_en || ''} onChange={(e) => setField('contact_title_en', e.target.value)} />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>{t.contactDescLabel}</label>
                <textarea rows={3} value={form.contact_description || ''} onChange={(e) => setField('contact_description', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{t.contactDescEn}</label>
                <textarea dir="ltr" rows={2} value={form.contact_description_en || ''} onChange={(e) => setField('contact_description_en', e.target.value)} />
              </div>
            </div>

            <div className={styles.subGroup}>
              <h3 className={styles.subGroupTitle}>{t.channelsGroup}</h3>
              <div className={styles.channelGrid}>
                <div className={`${styles.channelCard} ${form.show_contact_phone ? styles.channelOn : ''}`}>
                  <div className={styles.channelTop}>
                    <span className={styles.channelIcon}><PhoneCall size={16} /></span>
                    <strong>{t.channelPhone}</strong>
                    <span className={`${styles.switch} ${form.show_contact_phone ? styles.switchOn : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!form.show_contact_phone}
                        onChange={(e) => setField('show_contact_phone', e.target.checked)}
                        aria-label={t.showPhone}
                      />
                    </span>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.phone}</label>
                    <input dir="ltr" value={form.contact_phone || ''} onChange={(e) => setField('contact_phone', e.target.value)} placeholder="051xxxxxxx" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.phoneLabel}</label>
                    <input value={form.contact_phone_label || ''} onChange={(e) => setField('contact_phone_label', e.target.value)} />
                  </div>
                </div>

                <div className={`${styles.channelCard} ${form.show_contact_mobile ? styles.channelOn : ''}`}>
                  <div className={styles.channelTop}>
                    <span className={styles.channelIcon}><Smartphone size={16} /></span>
                    <strong>{t.channelMobile}</strong>
                    <span className={`${styles.switch} ${form.show_contact_mobile ? styles.switchOn : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!form.show_contact_mobile}
                        onChange={(e) => setField('show_contact_mobile', e.target.checked)}
                        aria-label={t.showMobile}
                      />
                    </span>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.contactMobile}</label>
                    <input dir="ltr" value={form.contact_mobile || ''} onChange={(e) => setField('contact_mobile', e.target.value)} placeholder="0912xxxxxxx" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.mobileLabel}</label>
                    <input value={form.contact_mobile_label || ''} onChange={(e) => setField('contact_mobile_label', e.target.value)} />
                  </div>
                </div>

                <div className={`${styles.channelCard} ${form.show_contact_email ? styles.channelOn : ''}`}>
                  <div className={styles.channelTop}>
                    <span className={styles.channelIcon}><Mail size={16} /></span>
                    <strong>{t.channelEmail}</strong>
                    <span className={`${styles.switch} ${form.show_contact_email ? styles.switchOn : ''}`}>
                      <input
                        type="checkbox"
                        checked={!!form.show_contact_email}
                        onChange={(e) => setField('show_contact_email', e.target.checked)}
                        aria-label={t.showEmail}
                      />
                    </span>
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.contactEmail}</label>
                    <input dir="ltr" type="email" value={form.contact_email || ''} onChange={(e) => setField('contact_email', e.target.value)} placeholder="info@example.com" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.emailLabel}</label>
                    <input value={form.contact_email_label || ''} onChange={(e) => setField('contact_email_label', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.subGroup}>
              <h3 className={styles.subGroupTitle}>{t.formGroup}</h3>
              <div className={styles.formGroup}>
                <label>{t.submitLabel}</label>
                <input value={form.contact_submit_label || ''} onChange={(e) => setField('contact_submit_label', e.target.value)} />
              </div>
            </div>
          </section>

          {/* SEO */}
          <section id="section-seo" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconSeo}`}><Search size={18} /></span>
              <div>
                <h2 className={styles.sectionTitle}>{t.seo}</h2>
                <p className={styles.sectionDesc}>{t.seoDesc}</p>
              </div>
            </div>

            <SwitchField
              label={t.robots}
              hint={t.robotsHint}
              checked={form.robots_index}
              onChange={(v) => setField('robots_index', v)}
            />

            <div className={styles.formGroup}>
              <label>{t.siteUrl}</label>
              <input dir="ltr" value={form.site_url || ''} onChange={(e) => setField('site_url', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>{t.seoTitle}</label>
              <input value={form.seo_title || ''} onChange={(e) => setField('seo_title', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>{t.seoTemplate}</label>
              <input dir="ltr" value={form.seo_title_template || ''} onChange={(e) => setField('seo_title_template', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>{t.seoDescField}</label>
              <textarea rows={3} value={form.seo_description || ''} onChange={(e) => setField('seo_description', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>{t.keywords}</label>
              <textarea
                rows={6}
                dir="auto"
                value={form.seo_keywords || ''}
                onChange={(e) => setField('seo_keywords', e.target.value)}
              />
              <p className={styles.keywordsHint}>{t.keywordsHint}</p>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t.category}</label>
                <input value={form.seo_category || ''} onChange={(e) => setField('seo_category', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label>{t.author}</label>
                <input dir="ltr" value={form.author_name || ''} onChange={(e) => setField('author_name', e.target.value)} />
              </div>
            </div>
          </section>

          {/* Social */}
          <section id="section-social" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconSocial}`}><Share2 size={18} /></span>
              <div>
                <h2 className={styles.sectionTitle}>{t.social}</h2>
                <p className={styles.sectionDesc}>{t.socialDesc}</p>
              </div>
            </div>

            <MediaPicker
              label={t.ogImage}
              hint={t.ogImageHint}
              preview={ogPreview}
              previewClass={styles.ogPreview}
              file={ogFile}
              onFile={setOgFile}
              onClear={() => setOgFile(null)}
              urlValue={form.og_image_url}
              onUrlChange={(v) => setField('og_image_url', v)}
              urlPlaceholder="/images/logo.png"
              clearLabel={t.clearFile}
              pickLabel={t.pickFile}
            />

            <div className={styles.formGroup}>
              <label>{t.ogTitle}</label>
              <input value={form.og_title || ''} onChange={(e) => setField('og_title', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>{t.ogDesc}</label>
              <textarea rows={2} value={form.og_description || ''} onChange={(e) => setField('og_description', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>{t.twTitle}</label>
              <input value={form.twitter_title || ''} onChange={(e) => setField('twitter_title', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>{t.twDesc}</label>
              <textarea rows={2} value={form.twitter_description || ''} onChange={(e) => setField('twitter_description', e.target.value)} />
            </div>
          </section>

          <div className={styles.stickyBar}>
            <p className={styles.stickyHint}>{t.subtitle}</p>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              <Save size={15} /> {saving ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
