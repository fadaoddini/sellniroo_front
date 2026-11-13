'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Boxes,
  CalendarClock,
  CheckCircle2,
  Download,
  Eye,
  GraduationCap,
  HandCoins,
  Loader2,
  Palette,
  Power,
  RefreshCw,
  Sparkles,
  Sprout,
  Store,
  Warehouse,
  Dumbbell,
  Wrench,
  X,
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

const ICONS = {
  job_theme_one: Briefcase,
  job_theme_two: Briefcase,
  booking_theme_one: CalendarClock,
  shop_theme_one: Store,
  marketplace_theme_one: Building2,
  agri_theme_one: Sprout,
  branding_theme_one: Palette,
  school_theme_one: GraduationCap,
  rebo_theme_one: Boxes,
  sadra_theme_one: Wrench,
  crm_theme_one: HandCoins,
  inventory_theme_one: Warehouse,
  gym_bodybuilding_theme_one: Dumbbell,
}

/** خاموش کردن ماژول‌های اختصاصی یک قالب (بدون روشن کردن اشتباهی) */
async function turnOffModules(keys, moduleMap, headers) {
  for (const key of keys) {
    if (!moduleMap?.[key]) continue
    try {
      await toggleSiteModule(key, headers)
      moduleMap = { ...moduleMap, [key]: false }
    } catch {
      /* نادیده */
    }
  }
  return moduleMap
}

export default function TemplateImportPanel() {
  const { getAuthHeaders } = useAuth()
  const [currentPack, setCurrentPack] = useState(null)
  const [currentName, setCurrentName] = useState('')
  const [moduleMap, setModuleMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [confirmTpl, setConfirmTpl] = useState(null)
  const [detailTpl, setDetailTpl] = useState(null)
  const [ack, setAck] = useState(false)

  const activeTpl = useMemo(
    () => getActiveExclusiveTemplate(moduleMap, currentPack),
    [moduleMap, currentPack],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const [packRes, mods] = await Promise.all([
        axios.get(Config.endpoints.news.topicPacks.list(), {
          headers: getAuthHeaders(),
        }),
        fetchSiteModules({ force: true }),
      ])
      const data = packRes.data?.data || {}
      setCurrentPack(data.current_pack || null)
      setCurrentName(data.current_site_name || '')
      setModuleMap(mods.map || {})
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'خواندن وضعیت قالب‌ها ناموفق بود',
      )
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!confirmTpl) setAck(false)
  }, [confirmTpl])

  useEffect(() => {
    if (!confirmTpl && !detailTpl) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape' || busyKey) return
      if (confirmTpl) setConfirmTpl(null)
      else setDetailTpl(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmTpl, detailTpl, busyKey])

  const applyTemplate = async (tpl) => {
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای اعمال قالب دوباره وارد شوید')
      return
    }
    setBusyKey(tpl.key)
    setErr('')
    setMsg('')
    try {
      const res = await axios.post(
        Config.endpoints.news.topicPacks.apply(),
        {
          pack: tpl.key,
          replace_menu: true,
          replace_tickers: true,
          replace_heroes: true,
        },
        { headers },
      )
      // بک‌اند خودش سیستم‌های رقیب را خاموش می‌کند؛ فقط وضعیت را تازه کن
      clearSiteModulesCache()
      const { map } = await fetchSiteModules({ force: true })
      setModuleMap(map || {})

      const status = res.data?.data?.status
      if (status) {
        setCurrentPack(status.current_pack || tpl.key)
        setCurrentName(status.current_site_name || '')
      } else {
        setCurrentPack(tpl.key)
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('site-modules-changed', {
            detail: { type: 'system-template', pack: tpl.key },
          }),
        )
      }
      setMsg(
        `فقط «${tpl.name}» فعال است — قالب قبلی و ماژول‌های اختصاصی‌اش خاموش شدند.`,
      )
      setConfirmTpl(null)
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'اعمال قالب ناموفق بود',
      )
      setConfirmTpl(null)
    } finally {
      setBusyKey(null)
    }
  }

  const deactivateTemplate = async (tpl) => {
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای تغییر وضعیت دوباره وارد شوید')
      return
    }

    const ok = window.confirm(
      `سیستم «${tpl.name}» کاملاً غیرفعال شود؟\n\nماژول‌های اختصاصی همین تم خاموش می‌شوند. محتوای نوشته‌شده روی سایت تا وقتی قالب دیگری اعمال نکنید می‌ماند.`,
    )
    if (!ok) return

    setBusyKey(tpl.key)
    setErr('')
    setMsg('')
    try {
      let map = { ...moduleMap }
      // ریشهٔ دامنه (آبشار) سپس پرچم بسته — از toggle دوبارهٔ فرزندان پرهیز شود
      map = await turnOffModules(tpl.deactivateKeys || [tpl.moduleKey], map, headers)
      clearSiteModulesCache()
      const fresh = await fetchSiteModules({ force: true })
      setModuleMap(fresh.map || {})
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('site-modules-changed', {
            detail: { type: 'system-template-off', pack: tpl.key },
          }),
        )
      }
      setMsg(`سیستم «${tpl.name}» غیرفعال شد — الان هیچ قالب اختصاصی فعالی نیست.`)
    } catch (e) {
      setErr(e?.message || 'غیرفعال‌سازی ناموفق بود')
    } finally {
      setBusyKey(null)
    }
  }

  const onToggleClick = (tpl, isActive) => {
    if (isActive) {
      deactivateTemplate(tpl)
      return
    }
    setConfirmTpl(tpl)
  }

  const rivalName =
    activeTpl && confirmTpl && activeTpl.key !== confirmTpl.key
      ? activeTpl.name
      : null

  return (
    <section className={styles.section} id="system-templates">
      <div className={styles.sectionHeadRow}>
        <div className={styles.sectionHead}>
          <Sparkles size={16} />
          <h2>قالب‌های اختصاصی سیستم</h2>
        </div>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={load}
          disabled={loading || !!busyKey}
          aria-label="بروزرسانی"
        >
          <RefreshCw size={13} className={loading ? styles.spin : undefined} />
        </button>
      </div>

      <p className={styles.moduleIntro}>
        در هر لحظه <strong>فقط یک</strong> قالب اختصاصی می‌تواند فعال باشد.
        هر قالب تم و نیازمندی‌های خودش را دارد؛ با فعال‌سازی، سیستم قبلی کاملاً
        کنار گذاشته می‌شود.
      </p>

      <div className={styles.tplExclusiveBanner} role="status">
        <AlertTriangle size={15} />
        <div>
          <strong>انحصاری</strong>
          <span>
            {activeTpl
              ? `الان فقط «${activeTpl.name}» فعال است.`
              : 'هیچ قالب اختصاصی‌ای فعال نیست.'}
          </span>
        </div>
      </div>

      <div className={styles.tplStatusBar}>
        <div>
          <span className={styles.tplStatusLabel}>سایت فعلی</span>
          <strong>{currentName || '—'}</strong>
        </div>
        <div>
          <span className={styles.tplStatusLabel}>قالب انحصاری فعال</span>
          <strong>{activeTpl?.name || '—'}</strong>
        </div>
      </div>

      {err ? (
        <div className={styles.lsAlert} role="alert">
          <AlertTriangle size={14} />
          {err}
        </div>
      ) : null}
      {msg ? (
        <div className={styles.lsOk}>
          <CheckCircle2 size={14} /> {msg}
        </div>
      ) : null}

      <div className={styles.tplGrid}>
        {SYSTEM_TEMPLATES.map((tpl) => {
          const Icon = ICONS[tpl.key] || Sparkles
          const isActive = activeTpl?.key === tpl.key
          const busy = busyKey === tpl.key
          const dimmed = !!(activeTpl && !isActive)
          return (
            <article
              key={tpl.key}
              className={[
                styles.tplCard,
                isActive ? styles.tplCardOn : '',
                dimmed ? styles.tplCardDim : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                '--tpl-accent': tpl.accent,
                '--tpl-accent-soft': tpl.accentSoft,
              }}
            >
              <div className={styles.tplCardGlow} aria-hidden />
              <div className={styles.tplCardTop}>
                <span className={styles.tplIcon}>
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                {isActive ? (
                  <span className={styles.tplBadgeOn}>فعال</span>
                ) : (
                  <span className={styles.tplBadgeOff}>خاموش</span>
                )}
              </div>

              <div className={styles.tplCardTitles}>
                <strong title={tpl.name}>{tpl.name}</strong>
                <span className={styles.tplTopic}>{tpl.topic}</span>
              </div>

              <p className={styles.tplTagline}>{tpl.tagline}</p>
              <p className={styles.tplEnables}>{tpl.enablesHint}</p>

              <footer className={styles.tplCardFoot}>
                <button
                  type="button"
                  className={styles.tplBtnGhost}
                  disabled={busy || loading}
                  onClick={() => setDetailTpl(tpl)}
                >
                  <Eye size={13} />
                  جزئیات
                </button>
                {isActive ? (
                  <button
                    type="button"
                    className={styles.tplBtnOn}
                    disabled={busy || loading}
                    title="چیدمان، رنگ‌ها و دادهٔ اولیه را از بستهٔ قالب دوباره اعمال می‌کند"
                    onClick={() => setConfirmTpl(tpl)}
                  >
                    {busy ? (
                      <Loader2 size={13} className={styles.spin} />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    {busy ? '…' : 'اعمال مجدد'}
                  </button>
                ) : null}
                <button
                  type="button"
                  className={isActive ? styles.tplBtnOff : styles.tplBtnOn}
                  disabled={busy || loading}
                  onClick={() => onToggleClick(tpl, isActive)}
                >
                  {busy ? (
                    <Loader2 size={13} className={styles.spin} />
                  ) : isActive ? (
                    <Power size={13} />
                  ) : (
                    <Download size={13} />
                  )}
                  {busy ? '…' : isActive ? 'خاموش' : 'اعمال'}
                </button>
              </footer>
            </article>
          )
        })}
      </div>

      {detailTpl ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tpl-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busyKey) setDetailTpl(null)
          }}
        >
          <div
            className={`${styles.tplModal} ${styles.tplDetailModal}`}
            style={{
              '--tpl-accent': detailTpl.accent,
              '--tpl-accent-soft': detailTpl.accentSoft,
            }}
          >
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={!!busyKey}
              onClick={() => setDetailTpl(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>

            <div className={styles.tplDetailHero}>
              <span className={styles.tplDetailIcon} aria-hidden>
                {React.createElement(ICONS[detailTpl.key] || Sparkles, {
                  size: 26,
                  strokeWidth: 1.6,
                })}
              </span>
              <div>
                <p className={styles.tplDetailTopic}>{detailTpl.topic}</p>
                <h3 id="tpl-detail-title">{detailTpl.name}</h3>
                <code dir="ltr">{detailTpl.nameEn}</code>
              </div>
              {activeTpl?.key === detailTpl.key ? (
                <span className={styles.tplBadgeOn}>فعال · انحصاری</span>
              ) : (
                <span className={styles.tplBadgeOff}>غیرفعال</span>
              )}
            </div>

            <p className={styles.tplDetailLead}>{detailTpl.tagline}</p>
            <p className={styles.tplDetailDesc}>{detailTpl.description}</p>

            <div className={styles.tplDetailCols}>
              <section className={styles.tplDetailBlock}>
                <h4>بازنویسی می‌شود</h4>
                <ul>
                  {(detailTpl.replaces || []).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
              <section className={styles.tplDetailBlock}>
                <h4>نیازمندی‌ها</h4>
                <ul>
                  {(detailTpl.requires || []).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            </div>

            <p className={styles.tplDetailHint}>{detailTpl.enablesHint}</p>

            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={!!busyKey}
                onClick={() => setDetailTpl(null)}
              >
                بستن
              </button>
              {activeTpl?.key === detailTpl.key ? (
                <>
                  <button
                    type="button"
                    className={styles.tplBtnOn}
                    disabled={!!busyKey}
                    onClick={() => {
                      const tpl = detailTpl
                      setDetailTpl(null)
                      setConfirmTpl(tpl)
                    }}
                  >
                    <RefreshCw size={15} />
                    اعمال مجدد چیدمان
                  </button>
                  <button
                    type="button"
                    className={styles.tplBtnOff}
                    disabled={!!busyKey}
                    onClick={() => {
                      const tpl = detailTpl
                      setDetailTpl(null)
                      onToggleClick(tpl, true)
                    }}
                  >
                    <Power size={15} />
                    غیرفعال کردن
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.tplConfirmBtn}
                  disabled={!!busyKey}
                  onClick={() => {
                    const tpl = detailTpl
                    setDetailTpl(null)
                    onToggleClick(tpl, false)
                  }}
                >
                  <Download size={15} />
                  {activeTpl ? 'جایگزینی با این قالب' : 'فعال‌سازی قالب'}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {confirmTpl ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tpl-warn-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busyKey) setConfirmTpl(null)
          }}
        >
          <div
            className={styles.tplModal}
            style={{
              '--tpl-accent': confirmTpl.accent,
              '--tpl-accent-soft': confirmTpl.accentSoft,
            }}
          >
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={!!busyKey}
              onClick={() => setConfirmTpl(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>

            <div className={styles.tplWarnIcon} aria-hidden>
              <AlertTriangle size={28} strokeWidth={1.6} />
            </div>

            <h3 id="tpl-warn-title">
              {activeTpl?.key === confirmTpl.key
                ? 'اعمال مجدد همین قالب'
                : 'فقط یک قالب اختصاصی'}
            </h3>
            <p className={styles.tplWarnLead}>
              {activeTpl?.key === confirmTpl.key ? (
                <>
                  چیدمان صفحه اصلی، رنگ‌ها، منو و دادهٔ اولیهٔ «
                  <strong>{confirmTpl.name}</strong>» دوباره از بستهٔ قالب اعمال
                  می‌شود. ویرایش‌های دستی روی چیدمان خانه ممکن است بازنویسی شوند.
                </>
              ) : (
                <>
                  با فعال کردن «<strong>{confirmTpl.name}</strong>»، قالب و محتوای
                  فعلی سایت از بین می‌رود و این تم جایگزین می‌شود.
                  {rivalName ? (
                    <>
                      {' '}
                      سیستم «<strong>{rivalName}</strong>» و ماژول‌های اختصاصی‌اش
                      کاملاً خاموش می‌شوند.
                    </>
                  ) : null}
                </>
              )}
            </p>

            <div className={styles.tplWarnBox}>
              <p>بازنویسی می‌شود:</p>
              <ul>
                {confirmTpl.replaces.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p style={{ marginTop: '0.55rem' }}>نیازمندی‌های این تم:</p>
              <ul>
                {(confirmTpl.requires || []).map((line) => (
                  <li key={`r-${line}`}>{line}</li>
                ))}
              </ul>
              {rivalName ? (
                <p className={styles.tplWarnNote}>
                  انحصار: همزمان نمی‌توان «{rivalName}» و «{confirmTpl.name}»
                  را فعال داشت.
                </p>
              ) : (
                <p className={styles.tplWarnNote}>
                  در هر لحظه فقط همین یک قالب اختصاصی فعال خواهد بود.
                </p>
              )}
            </div>

            <label className={styles.tplAck}>
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                disabled={!!busyKey}
              />
              <span>
                {activeTpl?.key === confirmTpl.key
                  ? 'متوجه شدم: چیدمان و رنگ‌های فعلی خانه ممکن است با بستهٔ قالب جایگزین شوند.'
                  : 'متوجه شدم: محتوای فعلی پاک می‌شود و فقط این سیستم فعال می‌ماند.'}
              </span>
            </label>

            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={!!busyKey}
                onClick={() => setConfirmTpl(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplConfirmBtn}
                disabled={!ack || !!busyKey}
                onClick={() => applyTemplate(confirmTpl)}
              >
                {busyKey === confirmTpl.key ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : activeTpl?.key === confirmTpl.key ? (
                  <RefreshCw size={15} />
                ) : (
                  <Download size={15} />
                )}
                {activeTpl?.key === confirmTpl.key
                  ? 'تأیید و اعمال مجدد'
                  : 'تأیید و اعمال انحصاری'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
