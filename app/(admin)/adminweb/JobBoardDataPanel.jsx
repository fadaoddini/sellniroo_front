'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Briefcase,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  CircleDashed,
  Database,
  MapPin,
  Filter,
  Tags,
  FolderTree,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AdminWeb.module.css'

const GROUP_HINTS = {
  location: {
    keys: ['provinces', 'cities', 'neighborhoods'],
    label: 'موقعیت',
    icon: MapPin,
  },
  filters: {
    keys: [
      'cooperation_types',
      'categories',
      'job_titles',
      'education_levels',
      'experience_levels',
      'genders',
      'salary_ranges',
      'features',
      'tags',
      'sort_options',
      'filter_configs',
    ],
    label: 'فیلتر و فرم',
    icon: Filter,
  },
}

function groupSections(sections) {
  const byKey = Object.fromEntries((sections || []).map((s) => [s.key, s]))
  return Object.entries(GROUP_HINTS).map(([id, meta]) => {
    const items = meta.keys.map((k) => byKey[k]).filter(Boolean)
    const complete = items.filter((i) => i.complete).length
    return {
      id,
      label: meta.label,
      Icon: meta.icon,
      items,
      complete,
      total: items.length,
      ready: items.length > 0 && complete === items.length,
    }
  })
}

export default function JobBoardDataPanel({ embedded = false, active = true } = {}) {
  const { getAuthHeaders } = useAuth()
  const [sections, setSections] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [replacing, setReplacing] = useState(null) // 'titles' | 'categories' | null
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const busy = loading || importing || !!replacing

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await axios.get(Config.endpoints.jobisell.baseData.status(), {
        headers: getAuthHeaders(),
      })
      const data = res.data?.data || {}
      setSections(data.sections || [])
      setSummary(data.summary || null)
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'خواندن وضعیت ناموفق بود'
      )
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (!active) return
    load()
  }, [load, active])

  const groups = useMemo(() => groupSections(sections), [sections])
  const ready = !!summary?.ready
  const percent = summary?.percent ?? 0
  const incomplete = useMemo(
    () => (sections || []).filter((s) => !s.complete),
    [sections]
  )

  const applyStatusFromResult = async (res) => {
    const data = res.data?.data?.status
    if (data) {
      setSections(data.sections || [])
      setSummary(data.summary || null)
    } else {
      await load()
    }
  }

  const runImport = async () => {
    if (
      !window.confirm(
        'داده‌های پایه کاریابی (استان، شهر، فیلترها، نوع همکاری و …) ایمپورت شوند؟\nرکوردهای موجود تکراری ساخته نمی‌شوند.'
      )
    ) {
      return
    }
    setImporting(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.post(
        Config.endpoints.jobisell.baseData.import(),
        {},
        { headers: getAuthHeaders() }
      )
      setMsg(res.data?.message || 'ایمپورت انجام شد')
      await applyStatusFromResult(res)
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'ایمپورت ناموفق بود'
      )
    } finally {
      setImporting(false)
    }
  }

  const runReplaceTitles = async () => {
    if (
      !window.confirm(
        'هشدار: با بروزرسانی، همهٔ عناوین شغلی قبلی حذف می‌شوند و با لیست پیش‌فرض ویژه کاریابی جایگزین می‌گردند.\n\nادامه می‌دهید؟'
      )
    ) {
      return
    }
    setReplacing('titles')
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.post(
        Config.endpoints.jobisell.baseData.replaceJobTitles(),
        {},
        { headers: getAuthHeaders() }
      )
      setMsg(res.data?.message || 'عناوین شغلی جایگزین شد')
      await applyStatusFromResult(res)
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'جایگزینی عناوین ناموفق بود'
      )
    } finally {
      setReplacing(null)
    }
  }

  const runReplaceCategories = async () => {
    if (
      !window.confirm(
        'هشدار: با بروزرسانی، همهٔ دسته‌بندی‌های شغلی قبلی حذف می‌شوند و با لیست پیش‌فرض ویژه کاریابی جایگزین می‌گردند.\n\nادامه می‌دهید؟'
      )
    ) {
      return
    }
    setReplacing('categories')
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.post(
        Config.endpoints.jobisell.baseData.replaceCategories(),
        {},
        { headers: getAuthHeaders() }
      )
      setMsg(res.data?.message || 'دسته‌بندی‌ها جایگزین شد')
      await applyStatusFromResult(res)
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'جایگزینی دسته‌بندی‌ها ناموفق بود'
      )
    } finally {
      setReplacing(null)
    }
  }

  if (!active) {
    return (
      <div className={styles.jbEmbedOff} id="job-board-data">
        <Database size={15} />
        <p>
          برای مدیریت داده‌های پایه (استان، شهر، فیلترها)، ابتدا ماژول کاریابی را روشن کنید.
        </p>
      </div>
    )
  }

  const body = (
    <>
      <div className={styles.jbHero}>
        <div className={styles.jbHeroMain}>
          <div className={styles.jbRing} aria-hidden>
            <svg viewBox="0 0 36 36" className={styles.jbRingSvg}>
              <path
                className={styles.jbRingTrack}
                d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"
              />
              <path
                className={`${styles.jbRingValue} ${ready ? styles.jbRingOk : ''}`}
                strokeDasharray={`${percent}, 100`}
                d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 1 1 0-31"
              />
            </svg>
            <span className={styles.jbRingLabel}>{percent}٪</span>
          </div>
          <div className={styles.jbHeroText}>
            <strong>داده‌های پایه</strong>
            <p>
              {summary
                ? ready
                  ? 'همه بخش‌های لازم برای فیلتر و فرم آگهی آماده‌اند.'
                  : `${summary.incomplete_sections} بخش ناقص — با یک کلیک تکمیل کنید.`
                : 'در حال بررسی وضعیت دیتابیس…'}
            </p>
            {summary ? (
              <span className={ready ? styles.jbReady : styles.jbPending}>
                {summary.complete_sections}/{summary.total_sections} کامل
              </span>
            ) : null}
          </div>
        </div>
        <div className={styles.jbHeroActions}>
          <button
            type="button"
            className={styles.extBtnGhost}
            onClick={load}
            disabled={busy}
            aria-label="بررسی مجدد"
          >
            <RefreshCw size={14} className={loading ? styles.spin : undefined} />
            بررسی
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={runImport}
            disabled={busy}
          >
            {importing ? (
              <RefreshCw size={14} className={styles.spin} />
            ) : (
              <Download size={14} />
            )}
            {ready ? 'تکمیل / همگام‌سازی' : 'ایمپورت یک‌کلیکه'}
          </button>
        </div>
      </div>

      <div className={styles.jbPresetBlock}>
        <div className={styles.jbPresetHead}>
          <AlertCircle size={14} />
          <div>
            <strong>پیش‌فرض ویژه کاریابی</strong>
            <p>
              با بروزرسانی، داده‌های قبلی همان بخش (عناوین یا دسته‌بندی‌ها)
              حذف و جایگزین می‌شوند. برای دیدن در صفحهٔ اصلی، در تنظیمات ویجت
              کاریابی گزینهٔ «دادهٔ نمونه (دمو)» را خاموش کنید.
            </p>
          </div>
        </div>
        <div className={styles.jbPresetActions}>
          <button
            type="button"
            className={styles.jbPresetBtn}
            onClick={runReplaceTitles}
            disabled={busy}
          >
            {replacing === 'titles' ? (
              <RefreshCw size={14} className={styles.spin} />
            ) : (
              <Tags size={14} />
            )}
            داده‌های پیش‌فرض عنوان شغلی ویژه کاریابی
          </button>
          <button
            type="button"
            className={styles.jbPresetBtn}
            onClick={runReplaceCategories}
            disabled={busy}
          >
            {replacing === 'categories' ? (
              <RefreshCw size={14} className={styles.spin} />
            ) : (
              <FolderTree size={14} />
            )}
            داده‌های پیش‌فرض دسته‌بندی ویژه کاریابی
          </button>
        </div>
      </div>

      {err ? (
        <div className={styles.lsAlert} role="alert">
          <AlertCircle size={14} />
          {err}
        </div>
      ) : null}
      {msg ? <div className={styles.lsOk}>{msg}</div> : null}

      <div className={styles.jbGroupGrid}>
        {loading && groups.every((g) => g.total === 0)
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={styles.jbRowSkeleton} />
            ))
          : groups.map((g) => {
              const Icon = g.Icon
              return (
                <div
                  key={g.id}
                  className={`${styles.jbGroupCard} ${g.ready ? styles.jbGroupOk : styles.jbGroupMiss}`}
                >
                  <div className={styles.jbGroupHead}>
                    <Icon size={14} />
                    <strong>{g.label}</strong>
                    <span>
                      {g.complete}/{g.total}
                    </span>
                  </div>
                  <div className={styles.jbChipRow}>
                    {g.items.map((sec) => (
                      <span
                        key={sec.key}
                        className={`${styles.jbChip} ${sec.complete ? styles.jbChipOk : styles.jbChipMiss}`}
                        title={`${sec.label}: ${sec.count}/${sec.min_count}`}
                      >
                        {sec.complete ? (
                          <CheckCircle2 size={11} />
                        ) : (
                          <CircleDashed size={11} />
                        )}
                        {sec.label}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
      </div>

      {incomplete.length > 0 ? (
        <div className={styles.jbIncomplete}>
          <button
            type="button"
            className={styles.jbExpandBtn}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'بستن جزئیات ناقص' : `نمایش ${incomplete.length} بخش ناقص`}
          </button>
          {expanded ? (
            <ul className={styles.jbMiniList}>
              {incomplete.map((sec) => (
                <li key={sec.key}>
                  <span>{sec.label}</span>
                  <em dir="ltr">
                    {sec.count}/{sec.min_count}
                  </em>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </>
  )

  if (embedded) {
    return (
      <div className={styles.jbEmbed} id="job-board-data">
        <div className={styles.jbEmbedHead}>
            <Briefcase size={15} />
            <strong>داده‌های پایه کاریابی</strong>
        </div>
        {body}
      </div>
    )
  }

  return (
    <section className={styles.section} id="job-board-data">
      <div className={styles.sectionHead}>
        <Briefcase size={18} />
        <h2>داده‌های پایه کاریابی</h2>
      </div>
      {body}
    </section>
  )
}
