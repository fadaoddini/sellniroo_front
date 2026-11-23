'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search,
  Filter,
  Newspaper,
  Briefcase,
  Loader2,
  X,
  ArrowLeft,
} from 'lucide-react'
import newsService from '@/services/newsService'
import { searchSite } from '@/services/siteSearch'
import styles from './SiteSearchResults.module.css'

const TYPE_FILTERS = [
  { id: 'all', label: 'همه', icon: Search },
  { id: 'news', label: 'اخبار', icon: Newspaper },
  { id: 'jobs', label: 'آگهی‌ها', icon: Briefcase },
]

function buildSearchPath({ q, type, category }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (type && type !== 'all') params.set('type', type)
  if (category) params.set('category', category)
  const s = params.toString()
  return s ? `/search?${s}` : '/search'
}

export default function SiteSearchResults() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const q = (searchParams?.get('q') || searchParams?.get('search') || '').trim()
  const type = searchParams?.get('type') || 'all'
  const category = searchParams?.get('category') || ''

  const [input, setInput] = useState(q)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState({
    items: [],
    total: 0,
    counts: {},
    available: { news: true, jobs: false },
  })
  const [categories, setCategories] = useState([])
  const [err, setErr] = useState('')

  useEffect(() => {
    setInput(q)
  }, [q])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await newsService.getCategories()
        if (!cancelled && res?.success) {
          setCategories(Array.isArray(res.data) ? res.data : [])
        }
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const runSearch = useCallback(async () => {
    if (!q) {
      setResult({
        items: [],
        total: 0,
        counts: {},
        available: { news: true, jobs: false },
      })
      setErr('')
      return
    }
    setLoading(true)
    setErr('')
    try {
      const res = await searchSite({ q, type, category })
      setResult(res)
      if (!res.success) setErr('جستجو ناموفق بود')
    } catch (e) {
      setErr(e?.message || 'جستجو ناموفق بود')
      setResult({ items: [], total: 0, counts: {}, available: {} })
    } finally {
      setLoading(false)
    }
  }, [q, type, category])

  useEffect(() => {
    runSearch()
  }, [runSearch])

  const push = useCallback(
    (patch) => {
      router.push(
        buildSearchPath({
          q: patch.q !== undefined ? patch.q : q,
          type: patch.type !== undefined ? patch.type : type,
          category: patch.category !== undefined ? patch.category : category,
        }),
        { scroll: false },
      )
    },
    [router, q, type, category],
  )

  const onSubmit = (e) => {
    e.preventDefault()
    push({ q: input.trim(), type: 'all', category: '' })
  }

  const typeFilters = useMemo(() => {
    const avail = result.available || {}
    return TYPE_FILTERS.filter((f) => {
      if (f.id === 'news') return avail.news !== false
      if (f.id === 'jobs') return !!avail.jobs
      return true
    })
  }, [result.available])

  const items = result.items || []

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.head}>
        <div className={styles.headTop}>
          <h1>
            <Search size={18} />
            جستجو در سایت
          </h1>
          {q ? (
            <p className={styles.sub}>
              نتایج برای «<strong>{q}</strong>»
              {result.total != null ? (
                <>
                  {' '}
                  — {result.total.toLocaleString('fa-IR')} مورد
                </>
              ) : null}
            </p>
          ) : (
            <p className={styles.sub}>عبارت مورد نظر را جستجو کنید</p>
          )}
        </div>

        <form className={styles.searchForm} onSubmit={onSubmit} role="search">
          <Search size={16} className={styles.searchGlyph} aria-hidden />
          <input
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="جستجو ..."
            enterKeyHint="search"
          />
          {input ? (
            <button
              type="button"
              className={styles.clearBtn}
              aria-label="پاک کردن"
              onClick={() => {
                setInput('')
                push({ q: '', type: 'all', category: '' })
              }}
            >
              <X size={14} />
            </button>
          ) : null}
          <button type="submit" className={styles.submitBtn}>
            جستجو
          </button>
        </form>
      </header>

      <div className={styles.layout}>
        <aside className={styles.filters} aria-label="فیلترها">
          <div className={styles.filterCard}>
            <h2>
              <Filter size={14} />
              نوع محتوا
            </h2>
            <div className={styles.filterList}>
              {typeFilters.map((f) => {
                const Icon = f.icon
                const on = type === f.id
                const count =
                  f.id === 'all'
                    ? result.total
                    : result.counts?.[f.id === 'news' ? 'news' : 'jobs']
                return (
                  <button
                    key={f.id}
                    type="button"
                    className={`${styles.filterBtn} ${on ? styles.filterBtnOn : ''}`}
                    onClick={() =>
                      push({
                        type: f.id,
                        category: f.id === 'news' ? category : '',
                      })
                    }
                  >
                    <Icon size={14} />
                    <span>{f.label}</span>
                    {typeof count === 'number' ? (
                      <em>{count.toLocaleString('fa-IR')}</em>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>

          {(type === 'all' || type === 'news') && categories.length ? (
            <div className={styles.filterCard}>
              <h2>دسته خبر</h2>
              <div className={styles.filterList}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${!category ? styles.filterBtnOn : ''}`}
                  onClick={() => push({ category: '' })}
                >
                  همه دسته‌ها
                </button>
                {categories.map((c) => {
                  const slug = c.slug || c.id
                  const on = category === slug
                  return (
                    <button
                      key={slug}
                      type="button"
                      className={`${styles.filterBtn} ${on ? styles.filterBtnOn : ''}`}
                      onClick={() => push({ type: type === 'jobs' ? 'news' : type, category: slug })}
                    >
                      {c.name || c.title || slug}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </aside>

        <section className={styles.results} aria-live="polite">
          {loading ? (
            <div className={styles.state}>
              <Loader2 size={20} className={styles.spin} />
              در حال جستجو…
            </div>
          ) : err ? (
            <div className={styles.stateErr}>{err}</div>
          ) : !q ? (
            <div className={styles.state}>عبارتی برای جستجو وارد نشده است.</div>
          ) : !items.length ? (
            <div className={styles.state}>
              نتیجه‌ای پیدا نشد.
              <Link href="/" className={styles.homeLink}>
                بازگشت به خانه
                <ArrowLeft size={14} />
              </Link>
            </div>
          ) : (
            <ul className={styles.list}>
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className={styles.card}>
                    <span
                      className={`${styles.badge} ${
                        item.type === 'jobs' ? styles.badgeJob : styles.badgeNews
                      }`}
                    >
                      {item.typeLabel}
                    </span>
                    <div className={styles.cardBody}>
                      <strong>{item.title}</strong>
                      {item.excerpt ? (
                        <p>
                          {String(item.excerpt).slice(0, 160)}
                          {String(item.excerpt).length > 160 ? '…' : ''}
                        </p>
                      ) : null}
                      {item.meta ? <small>{item.meta}</small> : null}
                    </div>
                    <ArrowLeft size={16} className={styles.cardArrow} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
