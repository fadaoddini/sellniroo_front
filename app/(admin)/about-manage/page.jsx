// app/(admin)/about-manage/page.jsx — مدیریت محتوای صفحه درباره ما
'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Info, RefreshCw, Shield, LayoutDashboard, Save, Search, Share2,
  Languages, Plus, Trash2, ExternalLink, FileText,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import {
  DEFAULT_ABOUT_SEO,
  normalizeAboutPage,
  clearAboutPageCache,
  emptyAboutContent,
  sanitizeAboutContent,
} from '@/services/aboutPage'
import { aboutData } from '@/components/About/AboutData'
import styles from './AboutManage.module.css'

const SECTIONS = [
  { id: 'fa', icon: FileText, iconClass: styles.iconFa },
  { id: 'en', icon: Languages, iconClass: styles.iconEn },
  { id: 'seo', icon: Search, iconClass: styles.iconSeo },
  { id: 'social', icon: Share2, iconClass: styles.iconSocial },
]

const ICON_OPTIONS = [
  'Briefcase', 'Building2', 'Users', 'Award', 'Shield',
  'Target', 'Zap', 'Calendar', 'CheckCircle', 'Home', 'BarChart3',
]

function SwitchField({ label, hint, checked, onChange }) {
  return (
    <label className={styles.switchRow}>
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

function Field({ label, value, onChange, multiline, rows = 3, dir, placeholder }) {
  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      {multiline ? (
        <textarea
          rows={rows}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
          placeholder={placeholder}
        />
      ) : (
        <input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
          placeholder={placeholder}
        />
      )}
    </div>
  )
}

function ContentEditor({ content, onChange, labels, textDir }) {
  const data = content && typeof content === 'object' ? content : emptyAboutContent()

  const patch = (partial) => onChange({ ...data, ...partial })

  const patchSection = (key, partial) => {
    const sec = { ...(data[key] || {}), ...partial }
    patch({ [key]: sec })
  }

  const setParagraphsText = (key, text) => {
    const paragraphs = String(text || '')
      .split('\n')
      .map((line) => line.trimEnd())
    patchSection(key, { paragraphs })
  }

  const paragraphsText = (key) =>
    Array.isArray(data[key]?.paragraphs) ? data[key].paragraphs.join('\n') : ''

  const updateListItem = (listKey, index, partial) => {
    const list = Array.isArray(data[listKey]) ? [...data[listKey]] : []
    list[index] = { ...(list[index] || {}), ...partial }
    patch({ [listKey]: list })
  }

  const removeListItem = (listKey, index) => {
    const list = Array.isArray(data[listKey]) ? [...data[listKey]] : []
    list.splice(index, 1)
    patch({ [listKey]: list })
  }

  const addStat = () => {
    patch({
      stats: [
        ...(Array.isArray(data.stats) ? data.stats : []),
        { value: '', label: '', icon: 'Briefcase' },
      ],
    })
  }

  const addService = () => {
    const sections = data.sections || { title: '', items: [] }
    patch({
      sections: {
        ...sections,
        items: [
          ...(Array.isArray(sections.items) ? sections.items : []),
          { title: '', desc: '', icon: 'Target' },
        ],
      },
    })
  }

  const updateService = (index, partial) => {
    const sections = data.sections || { title: '', items: [] }
    const items = [...(sections.items || [])]
    items[index] = { ...(items[index] || {}), ...partial }
    patch({ sections: { ...sections, items } })
  }

  const removeService = (index) => {
    const sections = data.sections || { title: '', items: [] }
    const items = [...(sections.items || [])]
    items.splice(index, 1)
    patch({ sections: { ...sections, items } })
  }

  const addAchievement = () => {
    const achievements = data.achievements || { title: '', items: [] }
    patch({
      achievements: {
        ...achievements,
        items: [
          ...(Array.isArray(achievements.items) ? achievements.items : []),
          { label: '', desc: '-' },
        ],
      },
    })
  }

  const updateAchievement = (index, partial) => {
    const achievements = data.achievements || { title: '', items: [] }
    const items = [...(achievements.items || [])]
    items[index] = { ...(items[index] || {}), ...partial }
    patch({ achievements: { ...achievements, items } })
  }

  const removeAchievement = (index) => {
    const achievements = data.achievements || { title: '', items: [] }
    const items = [...(achievements.items || [])]
    items.splice(index, 1)
    patch({ achievements: { ...achievements, items } })
  }

  return (
    <>
      <div className={styles.grid2}>
        <Field
          label={labels.pageTitle}
          value={data.title}
          onChange={(v) => patch({ title: v })}
          dir={textDir}
        />
        <Field
          label={labels.subtitle}
          value={data.subtitle}
          onChange={(v) => patch({ subtitle: v })}
          dir={textDir}
        />
      </div>

      {['section1', 'section2'].map((key) => (
        <div key={key} className={styles.subGroup}>
          <p className={styles.subGroupTitle}>
            {key === 'section1' ? labels.section1 : labels.section2}
          </p>
          <Field
            label={labels.sectionTitle}
            value={data[key]?.title}
            onChange={(v) => patchSection(key, { title: v })}
            dir={textDir}
          />
          <Field
            label={labels.paragraphs}
            value={paragraphsText(key)}
            onChange={(v) => setParagraphsText(key, v)}
            multiline
            rows={5}
            dir={textDir}
            placeholder={labels.paragraphsHint}
          />
          <div className={styles.grid3}>
            <Field
              label={labels.imageSrc}
              value={data[key]?.image?.src}
              onChange={(v) =>
                patchSection(key, {
                  image: { ...(data[key]?.image || {}), src: v },
                })
              }
              dir="ltr"
              placeholder="/images/..."
            />
            <Field
              label={labels.imageAlt}
              value={data[key]?.image?.alt}
              onChange={(v) =>
                patchSection(key, {
                  image: { ...(data[key]?.image || {}), alt: v },
                })
              }
              dir={textDir}
            />
            <Field
              label={labels.imageCaption}
              value={data[key]?.image?.caption}
              onChange={(v) =>
                patchSection(key, {
                  image: { ...(data[key]?.image || {}), caption: v },
                })
              }
              dir={textDir}
            />
          </div>
        </div>
      ))}

      <div className={styles.subGroup}>
        <div className={styles.listHead}>
          <strong>{labels.stats}</strong>
          <button type="button" className={styles.addBtn} onClick={addStat}>
            <Plus size={14} /> {labels.add}
          </button>
        </div>
        <div className={styles.listStack}>
          {(data.stats || []).map((item, index) => (
            <div key={`stat-${index}`} className={styles.listCard}>
              <div className={styles.listCardTop}>
                <span className={styles.listIndex}>#{index + 1}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeListItem('stats', index)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className={styles.grid3}>
                <Field
                  label={labels.statValue}
                  value={item.value}
                  onChange={(v) => updateListItem('stats', index, { value: v })}
                  dir={textDir}
                />
                <Field
                  label={labels.statLabel}
                  value={item.label}
                  onChange={(v) => updateListItem('stats', index, { label: v })}
                  dir={textDir}
                />
                <div className={styles.formGroup}>
                  <label>{labels.icon}</label>
                  <select
                    value={item.icon || 'Briefcase'}
                    onChange={(e) =>
                      updateListItem('stats', index, { icon: e.target.value })
                    }
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.subGroup}>
        <p className={styles.subGroupTitle}>{labels.services}</p>
        <Field
          label={labels.servicesTitle}
          value={data.sections?.title}
          onChange={(v) =>
            patch({ sections: { ...(data.sections || {}), title: v } })
          }
          dir={textDir}
        />
        <div className={styles.listHead}>
          <strong>{labels.serviceItems}</strong>
          <button type="button" className={styles.addBtn} onClick={addService}>
            <Plus size={14} /> {labels.add}
          </button>
        </div>
        <div className={styles.listStack}>
          {(data.sections?.items || []).map((item, index) => (
            <div key={`svc-${index}`} className={styles.listCard}>
              <div className={styles.listCardTop}>
                <span className={styles.listIndex}>#{index + 1}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeService(index)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className={styles.grid2}>
                <Field
                  label={labels.serviceTitle}
                  value={item.title}
                  onChange={(v) => updateService(index, { title: v })}
                  dir={textDir}
                />
                <div className={styles.formGroup}>
                  <label>{labels.icon}</label>
                  <select
                    value={item.icon || 'Target'}
                    onChange={(e) => updateService(index, { icon: e.target.value })}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
              </div>
              <Field
                label={labels.serviceDesc}
                value={item.desc}
                onChange={(v) => updateService(index, { desc: v })}
                multiline
                rows={2}
                dir={textDir}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.subGroup}>
        <p className={styles.subGroupTitle}>{labels.achievements}</p>
        <Field
          label={labels.achievementsTitle}
          value={data.achievements?.title}
          onChange={(v) =>
            patch({ achievements: { ...(data.achievements || {}), title: v } })
          }
          dir={textDir}
        />
        <div className={styles.listHead}>
          <strong>{labels.achievementItems}</strong>
          <button type="button" className={styles.addBtn} onClick={addAchievement}>
            <Plus size={14} /> {labels.add}
          </button>
        </div>
        <div className={styles.listStack}>
          {(data.achievements?.items || []).map((item, index) => (
            <div key={`ach-${index}`} className={styles.listCard}>
              <div className={styles.listCardTop}>
                <span className={styles.listIndex}>#{index + 1}</span>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeAchievement(index)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              <div className={styles.grid2}>
                <Field
                  label={labels.achievementLabel}
                  value={item.label}
                  onChange={(v) => updateAchievement(index, { label: v })}
                  dir={textDir}
                />
                <Field
                  label={labels.achievementDesc}
                  value={item.desc}
                  onChange={(v) => updateAchievement(index, { desc: v })}
                  dir={textDir}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function AboutManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [form, setForm] = useState(() =>
    normalizeAboutPage({
      ...DEFAULT_ABOUT_SEO,
      content_fa: aboutData.fa,
      content_en: aboutData.en,
    })
  )
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeSection, setActiveSection] = useState('fa')
  const formRef = useRef(null)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'About page',
    subtitle: 'Edit About Us content, SEO and social previews',
    back: 'Dashboard',
    save: 'Save changes',
    saving: 'Saving...',
    loading: 'Loading...',
    accessDenied: 'Access denied',
    needManager: 'Only managers and staff can edit the about page',
    preview: 'View page',
    navFa: 'Persian',
    navEn: 'English',
    navSeo: 'SEO',
    navSocial: 'Social',
    faTitle: 'Persian content',
    faDesc: 'Texts shown when language is FA',
    enTitle: 'English content',
    enDesc: 'Texts shown when language is EN',
    seoTitle: 'SEO',
    seoDesc: 'Search indexing and meta tags',
    socialTitle: 'Social share',
    socialDesc: 'Open Graph and Twitter cards',
    pageTitle: 'Page title',
    subtitleField: 'Subtitle',
    section1: 'Section 1 — Introduction',
    section2: 'Section 2 — Commitment',
    sectionTitle: 'Section title',
    paragraphs: 'Paragraphs',
    paragraphsHint: 'One paragraph per line',
    imageSrc: 'Image URL',
    imageAlt: 'Image alt',
    imageCaption: 'Caption',
    stats: 'Key stats',
    services: 'Services',
    servicesTitle: 'Services heading',
    serviceItems: 'Service items',
    serviceTitle: 'Title',
    serviceDesc: 'Description',
    achievements: 'Advantages',
    achievementsTitle: 'Advantages heading',
    achievementItems: 'Advantage items',
    achievementLabel: 'Label',
    achievementDesc: 'Note',
    add: 'Add',
    statValue: 'Value',
    statLabel: 'Label',
    icon: 'Icon',
    seoTitleField: 'SEO title',
    seoDescField: 'SEO description',
    keywords: 'Keywords',
    keywordsHint: 'One keyword per line',
    canonical: 'Canonical URL',
    robots: 'Allow search indexing',
    robotsHint: 'Turn off to keep this page out of search results',
    ogTitle: 'OG title',
    ogDesc: 'OG description',
    ogImage: 'Share image URL',
    twTitle: 'Twitter title',
    twDesc: 'Twitter description',
    saved: 'About page saved successfully',
  } : {
    title: 'مدیریت درباره ما',
    subtitle: 'ویرایش محتوا، سئو و پیش‌نمایش اشتراک‌گذاری',
    back: 'داشبورد',
    save: 'ذخیره تغییرات',
    saving: 'در حال ذخیره...',
    loading: 'در حال بارگذاری...',
    accessDenied: 'دسترسی محدود',
    needManager: 'ویرایش صفحه درباره ما فقط برای مدیر و staff است',
    preview: 'مشاهده صفحه',
    navFa: 'فارسی',
    navEn: 'انگلیسی',
    navSeo: 'سئو',
    navSocial: 'اشتراک',
    faTitle: 'محتوای فارسی',
    faDesc: 'متن‌هایی که با زبان فارسی نمایش داده می‌شوند',
    enTitle: 'محتوای انگلیسی',
    enDesc: 'متن‌هایی که با زبان انگلیسی نمایش داده می‌شوند',
    seoTitle: 'سئو',
    seoDesc: 'ایندکس جستجو و متاتگ‌ها',
    socialTitle: 'اشتراک‌گذاری',
    socialDesc: 'کارت Open Graph و توییتر',
    pageTitle: 'عنوان صفحه',
    subtitleField: 'زیرعنوان',
    section1: 'بخش ۱ — معرفی',
    section2: 'بخش ۲ — تعهد',
    sectionTitle: 'عنوان بخش',
    paragraphs: 'پاراگراف‌ها',
    paragraphsHint: 'هر پاراگراف در یک خط',
    imageSrc: 'آدرس تصویر',
    imageAlt: 'متن جایگزین تصویر',
    imageCaption: 'کپشن',
    stats: 'آمار کلیدی',
    services: 'خدمات',
    servicesTitle: 'عنوان بخش خدمات',
    serviceItems: 'آیتم‌های خدمات',
    serviceTitle: 'عنوان',
    serviceDesc: 'توضیح',
    achievements: 'مزیت‌ها',
    achievementsTitle: 'عنوان بخش مزیت‌ها',
    achievementItems: 'آیتم‌های مزیت',
    achievementLabel: 'عنوان',
    achievementDesc: 'یادداشت',
    add: 'افزودن',
    statValue: 'مقدار',
    statLabel: 'برچسب',
    icon: 'آیکون',
    seoTitleField: 'عنوان سئو',
    seoDescField: 'توضیحات سئو',
    keywords: 'کلمات کلیدی',
    keywordsHint: 'هر کلمه در یک خط',
    canonical: 'آدرس canonical',
    robots: 'اجازه ایندکس در موتورهای جستجو',
    robotsHint: 'با خاموش کردن، این صفحه در نتایج جستجو دیده نمی‌شود',
    ogTitle: 'عنوان OG',
    ogDesc: 'توضیحات OG',
    ogImage: 'آدرس تصویر اشتراک',
    twTitle: 'عنوان توییتر',
    twDesc: 'توضیحات توییتر',
    saved: 'صفحه درباره ما با موفقیت ذخیره شد',
  }

  const contentLabels = {
    pageTitle: t.pageTitle,
    subtitle: t.subtitleField,
    section1: t.section1,
    section2: t.section2,
    sectionTitle: t.sectionTitle,
    paragraphs: t.paragraphs,
    paragraphsHint: t.paragraphsHint,
    imageSrc: t.imageSrc,
    imageAlt: t.imageAlt,
    imageCaption: t.imageCaption,
    stats: t.stats,
    services: t.services,
    servicesTitle: t.servicesTitle,
    serviceItems: t.serviceItems,
    serviceTitle: t.serviceTitle,
    serviceDesc: t.serviceDesc,
    achievements: t.achievements,
    achievementsTitle: t.achievementsTitle,
    achievementItems: t.achievementItems,
    achievementLabel: t.achievementLabel,
    achievementDesc: t.achievementDesc,
    add: t.add,
    statValue: t.statValue,
    statLabel: t.statLabel,
    icon: t.icon,
  }

  const navLabels = {
    fa: t.navFa,
    en: t.navEn,
    seo: t.navSeo,
    social: t.navSocial,
  }

  const fetchData = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const res = await axios.get(Config.endpoints.news.about.get(), {
        headers: getAuthHeaders(),
      })
      setForm(normalizeAboutPage(res.data?.data || res.data))
    } catch (err) {
      setError(err.response?.data?.detail || err.message)
      setForm(
        normalizeAboutPage({
          ...DEFAULT_ABOUT_SEO,
          content_fa: aboutData.fa,
          content_en: aboutData.en,
        })
      )
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

    const contentFa = sanitizeAboutContent(form.content_fa)
    if (!contentFa.title) {
      setError(language === 'en' ? 'Persian title is required' : 'عنوان فارسی الزامی است')
      scrollToSection('fa')
      return
    }

    try {
      setSaving(true)
      const payload = {
        content_fa: contentFa,
        content_en: sanitizeAboutContent(form.content_en),
        seo_title: form.seo_title || '',
        seo_description: form.seo_description || '',
        seo_keywords: Array.isArray(form.keywords)
          ? form.keywords.join('\n')
          : (form.seo_keywords || ''),
        canonical_url: form.canonical_url || '',
        og_title: form.og_title || '',
        og_description: form.og_description || '',
        og_image_url: form.og_image_url || '',
        twitter_title: form.twitter_title || '',
        twitter_description: form.twitter_description || '',
        robots_index: !!form.robots_index,
      }

      const res = await axios.patch(
        Config.endpoints.news.about.update(),
        payload,
        {
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
        }
      )
      setForm(normalizeAboutPage(res.data?.data || res.data))
      clearAboutPageCache()
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

  const keywordsText = Array.isArray(form.keywords)
    ? form.keywords.join('\n')
    : (form.seo_keywords || '')

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><Info size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title}</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/about" target="_blank" className={styles.previewLink}>
              <ExternalLink size={14} /> {t.preview}
            </Link>
            <Link href="/dashboard" className={styles.headerGhost}>
              <LayoutDashboard size={15} /> {t.back}
            </Link>
            <button type="button" className={styles.headerGhost} onClick={fetchData} aria-label="refresh">
              <RefreshCw size={15} />
            </button>
            <button
              type="submit"
              form="about-manage-form"
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

        {error ? <div className={styles.errorBar}>{error}</div> : null}
        {success ? <div className={styles.successBar}>{success}</div> : null}

        <form
          id="about-manage-form"
          ref={formRef}
          className={styles.sections}
          onSubmit={handleSave}
        >
          <section id="section-fa" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconFa}`}>
                <FileText size={18} />
              </span>
              <div>
                <h2 className={styles.sectionTitle}>{t.faTitle}</h2>
                <p className={styles.sectionDesc}>{t.faDesc}</p>
              </div>
            </div>
            <ContentEditor
              content={form.content_fa}
              onChange={(next) => setField('content_fa', next)}
              labels={contentLabels}
              textDir="rtl"
            />
          </section>

          <section id="section-en" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconEn}`}>
                <Languages size={18} />
              </span>
              <div>
                <h2 className={styles.sectionTitle}>{t.enTitle}</h2>
                <p className={styles.sectionDesc}>{t.enDesc}</p>
              </div>
            </div>
            <ContentEditor
              content={form.content_en}
              onChange={(next) => setField('content_en', next)}
              labels={contentLabels}
              textDir="ltr"
            />
          </section>

          <section id="section-seo" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconSeo}`}>
                <Search size={18} />
              </span>
              <div>
                <h2 className={styles.sectionTitle}>{t.seoTitle}</h2>
                <p className={styles.sectionDesc}>{t.seoDesc}</p>
              </div>
            </div>
            <SwitchField
              label={t.robots}
              hint={t.robotsHint}
              checked={form.robots_index !== false}
              onChange={(v) => setField('robots_index', v)}
            />
            <Field
              label={t.seoTitleField}
              value={form.seo_title}
              onChange={(v) => setField('seo_title', v)}
            />
            <Field
              label={t.seoDescField}
              value={form.seo_description}
              onChange={(v) => setField('seo_description', v)}
              multiline
              rows={3}
            />
            <Field
              label={t.keywords}
              value={keywordsText}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  seo_keywords: v,
                  keywords: v
                    .replace(/,/g, '\n')
                    .split(/\n+/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                }))
              }
              multiline
              rows={5}
              placeholder={t.keywordsHint}
            />
            <Field
              label={t.canonical}
              value={form.canonical_url}
              onChange={(v) => setField('canonical_url', v)}
              dir="ltr"
            />
          </section>

          <section id="section-social" className={styles.sectionCard}>
            <div className={styles.sectionHead}>
              <span className={`${styles.sectionIcon} ${styles.iconSocial}`}>
                <Share2 size={18} />
              </span>
              <div>
                <h2 className={styles.sectionTitle}>{t.socialTitle}</h2>
                <p className={styles.sectionDesc}>{t.socialDesc}</p>
              </div>
            </div>
            <div className={styles.grid2}>
              <Field
                label={t.ogTitle}
                value={form.og_title}
                onChange={(v) => setField('og_title', v)}
              />
              <Field
                label={t.twTitle}
                value={form.twitter_title}
                onChange={(v) => setField('twitter_title', v)}
              />
            </div>
            <Field
              label={t.ogDesc}
              value={form.og_description}
              onChange={(v) => setField('og_description', v)}
              multiline
              rows={2}
            />
            <Field
              label={t.twDesc}
              value={form.twitter_description}
              onChange={(v) => setField('twitter_description', v)}
              multiline
              rows={2}
            />
            <Field
              label={t.ogImage}
              value={form.og_image_url}
              onChange={(v) => setField('og_image_url', v)}
              dir="ltr"
              placeholder="https://sellniroo.com/images/logo.png"
            />
          </section>
        </form>
      </div>
    </div>
  )
}
