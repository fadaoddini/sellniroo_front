'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  Activity,
  AlertTriangle,
  Database,
  ExternalLink,
  Eye,
  Loader2,
  MessageSquare,
  Monitor,
  RefreshCw,
  Save,
  Server,
  UserPlus,
  X,
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

function displayDomain(site) {
  const raw =
    site?.front_domain ||
    (site?.urls?.front || '').replace(/^https?:\/\//i, '').split('/')[0] ||
    ''
  const host = String(raw).trim().replace(/\/$/, '')
  if (host) return host
  return site?.site_id ? `${site.site_id}.ir` : 'این سایت'
}

function previewUrl(site) {
  const url = site?.urls?.front
  if (!url) return ''
  // سرویس خارجی — فشار CPU روی سرور ربو ندارد؛ فقط یک تصویر کش‌شده
  const day = Math.floor(Date.now() / 86400000)
  return `https://image.thum.io/get/width/720/crop/960/noanimate/wait/1/${encodeURI(
    url,
  )}?v=${day}`
}

const ACTION_META = {
  status: {
    title: 'مشاهده وضعیت',
    confirmTitle: 'تازه‌سازی وضعیت',
    confirmBtn: 'مشاهده وضعیت',
    Icon: Eye,
  },
  front: {
    title: 'بروزرسانی کامل فرانت',
    confirmTitle: 'تأیید بروزرسانی فرانت',
    confirmBtn: 'تأیید و بروزرسانی فرانت',
    Icon: Monitor,
    bullets: [
      'کد فرانت بسته از ربو همگام می‌شود',
      'صفحه /dashboard همیشه در اسلایس هسته است',
      'بیلد Next.js و ری‌استارت front',
      'دیتابیس، media و SSL حفظ می‌مانند',
    ],
  },
  admin: {
    title: 'بروزرسانی کامل بک اند',
    confirmTitle: 'تأیید بروزرسانی بک‌اند',
    confirmBtn: 'تأیید و بروزرسانی بک‌اند',
    Icon: Server,
    bullets: [
      'کد بک‌اند بسته از ربو همگام می‌شود',
      'migrate و ری‌استارت django',
      'دیتابیس، media و SSL حفظ می‌مانند',
    ],
  },
  dump: {
    title: 'دانلود دیتابیس کامل',
    confirmTitle: 'تأیید دانلود دیتابیس',
    confirmBtn: 'دانلود فایل SQL',
    Icon: Database,
    bullets: [
      'خروجی کامل PostgreSQL (pg_dump)',
      'فایل .sql روی دستگاه شما ذخیره می‌شود',
      'سایت و سرویس‌ها متوقف نمی‌شوند',
    ],
  },
}

function confirmLeadNodes(kind, domain) {
  if (kind === 'status') {
    return (
      <>
        وضعیت فعلی «<strong dir="ltr">{domain}</strong>» از سرور خوانده شود؟
      </>
    )
  }
  if (kind === 'front') {
    return (
      <>
        آیا از بروزرسانی کامل فرانت{' '}
        <strong dir="ltr">{domain}</strong> مطمئن هستید؟
      </>
    )
  }
  if (kind === 'admin') {
    return (
      <>
        آیا از بروزرسانی کامل بک‌اند{' '}
        <strong dir="ltr">{domain}</strong> مطمئن هستید؟
      </>
    )
  }
  return (
    <>
      دانلود کامل دیتابیس <strong dir="ltr">{domain}</strong> شروع شود؟
    </>
  )
}

const REBO_SMS_DEFAULTS = {
  API_MAX_SMS: 'oUSMoSz9YIujHc-XyaanUMimxpSq8rpbx3KHS1nMumA=',
  MAX_SMS_ORIGINATOR: '+983000505',
  MAX_SMS_PATTERN_CODE: 'nmi8aygm4k1tsnc',
  KAVENEGAR_API_KEY: '',
  OTP_EXPOSE_ON_SMS_FAIL: false,
}

function SitePreview({ site }) {
  const [failed, setFailed] = useState(false)
  const src = useMemo(() => previewUrl(site), [site?.urls?.front])
  const domain = displayDomain(site)

  if (!src || failed) {
    return (
      <div className={styles.sitePreviewFallback} aria-hidden>
        <span>{domain.slice(0, 2).toUpperCase()}</span>
        <em dir="ltr">{domain}</em>
      </div>
    )
  }

  return (
    <div className={styles.sitePreview}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`پیش‌نمایش ${domain}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      <div className={styles.sitePreviewShade} />
    </div>
  )
}

export default function InstalledSitesPanel() {
  const { getAuthHeaders } = useAuth()
  const [sites, setSites] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [busyId, setBusyId] = useState('')
  const [jobs, setJobs] = useState({})
  const [confirmAction, setConfirmAction] = useState(null)
  const [statusSite, setStatusSite] = useState(null)
  const [smsSite, setSmsSite] = useState(null)
  const [smsForm, setSmsForm] = useState({ ...REBO_SMS_DEFAULTS })
  const [smsLoading, setSmsLoading] = useState(false)
  const [smsSaving, setSmsSaving] = useState(false)
  const [suSite, setSuSite] = useState(null)
  const [suForm, setSuForm] = useState({ mobile: '', password: '' })
  const [suSaving, setSuSaving] = useState(false)

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

  useEffect(() => {
    if (!confirmAction && !statusSite && !smsSite && !suSite) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape' || busyId || smsSaving || suSaving) return
      setConfirmAction(null)
      setStatusSite(null)
      setSmsSite(null)
      setSuSite(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmAction, statusSite, smsSite, suSite, busyId, smsSaving, suSaving])

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

  const refreshOne = async (siteId, { openModal = true } = {}) => {
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
        if (openModal) setStatusSite(row)
      }
      setMsg(`وضعیت «${siteId}» بروزرسانی شد`)
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'status ناموفق')
    } finally {
      setBusyId('')
    }
  }

  const runUpdate = async (site, component) => {
    setBusyId(`update:${site.site_id}:${component}`)
    setErr('')
    setMsg('')
    try {
      const res = await axios.post(
        Config.endpoints.news.siteFactory.siteUpdate(site.site_id),
        {
          pack_key: site.pack_key || '',
          reseed: false,
          confirm: true,
          component,
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

  const runDbDump = async (site) => {
    setBusyId(`dump:${site.site_id}`)
    setErr('')
    setMsg('')
    try {
      const res = await axios.get(
        Config.endpoints.news.siteFactory.siteDbDump(site.site_id),
        {
          headers: getAuthHeaders(),
          responseType: 'blob',
        },
      )
      const ctype = String(res.headers?.['content-type'] || '')
      if (ctype.includes('application/json')) {
        const text = await res.data.text()
        let parsed = null
        try {
          parsed = JSON.parse(text)
        } catch {
          parsed = null
        }
        throw new Error(parsed?.message || 'دانلود دیتابیس ناموفق بود')
      }
      const blob = new Blob([res.data], { type: 'application/sql' })
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = href
      a.download = `${site.site_id}_full.sql`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
      setMsg(`دانلود دیتابیس «${site.site_id}» شروع شد`)
    } catch (e) {
      let message = e?.message || 'دانلود دیتابیس ناموفق'
      const data = e?.response?.data
      if (data instanceof Blob) {
        try {
          const parsed = JSON.parse(await data.text())
          if (parsed?.message) message = parsed.message
        } catch {
          /* ignore */
        }
      } else if (data?.message) {
        message = data.message
      }
      setErr(message)
    } finally {
      setBusyId('')
    }
  }

  const askAction = (site, kind) => {
    setConfirmAction({ site, kind })
  }

  const applyReboSmsDefaults = (defaults = {}) => {
    setSmsForm({
      API_MAX_SMS:
        defaults.API_MAX_SMS || REBO_SMS_DEFAULTS.API_MAX_SMS,
      MAX_SMS_ORIGINATOR:
        defaults.MAX_SMS_ORIGINATOR || REBO_SMS_DEFAULTS.MAX_SMS_ORIGINATOR,
      MAX_SMS_PATTERN_CODE:
        defaults.MAX_SMS_PATTERN_CODE || REBO_SMS_DEFAULTS.MAX_SMS_PATTERN_CODE,
      KAVENEGAR_API_KEY:
        defaults.KAVENEGAR_API_KEY || REBO_SMS_DEFAULTS.KAVENEGAR_API_KEY,
      OTP_EXPOSE_ON_SMS_FAIL: !!(
        defaults.OTP_EXPOSE_ON_SMS_FAIL ??
        REBO_SMS_DEFAULTS.OTP_EXPOSE_ON_SMS_FAIL
      ),
    })
  }

  const openSmsSettings = async (site) => {
    setSmsSite(site)
    setSmsForm({ ...REBO_SMS_DEFAULTS })
    setSmsLoading(true)
    setErr('')
    try {
      const res = await axios.get(
        Config.endpoints.news.siteFactory.siteSmsSettings(site.site_id),
        { headers: getAuthHeaders() },
      )
      const data = res.data?.data || {}
      const defaults = { ...REBO_SMS_DEFAULTS, ...(data.defaults || {}) }
      // اگر سایت خالی بود همان MaxSMS ربو؛ وگرنه مقدار ذخیره‌شده سایت
      setSmsForm({
        API_MAX_SMS:
          data.API_MAX_SMS || defaults.API_MAX_SMS || REBO_SMS_DEFAULTS.API_MAX_SMS,
        MAX_SMS_ORIGINATOR:
          data.MAX_SMS_ORIGINATOR ||
          defaults.MAX_SMS_ORIGINATOR ||
          REBO_SMS_DEFAULTS.MAX_SMS_ORIGINATOR,
        MAX_SMS_PATTERN_CODE:
          data.MAX_SMS_PATTERN_CODE ||
          defaults.MAX_SMS_PATTERN_CODE ||
          REBO_SMS_DEFAULTS.MAX_SMS_PATTERN_CODE,
        KAVENEGAR_API_KEY:
          data.KAVENEGAR_API_KEY || defaults.KAVENEGAR_API_KEY || '',
        OTP_EXPOSE_ON_SMS_FAIL: !!(
          data.OTP_EXPOSE_ON_SMS_FAIL ?? defaults.OTP_EXPOSE_ON_SMS_FAIL
        ),
      })
      setSmsSite({ ...site, _smsDefaults: defaults })
    } catch (e) {
      setSmsSite(null)
      setErr(
        e?.response?.data?.message || e?.message || 'خواندن تنظیمات پیامک ناموفق',
      )
    } finally {
      setSmsLoading(false)
    }
  }

  const saveSmsSettings = async () => {
    if (!smsSite?.site_id) return
    setSmsSaving(true)
    setErr('')
    setMsg('')
    try {
      const res = await axios.put(
        Config.endpoints.news.siteFactory.siteSmsSettings(smsSite.site_id),
        smsForm,
        { headers: getAuthHeaders() },
      )
      setMsg(res.data?.message || 'تنظیمات پیامک ذخیره شد')
      setSmsSite(null)
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || 'ذخیره تنظیمات پیامک ناموفق',
      )
    } finally {
      setSmsSaving(false)
    }
  }

  const openCreateSuperuser = (site) => {
    setSuSite(site)
    setSuForm({ mobile: '', password: '' })
    setErr('')
  }

  const saveCreateSuperuser = async () => {
    if (!suSite?.site_id) return
    const mobile = String(suForm.mobile || '').trim()
    const password = String(suForm.password || '')
    if (!mobile || !password) {
      setErr('موبایل و رمز عبور لازم است')
      return
    }
    if (password.length < 6) {
      setErr('رمز عبور حداقل ۶ کاراکتر باشد')
      return
    }
    setSuSaving(true)
    setErr('')
    setMsg('')
    try {
      const res = await axios.post(
        Config.endpoints.news.siteFactory.siteCreateSuperuser(suSite.site_id),
        { mobile, password },
        { headers: getAuthHeaders() },
      )
      setMsg(res.data?.message || 'سوپریوزر آماده شد')
      setSuSite(null)
      setSuForm({ mobile: '', password: '' })
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || 'ساخت سوپریوزر ناموفق',
      )
    } finally {
      setSuSaving(false)
    }
  }

  const confirmAndRun = async () => {
    if (!confirmAction?.site) return
    const { site, kind } = confirmAction
    setConfirmAction(null)
    if (kind === 'status') {
      await refreshOne(site.site_id, { openModal: true })
      return
    }
    if (kind === 'dump') {
      await runDbDump(site)
      return
    }
    if (kind === 'front' || kind === 'admin') {
      await runUpdate(site, kind)
    }
  }

  const confirmMeta = confirmAction
    ? ACTION_META[confirmAction.kind]
    : null
  const confirmDomain = confirmAction
    ? displayDomain(confirmAction.site)
    : ''

  return (
    <section className={styles.sitePanel}>
      <header className={styles.sitePanelHead}>
        <div>
          <h2 className={styles.sitePanelTitle}>
            <Server size={18} />
            سایت‌های نصب‌شده روی سرور
          </h2>
          <p className={styles.sitePanelLead}>
            وضعیت، بروزرسانی جداگانهٔ فرانت/بک‌اند، دانلود دیتابیس و پیش‌نمایش
            صفحه اصلی.
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
          const domain = displayDomain(site)

          const actions = [
            {
              kind: 'status',
              className: styles.siteBtnStatus,
              loading: busyId === `status:${site.site_id}`,
            },
            {
              kind: 'front',
              className: styles.siteBtnFront,
              loading: busyId === `update:${site.site_id}:front`,
            },
            {
              kind: 'admin',
              className: styles.siteBtnAdmin,
              loading: busyId === `update:${site.site_id}:admin`,
            },
            {
              kind: 'dump',
              className: styles.siteBtnDump,
              loading: busyId === `dump:${site.site_id}`,
            },
          ]

          return (
            <article key={site.site_id} className={styles.siteCard}>
              <SitePreview site={site} />

              <div className={styles.siteCardBody}>
                <div className={styles.siteCardTop}>
                  <div>
                    <h3 dir="ltr">{domain}</h3>
                    <p className={styles.siteMeta}>
                      {site.site_id} · {site.pack_key || 'pack نامشخص'}
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

                <div className={styles.siteRowsCompact}>
                  <span>
                    django{' '}
                    <em className={statusTone(site.supervisor?.django)}>
                      {statusLabel(site.supervisor?.django)}
                    </em>
                  </span>
                  <span>
                    front{' '}
                    <em className={statusTone(site.supervisor?.front)}>
                      {statusLabel(site.supervisor?.front)}
                    </em>
                  </span>
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

                <div className={styles.siteActionsStack}>
                  {actions.map((action) => {
                    const meta = ACTION_META[action.kind]
                    const Icon = meta.Icon
                    return (
                      <button
                        key={action.kind}
                        type="button"
                        className={`${styles.siteActionBtn} ${action.className}`}
                        disabled={!!busyId || smsSaving}
                        onClick={() => askAction(site, action.kind)}
                      >
                        {action.loading ? (
                          <Loader2 size={15} className={styles.spin} />
                        ) : (
                          <Icon size={15} />
                        )}
                        <span>{meta.title}</span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    className={`${styles.siteActionBtn} ${styles.siteBtnSms}`}
                    disabled={!!busyId || smsSaving || suSaving}
                    onClick={() => openSmsSettings(site)}
                  >
                    {smsLoading && smsSite?.site_id === site.site_id ? (
                      <Loader2 size={15} className={styles.spin} />
                    ) : (
                      <MessageSquare size={15} />
                    )}
                    <span>تنظیمات پنل پیامکی</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.siteActionBtn} ${styles.siteBtnSuperuser}`}
                    disabled={!!busyId || smsSaving || suSaving}
                    onClick={() => openCreateSuperuser(site)}
                  >
                    <UserPlus size={15} />
                    <span>ساخت سوپریوزر</span>
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {confirmAction?.site && confirmMeta ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-action-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busyId) setConfirmAction(null)
          }}
        >
          <div className={`${styles.tplModal} ${styles.siteUpdateModal}`}>
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={!!busyId}
              onClick={() => setConfirmAction(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>

            <div className={styles.tplWarnIcon} aria-hidden>
              <AlertTriangle size={28} strokeWidth={1.6} />
            </div>

            <h3 id="site-action-title">{confirmMeta.confirmTitle}</h3>
            <p className={styles.tplWarnLead}>
              {confirmLeadNodes(confirmAction.kind, confirmDomain)}
            </p>

            {confirmMeta.bullets?.length ? (
              <div className={styles.tplWarnBox}>
                <p>با تأیید این کار:</p>
                <ul>
                  {confirmMeta.bullets.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className={styles.tplWarnNote}>
                  شناسه سایت:{' '}
                  <strong dir="ltr">{confirmAction.site.site_id}</strong>
                </p>
              </div>
            ) : null}

            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={!!busyId}
                onClick={() => setConfirmAction(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplConfirmBtn}
                disabled={!!busyId}
                onClick={confirmAndRun}
              >
                {busyId ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  (() => {
                    const Icon = confirmMeta.Icon
                    return <Icon size={15} />
                  })()
                )}
                {confirmMeta.confirmBtn}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {suSite ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-su-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !suSaving) setSuSite(null)
          }}
        >
          <div className={`${styles.tplModal} ${styles.siteSmsModal}`}>
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={suSaving}
              onClick={() => setSuSite(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>
            <div className={styles.tplWarnIcon} aria-hidden>
              <UserPlus size={26} strokeWidth={1.6} />
            </div>
            <h3 id="site-su-title">ساخت سوپریوزر</h3>
            <p className={styles.tplWarnLead}>
              برای سایت <strong dir="ltr">{displayDomain(suSite)}</strong>
              <br />
              <small>
                اگر موبایل از قبل باشد، به سوپریوزر ارتقا می‌یابد و رمز عوض می‌شود
              </small>
            </p>
            <div className={styles.siteSmsForm}>
              <label>
                <span>موبایل</span>
                <input
                  dir="ltr"
                  inputMode="tel"
                  autoComplete="username"
                  placeholder="09123456789"
                  value={suForm.mobile}
                  onChange={(e) =>
                    setSuForm((p) => ({ ...p, mobile: e.target.value }))
                  }
                  disabled={suSaving}
                />
              </label>
              <label>
                <span>رمز عبور</span>
                <input
                  dir="ltr"
                  type="password"
                  autoComplete="new-password"
                  placeholder="حداقل ۶ کاراکتر"
                  value={suForm.password}
                  onChange={(e) =>
                    setSuForm((p) => ({ ...p, password: e.target.value }))
                  }
                  disabled={suSaving}
                />
              </label>
            </div>
            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={suSaving}
                onClick={() => setSuSite(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplConfirmBtn}
                disabled={suSaving}
                onClick={saveCreateSuperuser}
              >
                {suSaving ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <UserPlus size={15} />
                )}
                ساخت / بروزرسانی
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {smsSite ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-sms-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !smsSaving) setSmsSite(null)
          }}
        >
          <div className={`${styles.tplModal} ${styles.siteSmsModal}`}>
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={smsSaving}
              onClick={() => setSmsSite(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>
            <div className={styles.tplWarnIcon} aria-hidden>
              <MessageSquare size={26} strokeWidth={1.6} />
            </div>
            <h3 id="site-sms-title">تنظیمات پنل پیامکی</h3>
            <p className={styles.tplWarnLead}>
              ویرایش <code>local_settings</code> سایت{' '}
              <strong dir="ltr">{displayDomain(smsSite)}</strong>
              <br />
              <small>پیش‌فرض: MaxSMS (IPPanel) همان rebo.ir</small>
            </p>

            {smsLoading ? (
              <div className={styles.siteEmpty}>
                <Loader2 size={16} className={styles.spin} />
                در حال خواندن…
              </div>
            ) : (
              <div className={styles.siteSmsForm}>
                <button
                  type="button"
                  className={styles.siteSmsDefaultBtn}
                  disabled={smsSaving}
                  onClick={() =>
                    applyReboSmsDefaults(smsSite?._smsDefaults || {})
                  }
                >
                  بارگذاری پیش‌فرض MaxSMS ربو
                </button>
                <label>
                  <span>API_MAX_SMS</span>
                  <input
                    dir="ltr"
                    value={smsForm.API_MAX_SMS}
                    onChange={(e) =>
                      setSmsForm((p) => ({ ...p, API_MAX_SMS: e.target.value }))
                    }
                    disabled={smsSaving}
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>MAX_SMS_ORIGINATOR</span>
                  <input
                    dir="ltr"
                    value={smsForm.MAX_SMS_ORIGINATOR}
                    onChange={(e) =>
                      setSmsForm((p) => ({
                        ...p,
                        MAX_SMS_ORIGINATOR: e.target.value,
                      }))
                    }
                    disabled={smsSaving}
                    autoComplete="off"
                    placeholder="+983000505"
                  />
                </label>
                <label>
                  <span>MAX_SMS_PATTERN_CODE</span>
                  <input
                    dir="ltr"
                    value={smsForm.MAX_SMS_PATTERN_CODE}
                    onChange={(e) =>
                      setSmsForm((p) => ({
                        ...p,
                        MAX_SMS_PATTERN_CODE: e.target.value,
                      }))
                    }
                    disabled={smsSaving}
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>KAVENEGAR_API_KEY</span>
                  <input
                    dir="ltr"
                    value={smsForm.KAVENEGAR_API_KEY}
                    onChange={(e) =>
                      setSmsForm((p) => ({
                        ...p,
                        KAVENEGAR_API_KEY: e.target.value,
                      }))
                    }
                    disabled={smsSaving}
                    autoComplete="off"
                  />
                </label>
                <label className={styles.siteSmsCheck}>
                  <input
                    type="checkbox"
                    checked={!!smsForm.OTP_EXPOSE_ON_SMS_FAIL}
                    onChange={(e) =>
                      setSmsForm((p) => ({
                        ...p,
                        OTP_EXPOSE_ON_SMS_FAIL: e.target.checked,
                      }))
                    }
                    disabled={smsSaving}
                  />
                  <span>OTP_EXPOSE_ON_SMS_FAIL — نمایش OTP اگر SMS ناموفق بود</span>
                </label>
              </div>
            )}

            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={smsSaving}
                onClick={() => setSmsSite(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplConfirmBtn}
                disabled={smsLoading || smsSaving}
                onClick={saveSmsSettings}
              >
                {smsSaving ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <Save size={15} />
                )}
                ذخیره و اعمال
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {statusSite ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-status-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStatusSite(null)
          }}
        >
          <div className={`${styles.tplModal} ${styles.siteStatusModal}`}>
            <button
              type="button"
              className={styles.tplModalClose}
              onClick={() => setStatusSite(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>
            <div className={styles.tplWarnIcon} aria-hidden>
              <Activity size={26} strokeWidth={1.6} />
            </div>
            <h3 id="site-status-title">وضعیت {displayDomain(statusSite)}</h3>
            <div className={styles.siteRows}>
              <div>
                <span>شناسه</span>
                <em dir="ltr">{statusSite.site_id}</em>
              </div>
              <div>
                <span>بسته</span>
                <em dir="ltr">{statusSite.pack_key || '—'}</em>
              </div>
              <div>
                <span>django</span>
                <em className={statusTone(statusSite.supervisor?.django)}>
                  {statusLabel(statusSite.supervisor?.django)}
                </em>
              </div>
              <div>
                <span>front</span>
                <em className={statusTone(statusSite.supervisor?.front)}>
                  {statusLabel(statusSite.supervisor?.front)}
                </em>
              </div>
              <div>
                <span>پورت‌ها</span>
                <em>
                  {statusSite.django_port || '—'} / {statusSite.next_port || '—'}
                </em>
              </div>
              <div>
                <span>SSL</span>
                <em>
                  {statusSite.ssl?.front ? 'front✓' : 'front✗'}{' '}
                  {statusSite.ssl?.admin ? 'admin✓' : 'admin✗'}
                </em>
              </div>
              <div>
                <span>DB</span>
                <em dir="ltr">{statusSite.db_name || '—'}</em>
              </div>
              <div>
                <span>HTTP</span>
                <em>
                  front {statusSite.http?.front ?? '—'} / admin{' '}
                  {statusSite.http?.admin ?? '—'}
                </em>
              </div>
            </div>
            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                onClick={() => setStatusSite(null)}
              >
                بستن
              </button>
              <button
                type="button"
                className={styles.tplConfirmBtn}
                disabled={!!busyId}
                onClick={() =>
                  refreshOne(statusSite.site_id, { openModal: true })
                }
              >
                {busyId === `status:${statusSite.site_id}` ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <RefreshCw size={15} />
                )}
                تازه‌سازی
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
