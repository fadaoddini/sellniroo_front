// app/(admin)/platform-connections/page.jsx — مدیریت ربات بله / ایتا / روبیکا
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import {
  Radio, RefreshCw, Shield, LayoutDashboard, Save, Zap,
  CheckCircle2, XCircle, Newspaper,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import styles from './PlatformConnections.module.css'

const PLATFORM_META = {
  bale: {
    iconClass: styles.iconBale,
    short: 'بله',
    helpFa: '۱) ربات را در بله بسازید و توکن بگیرید. ۲) ربات را ادمین کانال کنید. ۳) شناسه عددی کانال را وارد کنید. ۴) تست اتصال بزنید.',
    helpEn: '1) Create a Bale bot and copy the token. 2) Add the bot as channel admin. 3) Enter channel chat id. 4) Run connection test.',
  },
  eitaa: {
    iconClass: styles.iconEitaa,
    short: 'ایتا',
    helpFa: '۱) از eitaayar.ir توکن بگیرید. ۲) شناسه کانال (بدون @) را وارد کنید. ۳) کاربر @sender را مدیر کانال کنید. ۴) تست اتصال بزنید.',
    helpEn: '1) Get a token from eitaayar.ir. 2) Enter channel id (without @). 3) Add @sender as channel manager. 4) Run connection test.',
  },
  rubika: {
    iconClass: styles.iconRubika,
    short: 'روبیکا',
    helpFa: '۱) توکن ربات روبیکا را بگیرید. ۲) ربات را به کانال اضافه کنید. ۳) شناسه کانال را وارد کنید. ۴) تست اتصال بزنید.',
    helpEn: '1) Get Rubika bot token. 2) Add bot to the channel. 3) Enter channel id. 4) Run connection test.',
  },
}

function emptyDraft(item) {
  return {
    display_name: item.display_name || '',
    is_enabled: !!item.is_enabled,
    bot_token: '',
    channel_id: item.channel_id || '',
    site_base_url: item.site_base_url || '',
    notes: item.notes || '',
  }
}

export default function PlatformConnectionsPage() {
  const router = useRouter()
  const { isAuthenticated, loading, user, canManageEmployees, getAuthHeaders } = useAuth()
  const { language, dir } = useLanguage()

  const [items, setItems] = useState([])
  const [drafts, setDrafts] = useState({})
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [saving, setSaving] = useState(null)
  const [testing, setTesting] = useState(null)
  const [testMsg, setTestMsg] = useState({})

  const canManage = user?.is_superuser || user?.is_staff || canManageEmployees

  const t = language === 'en' ? {
    title: 'Messenger connections',
    subtitle: 'Configure bots for Bale, Eitaa and Rubika',
    back: 'Dashboard',
    news: 'News management',
    loading: 'Loading...',
    accessDenied: 'Access denied',
    needManager: 'Only managers can configure messenger bots',
    hint: 'Enable each platform, enter bot token and channel id, then run Test connection. Enabled ready platforms appear when sending news.',
    enabled: 'Enabled for news send',
    token: 'Bot / API token',
    tokenHint: 'Leave blank to keep the current token',
    channel: 'Channel / chat id',
    siteUrl: 'Site base URL in messages',
    displayName: 'Display name',
    notes: 'Notes',
    save: 'Save',
    saving: 'Saving...',
    test: 'Test connection',
    testing: 'Testing...',
    ready: 'Ready',
    inactive: 'Off',
    active: 'On',
    lastOk: 'Last test OK',
    lastFail: 'Last test failed',
    neverTested: 'Not tested yet',
    saved: 'Saved successfully',
    tokenSet: 'Token saved',
    noToken: 'No token',
  } : {
    title: 'اتصالات پیام‌رسان',
    subtitle: 'تنظیم ربات بله، ایتا و روبیکا برای ارسال خبر',
    back: 'داشبورد',
    news: 'مدیریت اخبار',
    loading: 'در حال بارگذاری...',
    accessDenied: 'دسترسی محدود',
    needManager: 'فقط مدیر می‌تواند ربات‌ها را تنظیم کند',
    hint: 'هر پیام‌رسان را فعال کنید، توکن و شناسه کانال را وارد کنید، سپس «تست اتصال» بزنید. پلتفرم‌های آماده در ارسال خبر نمایش داده می‌شوند.',
    enabled: 'فعال برای ارسال خبر',
    token: 'توکن ربات / API',
    tokenHint: 'اگر خالی بگذارید، توکن قبلی حفظ می‌شود',
    channel: 'شناسه کانال / چت',
    siteUrl: 'آدرس پایه سایت در پیام',
    displayName: 'نام نمایشی',
    notes: 'یادداشت',
    save: 'ذخیره',
    saving: 'در حال ذخیره...',
    test: 'تست اتصال',
    testing: 'در حال تست...',
    ready: 'آماده ارسال',
    inactive: 'خاموش',
    active: 'روشن',
    lastOk: 'آخرین تست موفق',
    lastFail: 'آخرین تست ناموفق',
    neverTested: 'هنوز تست نشده',
    saved: 'با موفقیت ذخیره شد',
    tokenSet: 'توکن ذخیره شده',
    noToken: 'بدون توکن',
  }

  const fetchList = useCallback(async () => {
    try {
      setLoadingData(true)
      setError(null)
      const res = await axios.get(Config.endpoints.news.platformConnections.list(), {
        headers: getAuthHeaders(),
      })
      const list = Array.isArray(res.data?.data) ? res.data.data : []
      setItems(list)
      const nextDrafts = {}
      list.forEach((item) => {
        nextDrafts[item.platform] = emptyDraft(item)
      })
      setDrafts(nextDrafts)
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message)
      setItems([])
    } finally {
      setLoadingData(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login')
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated && canManage) fetchList()
    else if (isAuthenticated) setLoadingData(false)
  }, [isAuthenticated, canManage, fetchList])

  useEffect(() => {
    if (!success) return undefined
    const timer = setTimeout(() => setSuccess(null), 3000)
    return () => clearTimeout(timer)
  }, [success])

  const setDraftField = (platform, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [platform]: { ...prev[platform], [key]: value },
    }))
  }

  const persistPlatform = async (platform, { silent } = {}) => {
    const draft = drafts[platform]
    if (!draft) throw new Error('draft missing')
    const payload = {
      display_name: draft.display_name,
      is_enabled: !!draft.is_enabled,
      channel_id: draft.channel_id,
      site_base_url: draft.site_base_url,
      notes: draft.notes,
    }
    if (draft.bot_token?.trim()) {
      payload.bot_token = draft.bot_token.trim()
    }
    const res = await axios.patch(
      Config.endpoints.news.platformConnections.detail(platform),
      payload,
      { headers: getAuthHeaders() }
    )
    const updated = res.data?.data || res.data
    setItems((prev) => prev.map((it) => (it.platform === platform ? { ...it, ...updated } : it)))
    setDrafts((prev) => ({
      ...prev,
      [platform]: emptyDraft({ ...updated, bot_token: '' }),
    }))
    if (!silent) setSuccess(t.saved)
    return updated
  }

  const handleSave = async (platform) => {
    try {
      setSaving(platform)
      setError(null)
      await persistPlatform(platform)
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || err.message)
    } finally {
      setSaving(null)
    }
  }

  const handleTest = async (platform) => {
    try {
      setTesting(platform)
      setError(null)
      setTestMsg((prev) => ({ ...prev, [platform]: null }))
      await persistPlatform(platform, { silent: true })
      const res = await axios.post(
        Config.endpoints.news.platformConnections.test(platform),
        {},
        { headers: getAuthHeaders() }
      )
      const updated = res.data?.data
      if (updated) {
        setItems((prev) => prev.map((it) => (it.platform === platform ? { ...it, ...updated } : it)))
      }
      setTestMsg((prev) => ({
        ...prev,
        [platform]: { ok: true, text: res.data?.message || t.lastOk },
      }))
    } catch (err) {
      const updated = err.response?.data?.data
      if (updated) {
        setItems((prev) => prev.map((it) => (it.platform === platform ? { ...it, ...updated } : it)))
      }
      setTestMsg((prev) => ({
        ...prev,
        [platform]: {
          ok: false,
          text: err.response?.data?.message || err.message || t.lastFail,
        },
      }))
    } finally {
      setTesting(null)
    }
  }

  if (loading || loadingData) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.loadingBox}>
            <RefreshCw size={28} className={styles.spinner} />
            <p>{t.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  if (!canManage) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.wrap}>
          <div className={styles.denied}>
            <Shield size={40} />
            <h3>{t.accessDenied}</h3>
            <p>{t.needManager}</p>
            <Link href="/dashboard" className={styles.primaryBtn}>{t.back}</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><Radio size={24} /></span>
            <div>
              <h1 className={styles.pageTitle}>{t.title}</h1>
              <p className={styles.pageDesc}>{t.subtitle}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <Link href="/dashboard" className={styles.ghostBtn}>
              <LayoutDashboard size={15} /> {t.back}
            </Link>
            <Link href="/news-management" className={styles.ghostBtn}>
              <Newspaper size={15} /> {t.news}
            </Link>
            <button type="button" className={styles.ghostBtn} onClick={fetchList}>
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        <p className={styles.hint}>{t.hint}</p>

        {error && <div className={styles.errorBar}>{error}</div>}
        {success && <div className={styles.successBar}>{success}</div>}

        <div className={styles.grid}>
          {items.map((item) => {
            const meta = PLATFORM_META[item.platform] || PLATFORM_META.bale
            const draft = drafts[item.platform] || emptyDraft(item)
            const msg = testMsg[item.platform]
            return (
              <article key={item.platform} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitleRow}>
                    <span className={`${styles.platformIcon} ${meta.iconClass}`}>
                      {meta.short.slice(0, 1)}
                    </span>
                    <div>
                      <h2 className={styles.cardTitle}>
                        {item.display_name || item.platform_display || meta.short}
                      </h2>
                      <p className={styles.cardMeta}>
                        {item.token_set ? `${t.tokenSet}: ${item.token_preview}` : t.noToken}
                      </p>
                    </div>
                  </div>
                  <div className={styles.badges}>
                    <span className={`${styles.badge} ${item.is_enabled ? styles.badgeOn : styles.badgeOff}`}>
                      {item.is_enabled ? t.active : t.inactive}
                    </span>
                    {item.is_ready ? (
                      <span className={`${styles.badge} ${styles.badgeReady}`}>{t.ready}</span>
                    ) : null}
                    {item.last_test_ok === true && (
                      <span className={`${styles.badge} ${styles.badgeOk}`}>{t.lastOk}</span>
                    )}
                    {item.last_test_ok === false && (
                      <span className={`${styles.badge} ${styles.badgeFail}`}>{t.lastFail}</span>
                    )}
                    {item.last_test_ok == null && (
                      <span className={`${styles.badge} ${styles.badgeOff}`}>{t.neverTested}</span>
                    )}
                  </div>
                </div>

                <label className={styles.switchRow}>
                  <span>{t.enabled}</span>
                  <span className={`${styles.switch} ${draft.is_enabled ? styles.switchOn : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!draft.is_enabled}
                      onChange={(e) => setDraftField(item.platform, 'is_enabled', e.target.checked)}
                    />
                  </span>
                </label>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>{t.displayName}</label>
                    <input
                      value={draft.display_name}
                      onChange={(e) => setDraftField(item.platform, 'display_name', e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>{t.channel}</label>
                    <input
                      dir="ltr"
                      value={draft.channel_id}
                      onChange={(e) => setDraftField(item.platform, 'channel_id', e.target.value)}
                      placeholder="@channel or numeric id"
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.full}`}>
                    <label>{t.token}</label>
                    <input
                      dir="ltr"
                      type="password"
                      autoComplete="new-password"
                      value={draft.bot_token}
                      onChange={(e) => setDraftField(item.platform, 'bot_token', e.target.value)}
                      placeholder={item.token_set ? '••••••••' : ''}
                    />
                    <span style={{ fontSize: 10, color: '#6f675c' }}>{t.tokenHint}</span>
                  </div>
                  <div className={`${styles.formGroup} ${styles.full}`}>
                    <label>{t.siteUrl}</label>
                    <input
                      dir="ltr"
                      value={draft.site_base_url}
                      onChange={(e) => setDraftField(item.platform, 'site_base_url', e.target.value)}
                      placeholder="https://sellniroo.com"
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.full}`}>
                    <label>{t.notes}</label>
                    <textarea
                      rows={2}
                      value={draft.notes}
                      onChange={(e) => setDraftField(item.platform, 'notes', e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.helpBox}>
                  {language === 'en' ? meta.helpEn : meta.helpFa}
                </div>

                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.saveBtn}
                    disabled={saving === item.platform || testing === item.platform}
                    onClick={() => handleSave(item.platform)}
                  >
                    <Save size={14} />
                    {saving === item.platform ? t.saving : t.save}
                  </button>
                  <button
                    type="button"
                    className={styles.testBtn}
                    disabled={testing === item.platform || saving === item.platform}
                    onClick={() => handleTest(item.platform)}
                  >
                    <Zap size={14} />
                    {testing === item.platform ? t.testing : t.test}
                  </button>
                </div>

                {msg && (
                  <div className={`${styles.testResult} ${msg.ok ? styles.testResultOk : styles.testResultFail}`}>
                    {msg.ok ? <CheckCircle2 size={14} style={{ verticalAlign: -2 }} /> : <XCircle size={14} style={{ verticalAlign: -2 }} />}
                    {' '}{msg.text}
                  </div>
                )}
                {!msg && item.last_test_message ? (
                  <div className={`${styles.testResult} ${item.last_test_ok ? styles.testResultOk : styles.testResultFail}`}>
                    {item.last_test_message}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
