'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, RefreshCw, LayoutDashboard, Save, Eye, Palette, Type,
  Plus, Trash2, Pencil, ChevronUp, ChevronDown, Shield, Layers,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import catalogService from '@/components/Catalog/services/catalogService'
import PageBuilder from '@/components/Catalog/builder/PageBuilder'
import { legacyPageToBuilder, emptyBuilder } from '@/components/Catalog/builder/layouts'
import styles from './CatalogManage.module.css'

function SwitchField({ label, hint, checked, onChange }) {
  return (
    <label className={styles.switchRow}>
      <span>
        <span className={styles.switchLabel}>{label}</span>
        {hint ? <span className={styles.switchHint}>{hint}</span> : null}
      </span>
      <span className={`${styles.switch} ${checked ? styles.switchOn : ''}`}>
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
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
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} dir="ltr" />
      </div>
    </div>
  )
}

export default function CatalogManagePage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees } = useAuth()
  const { language, dir } = useLanguage()
  const isFa = language !== 'en'
  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const [tab, setTab] = useState('pages')
  const [settings, setSettings] = useState({})
  const [pages, setPages] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [editingPage, setEditingPage] = useState(null) // null | 'new' | page object

  const t = isFa
    ? {
        title: 'مدیریت کاتالوگ',
        subtitle: 'صفحه‌ساز درگ‌اند‌دراپ، شبکه‌ها، متن و رنگ',
        back: 'داشبورد',
        save: 'ذخیره',
        refresh: 'بروزرسانی',
        tabPages: 'صفحات',
        tabVis: 'نمایش',
        tabText: 'متن هدر',
        tabColor: 'رنگ‌ها',
        pages: 'صفحات کاتالوگ',
        add: 'صفحه جدید',
        edit: 'ویرایش با صفحه‌ساز',
        saved: 'ذخیره شد',
        denied: 'دسترسی ندارید',
        needManager: 'فقط مدیر و staff',
        loading: 'در حال بارگذاری...',
        empty: 'هنوز صفحه‌ای نیست — یک صفحه بسازید',
        confirmDelete: 'حذف این صفحه؟',
        showHome: 'نمایش در صفحه اصلی',
        showHeader: 'نمایش هدر بالای کتاب',
        showNums: 'شماره صفحه',
        headerTitleFa: 'عنوان هدر فارسی',
        headerTitleEn: 'عنوان هدر انگلیسی',
        headerSubFa: 'زیرعنوان هدر فارسی',
        headerSubEn: 'زیرعنوان هدر انگلیسی',
        accent: 'رنگ اصلی',
        accent2: 'رنگ دوم',
        stageBg: 'پس‌زمینه صحنه',
        pageBg: 'پس‌زمینه صفحه',
        pageText: 'رنگ متن صفحه',
        sections: 'بخش',
        builderHint: 'با انتخاب شبکه و کشیدن ویجت‌ها مثل المنتور صفحه را بچینید',
      }
    : {
        title: 'Catalog manage',
        subtitle: 'Drag-and-drop builder, grids, texts and colors',
        back: 'Dashboard',
        save: 'Save',
        refresh: 'Refresh',
        tabPages: 'Pages',
        tabVis: 'Visibility',
        tabText: 'Header texts',
        tabColor: 'Colors',
        pages: 'Catalog pages',
        add: 'New page',
        edit: 'Edit in builder',
        saved: 'Saved',
        denied: 'Access denied',
        needManager: 'Managers and staff only',
        loading: 'Loading...',
        empty: 'No pages yet — create one',
        confirmDelete: 'Delete this page?',
        showHome: 'Show on homepage',
        showHeader: 'Show stage header',
        showNums: 'Page numbers',
        headerTitleFa: 'Header title FA',
        headerTitleEn: 'Header title EN',
        headerSubFa: 'Header subtitle FA',
        headerSubEn: 'Header subtitle EN',
        accent: 'Accent',
        accent2: 'Secondary',
        stageBg: 'Stage background',
        pageBg: 'Page background',
        pageText: 'Page text color',
        sections: 'sections',
        builderHint: 'Pick a grid and drag widgets like Elementor',
      }

  const loadAll = useCallback(async () => {
    setLoadingData(true)
    setErr(null)
    const [s, p] = await Promise.all([
      catalogService.getSettings(),
      catalogService.getPages(true),
    ])
    if (s.success) setSettings(s.data)
    if (p.success) setPages(p.data || [])
    if (!s.success) setErr(s.error)
    setLoadingData(false)
  }, [])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login?next=/catalog-manage')
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (canManage) loadAll()
  }, [canManage, loadAll])

  const patchSettings = (partial) => setSettings((prev) => ({ ...prev, ...partial }))

  const saveSettings = async () => {
    setSaving(true)
    setMsg(null)
    setErr(null)
    const res = await catalogService.updateSettings(settings)
    setSaving(false)
    if (res.success) {
      setSettings(res.data)
      setMsg(t.saved)
    } else setErr(res.error)
  }

  const removePage = async (id) => {
    if (!confirm(t.confirmDelete)) return
    const res = await catalogService.deletePage(id)
    if (res.success) loadAll()
    else setErr(res.error)
  }

  const movePage = async (index, dir) => {
    const next = [...pages]
    const j = index + dir
    if (j < 0 || j >= next.length) return
    ;[next[index], next[j]] = [next[j], next[index]]
    setPages(next)
    await catalogService.reorder(next.map((p) => p.id))
  }

  const sectionCount = (page) => {
    const b = legacyPageToBuilder(page)
    return (b.sections || []).length
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
      <div className={`${styles.wrap} ${editingPage ? styles.wrapWide : ''}`}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><BookOpen size={24} /></div>
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
            {tab !== 'pages' && !editingPage && (
              <button type="button" className={styles.btnPrimary} onClick={saveSettings} disabled={saving}>
                <Save size={16} /> {t.save}
              </button>
            )}
          </div>
        </div>

        {msg ? <div className={`${styles.msg} ${styles.msgOk}`}>{msg}</div> : null}
        {err ? <div className={`${styles.msg} ${styles.msgErr}`}>{err}</div> : null}

        {!editingPage && (
          <div className={styles.tabs}>
            {[
              { id: 'pages', label: t.tabPages, icon: Layers },
              { id: 'visibility', label: t.tabVis, icon: Eye },
              { id: 'texts', label: t.tabText, icon: Type },
              { id: 'colors', label: t.tabColor, icon: Palette },
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
        )}

        {tab === 'visibility' && !editingPage && (
          <div className={styles.card}>
            <SwitchField
              label={t.showHome}
              checked={settings.show_on_homepage !== false}
              onChange={(v) => patchSettings({ show_on_homepage: v })}
            />
            <SwitchField
              label={t.showHeader}
              checked={settings.show_header !== false}
              onChange={(v) => patchSettings({ show_header: v })}
            />
            <SwitchField
              label={t.showNums}
              checked={settings.show_page_numbers !== false}
              onChange={(v) => patchSettings({ show_page_numbers: v })}
            />
          </div>
        )}

        {tab === 'texts' && !editingPage && (
          <div className={styles.card}>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>{t.headerTitleFa}</label>
                <input value={settings.header_title_fa || ''} onChange={(e) => patchSettings({ header_title_fa: e.target.value })} dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label>{t.headerTitleEn}</label>
                <input value={settings.header_title_en || ''} onChange={(e) => patchSettings({ header_title_en: e.target.value })} dir="ltr" />
              </div>
              <div className={styles.formGroup}>
                <label>{t.headerSubFa}</label>
                <input value={settings.header_subtitle_fa || ''} onChange={(e) => patchSettings({ header_subtitle_fa: e.target.value })} dir="rtl" />
              </div>
              <div className={styles.formGroup}>
                <label>{t.headerSubEn}</label>
                <input value={settings.header_subtitle_en || ''} onChange={(e) => patchSettings({ header_subtitle_en: e.target.value })} dir="ltr" />
              </div>
            </div>
          </div>
        )}

        {tab === 'colors' && !editingPage && (
          <div className={styles.card}>
            <div className={styles.grid2}>
              <ColorField label={t.accent} value={settings.accent_color} onChange={(v) => patchSettings({ accent_color: v })} />
              <ColorField label={t.accent2} value={settings.accent_secondary} onChange={(v) => patchSettings({ accent_secondary: v })} />
              <ColorField label={t.stageBg} value={settings.stage_bg} onChange={(v) => patchSettings({ stage_bg: v })} />
              <ColorField label={t.pageBg} value={settings.page_bg} onChange={(v) => patchSettings({ page_bg: v })} />
              <ColorField label={t.pageText} value={settings.page_text} onChange={(v) => patchSettings({ page_text: v })} />
            </div>
          </div>
        )}

        {tab === 'pages' && !editingPage && (
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
              <div>
                <h3 className={styles.cardTitle} style={{ margin: 0 }}>{t.pages}</h3>
                <p className={styles.pageDesc} style={{ marginTop: 4 }}>{t.builderHint}</p>
              </div>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() =>
                  setEditingPage({
                    id: null,
                    order: pages.length,
                    title_fa: '',
                    title_en: '',
                    builder: emptyBuilder('100'),
                  })
                }
              >
                <Plus size={16} /> {t.add}
              </button>
            </div>
            {pages.length === 0 ? (
              <div className={styles.empty}>{t.empty}</div>
            ) : (
              <div className={styles.pageList}>
                {pages.map((page, index) => (
                  <div key={page.id} className={styles.pageRow}>
                    <div className={styles.orderBtns}>
                      <button type="button" onClick={() => movePage(index, -1)} aria-label="up">
                        <ChevronUp size={14} />
                      </button>
                      <button type="button" onClick={() => movePage(index, 1)} aria-label="down">
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <div className={styles.pageMeta}>
                      <strong>{page.title_fa || page.title_en || `#${page.id}`}</strong>
                      <span>
                        {sectionCount(page)} {t.sections}
                        {!page.is_active ? ' · off' : ''}
                      </span>
                    </div>
                    <div className={styles.pageActions}>
                      <button
                        type="button"
                        className={styles.btn}
                        onClick={() => setEditingPage(page)}
                        title={t.edit}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className={styles.btnDanger}
                        onClick={() => removePage(page.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {editingPage && (
          <div className={styles.card} style={{ padding: 12 }}>
            <PageBuilder
              key={editingPage.id || 'new'}
              page={editingPage}
              isFa={isFa}
              onCancel={() => setEditingPage(null)}
              onSaved={() => {
                setEditingPage(null)
                setMsg(t.saved)
                loadAll()
              }}
            />
          </div>
        )}

        {tab !== 'pages' && !editingPage && (
          <div className={styles.footerBar}>
            <button type="button" className={styles.btnPrimary} onClick={saveSettings} disabled={saving}>
              <Save size={16} /> {saving ? '...' : t.save}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
