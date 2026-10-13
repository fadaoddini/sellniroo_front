'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  Briefcase,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  CircleDashed,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AdminWeb.module.css'

export default function JobBoardDataPanel() {
  const { getAuthHeaders } = useAuth()
  const [sections, setSections] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

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
      setErr(e.response?.data?.detail || e.response?.data?.message || e.message || 'خواندن وضعیت ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  const runImport = async () => {
    if (
      !window.confirm(
        'داده‌های پایه کاریابی (استان، شهر، فیلترها، نوع همکاری و …) ایمپورت شوند؟ رکوردهای موجود تکراری ساخته نمی‌شوند.'
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
      const data = res.data?.data?.status
      if (data) {
        setSections(data.sections || [])
        setSummary(data.summary || null)
      } else {
        await load()
      }
    } catch (e) {
      setErr(e.response?.data?.detail || e.response?.data?.message || e.message || 'ایمپورت ناموفق بود')
    } finally {
      setImporting(false)
    }
  }

  const ready = !!summary?.ready
  const percent = summary?.percent ?? 0

  return (
    <section className={styles.section} id="job-board-data">
      <div className={styles.sectionHead}>
        <Briefcase size={18} />
        <h2>داده‌های پایه کاریابی</h2>
      </div>
      <p className={styles.moduleIntro}>
        استان‌ها، شهرها، فیلترها و جداول مرجع لازم برای سیستم کاریابی — با یک کلیک
        ایمپورت و وضعیت تکمیل هر بخش را ببینید.
      </p>

      <div className={styles.lsBar}>
        <div className={styles.lsMeta}>
          {summary ? (
            <>
              <span>
                {summary.complete_sections}/{summary.total_sections} بخش کامل
              </span>
              <span className={ready ? styles.jbReady : styles.jbPending}>
                {ready ? 'آماده' : 'ناقص'}
              </span>
              <span>{percent}٪</span>
            </>
          ) : (
            <span>در حال بررسی…</span>
          )}
        </div>
        <div className={styles.lsActions}>
          <button
            type="button"
            className={styles.extBtnGhost}
            onClick={load}
            disabled={loading || importing}
          >
            <RefreshCw size={14} className={loading ? styles.spin : undefined} />
            بررسی
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={runImport}
            disabled={loading || importing}
          >
            {importing ? (
              <RefreshCw size={14} className={styles.spin} />
            ) : (
              <Download size={14} />
            )}
            ایمپورت یک‌کلیکه
          </button>
        </div>
      </div>

      {summary ? (
        <div className={styles.jbProgress} aria-hidden>
          <div
            className={`${styles.jbProgressFill} ${ready ? styles.jbProgressOk : ''}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}

      {err ? (
        <div className={styles.lsAlert} role="alert">
          <AlertCircle size={14} />
          {err}
        </div>
      ) : null}
      {msg ? <div className={styles.lsOk}>{msg}</div> : null}

      <ul className={styles.jbList}>
        {loading && sections.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className={styles.jbRowSkeleton} />
            ))
          : sections.map((sec) => (
              <li
                key={sec.key}
                className={`${styles.jbRow} ${sec.complete ? styles.jbRowOk : styles.jbRowMiss}`}
              >
                <span className={styles.jbIcon} aria-hidden>
                  {sec.complete ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <CircleDashed size={16} />
                  )}
                </span>
                <div className={styles.jbText}>
                  <strong>{sec.label}</strong>
                  <small>{sec.hint}</small>
                </div>
                <div className={styles.jbCount} dir="ltr">
                  <span>
                    {sec.count}
                    <em>/{sec.min_count}</em>
                  </span>
                  {!sec.complete && sec.missing > 0 ? (
                    <small className={styles.jbMissing}>−{sec.missing}</small>
                  ) : null}
                </div>
              </li>
            ))}
      </ul>
    </section>
  )
}
