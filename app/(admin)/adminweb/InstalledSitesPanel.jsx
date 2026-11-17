'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  Activity,
  ExternalLink,
  Loader2,
  RefreshCw,
  Server,
  Shield,
  UploadCloud,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AdminWeb.module.css'

function statusTone(sup) {
  const s = String(sup || '')
  if (s === 'RUNNING' || s === 'STARTING') return styles.sitePillOk
  if (!s || s === 'unknown' || s.startsWith('<')) return styles.sitePillMuted
  return styles.sitePillBad
}

function statusLabel(sup) {
  const s = String(sup || '')
  if (!s || s.startsWith('<') || s.toLowerCase().includes('error')) return '—'
  return s
}

export default function InstalledSitesPanel() {
  const { getAuthHeaders } = useAuth()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [busyId, setBusyId] = useState('')
  const [jobs, setJobs] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const res = await axios.get(Config.endpoints.news.siteFactory.sites(), {
        headers: getAuthHeaders(),
      })
      setSites(res.data?.data?.sites || [])
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          'خواندن لیست سایت‌ها ناموفق بود',
      )
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  const refreshOne = async (siteId) => {
    setBusyId(`status:${siteId}`)
    setErr('')
    try {
      const res = await axios.get(
        Config.endpoints.news.siteFactory.siteStatus(siteId),
        { headers: getAuthHeaders() },
      )
      const row = res.data?.data
      if (row) {
        setSites((prev) =>
          prev.map((s) => (s.site_id === siteId ? { ...s, ...row } : s)),
        )
      }
      setMsg(`وضعیت «${siteId}» بروزرسانی شد`)
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'status ناموفق')
    } finally {
      setBusyId('')
    }
  }

  const pollUpdate = async (jobId) => {
    for (let i = 0; i < 400; i += 1) {
      await new Promise((r) => setTimeout(r, 1500))
      const st = await axios.get(
        Config.endpoints.news.siteFactory.updateStatus(jobId),
        { headers: getAuthHeaders() },
      )
      const data = st.data?.data
      setJobs((prev) => ({ ...prev, [data.site_id]: data }))
      if (data?.status === 'success' || data?.status === 'failed') return data
    }
    return null
  }

  const startUpdate = async (site, reseed = false) => {
    const label = reseed
      ? `بروزرسانی + بازنشانی تم برای «${site.site_id}»؟ داده تم ممکن است عوض شود.`
      : `بروزرسانی امن «${site.site_id}»؟ کد از ربو می‌آید؛ دیتابیس و media و SSL حفظ می‌شوند.`
    if (!window.confirm(label)) return

    setBusyId(`update:${site.site_id}`)
    setErr('')
    setMsg('')
    try {
      const res = await axios.post(
        Config.endpoints.news.siteFactory.siteUpdate(site.site_id),
        {
          pack_key: site.pack_key || '',
          reseed: !!reseed,
          confirm: true,
        },
        { headers: getAuthHeaders() },
      )
      const job = res.data?.data
      if (!job?.id) throw new Error('جاب ساخته نشد')
      setJobs((prev) => ({ ...prev, [site.site_id]: job }))
      const finalJob = await pollUpdate(job.id)
      if (finalJob?.status === 'success') {
        setMsg(finalJob.message || 'بروزرسانی موفق')
        await load()
      } else {
        setErr(finalJob?.message || 'بروزرسانی ناموفق')
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || 'شروع بروزرسانی ناموفق',
      )
    } finally {
      setBusyId('')
    }
  }

  return (
    <section className={styles.sitePanel}>
      <header className={styles.sitePanelHead}>
        <div>
          <h2 className={styles.sitePanelTitle}>
            <Server size={18} />
            سایت‌های نصب‌شده روی سرور
          </h2>
          <p className={styles.sitePanelLead}>
            وضعیت، بروزرسانی امن (بدون پاک‌کردن دیتابیس) و عملیات روزمره برای
            سایت‌های ایزوله.
          </p>
        </div>
        <button
          type="button"
          className={styles.tplBtnGhost}
          disabled={loading || !!busyId}
          onClick={load}
        >
          {loading ? (
            <Loader2 size={14} className={styles.spin} />
          ) : (
            <RefreshCw size={14} />
          )}
          تازه‌سازی لیست
        </button>
      </header>

      {msg ? <div className={styles.siteBannerOk}>{msg}</div> : null}
      {err ? <div className={styles.siteBannerErr}>{err}</div> : null}

      {loading && !sites.length ? (
        <div className={styles.siteEmpty}>
          <Loader2 size={18} className={styles.spin} />
          در حال خواندن…
        </div>
      ) : null}

      {!loading && !sites.length ? (
        <div className={styles.siteEmpty}>
          هنوز سایت ایزوله‌ای روی سرور ثبت نشده. از تب «موتور و بسته‌ها» نصب کن.
        </div>
      ) : null}

      <div className={styles.siteGrid}>
        {sites.map((site) => {
          const job = jobs[site.site_id]
          const updating = busyId === `update:${site.site_id}`
          const checking = busyId === `status:${site.site_id}`
          return (
            <article key={site.site_id} className={styles.siteCard}>
              <div className={styles.siteCardTop}>
                <div>
                  <h3>{site.site_id}</h3>
                  <p className={styles.siteMeta}>
                    {site.pack_key || 'pack نامشخص'} ·{' '}
                    {site.front_domain || '—'}
                  </p>
                </div>
                <span
                  className={`${styles.sitePill} ${
                    site.healthy ? styles.sitePillOk : styles.sitePillBad
                  }`}
                >
                  {site.healthy ? 'سالم' : 'نیازمند بررسی'}
                </span>
              </div>

              <div className={styles.siteRows}>
                <div>
                  <span>django</span>
                  <em className={statusTone(site.supervisor?.django)}>
                    {statusLabel(site.supervisor?.django)}
                  </em>
                </div>
                <div>
                  <span>front</span>
                  <em className={statusTone(site.supervisor?.front)}>
                    {statusLabel(site.supervisor?.front)}
                  </em>
                </div>
                <div>
                  <span>پورت‌ها</span>
                  <em>
                    {site.django_port || '—'} / {site.next_port || '—'}
                  </em>
                </div>
                <div>
                  <span>SSL</span>
                  <em>
                    {site.ssl?.front ? 'front✓' : 'front✗'}{' '}
                    {site.ssl?.admin ? 'admin✓' : 'admin✗'}
                  </em>
                </div>
                <div>
                  <span>DB</span>
                  <em dir="ltr">{site.db_name || '—'}</em>
                </div>
              </div>

              <div className={styles.siteLinks}>
                {site.urls?.front ? (
                  <a href={site.urls.front} target="_blank" rel="noreferrer">
                    فرانت <ExternalLink size={12} />
                  </a>
                ) : null}
                {site.urls?.admin ? (
                  <a href={site.urls.admin} target="_blank" rel="noreferrer">
                    ادمین <ExternalLink size={12} />
                  </a>
                ) : null}
              </div>

              {job ? (
                <div className={styles.siteJob}>
                  <div className={styles.siteJobBar}>
                    <i style={{ width: `${job.progress || 0}%` }} />
                  </div>
                  <small>
                    [{job.status}] {job.phase || ''} — {job.message || ''}
                  </small>
                </div>
              ) : null}

              <div className={styles.siteActions}>
                <button
                  type="button"
                  className={styles.tplBtnGhost}
                  disabled={!!busyId}
                  onClick={() => refreshOne(site.site_id)}
                >
                  {checking ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <Activity size={14} />
                  )}
                  status
                </button>
                <button
                  type="button"
                  className={styles.tplBtnInstall}
                  disabled={!!busyId}
                  onClick={() => startUpdate(site, false)}
                  title="کد را همگام می‌کند؛ دیتابیس پاک نمی‌شود"
                >
                  {updating ? (
                    <Loader2 size={14} className={styles.spin} />
                  ) : (
                    <UploadCloud size={14} />
                  )}
                  deploy / بروزرسانی
                </button>
                <button
                  type="button"
                  className={styles.tplBtnSnapshot}
                  disabled={!!busyId}
                  onClick={() => startUpdate(site, true)}
                  title="علاوه بر کد، محتوای تم را هم از پک بازنشانی می‌کند"
                >
                  <Shield size={14} />
                  + reseed تم
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
