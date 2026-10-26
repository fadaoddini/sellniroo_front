'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

/**
 * پنل واریز دادهٔ موضوعی.
 * @param {string|null} packKey — اگر ست شود فقط همان بسته نمایش/اعمال می‌شود
 */
export default function TopicPackPanel({
  embedded = false,
  packKey = null,
  title = null,
} = {}) {
  const { getAuthHeaders } = useAuth()
  const [packs, setPacks] = useState([])
  const [sections, setSections] = useState([])
  const [currentPack, setCurrentPack] = useState(null)
  const [currentName, setCurrentName] = useState('')
  const [selected, setSelected] = useState(packKey || 'mammut_sabz')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (packKey) setSelected(packKey)
  }, [packKey])

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await axios.get(Config.endpoints.news.topicPacks.list(), {
        headers: getAuthHeaders(),
      })
      const data = res.data?.data || {}
      const all = data.packs || []
      setPacks(all)
      setSections(data.sections || [])
      setCurrentPack(data.current_pack || null)
      setCurrentName(data.current_site_name || '')
      const locked = packKey || selected
      if (all.length && !all.some((p) => p.key === locked)) {
        setSelected(packKey || all[0].key)
      } else if (packKey) {
        setSelected(packKey)
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
  }, [getAuthHeaders, packKey, selected])

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packKey])

  const visiblePacks = useMemo(() => {
    if (!packKey) return packs
    return packs.filter((p) => p.key === packKey)
  }, [packs, packKey])

  const apply = async () => {
    const target = packKey || selected
    const pack = packs.find((p) => p.key === target)
    if (
      !window.confirm(
        `اطلاعات سئو، درباره ما، نوار خبر، اسلایدر، منو و تماس با بسته «${pack?.name || target}» جایگزین شود؟\n\nاین کار داده‌های فعلی این بخش‌ها را بازنویسی می‌کند.`
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
          pack: target,
          replace_menu: true,
          replace_tickers: true,
          replace_heroes: true,
        },
        { headers: getAuthHeaders() }
      )
      setMsg(res.data?.message || 'بسته اعمال شد')
      clearSiteModulesCache()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('site-modules-changed', { detail: { type: 'topic-pack' } })
        )
      }
      const data = res.data?.data?.status
      if (data) {
        setPacks(data.packs || packs)
        setSections(data.sections || [])
        setCurrentPack(data.current_pack || target)
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

  const selectedPack = packs.find((p) => p.key === (packKey || selected))
  const heading = title || (packKey ? selectedPack?.name || 'بسته داده' : 'بسته‌های داده موضوعی')

  const body = (
    <>
      {!embedded ? (
        <>
          <div className={styles.sectionHead}>
            <Sprout size={18} />
            <h2>{heading}</h2>
          </div>
          <p className={styles.moduleIntro}>
            با یک کلیک، سئو، برند، درباره ما، نوار خبر، اسلایدر و منو را
            برای موضوع انتخاب‌شده جایگزین کنید.
          </p>
        </>
      ) : (
        <p className={styles.moduleIntro} style={{ marginTop: 0 }}>
          واریز دادهٔ آماده — فقط از داشبورد؛ در لیست ویجت‌ها نیست.
        </p>
      )}

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
            disabled={loading || applying || !(packKey || selected)}
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

      {!packKey ? (
        <div className={styles.topicPackGrid}>
          {loading && visiblePacks.length === 0
            ? Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={styles.jbRowSkeleton} />
              ))
            : visiblePacks.map((pack) => {
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
      ) : selectedPack ? (
        <div className={styles.topicPackGrid}>
          <div
            className={`${styles.topicPackCard} ${styles.topicPackCardOn} ${
              currentPack === selectedPack.key ? styles.topicPackCardActive : ''
            }`}
          >
            <div className={styles.topicPackTop}>
              <strong>{selectedPack.name}</strong>
              {currentPack === selectedPack.key ? (
                <span className={styles.jbReady}>فعال</span>
              ) : null}
            </div>
            <span className={styles.topicPackTopic}>
              <Tag size={12} />
              {selectedPack.topic}
            </span>
            <p>{selectedPack.description}</p>
          </div>
        </div>
      ) : loading ? (
        <div className={styles.jbRowSkeleton} />
      ) : null}

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
    </>
  )

  if (embedded) {
    return (
      <div className={styles.topicPackEmbed} id={packKey ? `topic-pack-${packKey}` : 'topic-packs'}>
        <div className={styles.topicPackEmbedHead}>
          <Sprout size={15} />
          <strong>{heading}</strong>
        </div>
        {body}
      </div>
    )
  }

  return (
    <section className={styles.section} id={packKey ? `topic-pack-${packKey}` : 'topic-packs'}>
      {body}
    </section>
  )
}
