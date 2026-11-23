'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  GraduationCap,
  Info,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Server,
  Shield,
  Sparkles,
  Wrench,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import { getReboSystemPageNav } from '@/components/Admin/reboSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import styles from './ReboLearn.module.css'

const ICONS = {
  book: BookOpen,
  server: Server,
  package: Package,
  rocket: Sparkles,
  wrench: Wrench,
  shield: Shield,
}

function IconByKey({ name, size = 15 }) {
  const Cmp = ICONS[name] || BookOpen
  return <Cmp size={size} strokeWidth={1.85} />
}

function CodeBlock({ title, lang, body }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(body || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* ignore */
    }
  }
  return (
    <div className={styles.codeWrap}>
      <div className={styles.codeHead}>
        <span>{title || lang || 'code'}</span>
        <button type="button" className={styles.copyBtn} onClick={onCopy}>
          <Copy size={12} /> {copied ? 'کپی شد' : 'کپی'}
        </button>
      </div>
      <pre>{body}</pre>
    </div>
  )
}

function SectionBlock({ section, index }) {
  if (!section || typeof section !== 'object') return null
  const type = section.type || 'text'

  if (type === 'text') {
    return (
      <div className={styles.section}>
        <p className={styles.sectionText}>{section.body}</p>
      </div>
    )
  }

  if (type === 'code') {
    return (
      <div className={styles.section}>
        <CodeBlock title={section.title} lang={section.lang} body={section.body} />
      </div>
    )
  }

  if (type === 'note') {
    const tone = section.tone || 'info'
    const cls =
      tone === 'warn'
        ? styles.noteWarn
        : tone === 'ok'
          ? styles.noteOk
          : styles.noteInfo
    const Icon =
      tone === 'warn' ? AlertTriangle : tone === 'ok' ? CheckCircle2 : Info
    return (
      <div className={`${styles.note} ${cls}`}>
        <Icon size={16} strokeWidth={1.8} />
        <span>{section.body}</span>
      </div>
    )
  }

  if (type === 'steps') {
    const items = Array.isArray(section.items) ? section.items : []
    return (
      <div className={styles.section}>
        <ol className={styles.steps}>
          {items.map((item, i) => (
            <li key={`${index}-step-${i}`} className={styles.step}>
              <div className={styles.stepTitle}>
                <span className={styles.stepNum}>{i + 1}</span>
                {item.title}
              </div>
              {item.body ? <p className={styles.stepBody}>{item.body}</p> : null}
              {item.code ? (
                <CodeBlock lang="bash" body={item.code} title="دستور" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    )
  }

  if (type === 'table') {
    const headers = Array.isArray(section.headers) ? section.headers : []
    const rows = Array.isArray(section.rows) ? section.rows : []
    return (
      <div className={styles.section}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={`r-${ri}`}>
                  {(Array.isArray(row) ? row : []).map((cell, ci) => (
                    <td key={`c-${ri}-${ci}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return null
}

function ReboLearnInner() {
  const gate = useOwnerGate('/rebolearn')
  const { getAuthHeaders } = useAuth()
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [categories, setCategories] = useState([])
  const [lessons, setLessons] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const res = await axios.get(Config.endpoints.reboLearn.bundle(), {
        headers: getAuthHeaders(),
      })
      const data = res.data?.data || {}
      setCategories(data.categories || [])
      setLessons(data.lessons || [])
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.message ||
          'خواندن آموزش‌ها ناموفق بود',
      )
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (gate.allowed) load()
  }, [gate.allowed, load])

  const openLesson = useCallback(
    async (slug) => {
      setSelectedSlug(slug)
      setDetail(null)
      setDetailLoading(true)
      try {
        const res = await axios.get(Config.endpoints.reboLearn.lesson(slug), {
          headers: getAuthHeaders(),
        })
        setDetail(res.data?.data || null)
      } catch (e) {
        setErr(
          e.response?.data?.message ||
            e.message ||
            'خواندن جزئیات آموزش ناموفق بود',
        )
        setSelectedSlug(null)
      } finally {
        setDetailLoading(false)
      }
    },
    [getAuthHeaders],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (lessons || []).filter((l) => {
      if (activeCat !== 'all' && l.category_key !== activeCat) return false
      if (!q) return true
      const hay = `${l.title} ${l.summary} ${(l.tags || []).join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [lessons, activeCat, query])

  const featuredCount = useMemo(
    () => (lessons || []).filter((l) => l.is_featured).length,
    [lessons],
  )

  return (
    <OwnerPortalShell
      brand="learn"
      brandAccent="admin"
      tagline="آموزش‌های اختصاصی ربو برای استقرار و مدیریت"
      title="آموزش‌های ربو"
      wide
      pageNav={getReboSystemPageNav('/rebolearn')}
      {...gate}
    >
      <div className={styles.page}>
        <div className={styles.refreshRow}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={load}
            disabled={loading}
          >
            {loading ? (
              <Loader2 size={13} className="spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            بروزرسانی
          </button>
        </div>

        {err ? <div className={styles.error}>{err}</div> : null}

        <div className={styles.layout}>
          <aside className={styles.side}>
            <div className={styles.sideHead}>
              <GraduationCap size={16} color="#a67c00" />
              <strong>دسته‌ها</strong>
            </div>
            <input
              className={styles.search}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در آموزش‌ها…"
              aria-label="جستجو"
            />
            <button
              type="button"
              className={`${styles.catBtn} ${activeCat === 'all' ? styles.catBtnOn : ''}`}
              onClick={() => {
                setActiveCat('all')
                setSelectedSlug(null)
                setDetail(null)
              }}
            >
              <BookOpen size={14} />
              همه آموزش‌ها
              <span className={styles.catCount}>{lessons.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`${styles.catBtn} ${activeCat === c.key ? styles.catBtnOn : ''}`}
                onClick={() => {
                  setActiveCat(c.key)
                  setSelectedSlug(null)
                  setDetail(null)
                }}
              >
                <IconByKey name={c.icon} size={14} />
                {c.title}
                <span className={styles.catCount}>{c.lesson_count ?? 0}</span>
              </button>
            ))}
          </aside>

          <div className={styles.main}>
            {!selectedSlug ? (
              <>
                <div className={styles.heroCard}>
                  <h1>آموزش‌های ربو</h1>
                  <p>
                    راهنمای مرتب برای انتقال بسته نصبی، نصب موتور چندسایته،
                    افزودن سایت مشتری و مدیریت روزمره با CLI — همیشه در دسترس
                    مالک پلتفرم.
                  </p>
                  <div className={styles.stats}>
                    <span className={styles.statPill}>
                      <BookOpen size={12} /> {lessons.length} آموزش
                    </span>
                    <span className={styles.statPill}>
                      <Package size={12} /> {categories.length} دسته
                    </span>
                    <span className={styles.statPill}>
                      <Sparkles size={12} /> {featuredCount} ویژه
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div className={styles.loading}>
                    <Loader2 size={18} className="spin" /> در حال بارگذاری…
                  </div>
                ) : filtered.length === 0 ? (
                  <div className={styles.empty}>آموزشی با این فیلتر نیست.</div>
                ) : (
                  <div className={styles.grid}>
                    {filtered.map((l) => (
                      <button
                        key={l.slug}
                        type="button"
                        className={styles.card}
                        onClick={() => openLesson(l.slug)}
                      >
                        <div className={styles.cardTop}>
                          <strong>{l.title}</strong>
                          {l.is_featured ? (
                            <span className={styles.badge}>ویژه</span>
                          ) : null}
                        </div>
                        <p className={styles.cardSummary}>{l.summary}</p>
                        <div className={styles.cardMeta}>
                          <span>
                            <Clock3 size={11} style={{ display: 'inline', verticalAlign: -1 }} />{' '}
                            {l.estimated_minutes || 5} دقیقه
                          </span>
                          <span className={styles.tag}>{l.category_title}</span>
                          {(l.tags || []).slice(0, 2).map((t) => (
                            <span key={t} className={styles.tag}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <article className={styles.detail}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setSelectedSlug(null)
                    setDetail(null)
                  }}
                >
                  <ArrowRight size={14} />
                  بازگشت به فهرست
                </button>

                {detailLoading || !detail ? (
                  <div className={styles.loading}>
                    <Loader2 size={18} className="spin" /> در حال بارگذاری درس…
                  </div>
                ) : (
                  <>
                    <div className={styles.detailHead}>
                      <h2>{detail.title}</h2>
                      <p>{detail.summary}</p>
                    </div>
                    <div className={styles.detailMeta}>
                      <span className={styles.tag}>{detail.category_title}</span>
                      <span className={styles.tag}>
                        {detail.estimated_minutes || 5} دقیقه
                      </span>
                      {(detail.tags || []).map((t) => (
                        <span key={t} className={styles.tag}>
                          {t}
                        </span>
                      ))}
                    </div>
                    {(detail.content_json || []).map((section, i) => (
                      <SectionBlock key={`s-${i}`} section={section} index={i} />
                    ))}
                  </>
                )}
              </article>
            )}
          </div>
        </div>
      </div>
    </OwnerPortalShell>
  )
}

export default function ReboLearnPage() {
  return (
    <Suspense fallback={null}>
      <ReboLearnInner />
    </Suspense>
  )
}
