'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  Check,
  Loader2,
  Save,
  ShoppingCart,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  fetchSiteSettings,
  saveCheckoutPipelines,
} from '@/services/siteSettings'
import { fetchSiteModules } from '@/services/siteModules'
import {
  CHECKOUT_SYSTEM_DEFS,
  FAB_PRIORITY_OPTIONS,
  DEFAULT_CHECKOUT_PIPELINES,
  normalizeCheckoutPipelines,
} from '@/config/checkoutPipelines'
import styles from './CheckoutPipelinesPanel.module.css'

export default function CheckoutPipelinesPanel() {
  const { getAuthHeaders } = useAuth()
  const [pipelines, setPipelines] = useState(() =>
    normalizeCheckoutPipelines(DEFAULT_CHECKOUT_PIPELINES),
  )
  const [moduleMap, setModuleMap] = useState({})
  const [openId, setOpenId] = useState('shop')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const [settings, mods] = await Promise.all([
        fetchSiteSettings({ force: true }),
        fetchSiteModules({ force: true }),
      ])
      setPipelines(normalizeCheckoutPipelines(settings?.checkout_pipelines))
      setModuleMap(mods?.map || {})
    } catch (e) {
      setErr(e?.message || 'بارگذاری ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const patchSystem = (systemId, patch) => {
    setPipelines((prev) => {
      const cur = prev.systems?.[systemId] || { enabled: true, steps: {}, options: {} }
      return {
        ...prev,
        systems: {
          ...prev.systems,
          [systemId]: { ...cur, ...patch },
        },
      }
    })
    setMsg(null)
  }

  const toggleStep = (systemId, stepId) => {
    const cur = pipelines.systems?.[systemId] || { steps: {} }
    patchSystem(systemId, {
      steps: { ...cur.steps, [stepId]: !cur.steps?.[stepId] },
    })
  }

  const toggleOption = (systemId, optionId) => {
    const cur = pipelines.systems?.[systemId] || { options: {} }
    patchSystem(systemId, {
      options: { ...cur.options, [optionId]: !cur.options?.[optionId] },
    })
  }

  const save = async () => {
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      const saved = await saveCheckoutPipelines(pipelines, getAuthHeaders())
      setPipelines(normalizeCheckoutPipelines(saved))
      setMsg('پایپ‌لاین سفارش ذخیره شد')
    } catch (e) {
      setErr(e?.message || 'ذخیره ناموفق بود')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className={styles.spin} size={22} />
        در حال بارگذاری پایپ‌لاین سفارش…
      </div>
    )
  }

  return (
    <div className={styles.panel} dir="rtl">
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>
            <ShoppingCart size={14} />
            سفارش و سبد
          </p>
          <h2>پایپ‌لاین سفارش هر سیستم</h2>
          <p className={styles.sub}>
            فروشگاه، نوبت‌دهی، سرور ابری و بسته‌های ربو هرکدام مسیر خودشان را
            دارند — همزمان روشن باشند تداخل سبد پیش نمی‌آید. ظاهر هدر و رنگ سبد
            (/cart) از همان نوار صفحه اصلی است؛ برای یکسان‌سازی با صفحات داخلی،
            در چیدمان صفحه اصلی «اعمال هدر و رنگ به همه» را بزنید.
          </p>
        </div>
        <Link href="/adminsettings?tab=home" className={styles.routeLink}>
          همگام‌سازی هدر
          <ExternalLink size={14} />
        </Link>
      </header>

      {err ? (
        <p className={styles.err}>
          <AlertCircle size={14} /> {err}
        </p>
      ) : null}
      {msg ? (
        <p className={styles.ok}>
          <Check size={14} /> {msg}
        </p>
      ) : null}

      <section className={styles.card}>
        <h3>سبد شناور (FAB)</h3>
        <p className={styles.cardHint}>
          فقط یک سبد شناور نشان داده می‌شود تا فروشگاه و ربو با هم قاطی نشوند.
          نوبت و تعمیرات سبد شناور ندارند.
        </p>
        <div className={styles.fabGrid}>
          {FAB_PRIORITY_OPTIONS.map((opt) => {
            const on = pipelines.fab_priority === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                className={`${styles.fabCard} ${on ? styles.fabOn : ''}`}
                onClick={() => {
                  setPipelines((p) => ({ ...p, fab_priority: opt.id }))
                  setMsg(null)
                }}
                aria-pressed={on}
              >
                <strong>{opt.label}</strong>
                <span>{opt.desc}</span>
              </button>
            )
          })}
        </div>
      </section>

      <div className={styles.systems}>
        {CHECKOUT_SYSTEM_DEFS.map((def) => {
          const sys = pipelines.systems?.[def.id] || {
            enabled: true,
            steps: {},
            options: {},
          }
          const moduleOn = def.moduleKey ? !!moduleMap[def.moduleKey] : true
          const open = openId === def.id
          return (
            <section key={def.id} className={styles.systemCard}>
              <button
                type="button"
                className={styles.systemHead}
                onClick={() => setOpenId(open ? '' : def.id)}
                aria-expanded={open}
              >
                <span>
                  <strong>{def.label}</strong>
                  <small>{def.desc}</small>
                </span>
                <span className={styles.headMeta}>
                  {!moduleOn ? (
                    <em className={styles.moduleOff}>ماژول خاموش</em>
                  ) : sys.enabled ? (
                    <em className={styles.moduleOn}>فعال</em>
                  ) : (
                    <em className={styles.moduleHidden}>غیرفعال</em>
                  )}
                  {def.route ? (
                    <Link
                      href={def.route}
                      target="_blank"
                      className={styles.routeLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={12} />
                      مسیر
                    </Link>
                  ) : null}
                </span>
              </button>

              {open ? (
                <div className={styles.systemBody}>
                  <label className={styles.enableRow}>
                    <input
                      type="checkbox"
                      checked={!!sys.enabled}
                      onChange={() =>
                        patchSystem(def.id, { enabled: !sys.enabled })
                      }
                    />
                    فعال‌سازی پایپ‌لاین این سیستم
                  </label>

                  <h4>مراحل سفارش</h4>
                  <ul className={styles.toggleList}>
                    {def.steps.map((step) => (
                      <li key={step.id}>
                        <label>
                          <input
                            type="checkbox"
                            checked={!!sys.steps?.[step.id]}
                            disabled={!sys.enabled}
                            onChange={() => toggleStep(def.id, step.id)}
                          />
                          <span>
                            <strong>{step.label}</strong>
                            {step.desc ? <small>{step.desc}</small> : null}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>

                  {def.options?.length ? (
                    <>
                      <h4>گزینه‌ها</h4>
                      <ul className={styles.toggleList}>
                        {def.options.map((opt) => (
                          <li key={opt.id}>
                            <label>
                              <input
                                type="checkbox"
                                checked={!!sys.options?.[opt.id]}
                                disabled={!sys.enabled}
                                onChange={() => toggleOption(def.id, opt.id)}
                              />
                              <span>
                                <strong>{opt.label}</strong>
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </div>
              ) : null}
            </section>
          )
        })}
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={styles.ghost}
          onClick={load}
          disabled={saving}
        >
          بازخوانی
        </button>
        <button
          type="button"
          className={styles.save}
          onClick={save}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className={styles.spin} size={16} />
              در حال ذخیره…
            </>
          ) : (
            <>
              <Save size={16} />
              ذخیره پایپ‌لاین سفارش
            </>
          )}
        </button>
      </div>
    </div>
  )
}
