// app/(admin)/job-single — مدیریت کامل صفحه سینگل آگهی
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Briefcase,
  LayoutDashboard,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  fetchSiteSettings,
  saveJobSinglePageSettings,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import {
  fetchSiteModules,
  isSiteModuleActive,
} from '@/services/siteModules'
import {
  DEFAULT_JOB_SINGLE_PAGE_SETTINGS,
  JOB_SINGLE_COMPOSITIONS,
  JOB_SINGLE_TITLE_SIZES,
  applyJobSingleComposition,
  normalizeJobSinglePageSettings,
} from '@/config/jobSinglePageSettings'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from '../news-list/NewsListAdmin.module.css'

function toHexForPicker(value, fallback = '#e67e22') {
  const v = String(value || '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`
  }
  return fallback
}

function ColorField({ label, value, onChange }) {
  const hex = toHexForPicker(value)
  return (
    <div className={styles.colorRow}>
      <label>{label}</label>
      <div className={styles.colorControls}>
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          dir="ltr"
        />
      </div>
    </div>
  )
}

export default function JobSingleAdminPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, hasPermission, getAuthHeaders } =
    useAuth()
  const { language, dir } = useLanguage()
  const canAccess =
    user?.is_superuser ||
    user?.is_staff ||
    hasPermission('jobs') ||
    hasPermission('jobisell') ||
    hasPermission('news')

  const [form, setForm] = useState(() =>
    normalizeJobSinglePageSettings(DEFAULT_JOB_SINGLE_PAGE_SETTINGS)
  )
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [moduleOn, setModuleOn] = useState(null)

  const t =
    language === 'en'
      ? {
          title: 'Job single page',
          subtitle: 'Full control over /jobs/[id] appearance and blocks',
          back: 'Dashboard',
          save: 'Save',
          saving: 'Saving…',
          refresh: 'Refresh',
          loading: 'Loading…',
          accessDenied: 'Access denied',
          needJobs: 'You need jobs access',
          moduleOff: 'Job board module is off in AdminWeb.',
          returnHome: 'Home',
          saved: 'Settings saved',
          saveError: 'Save failed',
          hint: 'Pick a template, toggle blocks and colors. Layout chrome from /adminkaryabi.',
        }
      : {
          title: 'صفحه سینگل آگهی',
          subtitle: 'قالب نمایش، اجزا و رنگ‌های صفحه جزئیات آگهی',
          back: 'داشبورد',
          save: 'ذخیره',
          saving: 'در حال ذخیره…',
          refresh: 'بروزرسانی',
          loading: 'در حال بارگذاری…',
          accessDenied: 'دسترسی محدود',
          needJobs: 'برای این بخش باید دسترسی کاریابی داشته باشید',
          moduleOff: 'ماژول سیستم کاریابی خاموش است.',
          returnHome: 'صفحه اصلی',
          saved: 'تنظیمات ذخیره شد',
          saveError: 'ذخیره ناموفق بود',
          hint: 'قالب و اجزای بدنه از اینجا؛ هدر/منو/ستون‌ها از /adminkaryabi.',
        }

  const load = useCallback(async () => {
    setLoadingData(true)
    setError('')
    try {
      await fetchSiteModules({ force: true })
      const active = await isSiteModuleActive(SITE_MODULE_KEYS.JOB_BOARD, {
        force: true,
      })
      setModuleOn(!!active)
      if (!active) return
      clearSiteSettingsCache()
      const settings = await fetchSiteSettings({ force: true })
      setForm(
        normalizeJobSinglePageSettings(
          settings?.job_single_page || DEFAULT_JOB_SINGLE_PAGE_SETTINGS
        )
      )
    } catch (e) {
      setError(e?.message || t.loading)
    } finally {
      setLoadingData(false)
    }
  }, [t.loading])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canAccess) load()
  }, [isAuthenticated, canAccess, load])

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 2800)
  }

  const onSave = async () => {
    setSaving(true)
    setError('')
    try {
      const saved = await saveJobSinglePageSettings(form, getAuthHeaders())
      setForm(normalizeJobSinglePageSettings(saved))
      showToast(t.saved)
    } catch (e) {
      setError(e?.message || t.saveError)
      showToast(e?.message || t.saveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.centerBox}>
          <RefreshCw className={styles.spin} size={22} />
          <p>{t.loading}</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canAccess) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.centerBox}>
          <Shield size={40} />
          <h2>{t.accessDenied}</h2>
          <p>{t.needJobs}</p>
          <Link href="/" className={styles.stickyGhost}>
            {t.returnHome}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      {toast ? (
        <div
          className={`${styles.toast} ${
            toast.type === 'error' ? styles.toastError : styles.toastOk
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      ) : null}

      <div className={styles.wrap}>
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.headerIcon}>
              <Briefcase size={20} />
            </span>
            <div>
              <h1>{t.title}</h1>
              <p>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={14} />
              {t.back}
            </Link>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={load}
              disabled={loadingData || saving}
            >
              <RefreshCw
                size={14}
                className={loadingData ? styles.spin : undefined}
              />
              {t.refresh}
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onSave}
              disabled={saving || loadingData || moduleOn === false}
            >
              {saving ? (
                <RefreshCw size={14} className={styles.spin} />
              ) : (
                <Save size={14} />
              )}
              {saving ? t.saving : t.save}
            </button>
          </div>
        </header>

        <p className={styles.hint}>{t.hint}</p>

        {error ? (
          <div className={styles.alert} role="alert">
            <AlertCircle size={14} />
            {error}
          </div>
        ) : null}

        {loadingData ? (
          <div className={styles.centerBox}>
            <RefreshCw className={styles.spin} size={20} />
            <p>{t.loading}</p>
          </div>
        ) : moduleOn === false ? (
          <div className={styles.empty}>
            <AlertCircle size={22} />
            <p>{t.moduleOff}</p>
            <Link href="/adminkaryabi" className={styles.stickyPrimary}>
              adminkaryabi
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>قالب نمایش محتوا</p>
                <p className={styles.panelHint}>
                  یکی از طرح‌های بدنه سینگل آگهی را انتخاب کنید
                </p>
              </div>
              <div className={styles.segRow}>
                {JOB_SINGLE_COMPOSITIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.layout === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() =>
                      setForm((prev) => applyJobSingleComposition(prev, o.id))
                    }
                    title={o.desc}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className={styles.labelMuted} style={{ marginTop: '1rem' }}>
                اندازه عنوان
              </p>
              <div className={styles.segRow}>
                {JOB_SINGLE_TITLE_SIZES.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.title_size === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        title_size: o.id,
                        title_font_size: o.px,
                      }))
                    }
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className={styles.grid2} style={{ marginTop: '1rem' }}>
                <label className={styles.field}>
                  <span>حداکثر عرض (px)</span>
                  <input
                    type="number"
                    min={640}
                    max={1400}
                    value={form.section_max_width}
                    onChange={(e) =>
                      patch(
                        'section_max_width',
                        Math.max(
                          640,
                          Math.min(1400, Number(e.target.value) || 1100)
                        )
                      )
                    }
                    dir="ltr"
                  />
                </label>
                <label className={styles.field}>
                  <span>اندازه فونت متن</span>
                  <input
                    type="number"
                    min={13}
                    max={22}
                    value={form.content_font_size}
                    onChange={(e) =>
                      patch(
                        'content_font_size',
                        Math.max(
                          13,
                          Math.min(22, Number(e.target.value) || 16)
                        )
                      )
                    }
                    dir="ltr"
                  />
                </label>
                <label className={styles.field}>
                  <span>اندازه عنوان (px)</span>
                  <input
                    type="number"
                    min={18}
                    max={48}
                    value={form.title_font_size}
                    onChange={(e) =>
                      patch(
                        'title_font_size',
                        Math.max(
                          18,
                          Math.min(48, Number(e.target.value) || 28)
                        )
                      )
                    }
                    dir="ltr"
                  />
                </label>
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>نمایش اجزا</p>
                <p className={styles.panelHint}>
                  هر بخش صفحه سینگل آگهی را جداگانه کنترل کنید
                </p>
              </div>
              <div className={styles.toggles}>
                {[
                  ['show_breadcrumb', 'مسیر صفحه'],
                  ['show_back_link', 'لینک بازگشت'],
                  ['show_image', 'تصویر آگهی'],
                  ['show_badges', 'برچسب‌ها'],
                  ['show_type_badge', 'نوع استخدام/کارجو'],
                  ['show_featured_badge', 'برچسب ویژه'],
                  ['show_title', 'عنوان'],
                  ['show_company', 'نام شرکت'],
                  ['show_verified', 'تایید شرکت'],
                  ['show_location', 'موقعیت'],
                  ['show_salary', 'حقوق'],
                  ['show_cooperation', 'نوع همکاری'],
                  ['show_meta_date', 'تاریخ انتشار'],
                  ['show_experience', 'سابقه'],
                  ['show_education', 'تحصیلات'],
                  ['show_gender', 'جنسیت'],
                  ['show_age', 'بازه سنی'],
                  ['show_description', 'توضیحات'],
                  ['show_features', 'مزایا و امکانات'],
                  ['show_tags', 'برچسب‌ها / تگ'],
                  ['show_apply', 'فرم درخواست'],
                  ['show_like', 'لایک'],
                  ['show_bookmark', 'نشان‌گذاری'],
                  ['show_share', 'اشتراک‌گذاری'],
                  ['share_bale', 'اشتراک بله'],
                  ['share_eitaa', 'اشتراک ایتا'],
                  ['share_rubika', 'اشتراک روبیکا'],
                  ['share_soroush', 'اشتراک سروش'],
                  ['show_contact', 'اطلاعات تماس'],
                  ['show_company_card', 'کارت شرکت'],
                  ['show_similar', 'آگهی‌های مشابه'],
                  ['show_views', 'آمار بازدید'],
                ].map(([key, label]) => (
                  <label key={key} className={styles.toggleRow}>
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={!!form[key]}
                      onChange={(e) => patch(key, e.target.checked)}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>رنگ‌ها</p>
              </div>
              <div className={styles.colorGrid}>
                <ColorField
                  label="متن"
                  value={form.ink_color}
                  onChange={(v) => patch('ink_color', v)}
                />
                <ColorField
                  label="متن فرعی"
                  value={form.muted_color}
                  onChange={(v) => patch('muted_color', v)}
                />
                <ColorField
                  label="تاکید"
                  value={form.accent_color}
                  onChange={(v) => patch('accent_color', v)}
                />
                <ColorField
                  label="پس‌زمینه"
                  value={form.surface_bg}
                  onChange={(v) => patch('surface_bg', v)}
                />
              </div>
            </div>

            <div className={styles.stickyBar}>
              <div className={styles.stickyInner}>
                <span className={styles.stickyNote}>
                  تغییرات روی /jobs/[id] اعمال می‌شود · چیدمان از adminkaryabi
                </span>
                <div className={styles.stickyActions}>
                  <Link href="/adminkaryabi" className={styles.stickyGhost}>
                    adminkaryabi
                  </Link>
                  <button
                    type="button"
                    className={styles.stickyPrimary}
                    onClick={onSave}
                    disabled={saving || loadingData}
                  >
                    {saving ? (
                      <RefreshCw size={14} className={styles.spin} />
                    ) : (
                      <Save size={14} />
                    )}
                    {saving ? t.saving : t.save}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
