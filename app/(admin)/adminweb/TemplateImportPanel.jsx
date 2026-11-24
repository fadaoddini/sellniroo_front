'use client'

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
  GitBranch,
  GraduationCap,
  HandCoins,
  Loader2,
  Package,
  Palette,
  Power,
  RefreshCw,
  Save,
  Server,
  Shield,
  Sparkles,
  Sprout,
  Store,
  Upload,
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
  ownerSystemToTemplate,
} from '@/config/systemTemplates'
import {
  clearSiteModulesCache,
  fetchSiteModules,
  toggleSiteModule,
} from '@/services/siteModules'
import DesignWizard from './DesignWizard'
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

function groupPackModules(list = []) {
  const roots = []
  const kids = {}
  const rootKeys = new Set()
  list.forEach((m) => {
    if (m.is_root || !m.parent_key) {
      roots.push(m)
      rootKeys.add(m.key)
    } else {
      if (!kids[m.parent_key]) kids[m.parent_key] = []
      kids[m.parent_key].push(m)
    }
  })
  list.forEach((m) => {
    if (!m.parent_key || rootKeys.has(m.parent_key)) return
    roots.push({
      key: m.parent_key,
      name: m.parent_name || m.parent_key,
      is_root: true,
    })
    rootKeys.add(m.parent_key)
  })
  return roots.map((r) => ({ ...r, children: kids[r.key] || [] }))
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

function TemplateImportPanelInner() {
  const { getAuthHeaders } = useAuth()
  const searchParams = useSearchParams()
  const presetDomain = (searchParams?.get('domain') || '').trim()
  const [currentPack, setCurrentPack] = useState(null)
  const [currentName, setCurrentName] = useState('')
  const [moduleMap, setModuleMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const [confirmTpl, setConfirmTpl] = useState(null)
  /** activate = فقط ماژول‌ها (حفظ چیدمان) | reset = بازنویسی از بسته */
  const [confirmMode, setConfirmMode] = useState('activate')
  const [detailTpl, setDetailTpl] = useState(null)
  const [ack, setAck] = useState(false)
  const [wantFactoryReset, setWantFactoryReset] = useState(false)
  const [wantDedicatedBackend, setWantDedicatedBackend] = useState(true)
  const [dedicatedKeys, setDedicatedKeys] = useState([])
  const [installTpl, setInstallTpl] = useState(null)
  const [installPreview, setInstallPreview] = useState(null)
  const [installLoading, setInstallLoading] = useState(false)
  const [deployTpl, setDeployTpl] = useState(null)
  const [deployForm, setDeployForm] = useState({
    front_domain: '',
    site_id: '',
    admin_domain: '',
    linux_user: 'rebo',
    django_port: '',
    next_port: '',
    db_name: '',
    db_user: '',
    db_pass: '',
    server_ip: '194.5.205.54',
    api_max_sms: '',
    max_sms_originator: '+983000505',
    max_sms_pattern_code: '',
    force: true,
  })
  const [deployBusy, setDeployBusy] = useState(false)
  const [deployJob, setDeployJob] = useState(null)
  const [sslTpl, setSslTpl] = useState(null)
  const [sslForm, setSslForm] = useState({
    site_id: '',
    target: 'both',
    admin_domain: '',
    front_domain: '',
    certificate_pem: '',
    private_key_pem: '',
    fullchain_pem: '',
    bundle_pem: '',
  })
  const [sslBusy, setSslBusy] = useState(false)
  const [sslJob, setSslJob] = useState(null)
  const [ownerTemplates, setOwnerTemplates] = useState([])
  const [packModules, setPackModules] = useState({})
  const [gitPackTpl, setGitPackTpl] = useState(null)
  const [gitPackName, setGitPackName] = useState('')
  const [gitPackMessage, setGitPackMessage] = useState('')
  const [gitPackBusy, setGitPackBusy] = useState(false)
  const [gitPackResult, setGitPackResult] = useState(null)

  const allTemplates = useMemo(
    () => [...SYSTEM_TEMPLATES, ...ownerTemplates],
    [ownerTemplates],
  )

  const activeTpl = useMemo(
    () => getActiveExclusiveTemplate(moduleMap, currentPack, ownerTemplates),
    [moduleMap, currentPack, ownerTemplates],
  )

  const detailModuleGroups = useMemo(
    () => (detailTpl ? groupPackModules(packModules[detailTpl.key] || []) : []),
    [detailTpl, packModules],
  )
  const detailModuleCount = detailTpl
    ? (packModules[detailTpl.key] || []).length
    : 0

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
      setDedicatedKeys(
        (data.dedicated_backends || []).map((item) => item.key).filter(Boolean),
      )
      setOwnerTemplates(
        (data.owner_systems || []).map((row) => ownerSystemToTemplate(row)),
      )
      setPackModules(data.pack_modules || {})
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
    else setWantDedicatedBackend(true)
  }, [confirmTpl])

  useEffect(() => {
    if (!confirmTpl && !detailTpl && !installTpl && !deployTpl && !sslTpl) {
      return undefined
    }
    const onKey = (e) => {
      if (e.key !== 'Escape' || busyKey || deployBusy || sslBusy) return
      if (deployTpl) setDeployTpl(null)
      else if (sslTpl) setSslTpl(null)
      else if (installTpl) setInstallTpl(null)
      else if (confirmTpl) setConfirmTpl(null)
      else setDetailTpl(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    confirmTpl,
    detailTpl,
    installTpl,
    deployTpl,
    sslTpl,
    busyKey,
    deployBusy,
    sslBusy,
  ])

  const suggestFromDomain = async (domain) => {
    if (!domain?.trim()) return
    try {
      const res = await axios.get(
        Config.endpoints.news.siteFactory.suggest(domain.trim()),
        { headers: getAuthHeaders() },
      )
      const d = res.data?.data || {}
      setDeployForm((prev) => ({
        ...prev,
        front_domain: d.front_domain || prev.front_domain,
        site_id: d.site_id || prev.site_id,
        admin_domain: d.admin_domain || prev.admin_domain,
        db_name: prev.db_name || (d.site_id ? `db_${d.site_id}` : ''),
        db_user: prev.db_user || (d.site_id ? `u_${d.site_id}` : ''),
      }))
    } catch (_) {
      /* ignore suggest errors */
    }
  }

  const openDeployModal = (tpl) => {
    setErr('')
    setMsg('')
    setDeployJob(null)
    setDeployTpl(tpl)
    const domain = presetDomain || ''
    setDeployForm({
      front_domain: domain,
      site_id: '',
      admin_domain: '',
      linux_user: 'rebo',
      django_port: '',
      next_port: '',
      db_name: '',
      db_user: '',
      db_pass: '',
      server_ip: '194.5.205.54',
      api_max_sms: '',
      max_sms_originator: '+983000505',
      max_sms_pattern_code: '',
      force: true,
    })
    if (domain) {
      window.setTimeout(() => {
        suggestFromDomain(domain)
      }, 0)
    }
  }

  const openSslModal = (tpl) => {
    setErr('')
    setMsg('')
    setSslJob(null)
    setSslTpl(tpl)
    setSslForm({
      site_id: '',
      target: 'both',
      admin_domain: '',
      front_domain: '',
      certificate_pem: '',
      private_key_pem: '',
      fullchain_pem: '',
      bundle_pem: '',
    })
  }

  const pollProvision = async (jobId, headers) => {
    for (let i = 0; i < 400; i += 1) {
      await new Promise((r) => setTimeout(r, 1500))
      const st = await axios.get(
        Config.endpoints.news.siteFactory.provisionStatus(jobId),
        { headers },
      )
      const data = st.data?.data
      setDeployJob(data)
      if (data?.status === 'success' || data?.status === 'failed') return data
    }
    return null
  }

  const startDeploy = async () => {
    if (!deployTpl) return
    setDeployBusy(true)
    setErr('')
    setMsg('')
    try {
      const headers = getAuthHeaders()
      const body = {
        pack: deployTpl.key,
        front_domain: deployForm.front_domain.trim(),
        site_id: deployForm.site_id.trim() || undefined,
        admin_domain: deployForm.admin_domain.trim() || undefined,
        linux_user: deployForm.linux_user.trim() || 'rebo',
        django_port: deployForm.django_port.trim() || undefined,
        next_port: deployForm.next_port.trim() || undefined,
        db_name: deployForm.db_name.trim() || undefined,
        db_user: deployForm.db_user.trim() || undefined,
        db_pass: deployForm.db_pass.trim() || undefined,
        server_ip: deployForm.server_ip.trim() || undefined,
        api_max_sms: deployForm.api_max_sms.trim() || undefined,
        max_sms_originator: deployForm.max_sms_originator.trim() || undefined,
        max_sms_pattern_code: deployForm.max_sms_pattern_code.trim() || undefined,
        force: !!deployForm.force,
        confirm: true,
      }
      const res = await axios.post(
        Config.endpoints.news.siteFactory.provision(),
        body,
        { headers },
      )
      const job = res.data?.data
      setDeployJob(job)
      setMsg(res.data?.message || 'نصب شروع شد')
      const finalJob = await pollProvision(job.id, headers)
      if (finalJob?.status === 'success') {
        setMsg(finalJob.message || 'نصب با موفقیت تمام شد')
      } else if (finalJob?.status === 'failed') {
        setErr(finalJob.message || 'نصب ناموفق بود')
      }
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.response?.data?.detail ||
          e.message ||
          'شروع نصب ناموفق بود',
      )
    } finally {
      setDeployBusy(false)
    }
  }

  const pollSsl = async (jobId, headers) => {
    for (let i = 0; i < 60; i += 1) {
      await new Promise((r) => setTimeout(r, 2000))
      const st = await axios.get(
        Config.endpoints.news.siteFactory.sslStatus(jobId),
        { headers },
      )
      const data = st.data?.data
      setSslJob(data)
      if (data?.status === 'success' || data?.status === 'failed') return data
    }
    return null
  }

  const startSsl = async () => {
    if (!sslTpl) return
    setSslBusy(true)
    setErr('')
    setMsg('')
    try {
      const headers = getAuthHeaders()
      const res = await axios.post(
        Config.endpoints.news.siteFactory.ssl(),
        { ...sslForm, confirm: true },
        { headers },
      )
      const job = res.data?.data
      setSslJob(job)
      const finalJob = await pollSsl(job.id, headers)
      if (finalJob?.status === 'success') {
        setMsg(finalJob.message || 'SSL نصب شد')
      } else if (finalJob?.status === 'failed') {
        setErr(finalJob.message || 'SSL ناموفق بود')
      }
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.response?.data?.detail ||
          e.message ||
          'نصب SSL ناموفق بود',
      )
    } finally {
      setSslBusy(false)
    }
  }

  const hasDedicatedBackend = (key) =>
    dedicatedKeys.length ? dedicatedKeys.includes(key) : true

  const downloadBuiltZip = async (packKey, headers) => {
    const res = await axios.get(
      Config.endpoints.news.topicPacks.buildBackendFile(packKey),
      { headers, responseType: 'blob' },
    )
    const blob = new Blob([res.data], { type: 'application/zip' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `${packKey}.zip`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(href)
  }

  const openInstallModal = async (tpl) => {
    setInstallTpl(tpl)
    setInstallPreview(null)
    setInstallLoading(true)
    setErr('')
    try {
      const headers = getAuthHeaders()
      const res = await axios.get(
        Config.endpoints.news.topicPacks.buildBackendPreview(tpl.key),
        { headers },
      )
      setInstallPreview(res.data?.data || null)
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.message ||
          'خواندن نیازمندی‌های بسته ناموفق بود',
      )
      setInstallTpl(null)
    } finally {
      setInstallLoading(false)
    }
  }

  const buildDedicatedBackend = async (tpl, headers) => {
    const res = await axios.post(
      Config.endpoints.news.topicPacks.buildBackend(),
      { pack: tpl.key, confirm: true, force: true, zip: true },
      { headers },
    )
    const data = res.data?.data || {}
    try {
      await downloadBuiltZip(tpl.key, headers)
    } catch {
      /* زیپ روی دیسک هست حتی اگر دانلود مرورگر نگیرد */
    }
    const apps = (data.copied_apps || []).join('، ')
    const bits = [
      `بسته نصبی «${tpl.name}» از روی تعریف فعلی ساخته شد (موتور ربو دست نخورد).`,
    ]
    if (apps) bits.push(`اپ‌ها: ${apps}`)
    bits.push('زیپ دانلود شد.')
    return bits.join(' ')
  }

  const applyTemplate = async (tpl, { resetContent = false } = {}) => {
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای اعمال قالب دوباره وارد شوید')
      return
    }
    setBusyKey(tpl.key)
    setErr('')
    setMsg('')
    // تعویض سیستم (مثلاً ربو → مدرسه): باید چیدمان بستهٔ مقصد بیاید
    // فقط وقتی همان بسته دوباره فعال می‌شود، ویرایش‌های دستی حفظ می‌شود
    const switching =
      !!activeTpl && activeTpl.key !== tpl.key
    const doReset = !!resetContent || switching
    try {
      const res = await axios.post(
        Config.endpoints.news.topicPacks.apply(),
        {
          pack: tpl.key,
          preserve_customizations: !doReset,
          reset_content: doReset,
          replace_menu: doReset,
          replace_tickers: doReset,
          replace_heroes: doReset,
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
      let extra = ''
      if (wantDedicatedBackend && hasDedicatedBackend(tpl.key)) {
        extra = await buildDedicatedBackend(tpl, headers)
      }
      if (tpl.custom && doReset) {
        try {
          window.localStorage.removeItem(
            `rebo_design_wizard_v1:${tpl.key}`,
          )
        } catch {
          /* ignore */
        }
      }
      setMsg(
        [
          switching
            ? `سیستم «${tpl.name}» جایگزین شد — چیدمان و داده از بستهٔ همین سیستم اعمال شد (نه سیستم قبلی).`
            : doReset
              ? `بسته «${tpl.name}» از روی دادهٔ بسته دوباره اعمال شد.`
              : `فقط «${tpl.name}» فعال است — چیدمان و ویرایش‌های قبلی همین سیستم حفظ شد.`,
          doReset && tpl.custom
            ? 'چیدمان خانه، صفحات داخلی، پروفایل، سبد و منو از بسته بازنویسی شد.'
            : '',
          extra,
        ]
          .filter(Boolean)
          .join(' '),
      )
      setConfirmTpl(null)
      setWantFactoryReset(false)
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

  const openActivateConfirm = (tpl) => {
    setConfirmMode('activate')
    // تعویض سیستم → به‌صورت پیش‌فرض چیدمان بستهٔ جدید؛ فعال‌سازی مجدد همان بسته → حفظ
    const switching = !!(activeTpl && activeTpl.key !== tpl.key)
    setWantFactoryReset(switching)
    setAck(false)
    setConfirmTpl(tpl)
  }

  const openResetConfirm = (tpl) => {
    setConfirmMode('reset')
    setWantFactoryReset(true)
    setAck(false)
    setConfirmTpl(tpl)
  }

  const onToggleClick = (tpl, isActive) => {
    if (isActive) {
      deactivateTemplate(tpl)
      return
    }
    openActivateConfirm(tpl)
  }

  const publishPackToGit = async () => {
    if (!gitPackTpl) return
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای افزودن به گیت دوباره وارد شوید')
      return
    }
    const name = gitPackName.trim()
    if (!name) {
      setErr('نام گیت را وارد کنید')
      return
    }
    setGitPackBusy(true)
    setGitPackResult(null)
    setErr('')
    setMsg('')
    try {
      const res = await axios.post(
        Config.endpoints.news.git.packPublish(),
        {
          pack: gitPackTpl.key,
          name,
          message: gitPackMessage.trim() || `export ${gitPackTpl.key} as ${name}`,
        },
        { headers, timeout: 300000 },
      )
      setGitPackResult(res.data?.data || null)
      setMsg(res.data?.message || 'بسته به گیت اضافه شد')
    } catch (e) {
      const data = e?.response?.data
      setGitPackResult(data?.data || null)
      setErr(data?.message || e?.message || 'افزودن بسته به گیت ناموفق بود')
    } finally {
      setGitPackBusy(false)
    }
  }

  const exportLiveDesign = async () => {
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای دانلود چیدمان دوباره وارد شوید')
      return
    }
    setBusyKey('design-export')
    setErr('')
    setMsg('')
    try {
      const res = await axios.get(Config.endpoints.news.topicPacks.designExport(), {
        headers,
      })
      const data = res.data?.data || {}
      const payload = data.payload || data
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json;charset=utf-8',
      })
      const href = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
      a.href = href
      a.download = `design-export-${stamp}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(href)
      const counts = data.counts || {}
      setMsg(
        res.data?.message ||
          `چیدمان دانلود شد` +
            (counts.home_widgets != null
              ? ` — خانه ${counts.home_widgets} ویجت`
              : ''),
      )
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.message ||
          'دانلود چیدمان ناموفق بود',
      )
    } finally {
      setBusyKey(null)
    }
  }

  const importLiveDesign = async (file) => {
    if (!file) return
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای ورود چیدمان دوباره وارد شوید')
      return
    }
    const ok = window.confirm(
      [
        'چیدمان و طراحی این سایت با فایل انتخاب‌شده جایگزین شود؟',
        'خانه، صفحات داخلی، رنگ‌ها، منو و ظاهر عوض می‌شوند.',
        'معلمان، دانش‌آموزان، دروس و داده‌های مدرسه دست نمی‌خورند.',
      ].join('\n\n'),
    )
    if (!ok) return

    setBusyKey('design-import')
    setErr('')
    setMsg('')
    try {
      const text = await file.text()
      let parsed
      try {
        parsed = JSON.parse(text)
      } catch {
        throw new Error('فایل JSON معتبر نیست')
      }
      const body =
        parsed?.format === 'sellniroo_design_v1' || parsed?.site_settings
          ? parsed
          : parsed?.payload || parsed
      const res = await axios.post(
        Config.endpoints.news.topicPacks.designImport(),
        body,
        { headers },
      )
      setMsg(res.data?.message || 'چیدمان اعمال شد')
      await load()
    } catch (e) {
      setErr(
        e.response?.data?.message ||
          e.message ||
          'ورود چیدمان ناموفق بود',
      )
    } finally {
      setBusyKey(null)
    }
  }

  const snapshotTemplate = async (tpl) => {
    const headers = getAuthHeaders()
    if (!headers?.Authorization) {
      setErr('برای بروزرسانی قالب دوباره وارد شوید')
      return
    }
    const otherLive = activeTpl && activeTpl.key !== tpl.key
    const ok = window.confirm(
      [
        `چیدمان فعلی سایت روی قالب «${tpl.name}» ذخیره شود؟`,
        otherLive
          ? `الان قالب فعال «${activeTpl.name}» است؛ همان چیدمان زنده روی «${tpl.name}» نوشته می‌شود.`
          : 'خانه، صفحات داخلی، پروفایل، فروشگاه، اخبار، منو و ظاهر فعلی داخل همین بسته می‌روند.',
        'بعد از این، با دکمه اعمال، نسخهٔ به‌روز نصب می‌شود.',
        'نکته: صفحه /dashboard جزو هستهٔ همهٔ سایت‌هاست و با نصب/بروزرسانی فرانت روی سرور همیشه همراه می‌آید.',
      ].join('\n\n'),
    )
    if (!ok) return

    setBusyKey(`snap:${tpl.key}`)
    setErr('')
    setMsg('')
    try {
      const res = await axios.post(
        Config.endpoints.news.topicPacks.snapshot(),
        { pack: tpl.key },
        { headers },
      )
      const counts = res.data?.data?.counts || {}
      setMsg(
        res.data?.message ||
          `چیدمان «${tpl.name}» ذخیره شد` +
            (counts.home_widgets != null
              ? ` — خانه ${counts.home_widgets} ویجت.`
              : ''),
      )
    } catch (e) {
      setErr(
        e.response?.data?.detail ||
          e.response?.data?.message ||
          e.message ||
          'ذخیره چیدمان ناموفق بود',
      )
    } finally {
      setBusyKey(null)
    }
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
        فعال‌سازی فقط ماژول‌ها را عوض می‌کند و{' '}
        <strong>چیدمان سفارشی شما را پاک نمی‌کند</strong>. برای برگشت به دادهٔ
        کارخانه از «اعمال مجدد» استفاده کنید.
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

      <div className={styles.designSyncBar}>
        <div className={styles.designSyncCopy}>
          <strong>همگام‌سازی چیدمان با لوکال</strong>
          <span>
            از سرور دانلود کنید و در لوکال وارد کنید — فقط رنگ و چیدمان؛ داده مدرسه جابه‌جا نمی‌شود.
          </span>
        </div>
        <div className={styles.designSyncActions}>
          <button
            type="button"
            className={styles.tplBtnSnapshot}
            disabled={!!busyKey}
            onClick={exportLiveDesign}
          >
            {busyKey === 'design-export' ? (
              <Loader2 size={14} className={styles.spin} />
            ) : (
              <Download size={14} />
            )}
            دانلود چیدمان زنده
          </button>
          <label
            className={`${styles.tplBtnInstall} ${styles.designSyncUpload}${busyKey ? ` ${styles.designSyncUploadDisabled}` : ''}`}
          >
            {busyKey === 'design-import' ? (
              <Loader2 size={14} className={styles.spin} />
            ) : (
              <Upload size={14} />
            )}
            ورود چیدمان از فایل
            <input
              type="file"
              accept="application/json,.json"
              hidden
              disabled={!!busyKey}
              onChange={(e) => {
                const f = e.target.files?.[0]
                e.target.value = ''
                importLiveDesign(f)
              }}
            />
          </label>
        </div>
      </div>

      {activeTpl?.custom ? (
        <DesignWizard
          packKey={activeTpl.key}
          packName={activeTpl.name}
          defaultOpen
          moduleMap={moduleMap}
        />
      ) : null}

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
        {allTemplates.map((tpl) => {
          const Icon = ICONS[tpl.key] || Sparkles
          const isActive = activeTpl?.key === tpl.key
          const busy = busyKey === tpl.key || busyKey === `snap:${tpl.key}`
          const snapping = busyKey === `snap:${tpl.key}`
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
                    title="چیدمان و داده را از بستهٔ کارخانه دوباره می‌نویسد (ویرایش‌های دستی پاک می‌شود)"
                    onClick={() => openResetConfirm(tpl)}
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
                {tpl.custom && isActive ? (
                  <Link
                    href="/adminsettings?wizard=1"
                    className={styles.tplBtnInstall}
                    style={{ textDecoration: 'none' }}
                  >
                    <Sparkles size={13} />
                    طراحی قالب
                  </Link>
                ) : null}
                <button
                  type="button"
                  className={styles.tplBtnSnapshot}
                  disabled={busy || loading}
                  title="چیدمان فعلی سایت (خانه، صفحات داخلی، پروفایل و بقیه) را داخل این قالب ذخیره می‌کند"
                  onClick={() => snapshotTemplate(tpl)}
                >
                  {snapping ? (
                    <Loader2 size={13} className={styles.spin} />
                  ) : (
                    <Save size={13} />
                  )}
                  {snapping ? 'در حال ذخیره…' : 'بروزرسانی قالب و چیدمان'}
                </button>
                {hasDedicatedBackend(tpl.key) ? (
                  <button
                    type="button"
                    className={styles.tplBtnInstall}
                    disabled={busy || loading || installLoading}
                    title="از روی تعریف فعلی همین بسته، زیپ نصب جنگو را با آخرین کد ربو می‌سازد"
                    onClick={() => openInstallModal(tpl)}
                  >
                    {busy ? (
                      <Loader2 size={13} className={styles.spin} />
                    ) : (
                      <Package size={13} />
                    )}
                    بسته نصبی
                  </button>
                ) : null}
                {hasDedicatedBackend(tpl.key) ? (
                  <button
                    type="button"
                    className={styles.tplBtnInstall}
                    disabled={busy || loading || deployBusy}
                    title="ساخت پوشه ایزوله زیر /var/www/websites/<نام>/ با بک‌اند و فرانت سبک"
                    onClick={() => openDeployModal(tpl)}
                  >
                    {deployBusy ? (
                      <Loader2 size={13} className={styles.spin} />
                    ) : (
                      <Server size={13} />
                    )}
                    نصب روی سرور
                  </button>
                ) : null}
                <button
                  type="button"
                  className={styles.tplBtnSnapshot}
                  disabled={busy || loading || sslBusy}
                  title="نصب گواهی SSL برای سایت ایزوله (PEM)"
                  onClick={() => openSslModal(tpl)}
                >
                  {sslBusy ? (
                    <Loader2 size={13} className={styles.spin} />
                  ) : (
                    <Shield size={13} />
                  )}
                  گواهی SSL
                </button>
                {hasDedicatedBackend(tpl.key) ? (
                  <button
                    type="button"
                    className={styles.tplBtnInstall}
                    disabled={busy || loading || gitPackBusy}
                    title="برش بک‌اند و فرانت این بسته را با نام دلخواه به گیت‌هاب پوش می‌کند"
                    onClick={() => {
                      setGitPackResult(null)
                      setGitPackMessage(`export ${tpl.key}`)
                      setGitPackName(
                        String(tpl.key || '')
                          .replace(/_theme_one$/i, '')
                          .replace(/_/g, '-')
                          .slice(0, 40),
                      )
                      setGitPackTpl(tpl)
                    }}
                  >
                    {gitPackBusy && gitPackTpl?.key === tpl.key ? (
                      <Loader2 size={13} className={styles.spin} />
                    ) : (
                      <GitBranch size={13} />
                    )}
                    افزودن به گیت
                  </button>
                ) : null}
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
          <div className={`${styles.tplModal} ${styles.tplDetailModal}`}>
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

            {detailModuleGroups.length ? (
              <section
                className={styles.tplModuleMap}
                aria-label="ماژول‌های فعال این سیستم"
              >
                <h4>
                  ماژول‌های فعال این سیستم
                  <span>{detailModuleCount} مورد</span>
                </h4>
                <ul>
                  {detailModuleGroups.map((root) => (
                    <li key={root.key}>
                      <strong>{root.name}</strong>
                      {root.children?.length ? (
                        <ul>
                          {root.children.map((child) => (
                            <li key={child.key}>{child.name}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : (
              <p className={styles.tplDetailHint}>
                فهرست ماژول این بسته از سرور خوانده نشد.
              </p>
            )}

            <p className={styles.tplDetailHint}>{detailTpl.enablesHint}</p>
            {hasDedicatedBackend(detailTpl.key) ? (
              <p className={styles.tplDetailHint}>
                دکمه «بسته نصبی» از روی ماژول‌های فعلی همین قالب و آخرین کد ربو
                زیپ می‌سازد. اگر ماژولی به بسته اضافه یا کم کرده باشید، در بیلد
                بعدی اعمال می‌شود.
              </p>
            ) : null}

            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={!!busyKey}
                onClick={() => setDetailTpl(null)}
              >
                بستن
              </button>
              <button
                type="button"
                className={styles.tplBtnSnapshot}
                disabled={!!busyKey}
                onClick={() => {
                  const tpl = detailTpl
                  setDetailTpl(null)
                  snapshotTemplate(tpl)
                }}
              >
                <Save size={15} />
                بروزرسانی قالب و چیدمان
              </button>
              {hasDedicatedBackend(detailTpl.key) ? (
                <button
                  type="button"
                  className={styles.tplBtnOn}
                  disabled={!!busyKey}
                  onClick={() => {
                    const tpl = detailTpl
                    setDetailTpl(null)
                    openInstallModal(tpl)
                  }}
                >
                  <Package size={15} />
                  بسته نصبی
                </button>
              ) : null}
              {activeTpl?.key === detailTpl.key ? (
                <>
                  <button
                    type="button"
                    className={styles.tplBtnOn}
                    disabled={!!busyKey}
                    onClick={() => {
                      const tpl = detailTpl
                      setDetailTpl(null)
                      openResetConfirm(tpl)
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
          <div className={styles.tplModal}>
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
              {confirmMode === 'reset'
                ? 'اعمال مجدد از بسته (بازنویسی)'
                : activeTpl && activeTpl.key !== confirmTpl.key
                  ? 'تعویض سیستم'
                  : 'فعال‌سازی قالب'}
            </h3>
            <p className={styles.tplWarnLead}>
              {confirmMode === 'reset' ? (
                <>
                  چیدمان صفحه اصلی، رنگ‌ها، منو و دادهٔ اولیهٔ «
                  <strong>{confirmTpl.name}</strong>» دوباره از بستهٔ قالب اعمال
                  می‌شود. ویرایش‌های دستی شما بازنویسی می‌شوند.
                </>
              ) : activeTpl && activeTpl.key !== confirmTpl.key ? (
                <>
                  با رفتن از «<strong>{activeTpl.name}</strong>» به «
                  <strong>{confirmTpl.name}</strong>»، چیدمان و داده از{' '}
                  <strong>بستهٔ سیستم جدید</strong> اعمال می‌شود — نه چیدمان
                  سیستم قبلی (مثلاً ربو روی مدرسه نمی‌ماند).
                  {rivalName ? (
                    <>
                      {' '}
                      سیستم «<strong>{rivalName}</strong>» خاموش می‌شود.
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  با فعال کردن مجدد «<strong>{confirmTpl.name}</strong>»، فقط
                  ماژول‌ها روشن می‌شوند و{' '}
                  <strong>چیدمان و ویرایش‌های قبلی همین سیستم حفظ می‌ماند</strong>.
                </>
              )}
            </p>

            <div className={styles.tplWarnBox}>
              {confirmMode === 'reset' ||
              (activeTpl && activeTpl.key !== confirmTpl.key) ? (
                <>
                  <p>اعمال / بازنویسی می‌شود:</p>
                  <ul>
                    {confirmTpl.replaces.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p>انجام می‌شود:</p>
                  <ul>
                    <li>روشن شدن ماژول‌های اختصاصی این سیستم</li>
                    <li>خاموش شدن قالب رقیب (در صورت وجود)</li>
                    <li>حفظ چیدمان خانه، صفحات داخلی، منو و محتوای سفارشی</li>
                  </ul>
                </>
              )}
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

            {confirmMode === 'activate' &&
            !(activeTpl && activeTpl.key !== confirmTpl.key) ? (
              <label className={styles.tplAck}>
                <input
                  type="checkbox"
                  checked={wantFactoryReset}
                  onChange={(e) => setWantFactoryReset(e.target.checked)}
                  disabled={!!busyKey}
                />
                <span>
                  چیدمان را هم از بسته بازنویسی کن (اختیاری — ویرایش‌های دستی
                  همین سیستم پاک می‌شود)
                </span>
              </label>
            ) : null}

            <label className={styles.tplAck}>
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                disabled={!!busyKey}
              />
              <span>
                {confirmMode === 'reset' ||
                wantFactoryReset ||
                (activeTpl && activeTpl.key !== confirmTpl.key)
                  ? 'متوجه شدم: چیدمان از بستهٔ سیستم انتخاب‌شده اعمال می‌شود.'
                  : 'متوجه شدم: فقط سیستم فعال می‌شود و ویرایش‌های من حفظ می‌ماند.'}
              </span>
            </label>

            {hasDedicatedBackend(confirmTpl.key) ? (
              <label className={styles.tplAckBuild}>
                <input
                  type="checkbox"
                  checked={wantDedicatedBackend}
                  onChange={(e) => setWantDedicatedBackend(e.target.checked)}
                  disabled={!!busyKey}
                />
                <span>
                  آیا قصد دارید بک‌اند جنگوی اختصاصی «{confirmTpl.name}» را
                  پیاده‌سازی کنم؟ فقط اپ‌های همین سیستم کپی می‌شود؛ موتور ربو
                  بدون تغییر می‌ماند و زیپ تحویل ساخته می‌شود.
                </span>
              </label>
            ) : null}

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
                onClick={() =>
                  applyTemplate(confirmTpl, {
                    resetContent:
                      confirmMode === 'reset' || wantFactoryReset,
                  })
                }
              >
                {busyKey === confirmTpl.key ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : confirmMode === 'reset' || wantFactoryReset ? (
                  <RefreshCw size={15} />
                ) : (
                  <Download size={15} />
                )}
                {confirmMode === 'reset' || wantFactoryReset
                  ? 'تأیید و بازنویسی از بسته'
                  : 'تأیید و فعال‌سازی (حفظ چیدمان)'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {installTpl ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tpl-install-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busyKey) setInstallTpl(null)
          }}
        >
          <div className={styles.tplModal}>
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={!!busyKey}
              onClick={() => setInstallTpl(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>
            <div className={styles.tplWarnIcon} aria-hidden>
              <Package size={28} strokeWidth={1.6} />
            </div>
            <h3 id="tpl-install-title">بسته نصبی «{installTpl.name}»</h3>
            <p className={styles.tplWarnLead}>
              از روی <strong>تعریف فعلی همین بسته</strong> و آخرین کد ربو زیپ
              ساخته می‌شود. اگر ماژولی اضافه یا کم کرده باشید، در همین بیلد
              اعمال می‌شود. موتور ربو جابه‌جا نمی‌شود.
            </p>
            {installLoading ? (
              <p className={styles.tplDetailHint}>
                <Loader2 size={14} className={styles.spin} /> در حال خواندن
                نیازمندی‌ها…
              </p>
            ) : null}
            {installPreview ? (
              <div className={styles.tplWarnBox}>
                <p>داخل زیپ می‌آید:</p>
                <ul>
                  {(installPreview.copy_apps || []).map((app) => (
                    <li key={app}>
                      <code dir="ltr">{app}</code>
                    </li>
                  ))}
                </ul>
                {(installPreview.omit_from_customer || []).length ? (
                  <>
                    <p style={{ marginTop: '0.55rem' }}>عمداً نمی‌آید:</p>
                    <ul>
                      {installPreview.omit_from_customer.map((app) => (
                        <li key={`omit-${app}`}>
                          <code dir="ltr">{app}</code>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <p className={styles.tplWarnNote}>
                  این همان نسخه‌ای است که الان در موتور و بسته‌ها برای «
                  {installTpl.name}» تعریف شده.
                </p>
              </div>
            ) : null}
            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={!!busyKey}
                onClick={() => setInstallTpl(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplConfirmBtn}
                disabled={!!busyKey || installLoading || !installPreview}
                onClick={async () => {
                  const tpl = installTpl
                  const headers = getAuthHeaders()
                  if (!headers?.Authorization) {
                    setErr('برای ساخت بسته دوباره وارد شوید')
                    return
                  }
                  setBusyKey(tpl.key)
                  setErr('')
                  try {
                    const extra = await buildDedicatedBackend(tpl, headers)
                    setMsg(extra)
                    setInstallTpl(null)
                  } catch (e) {
                    setErr(
                      e.response?.data?.message ||
                        e.message ||
                        'ساخت بسته نصبی ناموفق بود',
                    )
                  } finally {
                    setBusyKey(null)
                  }
                }}
              >
                {busyKey === installTpl.key ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <Download size={15} />
                )}
                ساخت و دانلود زیپ
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deployTpl ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deployBusy) setDeployTpl(null)
          }}
        >
          <div className={styles.tplModal}>
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={deployBusy}
              onClick={() => setDeployTpl(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>
            <h3>نصب روی سرور — {deployTpl.name}</h3>
            <p className={styles.tplModalLead}>
              پوشه ایزوله زیر{' '}
              <code>/var/www/websites/&lt;نام&gt;/</code> ساخته می‌شود؛ فقط
              مدل‌ها و صفحات همین سیستم کپی می‌شوند. موتور ربو و
              server-tools دست نمی‌خورند.
            </p>
            <label className={styles.tplField}>
              دامنه فرانت (مثلاً asmaneelm.ir)
              <input
                value={deployForm.front_domain}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, front_domain: e.target.value }))
                }
                onBlur={(e) => suggestFromDomain(e.target.value)}
                placeholder="asmaneelm.ir"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              نام پوشه سایت (site_id)
              <input
                value={deployForm.site_id}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, site_id: e.target.value }))
                }
                placeholder="asmaneelm"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              دامنه ادمین
              <input
                value={deployForm.admin_domain}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, admin_domain: e.target.value }))
                }
                placeholder="admin.asmaneelm.ir"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              کاربر لینوکس سرور
              <input
                value={deployForm.linux_user}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, linux_user: e.target.value }))
                }
                placeholder="rebo"
                dir="ltr"
              />
            </label>
            <div className={styles.tplFieldRow}>
              <label className={styles.tplField}>
                پورت Django (خالی = خودکار)
                <input
                  value={deployForm.django_port}
                  onChange={(e) =>
                    setDeployForm((p) => ({ ...p, django_port: e.target.value }))
                  }
                  placeholder="8001"
                  dir="ltr"
                />
              </label>
              <label className={styles.tplField}>
                پورت Next (خالی = خودکار)
                <input
                  value={deployForm.next_port}
                  onChange={(e) =>
                    setDeployForm((p) => ({ ...p, next_port: e.target.value }))
                  }
                  placeholder="3001"
                  dir="ltr"
                />
              </label>
            </div>
            <div className={styles.tplFieldRow}>
              <label className={styles.tplField}>
                نام دیتابیس (خالی = خودکار)
                <input
                  value={deployForm.db_name}
                  onChange={(e) =>
                    setDeployForm((p) => ({ ...p, db_name: e.target.value }))
                  }
                  placeholder="db_asmaneelm"
                  dir="ltr"
                />
              </label>
              <label className={styles.tplField}>
                کاربر دیتابیس (خالی = خودکار)
                <input
                  value={deployForm.db_user}
                  onChange={(e) =>
                    setDeployForm((p) => ({ ...p, db_user: e.target.value }))
                  }
                  placeholder="u_asmaneelm"
                  dir="ltr"
                />
              </label>
            </div>
            <label className={styles.tplField}>
              رمز دیتابیس (خالی = ساخت خودکار)
              <input
                type="password"
                value={deployForm.db_pass}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, db_pass: e.target.value }))
                }
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              IP سرور (برای ALLOWED_HOSTS)
              <input
                value={deployForm.server_ip}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, server_ip: e.target.value }))
                }
                placeholder="194.5.205.54"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              API_MAX_SMS (اختیاری)
              <input
                value={deployForm.api_max_sms}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, api_max_sms: e.target.value }))
                }
                dir="ltr"
              />
            </label>
            <div className={styles.tplFieldRow}>
              <label className={styles.tplField}>
                MAX_SMS_ORIGINATOR
                <input
                  value={deployForm.max_sms_originator}
                  onChange={(e) =>
                    setDeployForm((p) => ({
                      ...p,
                      max_sms_originator: e.target.value,
                    }))
                  }
                  dir="ltr"
                />
              </label>
              <label className={styles.tplField}>
                MAX_SMS_PATTERN_CODE
                <input
                  value={deployForm.max_sms_pattern_code}
                  onChange={(e) =>
                    setDeployForm((p) => ({
                      ...p,
                      max_sms_pattern_code: e.target.value,
                    }))
                  }
                  dir="ltr"
                />
              </label>
            </div>
            <label className={styles.tplCheck}>
              <input
                type="checkbox"
                checked={!!deployForm.force}
                onChange={(e) =>
                  setDeployForm((p) => ({ ...p, force: e.target.checked }))
                }
              />
              بازنویسی اجباری اگر پوشه از قبل وجود دارد (نصب ناقص)
            </label>
            {deployBusy || deployJob ? (
              <div className={styles.tplProgressCard}>
                <div className={styles.tplProgressHead}>
                  <span>{deployJob?.phase || 'در حال آماده‌سازی…'}</span>
                  <strong>{Math.min(100, Number(deployJob?.progress) || 0)}%</strong>
                </div>
                <div className={styles.tplProgressTrack}>
                  <div
                    className={styles.tplProgressFill}
                    style={{
                      width: `${Math.min(100, Number(deployJob?.progress) || 3)}%`,
                    }}
                  />
                </div>
                <p className={styles.tplProgressMsg}>
                  {deployJob?.message || 'نصب در صف…'}
                </p>
                {deployJob?.log_tail ? (
                  <pre className={styles.tplLogBox}>{deployJob.log_tail}</pre>
                ) : null}
              </div>
            ) : null}
            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={deployBusy}
                onClick={() => setDeployTpl(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplBtnInstall}
                disabled={
                  deployBusy || !deployForm.front_domain.trim()
                }
                onClick={startDeploy}
              >
                {deployBusy ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <Server size={15} />
                )}
                شروع نصب ایزوله
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {sslTpl ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget && !sslBusy) setSslTpl(null)
          }}
        >
          <div className={styles.tplModal}>
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={sslBusy}
              onClick={() => setSslTpl(null)}
              aria-label="بستن"
            >
              <X size={16} />
            </button>
            <h3>گواهی SSL — {sslTpl.name}</h3>
            <p className={styles.tplModalLead}>
              همان ۴ قطعه‌ای که از پنل گواهی می‌گیری را اینجا بگذار. nginx از
              Full Chain (یا Certificate + Bundle) به‌همراه Private key استفاده
              می‌کند؛ فقط روی همین سایت ایزوله نوشته می‌شود.
            </p>
            <label className={styles.tplField}>
              site_id
              <input
                value={sslForm.site_id}
                onChange={(e) =>
                  setSslForm((p) => ({ ...p, site_id: e.target.value }))
                }
                placeholder="asmaneelm"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              هدف
              <select
                value={sslForm.target}
                onChange={(e) =>
                  setSslForm((p) => ({ ...p, target: e.target.value }))
                }
              >
                <option value="both">ادمین + فرانت</option>
                <option value="front">فقط فرانت</option>
                <option value="admin">فقط ادمین</option>
              </select>
            </label>
            <label className={styles.tplField}>
              دامنه فرانت
              <input
                value={sslForm.front_domain}
                onChange={(e) =>
                  setSslForm((p) => ({ ...p, front_domain: e.target.value }))
                }
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              دامنه ادمین
              <input
                value={sslForm.admin_domain}
                onChange={(e) =>
                  setSslForm((p) => ({ ...p, admin_domain: e.target.value }))
                }
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              Certificate
              <textarea
                rows={4}
                value={sslForm.certificate_pem}
                onChange={(e) =>
                  setSslForm((p) => ({
                    ...p,
                    certificate_pem: e.target.value,
                  }))
                }
                placeholder="-----BEGIN CERTIFICATE-----"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              Private key
              <textarea
                rows={4}
                value={sslForm.private_key_pem}
                onChange={(e) =>
                  setSslForm((p) => ({
                    ...p,
                    private_key_pem: e.target.value,
                  }))
                }
                placeholder="-----BEGIN PRIVATE KEY-----"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              Full Chain
              <textarea
                rows={4}
                value={sslForm.fullchain_pem}
                onChange={(e) =>
                  setSslForm((p) => ({ ...p, fullchain_pem: e.target.value }))
                }
                placeholder="-----BEGIN CERTIFICATE-----"
                dir="ltr"
              />
            </label>
            <label className={styles.tplField}>
              Bundle
              <textarea
                rows={4}
                value={sslForm.bundle_pem}
                onChange={(e) =>
                  setSslForm((p) => ({ ...p, bundle_pem: e.target.value }))
                }
                placeholder="-----BEGIN CERTIFICATE-----"
                dir="ltr"
              />
            </label>
            {sslJob ? (
              <pre className={styles.tplLogBox}>
                [{sslJob.status}] {sslJob.message}
              </pre>
            ) : null}
            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={sslBusy}
                onClick={() => setSslTpl(null)}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplBtnInstall}
                disabled={
                  sslBusy ||
                  !sslForm.site_id.trim() ||
                  !sslForm.private_key_pem.trim() ||
                  !(
                    sslForm.fullchain_pem.trim() ||
                    sslForm.certificate_pem.trim()
                  )
                }
                onClick={startSsl}
              >
                {sslBusy ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <Shield size={15} />
                )}
                نصب گواهی
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {gitPackTpl ? (
        <div
          className={styles.tplModalRoot}
          role="dialog"
          aria-modal="true"
          aria-labelledby="git-pack-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !gitPackBusy) {
              setGitPackTpl(null)
              setGitPackResult(null)
            }
          }}
        >
          <div className={styles.tplModal}>
            <button
              type="button"
              className={styles.tplModalClose}
              disabled={gitPackBusy}
              onClick={() => {
                setGitPackTpl(null)
                setGitPackResult(null)
              }}
              aria-label="بستن"
            >
              <X size={16} />
            </button>
            <h3 id="git-pack-title">
              <GitBranch size={18} style={{ verticalAlign: 'middle' }} /> افزودن
              «{gitPackTpl.name}» به گیت
            </h3>
            <p className={styles.tplModalLead}>
              بک‌اند و فرانت سبک این بسته ساخته می‌شود و به دو ریپوی خصوصی
              GitHub پوش می‌شود تا بعداً روی سرور دیگر نصب شود:
            </p>
            <ul className={styles.gitPackRepos}>
              <li>
                <code>fadaoddini/{gitPackName.trim() || '…'}-admin</code>
              </li>
              <li>
                <code>fadaoddini/{gitPackName.trim() || '…'}-front</code>
              </li>
            </ul>
            <label className={styles.tplField}>
              نام دلخواه گیت
              <input
                type="text"
                value={gitPackName}
                onChange={(e) => setGitPackName(e.target.value)}
                placeholder="مثلاً asmaneelm یا school-pack"
                dir="ltr"
                disabled={gitPackBusy}
              />
            </label>
            <label className={styles.tplField}>
              پیام کامیت
              <input
                type="text"
                value={gitPackMessage}
                onChange={(e) => setGitPackMessage(e.target.value)}
                placeholder={`export ${gitPackTpl.key}`}
                disabled={gitPackBusy}
              />
            </label>
            {gitPackResult ? (
              <div className={styles.gitPackResult}>
                {gitPackResult.admin?.html_url ? (
                  <a
                    href={gitPackResult.admin.html_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    admin {gitPackResult.admin.ok ? '✓' : '✗'}
                  </a>
                ) : null}
                {gitPackResult.front?.html_url ? (
                  <a
                    href={gitPackResult.front.html_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    front {gitPackResult.front.ok ? '✓' : '✗'}
                  </a>
                ) : null}
                {gitPackResult.error ? (
                  <pre className={styles.tplLogBox}>{gitPackResult.error}</pre>
                ) : null}
              </div>
            ) : null}
            <div className={styles.tplModalActions}>
              <button
                type="button"
                className={styles.extBtnGhost}
                disabled={gitPackBusy}
                onClick={() => {
                  setGitPackTpl(null)
                  setGitPackResult(null)
                }}
              >
                انصراف
              </button>
              <button
                type="button"
                className={styles.tplBtnInstall}
                disabled={gitPackBusy || !gitPackName.trim()}
                onClick={publishPackToGit}
              >
                {gitPackBusy ? (
                  <Loader2 size={15} className={styles.spin} />
                ) : (
                  <GitBranch size={15} />
                )}
                {gitPackBusy ? 'در حال ساخت و پوش…' : 'ساخت و پوش به گیت'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default function TemplateImportPanel() {
  return (
    <Suspense fallback={null}>
      <TemplateImportPanelInner />
    </Suspense>
  )
}
