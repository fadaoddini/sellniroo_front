'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BadgeCheck,
  Building2,
  Globe,
  MapPin,
  Briefcase,
  ArrowLeft,
} from 'lucide-react'
import jobisellApi from '@/services/jobisellApi'
import { getFullImageUrl } from '@/utils/imageUrl'
import { getJobHref } from '@/utils/jobSlug'
import styles from './CompanyPublic.module.css'

export default function CompanyPublicClient({ slug }) {
  const [company, setCompany] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!slug) {
        setError('شرکت یافت نشد')
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const decoded = decodeURIComponent(slug)
        const c = await jobisellApi.getCompanyBySlug(decoded)
        if (cancelled) return
        setCompany(c)
        try {
          const list = await jobisellApi.getJobs({
            company: c.id,
            type: 'hiring',
            page_size: 12,
          })
          if (!cancelled) {
            setJobs(Array.isArray(list?.results) ? list.results : list || [])
          }
        } catch {
          if (!cancelled) setJobs([])
        }
      } catch {
        if (!cancelled) {
          setCompany(null)
          setError('این شرکت پیدا نشد یا غیرفعال است.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.muted}>در حال بارگذاری…</p>
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <h1 className={styles.title}>شرکت یافت نشد</h1>
          <p className={styles.muted}>{error || '—'}</p>
          <Link href="/jobs" className={styles.backLink}>
            بازگشت به آگهی‌ها
          </Link>
        </div>
      </div>
    )
  }

  const logo = company.logo ? getFullImageUrl(company.logo) : null
  const place = [company.province_name, company.city_name]
    .filter(Boolean)
    .join('، ')

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Link href="/jobs" className={styles.backLink}>
          <ArrowLeft size={16} />
          آگهی‌ها
        </Link>

        <header className={styles.hero}>
          <div className={styles.logoBox}>
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt={company.name} className={styles.logo} />
            ) : (
              <span className={styles.logoPh}>
                <Building2 size={36} />
              </span>
            )}
          </div>
          <div className={styles.heroText}>
            <h1 className={styles.title}>
              {company.name}
              {company.is_verified ? (
                <BadgeCheck
                  size={22}
                  className={styles.verify}
                  aria-label="شرکت تاییدشده"
                  title="شرکت تاییدشده"
                />
              ) : null}
            </h1>
            {company.description ? (
              <p className={styles.lead}>{company.description}</p>
            ) : null}
            <div className={styles.meta}>
              {place ? (
                <span>
                  <MapPin size={14} /> {place}
                </span>
              ) : null}
              {company.website ? (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                >
                  <Globe size={14} /> {company.website}
                </a>
              ) : null}
              <span>
                <Briefcase size={14} />{' '}
                {(company.jobs_count ?? jobs.length).toLocaleString('fa-IR')}{' '}
                آگهی فعال
              </span>
            </div>
          </div>
        </header>

        {company.about ? (
          <section className={styles.section}>
            <h2>درباره شرکت</h2>
            <p className={styles.about}>{company.about}</p>
          </section>
        ) : null}

        <section className={styles.section}>
          <h2>آگهی‌های استخدام</h2>
          {jobs.length === 0 ? (
            <p className={styles.muted}>فعلاً آگهی فعالی ثبت نشده است.</p>
          ) : (
            <ul className={styles.jobList}>
              {jobs.map((j) => (
                <li key={j.id}>
                  <Link href={getJobHref(j)} className={styles.jobCard}>
                    <strong>{j.title}</strong>
                    <span>
                      {[j.city_name, j.cooperation_type_name]
                        .filter(Boolean)
                        .join(' · ') || 'مشاهده جزئیات'}
                    </span>
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
