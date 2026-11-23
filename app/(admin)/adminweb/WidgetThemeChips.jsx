'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, Plus, Trash2, Loader2, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchSiteSettings,
  saveWidgetCustomThemes,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import styles from './AdminWeb.module.css'

/**
 * انتخاب تم جمع‌وجور برای ویجت‌ها (خبر فوری / منو / …)
 * props:
 *  - presetKey: کلید در widget_presets (breaking_news | site_menu)
 *  - builtin + listThemes/applyTheme/snapshotTheme از کانفیگ مربوط
 */
export default function WidgetThemeChips({
  settings = {},
  onChange,
  presetKey = 'site_menu',
  listThemes,
  applyTheme,
  snapshotTheme,
  label = 'تم',
}) {
  const { getAuthHeaders } = useAuth()
  const [custom, setCustom] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [naming, setNaming] = useState(false)
  const [themeName, setThemeName] = useState('')
  const [hint, setHint] = useState('')

  const activeId = String(settings?.theme_id || '')
  const storageKey = `${presetKey}_custom_themes`

  const load = useCallback(async () => {
    setLoading(true)
    try {
      clearSiteSettingsCache()
      const s = await fetchSiteSettings({ force: true })
      let list = s?.widget_presets?.[presetKey]
      if (!Array.isArray(list) || !list.length) {
        try {
          const raw = window.localStorage.getItem(storageKey)
          const parsed = raw ? JSON.parse(raw) : []
          if (Array.isArray(parsed)) list = parsed
        } catch {
          /* ignore */
        }
      }
      setCustom(Array.isArray(list) ? list : [])
    } catch {
      try {
        const raw = window.localStorage.getItem(storageKey)
        const parsed = raw ? JSON.parse(raw) : []
        setCustom(Array.isArray(parsed) ? parsed : [])
      } catch {
        setCustom([])
      }
    } finally {
      setLoading(false)
    }
  }, [presetKey, storageKey])

  useEffect(() => {
    load()
  }, [load])

  const themes = useMemo(
    () => (typeof listThemes === 'function' ? listThemes(custom) : []),
    [listThemes, custom],
  )

  const flash = (text) => {
    setHint(text)
    window.setTimeout(() => setHint(''), 1800)
  }

  const onApply = (theme) => {
    if (!theme || typeof onChange !== 'function' || typeof applyTheme !== 'function')
      return
    onChange(applyTheme(settings, theme))
    flash(theme.name)
  }

  const persist = async (nextList) => {
    setSaving(true)
    try {
      const saved = await saveWidgetCustomThemes(
        presetKey,
        nextList,
        getAuthHeaders(),
      )
      setCustom(saved)
      return saved
    } finally {
      setSaving(false)
    }
  }

  const onSave = async () => {
    const name = themeName.trim()
    if (!name || typeof snapshotTheme !== 'function') return
    const snap = snapshotTheme(settings, { name })
    const next = [...custom.filter((t) => t.id !== snap.id), snap]
    await persist(next)
    onChange?.({ ...settings, theme_id: snap.id })
    setNaming(false)
    setThemeName('')
    flash('ذخیره شد')
  }

  const onDelete = async (theme, e) => {
    e?.stopPropagation?.()
    if (!theme || theme.builtIn) return
    const next = custom.filter((t) => t.id !== theme.id)
    await persist(next)
    if (activeId === theme.id) onChange?.({ ...settings, theme_id: '' })
  }

  return (
    <div className={styles.themeChips}>
      <div className={styles.themeChipsRow}>
        <span className={styles.themeChipsLabel}>{label}</span>
        {loading ? (
          <Loader2 size={12} className={styles.spin} />
        ) : (
          <div className={styles.themeChipsList}>
            {themes.map((theme) => {
              const on = activeId === theme.id
              const swatch = theme.swatch?.length
                ? theme.swatch
                : ['#888', '#aaa', '#ccc']
              return (
                <div key={theme.id} className={styles.themeChipWrap}>
                  <button
                    type="button"
                    className={`${styles.themeChip} ${on ? styles.themeChipOn : ''}`}
                    onClick={() => onApply(theme)}
                    title={theme.name}
                  >
                    <span className={styles.themeChipSwatch} aria-hidden>
                      {swatch.slice(0, 3).map((c, i) => (
                        <i key={`${theme.id}-${i}`} style={{ background: c || '#999' }} />
                      ))}
                    </span>
                    <em>{theme.name.replace(/^تم\s*[۱۲۳]\s*·\s*/u, '')}</em>
                    {on ? <Check size={10} /> : null}
                  </button>
                  {!theme.builtIn ? (
                    <button
                      type="button"
                      className={styles.themeChipDel}
                      title="حذف"
                      onClick={(e) => onDelete(theme, e)}
                      disabled={saving}
                    >
                      <Trash2 size={10} />
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
        {!naming ? (
          <button
            type="button"
            className={styles.themeChipAdd}
            onClick={() => setNaming(true)}
            title="ذخیره ظاهر فعلی به‌عنوان تم"
            disabled={saving}
          >
            <Plus size={12} />
          </button>
        ) : null}
      </div>

      {naming ? (
        <div className={styles.themeChipNameRow}>
          <input
            type="text"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            placeholder="نام تم"
            maxLength={40}
            autoFocus
          />
          <button type="button" onClick={onSave} disabled={saving || !themeName.trim()}>
            {saving ? <Loader2 size={12} className={styles.spin} /> : 'ذخیره'}
          </button>
          <button
            type="button"
            className={styles.themeChipCancel}
            onClick={() => setNaming(false)}
          >
            <X size={12} />
          </button>
        </div>
      ) : null}

      {hint ? <span className={styles.themeChipsHint}>{hint}</span> : null}
    </div>
  )
}
