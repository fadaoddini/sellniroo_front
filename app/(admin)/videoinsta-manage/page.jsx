'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Video, RefreshCw, LayoutDashboard, Save, Eye,
  Palette, Type, Plus, Trash2, Upload, Image as ImageIcon,
  Shield,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import videoArchiveService from '@/components/Story/services/videoArchiveService'
import {
  DEFAULT_VIDEO_INSTA_SETTINGS,
  fetchVideoInstaSettings,
  updateVideoInstaSettings,
  clearVideoInstaSettingsCache,
  normalizeVideoInstaSettings,
} from '@/services/videoInstaSettings'
import styles from './VideoInstaManage.module.css'

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

function ColorField({ label, value, onChange }) {
  const hex = value || '#000000'
  return (
    <div className={styles.formGroup}>
      <label>{label}</label>
      <div className={styles.colorRow}>
        <input
          type="color"
          value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : '#000000'}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#be123c"
          dir="ltr"
        />
      </div>
    </div>
  )
}

export default function VideoInstaManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()
  const isFa = language !== 'en'

  const [tab, setTab] = useState('visibility')
  const [settings, setSettings] = useState(DEFAULT_VIDEO_INSTA_SETTINGS)
  const [videos, setVideos] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const [newTitle, setNewTitle] = useState('')
  const [newVideo, setNewVideo] = useState(null)
  const [newThumb, setNewThumb] = useState(null)
  const [uploading, setUploading] = useState(false)

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = isFa
    ? {
        title: 'مدیریت آرشیو ویدیو / استوری',
        subtitle: 'متن‌ها، رنگ‌ها، نمایش و ویدیوها',
        back: 'داشبورد',
        save: 'ذخیره تنظیمات',
        refresh: 'بروزرسانی',
        tabVis: 'نمایش',
        tabText: 'متن‌ها',
        tabColor: 'رنگ‌ها',
        tabVideos: 'ویدیوها',
        showDesktop: 'بخش دسکتاپ',
        showDesktopHint: 'آرشیو کامل در صفحه اصلی',
        showMobile: 'استوری موبایل',
        showMobileHint: 'دایره‌ها زیر نوار خبر',
        showTitle: 'نمایش عنوان',
        showSubtitle: 'نمایش زیرعنوان',
        showViews: 'نمایش بازدید',
        showAdd: 'دکمه افزودن در سایت',
        showAddHint: 'برای ادمین لاگین‌شده در صفحه سایت',
        titleFa: 'عنوان فارسی',
        titleEn: 'عنوان انگلیسی',
        subFa: 'زیرعنوان فارسی',
        subEn: 'زیرعنوان انگلیسی',
        accent: 'رنگ اصلی',
        accent2: 'رنگ دوم',
        bgFrom: 'پس‌زمینه (شروع)',
        bgTo: 'پس‌زمینه (پایان)',
        titleColor: 'رنگ ثابت عنوان (اختیاری)',
        ring1: 'حلقه استوری ۱',
        ring2: 'حلقه استوری ۲',
        ring3: 'حلقه استوری ۳',
        railBg: 'پس‌زمینه نوار موبایل',
        preview: 'پیش‌نمایش عنوان',
        videos: 'لیست ویدیوها',
        addVideo: 'افزودن ویدیو',
        videoFile: 'فایل ویدیو',
        thumb: 'تصویر شاخص',
        videoTitle: 'عنوان ویدیو',
        upload: 'آپلود',
        delete: 'حذف',
        views: 'بازدید',
        empty: 'ویدیویی نیست',
        saved: 'ذخیره شد',
        denied: 'دسترسی ندارید',
        needManager: 'فقط مدیر و staff می‌توانند این بخش را مدیریت کنند',
        loading: 'در حال بارگذاری...',
        confirmDelete: 'حذف این ویدیو؟',
        needVideo: 'فایل ویدیو را انتخاب کنید',
      }
    : {
        title: 'Video Insta manage',
        subtitle: 'Texts, colors, visibility and videos',
        back: 'Dashboard',
        save: 'Save settings',
        refresh: 'Refresh',
        tabVis: 'Visibility',
        tabText: 'Texts',
        tabColor: 'Colors',
        tabVideos: 'Videos',
        showDesktop: 'Desktop section',
        showDesktopHint: 'Full archive on homepage',
        showMobile: 'Mobile stories',
        showMobileHint: 'Circles under breaking news',
        showTitle: 'Show title',
        showSubtitle: 'Show subtitle',
        showViews: 'Show views',
        showAdd: 'Add button on site',
        showAddHint: 'For logged-in admins on the public page',
        titleFa: 'Title (FA)',
        titleEn: 'Title (EN)',
        subFa: 'Subtitle (FA)',
        subEn: 'Subtitle (EN)',
        accent: 'Accent',
        accent2: 'Secondary',
        bgFrom: 'Background from',
        bgTo: 'Background to',
        titleColor: 'Solid title color (optional)',
        ring1: 'Story ring 1',
        ring2: 'Story ring 2',
        ring3: 'Story ring 3',
        railBg: 'Mobile rail background',
        preview: 'Title preview',
        videos: 'Videos',
        addVideo: 'Add video',
        videoFile: 'Video file',
        thumb: 'Thumbnail',
        videoTitle: 'Video title',
        upload: 'Upload',
        delete: 'Delete',
        views: 'views',
        empty: 'No videos yet',
        saved: 'Saved',
        denied: 'Access denied',
        needManager: 'Only managers and staff can manage this section',
        loading: 'Loading...',
        confirmDelete: 'Delete this video?',
        needVideo: 'Please choose a video file',
      }

  const loadAll = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    try {
      clearVideoInstaSettingsCache()
      const [s, v] = await Promise.all([
        fetchVideoInstaSettings({ force: true }),
        videoArchiveService.getVideos(1, 50, { include_inactive: '1' }),
      ])
      setSettings(normalizeVideoInstaSettings(s))
      if (v.success) setVideos(v.data?.items || [])
    } catch (e) {
      setErr(e?.message || 'error')
    } finally {
      setLoadingData(false)
    }
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/videoinsta-manage')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (canManage) loadAll()
  }, [canManage, loadAll])

  const patch = (partial) => setSettings((prev) => ({ ...prev, ...partial }))

  const saveSettings = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    try {
      const headers = typeof getAuthHeaders === 'function' ? getAuthHeaders() : {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      }
      const data = await updateVideoInstaSettings(settings, headers)
      setSettings(data)
      setMsg(t.saved)
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'error')
    } finally {
      setSaving(false)
    }
  }

  const uploadVideo = async () => {
    if (!newVideo) {
      setErr(t.needVideo)
      return
    }
    setUploading(true)
    setErr(null)
    try {
      const result = await videoArchiveService.createVideo({
        title: newTitle,
        video: newVideo,
        thumbnail: newThumb,
        is_active: true,
      })
      if (!result.success) throw new Error(result.error)
      setNewTitle('')
      setNewVideo(null)
      setNewThumb(null)
      await loadAll()
      setMsg(t.saved)
    } catch (e) {
      setErr(e?.message || 'error')
    } finally {
      setUploading(false)
    }
  }

  const removeVideo = async (id) => {
    if (!confirm(t.confirmDelete)) return
    const result = await videoArchiveService.deleteVideo(id)
    if (result.success) loadAll()
    else setErr(result.error)
  }

  const previewTitle = isFa ? settings.title_fa : settings.title_en
  const previewSub = isFa ? settings.subtitle_fa : settings.subtitle_en

  const getFullUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    if (path.startsWith('/media/')) return `${Config.baseUrl}${path}`
    return `${Config.baseUrl}/media/${String(path).replace(/^\/+/, '')}`
  }

  if (loading || (canManage && loadingData)) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.loading}>{t.loading}</div>
      </div>
    )
  }

  if (!canManage) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.denied}>
          <Shield size={40} />
          <h3>{t.denied}</h3>
          <p>{t.needManager}</p>
          <Link href="/dashboard" className={styles.btn}>{t.back}</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><Video size={24} /></div>
            <div>
              <h1 className={styles.pageTitle}>{t.title}</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.btnGhost}>
              <LayoutDashboard size={16} /> {t.back}
            </Link>
            <button type="button" className={styles.btnGhost} onClick={loadAll}>
              <RefreshCw size={16} /> {t.refresh}
            </button>
            {tab !== 'videos' && (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={saveSettings}
                disabled={saving}
              >
                <Save size={16} /> {saving ? '...' : t.save}
              </button>
            )}
          </div>
        </div>

        {msg ? <div className={`${styles.msg} ${styles.msgOk}`}>{msg}</div> : null}
        {err ? <div className={`${styles.msg} ${styles.msgErr}`}>{err}</div> : null}

        <div className={styles.tabs}>
          {[
            { id: 'visibility', label: t.tabVis, icon: Eye },
            { id: 'texts', label: t.tabText, icon: Type },
            { id: 'colors', label: t.tabColor, icon: Palette },
            { id: 'videos', label: t.tabVideos, icon: Video },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.tab} ${tab === id ? styles.tabActive : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={14} style={{ marginInlineEnd: 4 }} />
              {label}
            </button>
          ))}
        </div>

        {tab === 'visibility' && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t.tabVis}</h3>
            <SwitchField
              label={t.showDesktop}
              hint={t.showDesktopHint}
              checked={settings.show_desktop_section}
              onChange={(v) => patch({ show_desktop_section: v })}
            />
            <SwitchField
              label={t.showMobile}
              hint={t.showMobileHint}
              checked={settings.show_mobile_rail}
              onChange={(v) => patch({ show_mobile_rail: v })}
            />
            <SwitchField
              label={t.showTitle}
              checked={settings.show_title}
              onChange={(v) => patch({ show_title: v })}
            />
            <SwitchField
              label={t.showSubtitle}
              checked={settings.show_subtitle}
              onChange={(v) => patch({ show_subtitle: v })}
            />
            <SwitchField
              label={t.showViews}
              checked={settings.show_views}
              onChange={(v) => patch({ show_views: v })}
            />
            <SwitchField
              label={t.showAdd}
              hint={t.showAddHint}
              checked={settings.show_add_button}
              onChange={(v) => patch({ show_add_button: v })}
            />
          </div>
        )}

        {tab === 'texts' && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t.tabText}</h3>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>{t.titleFa}</label>
                <input
                  value={settings.title_fa || ''}
                  onChange={(e) => patch({ title_fa: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t.titleEn}</label>
                <input
                  value={settings.title_en || ''}
                  onChange={(e) => patch({ title_en: e.target.value })}
                  dir="ltr"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t.subFa}</label>
                <input
                  value={settings.subtitle_fa || ''}
                  onChange={(e) => patch({ subtitle_fa: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t.subEn}</label>
                <input
                  value={settings.subtitle_en || ''}
                  onChange={(e) => patch({ subtitle_en: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>
            <div
              className={styles.previewBox}
              style={{
                '--preview-accent': settings.accent_color,
                '--preview-mid': settings.accent_secondary,
                '--preview-solid': settings.title_color || undefined,
                background: `linear-gradient(160deg, ${settings.section_bg_from}, ${settings.section_bg_to})`,
              }}
            >
              <p style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.6 }}>{t.preview}</p>
              {settings.show_title !== false && (
                <h4
                  className={`${styles.previewTitle} ${
                    settings.title_color ? styles.previewTitleSolid : ''
                  }`}
                >
                  {previewTitle}
                </h4>
              )}
              {settings.show_subtitle !== false && (
                <p className={styles.previewSub}>{previewSub}</p>
              )}
              {settings.show_title === false && settings.show_subtitle === false && (
                <p className={styles.previewSub}>
                  {isFa ? 'عنوان و زیرعنوان مخفی‌اند' : 'Title & subtitle hidden'}
                </p>
              )}
            </div>
          </div>
        )}

        {tab === 'colors' && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>{t.tabColor}</h3>
            <div className={styles.grid2}>
              <ColorField label={t.accent} value={settings.accent_color} onChange={(v) => patch({ accent_color: v })} />
              <ColorField label={t.accent2} value={settings.accent_secondary} onChange={(v) => patch({ accent_secondary: v })} />
              <ColorField label={t.bgFrom} value={settings.section_bg_from} onChange={(v) => patch({ section_bg_from: v })} />
              <ColorField label={t.bgTo} value={settings.section_bg_to} onChange={(v) => patch({ section_bg_to: v })} />
              <ColorField label={t.titleColor} value={settings.title_color} onChange={(v) => patch({ title_color: v })} />
              <ColorField label={t.railBg} value={settings.rail_bg} onChange={(v) => patch({ rail_bg: v })} />
              <ColorField label={t.ring1} value={settings.ring_color_1} onChange={(v) => patch({ ring_color_1: v })} />
              <ColorField label={t.ring2} value={settings.ring_color_2} onChange={(v) => patch({ ring_color_2: v })} />
              <ColorField label={t.ring3} value={settings.ring_color_3} onChange={(v) => patch({ ring_color_3: v })} />
            </div>
          </div>
        )}

        {tab === 'videos' && (
          <>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>{t.addVideo}</h3>
              <div className={styles.addForm}>
                <div className={styles.formGroup}>
                  <label>{t.videoTitle}</label>
                  <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label>{t.videoFile}</label>
                  <input
                    className={styles.fileInput}
                    id="vi-video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setNewVideo(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="vi-video" className={styles.fileLabel}>
                    <Upload size={16} />
                    {newVideo?.name || t.videoFile}
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>{t.thumb}</label>
                  <input
                    className={styles.fileInput}
                    id="vi-thumb"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewThumb(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="vi-thumb" className={styles.fileLabel}>
                    <ImageIcon size={16} />
                    {newThumb?.name || t.thumb}
                  </label>
                </div>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ justifyContent: 'center' }}
                  onClick={uploadVideo}
                  disabled={uploading || !newVideo}
                >
                  <Plus size={16} /> {uploading ? '...' : t.upload}
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <h3 className={styles.cardTitle}>{t.videos}</h3>
              {videos.length === 0 ? (
                <div className={styles.empty}>{t.empty}</div>
              ) : (
                <div className={styles.videoList}>
                  {videos.map((v) => (
                    <div key={v.id} className={styles.videoRow}>
                      <div className={styles.thumb}>
                        {v.thumbnail_url ? (
                          <img src={getFullUrl(v.thumbnail_url)} alt="" />
                        ) : null}
                      </div>
                      <div className={styles.videoMeta}>
                        <strong>{v.title || `#${v.id}`}</strong>
                        <span>
                          {v.views || 0} {t.views}
                        </span>
                      </div>
                      <div className={styles.videoActions}>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => removeVideo(v.id)}
                        >
                          <Trash2 size={14} /> {t.delete}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab !== 'videos' && (
          <div className={styles.footerBar}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={saveSettings}
              disabled={saving}
            >
              <Save size={16} /> {saving ? '...' : t.save}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
