// app/(admin)/news-single — مدیریت کامل صفحه سینگل خبر
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText,
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
  saveNewsSinglePageSettings,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import {
  fetchSiteModules,
  isSiteModuleActive,
} from '@/services/siteModules'
import {
  DEFAULT_NEWS_SINGLE_PAGE_SETTINGS,
  NEWS_SINGLE_GALLERY_RATIOS,
  NEWS_SINGLE_META_STYLES,
  NEWS_SINGLE_META_PLACEMENTS,
  applyNewsSingleComposition,
  normalizeNewsSinglePageSettings,
} from '@/config/newsSinglePageSettings'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import NewsSingleCompositionPicker from './NewsSingleCompositionPicker'
import styles from '../news-list/NewsListAdmin.module.css'

function toHexForPicker(value, fallback = '#c27800') {
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

export default function NewsSingleAdminPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, hasPermission, getAuthHeaders } =
    useAuth()
  const { language, dir } = useLanguage()
  const canAccess =
    user?.is_superuser || user?.is_staff || hasPermission('news')

  const [form, setForm] = useState(() =>
    normalizeNewsSinglePageSettings(DEFAULT_NEWS_SINGLE_PAGE_SETTINGS)
  )
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [moduleOn, setModuleOn] = useState(null)

  const t =
    language === 'en'
      ? {
          title: 'News single page',
          subtitle: 'Full control over /news/[slug] appearance and blocks',
          back: 'Dashboard',
          save: 'Save',
          saving: 'Saving…',
          refresh: 'Refresh',
          loading: 'Loading…',
          accessDenied: 'Access denied',
          needNews: 'You need news access',
          moduleOff: 'News module is off in AdminWeb.',
          returnHome: 'Home',
          saved: 'Settings saved',
          saveError: 'Save failed',
          hint: 'Pick a content template, badge placement, then toggle blocks and colors.',
        }
      : {
          title: 'صفحه سینگل',
          subtitle: 'قالب نمایش محتوا، جای بج، و اجزای بدنه خبر',
          back: 'داشبورد',
          save: 'ذخیره',
          saving: 'در حال ذخیره…',
          refresh: 'بروزرسانی',
          loading: 'در حال بارگذاری…',
          accessDenied: 'دسترسی محدود',
          needNews: 'برای این بخش باید دسترسی اخبار داشته باشید',
          moduleOff: 'ماژول اخبار خاموش است.',
          returnHome: 'صفحه اصلی',
          saved: 'تنظیمات ذخیره شد',
          saveError: 'ذخیره ناموفق بود',
          hint: 'قالب بدنه و بج از اینجا؛ هدر/منو/ستون‌ها فقط از /adminnews (ظاهر قدیمی سایت حذف شده).',
        }

  const load = useCallback(async () => {
    setLoadingData(true)
    setError('')
    try {
      await fetchSiteModules({ force: true })
      const active = await isSiteModuleActive(SITE_MODULE_KEYS.NEWS, {
        force: true,
      })
      setModuleOn(!!active)
      if (!active) return
      clearSiteSettingsCache()
      const settings = await fetchSiteSettings({ force: true })
      setForm(
        normalizeNewsSinglePageSettings(
          settings?.news_single_page || DEFAULT_NEWS_SINGLE_PAGE_SETTINGS
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
      const saved = await saveNewsSinglePageSettings(form, getAuthHeaders())
      setForm(normalizeNewsSinglePageSettings(saved))
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
          <p>{t.needNews}</p>
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
              <FileText size={20} />
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
            <Link href="/adminnews" className={styles.stickyPrimary}>
              adminnews
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.panel}>
              <NewsSingleCompositionPicker
                layout={form.layout}
                badgePlacement={form.badge_placement}
                titleSize={form.title_size}
                onSelectLayout={(id) =>
                  setForm((prev) => applyNewsSingleComposition(prev, id))
                }
                onBadgePlacement={(id) => patch('badge_placement', id)}
                onTitleSize={(id, px) =>
                  setForm((prev) => ({
                    ...prev,
                    title_size: id,
                    title_font_size: px,
                  }))
                }
              />
              <p className={styles.labelMuted} style={{ marginTop: '1rem' }}>
                نسبت گالری
              </p>
              <div className={styles.segRow}>
                {NEWS_SINGLE_GALLERY_RATIOS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.gallery_aspect === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() => patch('gallery_aspect', o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className={styles.grid2}>
                <label className={styles.field}>
                  <span>حداکثر عرض (px)</span>
                  <input
                    type="number"
                    min={640}
                    max={1200}
                    value={form.section_max_width}
                    onChange={(e) =>
                      patch(
                        'section_max_width',
                        Math.max(
                          640,
                          Math.min(1200, Number(e.target.value) || 900)
                        )
                      )
                    }
                    dir="ltr"
                  />
                </label>
                <label className={styles.field}>
                  <span>اندازه فونت متن بدنه</span>
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
                <p className={styles.panelTitle}>نوار اطلاعات (متا)</p>
                <p className={styles.panelHint}>
                  تاریخ، زمان مطالعه، بازدید، دسته و … — طرح، جایگاه و رنگ
                </p>
              </div>
              <p className={styles.labelMuted}>۴ طرح نمایش</p>
              <div className={styles.segRow}>
                {NEWS_SINGLE_META_STYLES.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.meta_style === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() => patch('meta_style', o.id)}
                    title={o.desc}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className={styles.labelMuted} style={{ marginTop: '0.85rem' }}>
                جایگاه نمایش
              </p>
              <div className={styles.segRow}>
                {NEWS_SINGLE_META_PLACEMENTS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    className={`${styles.segBtn} ${
                      form.meta_placement === o.id ? styles.segBtnOn : ''
                    }`}
                    onClick={() => patch('meta_placement', o.id)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <div className={styles.colorGrid} style={{ marginTop: '1rem' }}>
                <ColorField
                  label="متن متا"
                  value={form.meta_text_color}
                  onChange={(v) => patch('meta_text_color', v)}
                />
                <ColorField
                  label="پس‌زمینه متا"
                  value={form.meta_bg_color}
                  onChange={(v) => patch('meta_bg_color', v)}
                />
                <ColorField
                  label="آیکن متا"
                  value={form.meta_icon_color}
                  onChange={(v) => patch('meta_icon_color', v)}
                />
                <ColorField
                  label="حاشیه متا"
                  value={form.meta_border_color}
                  onChange={(v) => patch('meta_border_color', v)}
                />
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHead}>
                <p className={styles.panelTitle}>نمایش اجزا</p>
                <p className={styles.panelHint}>
                  هر بخش صفحه سینگل را جداگانه کنترل کنید
                </p>
              </div>
              <div className={styles.toggles}>
                {[
                  ['show_back_link', 'لینک بازگشت'],
                  ['show_badges', 'برچسب‌های ویژه'],
                  ['show_status_badge', 'وضعیت خبر'],
                  ['show_gallery', 'گالری تصویر'],
                  ['show_thumbnails', 'تصاویر بندانگشتی'],
                  ['show_title', 'عنوان'],
                  ['show_subtitle', 'زیرعنوان'],
                  ['show_excerpt', 'لید / خلاصه'],
                  ['show_body', 'متن کامل'],
                  ['show_keywords', 'کلمات کلیدی'],
                  ['show_meta_date', 'تاریخ'],
                  ['show_meta_reading_time', 'زمان مطالعه'],
                  ['show_meta_views', 'بازدید'],
                  ['show_meta_writer', 'نویسنده'],
                  ['show_meta_source', 'منبع'],
                  ['show_meta_category', 'دسته'],
                  ['show_like', 'لایک'],
                  ['show_comment_btn', 'دکمه نظر'],
                  ['show_share', 'اشتراک‌گذاری'],
                  ['share_bale', 'اشتراک در بله'],
                  ['share_eitaa', 'اشتراک در ایتا'],
                  ['share_rubika', 'اشتراک در روبیکا'],
                  ['share_soroush', 'اشتراک در سروش'],
                  ['comments_enabled', 'ارسال نظر'],
                  ['allow_guest_comments', 'نظر مهمان'],
                  ['show_comments_list', 'لیست نظرات'],
                  ['show_json_ld', 'JSON-LD سئو'],
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
                  تغییرات روی /news/[slug] اعمال می‌شود
                </span>
                <div className={styles.stickyActions}>
                  <button
                    type="button"
                    className={styles.stickyGhost}
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
