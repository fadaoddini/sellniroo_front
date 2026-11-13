// پنل یک‌کلیکه «سیستم کاریابی تم دو» — داخل تب ماژول‌ها زیر گروه کاریابی
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  Briefcase,
  CheckCircle2,
  Loader2,
  Power,
  Sparkles,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import {
  SYSTEM_TEMPLATES,
  getActiveExclusiveTemplate,
} from '@/config/systemTemplates'
import {
  clearSiteModulesCache,
  fetchSiteModules,
  toggleSiteModule,
} from '@/services/siteModules'
import styles from './AdminWeb.module.css'

const TPL = SYSTEM_TEMPLATES.find((t) => t.key === 'job_theme_two')

export default function JobThemeTwoPackPanel({ embedded = false } = {}) {
  const { getAuthHeaders } = useAuth()
  const [moduleMap, setModuleMap] = useState({})
  const [currentPack, setCurrentPack] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  const activeTpl = getActiveExclusiveTemplate(moduleMap, currentPack)
  const isActive = activeTpl?.key === 'job_theme_two'

  const load = useCallback(async () => {
    try {
      const [packRes, mods] = await Promise.all([
        axios.get(Config.endpoints.news.topicPacks.list(), {
          headers: getAuthHeaders(),
        }),
        fetchSiteModules({ force: true }),
      ])
      setCurrentPack(packRes.data?.data?.current_pack || null)
      setModuleMap(mods.map || {})
    } catch {
      /* نادیده */
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  if (!TPL) return null

  const apply = async () => {
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای اعمال بسته دوباره وارد شوید')
      return
    }
    const ok = window.confirm(
      `سیستم «${TPL.name}» با یک کلیک نصب شود؟\n\n` +
        'چیدمان خانه، آگهی، اخبار، ویدیو، پروفایل، تماس، منو و دادهٔ دمو جایگزین می‌شود.\n' +
        'قالب اختصاصی قبلی خاموش می‌گردد.',
    )
    if (!ok) return

    setBusy(true)
    setErr('')
    setMsg('')
    try {
      await axios.post(
        Config.endpoints.news.topicPacks.apply(),
        {
          pack: TPL.key,
          replace_menu: true,
          replace_tickers: true,
          replace_heroes: true,
        },
        { headers },
      )
      clearSiteModulesCache()
      const { map } = await fetchSiteModules({ force: true })
      setModuleMap(map || {})
      setCurrentPack(TPL.key)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('site-modules-changed', {
            detail: { type: 'system-template', pack: TPL.key },
          }),
        )
      }
      setMsg(`«${TPL.name}» فعال شد — نسخه کامل کاریابی آماده است.`)
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'اعمال بسته ناموفق بود',
      )
    } finally {
      setBusy(false)
    }
  }

  const deactivate = async () => {
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای تغییر وضعیت دوباره وارد شوید')
      return
    }
    const ok = window.confirm(
      `سیستم «${TPL.name}» غیرفعال شود؟\nماژول‌های اختصاصی خاموش می‌شوند.`,
    )
    if (!ok) return

    setBusy(true)
    setErr('')
    setMsg('')
    try {
      let map = { ...moduleMap }
      for (const key of TPL.deactivateKeys || [TPL.moduleKey]) {
        if (!map?.[key]) continue
        try {
          await toggleSiteModule(key, headers)
          map = { ...map, [key]: false }
        } catch {
          /* نادیده */
        }
      }
      clearSiteModulesCache()
      const fresh = await fetchSiteModules({ force: true })
      setModuleMap(fresh.map || {})
      setCurrentPack(null)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('site-modules-changed', {
            detail: { type: 'system-template-off', pack: TPL.key },
          }),
        )
      }
      setMsg(`«${TPL.name}» غیرفعال شد.`)
    } catch (e) {
      setErr(e?.message || 'غیرفعال‌سازی ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className={styles.section}
      style={
        embedded
          ? {
              marginTop: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'rgba(212, 98, 26, 0.08)',
              border: '1px solid rgba(212, 98, 26, 0.22)',
            }
          : undefined
      }
      id="job-theme-two-pack"
    >
      <div className={styles.sectionHeadRow}>
        <div className={styles.sectionHead}>
          <Sparkles size={15} color="#D4621A" />
          <h2 style={{ fontSize: embedded ? 14 : undefined }}>
            {TPL.name}
          </h2>
          {isActive ? (
            <span
              className={styles.exclusivePill}
              style={{ background: 'rgba(212, 98, 26, 0.18)', color: '#D4621A' }}
            >
              فعال
            </span>
          ) : null}
        </div>
      </div>

      <p className={styles.soloHint} style={{ margin: '0 0 10px' }}>
        {TPL.description}
      </p>
      <ul
        className={styles.soloHint}
        style={{ margin: '0 0 12px', paddingInlineStart: 18 }}
      >
        {(TPL.replaces || []).slice(0, 4).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button
          type="button"
          className={styles.refreshBtn}
          disabled={busy}
          onClick={isActive ? deactivate : apply}
          style={{
            background: isActive ? 'transparent' : '#D4621A',
            color: isActive ? '#D4621A' : '#FEF3E2',
            border: '1px solid #D4621A',
            padding: '8px 14px',
            borderRadius: 10,
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {busy ? (
            <Loader2 size={14} className={styles.spin} />
          ) : isActive ? (
            <Power size={14} />
          ) : (
            <Briefcase size={14} />
          )}
          {busy
            ? 'در حال اعمال…'
            : isActive
              ? 'غیرفعال کردن سیستم'
              : 'راه‌اندازی با یک کلیک'}
        </button>
      </div>

      {msg ? (
        <p
          className={styles.soloHint}
          style={{
            marginTop: 10,
            color: '#2A1A0E',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <CheckCircle2 size={14} color="#D4621A" />
          {msg}
        </p>
      ) : null}
      {err ? (
        <p className={styles.soloHint} style={{ marginTop: 10, color: '#b91c1c' }}>
          {err}
        </p>
      ) : null}
    </div>
  )
}
