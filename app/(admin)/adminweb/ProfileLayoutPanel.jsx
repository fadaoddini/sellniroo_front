'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Loader2,
  Save,
  UserRound,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchSiteSettings,
  saveProfileLayout,
} from '@/services/siteSettings'
import { fetchSiteModules } from '@/services/siteModules'
import {
  DEFAULT_PROFILE_LAYOUT,
  PROFILE_PRIMARY_OPTIONS,
  PROFILE_SECTION_DEFS,
  isProfileSectionModuleOn,
  normalizeProfileLayout,
} from '@/config/profileLayout'
import styles from './ProfileLayoutPanel.module.css'

export default function ProfileLayoutPanel() {
  const { getAuthHeaders } = useAuth()
  const [layout, setLayout] = useState(() =>
    normalizeProfileLayout(DEFAULT_PROFILE_LAYOUT),
  )
  const [moduleMap, setModuleMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const [settings, mods] = await Promise.all([
        fetchSiteSettings({ force: true }),
        fetchSiteModules({ force: true }),
      ])
      setLayout(normalizeProfileLayout(settings?.profile_layout))
      setModuleMap(mods?.map || {})
    } catch (e) {
      setErr(e?.message || 'بارگذاری ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const setPrimary = (id) => {
    setLayout((prev) => ({ ...prev, primary: id }))
    setMsg(null)
  }

  const toggleSection = (id) => {
    setLayout((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [id]: !prev.sections?.[id],
      },
    }))
    setMsg(null)
  }

  const save = async () => {
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const saved = await saveProfileLayout(layout, getAuthHeaders())
      setLayout(normalizeProfileLayout(saved))
      setMsg('چیدمان پروفایل ذخیره شد')
    } catch (e) {
      setErr(e?.message || 'ذخیره ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  const preview = useMemo(() => {
    const on = PROFILE_SECTION_DEFS.filter(
      (def) =>
        layout.sections?.[def.id] && isProfileSectionModuleOn(def, moduleMap),
    )
    return on.map((s) => s.label).join(' · ') || 'هیچ بخشی'
  }, [layout, moduleMap])

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className={styles.spin} size={22} />
        در حال بارگذاری چیدمان پروفایل…
      </div>
    )
  }

  return (
    <div className={styles.panel} dir="rtl">
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <UserRound size={14} />
            پروفایل کاربر
          </p>
          <h2>چیدمان و دسترسی‌های /profile</h2>
          <p className={styles.sub}>
            وقتی چند ماژول با هم روشن‌اند، اینجا مشخص کنید سیستم اصلی پروفایل
            کدام است و کدام بخش‌ها در پروفایل دیده شوند. هدر و رنگ نوار بالا از
            صفحه اصلی می‌آید — در «چیدمان صفحه اصلی» دکمه «اعمال هدر و رنگ به
            همه» را بزنید.
          </p>
        </div>
        <div className={styles.headActions}>
          <Link
            href="/adminsettings?tab=home"
            className={styles.previewLink}
          >
            همگام‌سازی هدر
          </Link>
          <Link href="/profile" target="_blank" className={styles.previewLink}>
            مشاهده پروفایل
            <ExternalLink size={14} />
          </Link>
        </div>
      </header>

      {err ? (
        <p className={styles.err}>
          <AlertCircle size={14} /> {err}
        </p>
      ) : null}
      {msg ? (
        <p className={styles.ok}>
          <Check size={14} /> {msg}
        </p>
      ) : null}

      <section className={styles.card}>
        <h3>سیستم اصلی پروفایل</h3>
        <p className={styles.cardHint}>
          «ترکیبی» همه بخش‌های روشن را به‌صورت تب نشان می‌دهد. «خودکار» بر اساس
          اولویت سیستم‌ها انتخاب می‌کند.
        </p>
        <div className={styles.primaryGrid}>
          {PROFILE_PRIMARY_OPTIONS.map((opt) => {
            const on = layout.primary === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                className={`${styles.primaryCard} ${on ? styles.primaryOn : ''}`}
                onClick={() => setPrimary(opt.id)}
                aria-pressed={on}
              >
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className={styles.card}>
        <h3>بخش‌های قابل‌نمایش</h3>
        <p className={styles.cardHint}>
          فقط بخش‌هایی که ماژول‌شان هم روشن باشد در پروفایل ظاهر می‌شوند.
        </p>
        <ul className={styles.sectionList}>
          {PROFILE_SECTION_DEFS.map((def) => {
            const moduleOn = isProfileSectionModuleOn(def, moduleMap)
            const checked = !!layout.sections?.[def.id]
            return (
              <li
                key={def.id}
                className={`${styles.sectionRow} ${
                  !moduleOn ? styles.sectionMuted : ''
                }`}
              >
                <label className={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSection(def.id)}
                  />
                  <span className={styles.switchUi} aria-hidden />
                  <span className={styles.sectionMeta}>
                    <strong>{def.label}</strong>
                    <small>{def.desc}</small>
                  </span>
                </label>
                {!moduleOn ? (
                  <em className={styles.moduleOff}>ماژول خاموش</em>
                ) : checked ? (
                  <em className={styles.moduleOn}>فعال</em>
                ) : (
                  <em className={styles.moduleHidden}>مخفی</em>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      <div className={styles.footer}>
        <p className={styles.preview}>
          پیش‌نمایش بخش‌ها: <strong>{preview}</strong>
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.ghost}
            onClick={load}
            disabled={saving}
          >
            بازخوانی
          </button>
          <button
            type="button"
            className={styles.save}
            onClick={save}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className={styles.spin} size={16} />
                در حال ذخیره…
              </>
            ) : (
              <>
                <Save size={16} />
                ذخیره چیدمان پروفایل
              </>
            )}
          </button>
        </div>
      </div>

      <p className={styles.footNote}>
        برای چیدمان ویجتی اطراف صفحه پروفایل از{' '}
        <Link href="/adminsettings?tab=pages&page=profile">
          صفحات داخلی → صفحه پروفایل
        </Link>{' '}
        استفاده کنید.
      </p>
    </div>
  )
}
