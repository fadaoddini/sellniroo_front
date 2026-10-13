'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  LayoutList,
  ChevronUp,
  ChevronDown,
  GripVertical,
  RefreshCw,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  HOMEPAGE_ORDERABLE_MODULES,
  HOMEPAGE_ORDERABLE_KEYS,
  sortHomepageModuleKeys,
  getCatalogMeta,
} from '@/config/siteModules'
import {
  fetchSiteModules,
  reorderHomepageModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import styles from './AdminWeb.module.css'

function moveItem(list, index, dir) {
  const next = [...list]
  const j = index + dir
  if (j < 0 || j >= next.length) return list
  ;[next[index], next[j]] = [next[j], next[index]]
  return next
}

export default function HomepageOrderPanel() {
  const { getAuthHeaders } = useAuth()
  const [keys, setKeys] = useState([...HOMEPAGE_ORDERABLE_KEYS])
  const [savedKeys, setSavedKeys] = useState([...HOMEPAGE_ORDERABLE_KEYS])
  const [moduleMeta, setModuleMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const [msg, setMsg] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)

  const dirty = useMemo(
    () => keys.join('|') !== savedKeys.join('|'),
    [keys, savedKeys]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      clearSiteModulesCache()
      const { list, map } = await fetchSiteModules({ force: true })
      const ordered = sortHomepageModuleKeys(list)
      setKeys(ordered)
      setSavedKeys(ordered)
      const meta = {}
      ;(list || []).forEach((m) => {
        if (HOMEPAGE_ORDERABLE_KEYS.includes(m.key)) {
          meta[m.key] = {
            name: m.name,
            effective: !!(map?.[m.key] ?? m.effective_active ?? m.is_active),
          }
        }
      })
      HOMEPAGE_ORDERABLE_MODULES.forEach((m) => {
        if (!meta[m.key]) {
          meta[m.key] = {
            name: m.name,
            effective: true,
          }
        }
      })
      setModuleMeta(meta)
    } catch (e) {
      setErr(e.message || 'بارگذاری ترتیب ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const res = await reorderHomepageModules(keys, getAuthHeaders())
      const next = res.homeOrder?.length ? res.homeOrder : keys
      setKeys(next)
      setSavedKeys(next)
      setMsg('ترتیب صفحه اصلی ذخیره شد')
    } catch (e) {
      setErr(e.message || 'ذخیره ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  const onDragStart = (index) => (e) => {
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }

  const onDragOver = (index) => (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragIndex == null || dragIndex === index) return
    setKeys((prev) => moveItem(prev, dragIndex, index - dragIndex))
    setDragIndex(index)
  }

  const onDragEnd = () => setDragIndex(null)

  return (
    <section className={styles.section} id="homepage-order">
      <div className={styles.sectionHead}>
        <LayoutList size={18} />
        <h2>چیدمان صفحه اصلی</h2>
      </div>
      <p className={styles.moduleIntro}>
        ترتیب سکشن‌های فعال در بدنهٔ صفحه اصلی را با کشیدن یا دکمه‌های بالا/پایین
        تنظیم کنید. هدر، هیرو و فوتر ثابت می‌مانند.
      </p>

      <div className={styles.lsBar}>
        <div className={styles.lsMeta}>
          <span>{keys.length} سکشن</span>
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
            ذخیره ترتیب
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

      <ol className={styles.homeOrderList}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className={styles.homeOrderSkeleton} />
            ))
          : keys.map((key, index) => {
              const meta = moduleMeta[key] || getCatalogMeta(key) || {}
              const name =
                meta.name ||
                HOMEPAGE_ORDERABLE_MODULES.find((m) => m.key === key)?.name ||
                key
              const on = meta.effective !== false
              return (
                <li
                  key={key}
                  className={`${styles.homeOrderRow} ${dragIndex === index ? styles.homeOrderDragging : ''} ${on ? '' : styles.homeOrderOff}`}
                  draggable={!saving}
                  onDragStart={onDragStart(index)}
                  onDragOver={onDragOver(index)}
                  onDragEnd={onDragEnd}
                >
                  <span className={styles.homeOrderGrip} aria-hidden>
                    <GripVertical size={16} />
                  </span>
                  <span className={styles.homeOrderIndex}>{index + 1}</span>
                  <div className={styles.homeOrderText}>
                    <strong>{name}</strong>
                    <code dir="ltr">{key}</code>
                  </div>
                  <span className={on ? styles.jbReady : styles.jbPending}>
                    {on ? 'فعال' : 'خاموش'}
                  </span>
                  <div className={styles.homeOrderMove}>
                    <button
                      type="button"
                      className={styles.homeOrderBtn}
                      disabled={index === 0 || saving}
                      onClick={() => setKeys((prev) => moveItem(prev, index, -1))}
                      aria-label="بالا"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      type="button"
                      className={styles.homeOrderBtn}
                      disabled={index === keys.length - 1 || saving}
                      onClick={() => setKeys((prev) => moveItem(prev, index, 1))}
                      aria-label="پایین"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </li>
              )
            })}
      </ol>
    </section>
  )
}
