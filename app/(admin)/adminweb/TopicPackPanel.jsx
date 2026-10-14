'use client'

import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import {
  Sprout,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle2,
  Tag,
} from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import { clearSiteModulesCache } from '@/services/siteModules'
import styles from './AdminWeb.module.css'

export default function TopicPackPanel() {
  const { getAuthHeaders } = useAuth()
  const [packs, setPacks] = useState([])
  const [sections, setSections] = useState([])
  const [currentPack, setCurrentPack] = useState(null)
  const [currentName, setCurrentName] = useState('')
  const [selected, setSelected] = useState('mammut_sabz')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await axios.get(Config.endpoints.news.topicPacks.list(), {
        headers: getAuthHeaders(),
      })
      const data = res.data?.data || {}
      setPacks(data.packs || [])
      setSections(data.sections || [])
      setCurrentPack(data.current_pack || null)
      setCurrentName(data.current_site_name || '')
      if (data.packs?.length && !data.packs.some((p) => p.key === selected)) {
        setSelected(data.packs[0].key)
      }
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'خواندن بسته‌ها ناموفق بود'
      )
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders, selected])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apply = async () => {
    const pack = packs.find((p) => p.key === selected)
    if (
      !window.confirm(
        `اطلاعات سئو، درباره ما، نوار خبر، اسلایدر، منوی شرکتی و تماس با بسته «${pack?.name || selected}» جایگزین شود؟\n\nاین کار داده‌های فعلی این بخش‌ها را بازنویسی می‌کند.`
      )
    ) {
      return
    }
    setApplying(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await axios.post(
        Config.endpoints.news.topicPacks.apply(),
        {
          pack: selected,
          replace_menu: true,
          replace_tickers: true,
          replace_heroes: true,
        },
        { headers: getAuthHeaders() }
      )
      setMsg(res.data?.message || 'بسته اعمال شد')
      clearSiteModulesCache()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('site-modules-changed', { detail: { type: 'topic-pack' } }))
      }
      const data = res.data?.data?.status
      if (data) {
        setPacks(data.packs || packs)
        setSections(data.sections || [])
        setCurrentPack(data.current_pack || selected)
        setCurrentName(data.current_site_name || '')
      } else {
        await load()
      }
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'اعمال بسته ناموفق بود'
      )
    } finally {
      setApplying(false)
    }
  }

  const selectedPack = packs.find((p) => p.key === selected)

  return (
    <section className={styles.section} id="topic-packs">
      <div className={styles.sectionHead}>
        <Sprout size={18} />
        <h2>بسته موضوعی سایت</h2>
      </div>
      <p className={styles.moduleIntro}>
        با یک کلیک، سئو، برند، درباره ما، نوار خبر، اسلایدر و منوی سیستم شرکتی را
        برای موضوع انتخاب‌شده جایگزین کنید — مناسب راه‌اندازی سریع سایت شرکتی.
      </p>

      <div className={styles.lsBar}>
        <div className={styles.lsMeta}>
          <span>سایت فعلی: {currentName || '—'}</span>
          {currentPack ? (
            <span className={styles.jbReady}>بسته فعال: {currentPack}</span>
          ) : (
            <span className={styles.jbPending}>بسته موضوعی اعمال‌نشده</span>
          )}
        </div>
        <div className={styles.lsActions}>
          <button
            type="button"
            className={styles.extBtnGhost}
            onClick={load}
            disabled={loading || applying}
          >
            <RefreshCw size={14} className={loading ? styles.spin : undefined} />
            بررسی
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={apply}
            disabled={loading || applying || !selected}
          >
            {applying ? (
              <RefreshCw size={14} className={styles.spin} />
            ) : (
              <Download size={14} />
            )}
            اعمال بسته
          </button>
        </div>
      </div>

      {err ? (
        <div className={styles.lsAlert} role="alert">
          <AlertCircle size={14} />
          {err}
        </div>
      ) : null}
      {msg ? (
        <div className={styles.lsOk}>
          <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
          {msg}
        </div>
      ) : null}

      <div className={styles.topicPackGrid}>
        {loading && packs.length === 0
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className={styles.jbRowSkeleton} />
            ))
          : packs.map((pack) => {
              const on = selected === pack.key
              const active = currentPack === pack.key
              return (
                <button
                  key={pack.key}
                  type="button"
                  className={`${styles.topicPackCard} ${on ? styles.topicPackCardOn : ''} ${active ? styles.topicPackCardActive : ''}`}
                  onClick={() => setSelected(pack.key)}
                >
                  <div className={styles.topicPackTop}>
                    <strong>{pack.name}</strong>
                    {active ? <span className={styles.jbReady}>فعال</span> : null}
                  </div>
                  <span className={styles.topicPackTopic}>
                    <Tag size={12} />
                    {pack.topic}
                  </span>
                  <p>{pack.description}</p>
                  {pack.tags?.length ? (
                    <div className={styles.topicPackTags}>
                      {pack.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  ) : null}
                </button>
              )
            })}
      </div>

      {selectedPack ? (
        <p className={styles.topicPackHint}>
          انتخاب‌شده: <strong>{selectedPack.name}</strong> — با زدن «اعمال بسته»،
          اطلاعات سئو و محتوای اولیه جایگزین می‌شود.
        </p>
      ) : null}

      <ul className={styles.jbList} style={{ marginTop: '0.85rem' }}>
        {sections.map((sec) => (
          <li key={sec.key} className={styles.jbRow}>
            <div className={styles.jbText}>
              <strong>{sec.label}</strong>
              <small>{sec.hint || sec.value}</small>
            </div>
            <div className={styles.jbCount}>
              <span>{sec.value}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
