'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { FileCode2, RefreshCw, Save, AlertTriangle } from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import styles from './AdminWeb.module.css'

export default function LocalSettingsEditor() {
  const { getAuthHeaders } = useAuth()
  const [content, setContent] = useState('')
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.get(Config.endpoints.news.localSettings.get(), {
        headers: getAuthHeaders(),
      })
      const data = res.data?.data || {}
      setContent(data.content || '')
      setMeta(data)
      setDirty(false)
    } catch (e) {
      setErr(e.response?.data?.message || e.message || 'خواندن فایل ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    if (!window.confirm('ذخیره local_settings.py؟ قبل از ذخیره بک‌آپ گرفته می‌شود.')) return
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.put(
        Config.endpoints.news.localSettings.save(),
        { content },
        { headers: getAuthHeaders() },
      )
      setMsg(res.data?.message || 'ذخیره شد')
      setDirty(false)
      const data = res.data?.data
      if (data) setMeta((prev) => ({ ...prev, ...data }))
    } catch (e) {
      setErr(e.response?.data?.message || e.message || 'ذخیره ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={styles.section} id="local-settings">
      <div className={styles.sectionHead}>
        <FileCode2 size={18} />
        <h2>local_settings.py</h2>
      </div>
      <p className={styles.moduleIntro}>
        ویرایش مستقیم تنظیمات محیط — فقط برای مالک پلتفرم. پس از ذخیره ممکن است
        ری‌استارت بک‌اند لازم باشد.
      </p>

      <div className={styles.lsBar}>
        <div className={styles.lsMeta}>
          <span dir="ltr">{meta?.path || 'aria/local_settings.py'}</span>
          {meta?.size != null ? <span>{meta.size} B</span> : null}
          {dirty ? <span className={styles.lsDirty}>ذخیره‌نشده</span> : null}
        </div>
        <div className={styles.lsActions}>
          <button
            type="button"
            className={styles.extBtnGhost}
            onClick={load}
            disabled={loading || saving}
          >
            <RefreshCw size={14} className={loading ? styles.spin : undefined} />
            بارگذاری
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={save}
            disabled={loading || saving || !dirty}
          >
            {saving ? <RefreshCw size={14} className={styles.spin} /> : <Save size={14} />}
            ذخیره
          </button>
        </div>
      </div>

      {err ? (
        <div className={styles.lsAlert} role="alert">
          <AlertTriangle size={14} />
          {err}
        </div>
      ) : null}
      {msg ? <div className={styles.lsOk}>{msg}</div> : null}

      <textarea
        className={styles.lsEditor}
        dir="ltr"
        spellCheck={false}
        value={content}
        disabled={loading}
        onChange={(e) => {
          setContent(e.target.value)
          setDirty(true)
        }}
        aria-label="محتوای local_settings.py"
      />
    </section>
  )
}
