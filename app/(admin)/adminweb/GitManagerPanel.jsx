'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { GitBranch, Loader2, RefreshCw, UploadCloud } from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AdminWeb.module.css'

const REPOS = [
  { id: 'admin', title: 'بک‌اند', hint: 'sell_niroo · admin' },
  { id: 'front', title: 'فرانت', hint: 'sellniroo_front · front' },
]

function Out({ data }) {
  if (!data) return null
  const text =
    typeof data === 'string'
      ? data
      : data.output || data.stdout || data.stderr || ''
  if (!text) return null
  return <pre className={styles.gitLog}>{text}</pre>
}

function RepoCard({ repoId, title, hint, info, busy, message, onUpdate }) {
  const [commitMsg, setCommitMsg] = useState('')
  const updating = busy === repoId
  const branch = info?.branch || '—'
  const creds = info?.credentials_configured

  return (
    <article className={styles.gitColCard}>
      <div className={styles.siteCardTop}>
        <div>
          <h3>{title}</h3>
          <p className={styles.siteMeta}>
            {hint}
            <br />
            branch: <strong>{branch}</strong>
          </p>
        </div>
        <span
          className={`${styles.sitePill} ${
            creds ? styles.sitePillOk : styles.sitePillBad
          }`}
        >
          {creds ? 'آماده' : 'بدون رمز'}
        </span>
      </div>

      {info?.error ? (
        <div className={styles.siteBannerErr}>{info.error}</div>
      ) : (
        <Out data={info?.status} />
      )}

      <label className={styles.gitCommitLabel}>
        متن کامیت
        <input
          type="text"
          className={styles.gitCommitInput}
          value={commitMsg}
          onChange={(e) => setCommitMsg(e.target.value)}
          placeholder="پیام کامیت را بنویس…"
          disabled={updating}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && commitMsg.trim() && !updating) {
              onUpdate(repoId, commitMsg.trim())
            }
          }}
        />
      </label>

      <button
        type="button"
        className={styles.gitUpdateBtn}
        disabled={updating || !commitMsg.trim()}
        onClick={() => onUpdate(repoId, commitMsg.trim())}
      >
        {updating ? (
          <Loader2 size={16} className={styles.spin} />
        ) : (
          <UploadCloud size={16} />
        )}
        {updating ? 'در حال بروزرسانی…' : 'بروزرسانی'}
      </button>

      <p className={styles.gitAutoHint}>
        خودکار: <code>git add .</code> → <code>commit</code> →{' '}
        <code>push -u origin</code>
      </p>

      {message ? (
        <div
          className={
            String(message).includes('ناموفق') || String(message).includes('error')
              ? styles.siteBannerErr
              : styles.siteBannerOk
          }
        >
          {message}
        </div>
      ) : null}
    </article>
  )
}

export default function GitManagerPanel() {
  const { getAuthHeaders } = useAuth()
  const [repos, setRepos] = useState({ admin: null, front: null })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState('')
  const [actionMsg, setActionMsg] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const res = await axios.get(Config.endpoints.news.git.overview(), {
        headers: getAuthHeaders(),
      })
      setRepos(res.data?.data || {})
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || 'خواندن وضعیت گیت ناموفق بود',
      )
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  const runUpdate = async (repoId, message) => {
    setBusy(repoId)
    setActionMsg((p) => ({ ...p, [repoId]: '' }))
    try {
      const res = await axios.post(
        Config.endpoints.news.git.update(),
        { repo: repoId, message },
        { headers: getAuthHeaders(), timeout: 180000 },
      )
      const out = res.data?.data?.output || ''
      const steps = (res.data?.data?.steps || [])
        .map((s) => `${s.step}:${s.ok ? '✓' : '✗'}`)
        .join(' · ')
      setActionMsg((p) => ({
        ...p,
        [repoId]: [res.data?.message || 'بروزرسانی شد', steps, out]
          .filter(Boolean)
          .join('\n'),
      }))
      const st = await axios.get(Config.endpoints.news.git.status(repoId), {
        headers: getAuthHeaders(),
      })
      setRepos((prev) => ({ ...prev, [repoId]: st.data?.data }))
    } catch (e) {
      const data = e?.response?.data
      setActionMsg((p) => ({
        ...p,
        [repoId]:
          data?.message ||
          data?.data?.output ||
          e?.message ||
          'بروزرسانی ناموفق',
      }))
    } finally {
      setBusy('')
    }
  }

  return (
    <section className={styles.sitePanel}>
      <header className={styles.sitePanelHead}>
        <div>
          <h2 className={styles.sitePanelTitle}>
            <GitBranch size={18} />
            مدیریت گیت
          </h2>
          <p className={styles.sitePanelLead}>
            فقط متن کامیت را بنویس و «بروزرسانی» را بزن — add و commit و push
            خودکار انجام می‌شود.
          </p>
        </div>
        <button
          type="button"
          className={styles.tplBtnGhost}
          disabled={loading || !!busy}
          onClick={load}
        >
          {loading ? (
            <Loader2 size={14} className={styles.spin} />
          ) : (
            <RefreshCw size={14} />
          )}
          وضعیت
        </button>
      </header>

      {err ? <div className={styles.siteBannerErr}>{err}</div> : null}

      {loading && !repos.admin && !repos.front ? (
        <div className={styles.siteEmpty}>
          <Loader2 size={18} className={styles.spin} />
          در حال خواندن…
        </div>
      ) : (
        <div className={styles.gitTwoCol}>
          {REPOS.map((r) => (
            <RepoCard
              key={r.id}
              repoId={r.id}
              title={r.title}
              hint={r.hint}
              info={repos[r.id]}
              busy={busy}
              message={actionMsg[r.id]}
              onUpdate={runUpdate}
            />
          ))}
        </div>
      )}
    </section>
  )
}
