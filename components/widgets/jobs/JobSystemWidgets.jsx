'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BadgeCheck,
  Briefcase,
  Building2,
  Search,
  User,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import AllBoxItem from '@/components/AllBoxItem'
import JobCard from '@/components/AllBoxItem/components/JobCard/JobCard'
import HeaderSlot from '@/components/modules/HeaderSlot'
import MobileBottomNavSlot from '@/components/modules/MobileBottomNavSlot'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  getJobWidgetVariant,
  jobBoardWidgetCssVars,
  normalizeJobBoardWidgetSettings,
} from '@/config/jobBoardWidgetSettings'
import jobisellApi from '@/services/jobisellApi'
import {
  DEMO_CATEGORIES,
  DEMO_COMPANIES,
  DEMO_FILTER_OPTIONS,
  DEMO_JOB_STATS,
  DEMO_RESUMES,
  getDemoJobsBySource,
} from '@/components/AllBoxItem/constants/demoJobs'
import styles from './JobWidgetShell.module.css'

function shellClass(settings) {
  return [
    styles.shell,
    settings.show_on_mobile === false ? styles.hideOnMobile : '',
    settings.show_on_desktop === false ? styles.hideOnDesktop : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function ResultsList({ results }) {
  if (Array.isArray(results)) return results
  if (Array.isArray(results?.results)) return results.results
  return []
}

function WidgetHead({ title, show, moreHref, moreLabel, showMore }) {
  if (!show || !title) return null
  return (
    <div className={styles.head}>
      <h3 className={styles.title}>{title}</h3>
      {showMore && moreHref ? (
        <Link href={moreHref} className={styles.more}>
          {moreLabel || 'مشاهده همه'}
        </Link>
      ) : null}
    </div>
  )
}

function visibilityClass(settings) {
  return shellClass(settings)
}

/** سیستم کامل / لیست / فقط فیلتر / فقط گرید */
export function JobFullBoardWidget({ type = 'job_board_system', settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, type)
  const variant = getJobWidgetVariant(type)
  const vars = jobBoardWidgetCssVars(settings, type)
  const gate =
    variant.gate === 'job_listings'
      ? SITE_MODULE_KEYS.JOB_LISTINGS
      : SITE_MODULE_KEYS.JOB_BOARD

  const showFilters =
    variant.showFilters !== false && settings.show_filters !== false
  const showList = variant.showList !== false

  return (
    <ModuleGate moduleKey={gate}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget={type}
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <AllBoxItem
            embedded
            demoMode={settings.use_demo_data === true}
            initialFilters={{
              ...(settings.default_tab === 'hiring'
                ? { adType: 'hiring' }
                : settings.default_tab === 'seeking'
                  ? { adType: 'seeking' }
                  : {}),
            }}
            ui={{
              showFilters,
              showTabs: showList && settings.show_tabs,
              showViewToggle: showList && settings.show_view_toggle,
              showTitle: showList && settings.show_title,
              showCount: showList && settings.show_count,
              defaultView: settings.default_view,
              showList,
            }}
          />
        </div>
      </div>
    </ModuleGate>
  )
}

/** آگهی‌های ویژه / آخرین / استخدام / کارجو */
export function JobCardsStripWidget({ type = 'latest_jobs', settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, type)
  const variant = getJobWidgetVariant(type)
  const vars = jobBoardWidgetCssVars(settings, type)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const title =
    settings.title_text || variant.title || 'آگهی‌ها'
  const viewMode = settings.default_view === 'list' ? 'list' : 'grid-2'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        if (settings.use_demo_data === true) {
          if (!cancelled) {
            setJobs(getDemoJobsBySource(variant.source, settings.limit))
          }
          return
        }
        let data
        const limit = settings.limit
        if (variant.source === 'featured') {
          data = await jobisellApi.getFeaturedJobs(limit)
        } else if (variant.source === 'latest') {
          data = await jobisellApi.getLatestJobs(limit)
        } else if (variant.source === 'hiring') {
          data = await jobisellApi.getHiringJobs({ page_size: limit })
        } else if (variant.source === 'seeking') {
          data = await jobisellApi.getSeekingJobs({ page_size: limit })
        } else {
          data = await jobisellApi.getJobs({ page_size: limit })
        }
        let list = ResultsList(data).slice(0, limit)
        if (!list.length && settings.use_demo_data === true) {
          list = getDemoJobsBySource(variant.source, limit)
        }
        if (!cancelled) setJobs(list)
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setError(err)
          setJobs(getDemoJobsBySource(variant.source, settings.limit))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    type,
    variant.source,
    settings.limit,
    settings.use_demo_data,
  ])

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_LISTINGS}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget={type}
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={title}
            show={settings.show_header}
            showMore={settings.show_more_link}
            moreHref={settings.more_href}
            moreLabel={settings.more_label}
          />
          {loading ? (
            <p className={styles.loading}>در حال بارگذاری آگهی‌ها…</p>
          ) : jobs.length === 0 ? (
            <p className={styles.empty}>آگهی‌ای یافت نشد</p>
          ) : (
            <div
              className={
                viewMode === 'list' ? styles.gridList : styles.grid
              }
            >
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} viewMode={viewMode} />
              ))}
            </div>
          )}
          {error && settings.use_demo_data === false ? (
            <p className={styles.error}>خطا در دریافت — دادهٔ دمو نمایش داده شد</p>
          ) : null}
        </div>
      </div>
    </ModuleGate>
  )
}

/** نوار جستجوی شغل → /jobs */
export function JobSearchBarWidget({ settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, 'job_search_bar')
  const vars = jobBoardWidgetCssVars(settings, 'job_search_bar')
  const router = useRouter()
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [cities, setCities] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (settings.use_demo_data === true) {
          if (!cancelled) setCities(DEMO_FILTER_OPTIONS.cities || [])
          return
        }
        const data = await jobisellApi.getCities()
        const list = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : []
        if (!cancelled) setCities(list)
      } catch {
        if (!cancelled) setCities(DEMO_FILTER_OPTIONS.cities || [])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [settings.use_demo_data])

  const onSubmit = useCallback(
    (e) => {
      e.preventDefault()
      const params = new URLSearchParams()
      if (q.trim()) params.set('q', q.trim())
      if (city) params.set('city', city)
      const qs = params.toString()
      router.push(qs ? `/jobs?${qs}` : '/jobs')
    },
    [router, q, city]
  )

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_BOARD}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget="job_search_bar"
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <form className={styles.searchForm} onSubmit={onSubmit} role="search">
            {settings.show_city_picker ? (
              <select
                className={styles.citySelect}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="شهر"
              >
                <option value="">همه شهرها</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.province_name ? ` — ${c.province_name}` : ''}
                  </option>
                ))}
              </select>
            ) : null}
            <input
              className={styles.searchInput}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={settings.search_placeholder}
              aria-label="جستجوی شغل"
            />
            <button type="submit" className={styles.searchBtn}>
              <Search size={16} style={{ verticalAlign: 'middle' }} /> جستجو
            </button>
          </form>
        </div>
      </div>
    </ModuleGate>
  )
}

/** گرید دسته‌های شغلی */
export function JobCategoriesGridWidget({ settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, 'job_categories_grid')
  const vars = jobBoardWidgetCssVars(settings, 'job_categories_grid')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        if (settings.use_demo_data === true) {
          if (!cancelled) setItems(DEMO_CATEGORIES)
          return
        }
        const data = await jobisellApi.getCategories()
        const list = Array.isArray(data?.results)
          ? data.results
          : Array.isArray(data)
            ? data
            : []
        if (!cancelled) {
          setItems(list.length ? list : DEMO_CATEGORIES)
        }
      } catch {
        if (!cancelled) setItems(DEMO_CATEGORIES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [settings.use_demo_data])

  const title = settings.title_text || 'دسته‌های شغلی'

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_BOARD}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget="job_categories_grid"
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={title}
            show={settings.show_header}
            showMore={settings.show_more_link}
            moreHref={settings.more_href}
            moreLabel={settings.more_label}
          />
          {loading ? (
            <p className={styles.loading}>در حال بارگذاری…</p>
          ) : (
            <div className={styles.catGrid}>
              {items.slice(0, settings.limit).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/jobs?category=${cat.id}`}
                  className={styles.catCard}
                >
                  <span className={styles.catName}>
                    <Briefcase size={14} style={{ marginLeft: 4 }} />
                    {cat.name}
                  </span>
                  <span className={styles.catMeta}>
                    {cat.jobs_count != null
                      ? `${Number(cat.jobs_count).toLocaleString('fa-IR')} آگهی`
                      : 'مشاهده آگهی‌ها'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleGate>
  )
}

/** شرکت‌های تاییدشده */
export function VerifiedCompaniesWidget({ settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, 'verified_companies')
  const vars = jobBoardWidgetCssVars(settings, 'verified_companies')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        if (settings.use_demo_data === true) {
          if (!cancelled) setItems(DEMO_COMPANIES)
          return
        }
        const data = await jobisellApi.getCompanies({
          is_verified: true,
          page_size: settings.limit,
        })
        const list = ResultsList(data)
        if (!cancelled) {
          setItems(list.length ? list : DEMO_COMPANIES)
        }
      } catch {
        if (!cancelled) setItems(DEMO_COMPANIES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [settings.use_demo_data, settings.limit])

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_BOARD}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget="verified_companies"
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={settings.title_text || 'شرکت‌های تاییدشده'}
            show={settings.show_header}
            showMore={settings.show_more_link}
            moreHref={settings.more_href}
            moreLabel={settings.more_label}
          />
          {loading ? (
            <p className={styles.loading}>در حال بارگذاری…</p>
          ) : (
            <div
              className={`${styles.companyGrid} ${styles.sidePanelGrid}`}
              style={{ '--jb-cols': String(settings.columns || 1) }}
            >
              {items.slice(0, settings.limit).map((c) => (
                <div key={c.id} className={styles.companyCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.cardIcon} aria-hidden>
                      <Building2 size={16} />
                    </span>
                    <div className={styles.cardBody}>
                      <span className={styles.companyName}>{c.name}</span>
                      <span className={styles.companyMeta}>
                        {[
                          c.city_name,
                          c.jobs_count != null ? `${c.jobs_count} آگهی` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') ||
                          c.description ||
                          '—'}
                      </span>
                    </div>
                    {(c.is_verified ||
                      c.verification_status === 'verified') && (
                      <span className={styles.badge}>
                        <BadgeCheck size={12} />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleGate>
  )
}

/** رزومه‌های عمومی */
export function PublicResumesWidget({ settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, 'public_resumes')
  const vars = jobBoardWidgetCssVars(settings, 'public_resumes')
  const items = useMemo(
    () => DEMO_RESUMES.slice(0, settings.limit),
    [settings.limit]
  )

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_PROFILE}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget="public_resumes"
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={settings.title_text || 'رزومه‌های عمومی'}
            show={settings.show_header}
            showMore={settings.show_more_link}
            moreHref={settings.more_href || '/profile'}
            moreLabel={settings.more_label}
          />
          <div
            className={`${styles.resumeGrid} ${styles.sidePanelGrid}`}
            style={{ '--jb-cols': String(settings.columns || 1) }}
          >
            {items.map((r) => (
              <Link
                key={r.id}
                href={`/resume/${r.slug}`}
                className={styles.resumeCard}
              >
                <div className={styles.cardTop}>
                  <span className={styles.cardIcon} aria-hidden>
                    <User size={16} />
                  </span>
                  <div className={styles.cardBody}>
                    <span className={styles.resumeName}>{r.full_name}</span>
                    <span className={styles.resumeMeta}>{r.title}</span>
                    <span className={styles.resumeMeta}>
                      {r.city_name}
                      {r.experience_years != null
                        ? ` · ${r.experience_years} سال سابقه`
                        : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ModuleGate>
  )
}

/** فیلترهای سریع → لینک به /jobs */
export function JobQuickFiltersWidget({ settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, 'job_quick_filters')
  const vars = jobBoardWidgetCssVars(settings, 'job_quick_filters')

  const chips = [
    { href: '/jobs', label: 'همه آگهی‌ها' },
    { href: '/jobs?type=hiring', label: 'استخدام' },
    { href: '/jobs?type=seeking', label: 'کارجو' },
    { href: '/jobs?is_verified=true', label: 'تاییدشده' },
    { href: '/jobs?ordering=-created_at', label: 'جدیدترین' },
    ...(DEMO_CATEGORIES.slice(0, 4).map((c) => ({
      href: `/jobs?category=${c.id}`,
      label: c.name,
    }))),
  ]

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_LISTINGS}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget="job_quick_filters"
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={settings.title_text || 'فیلترهای سریع'}
            show={settings.show_header}
            showMore={false}
          />
          <div className={styles.quickRow}>
            {chips.map((c) => (
              <Link key={c.href + c.label} href={c.href} className={styles.chip}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ModuleGate>
  )
}

/** آمار کاریابی */
export function JobStatsStripWidget({ settings: raw }) {
  const settings = normalizeJobBoardWidgetSettings(raw, 'job_stats_strip')
  const vars = jobBoardWidgetCssVars(settings, 'job_stats_strip')
  const [stats, setStats] = useState(DEMO_JOB_STATS)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (settings.use_demo_data === true) {
        setStats(DEMO_JOB_STATS)
        return
      }
      try {
        const data = await jobisellApi.getStats()
        if (!cancelled && data) {
          setStats({
            total_jobs: data.total_jobs ?? data.total ?? DEMO_JOB_STATS.total_jobs,
            hiring_count: data.hiring_count ?? data.hiring ?? DEMO_JOB_STATS.hiring_count,
            seeking_count:
              data.seeking_count ?? data.seeking ?? DEMO_JOB_STATS.seeking_count,
            companies_count:
              data.companies_count ?? DEMO_JOB_STATS.companies_count,
            verified_companies:
              data.verified_companies ?? DEMO_JOB_STATS.verified_companies,
          })
        }
      } catch {
        if (!cancelled) setStats(DEMO_JOB_STATS)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [settings.use_demo_data])

  const cards = [
    { label: 'کل آگهی‌ها', value: stats.total_jobs },
    { label: 'استخدام', value: stats.hiring_count },
    { label: 'کارجو', value: stats.seeking_count },
    { label: 'شرکت‌ها', value: stats.companies_count },
  ]

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.JOB_BOARD}>
      <div
        className={visibilityClass(settings)}
        style={vars}
        data-jb-widget="job_stats_strip"
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={settings.title_text || 'آمار کاریابی'}
            show={settings.show_header}
            showMore={false}
          />
          <div
            className={styles.statsRow}
            style={{ '--jb-cols': String(settings.columns || 2) }}
          >
            {cards.map((c) => (
              <div key={c.label} className={styles.statCard}>
                <span className={styles.statValue}>
                  {Number(c.value || 0).toLocaleString('fa-IR')}
                </span>
                <span className={styles.statLabel}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ModuleGate>
  )
}

export function JobHeaderBarWidget() {
  return <HeaderSlot />
}

export function JobBottomNavWidget() {
  return <MobileBottomNavSlot />
}
