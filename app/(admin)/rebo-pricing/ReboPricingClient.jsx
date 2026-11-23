'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calculator,
  Cloud,
  Copy,
  ExternalLink,
  Headphones,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import { getReboSystemPageNav } from '@/components/Admin/reboSystemNav'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import { useAuth } from '@/contexts/AuthContext'
import { WIDGET_CATEGORIES } from '@/config/pageBuilderWidgets'
import moment from 'moment-jalaali'
import {
  categoryLabel,
  cloudMonthlyEstimate,
  formatMoney,
  formatRial,
  getCoveredWidgetTypes,
  getPackagePriceInfo,
  listCatalogWidgets,
  newPackageId,
  newServiceId,
  normalizePackage,
  normalizePackageDiscount,
  normalizeReboPricing,
  CORE_REBO_PACKAGES,
  PACKAGE_PRESETS,
  packageFromPreset,
  startDiscountForDays,
} from '@/config/reboPricing'

moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' })
import {
  fetchSiteSettings,
  saveReboPricing,
} from '@/services/siteSettings'
import styles from '../adminweb/AdminWeb.module.css'
import local from './ReboPricing.module.css'

const emptyDraft = () =>
  normalizePackage({
    id: newPackageId(),
    name: '',
    desc: '',
    icon: 'Boxes',
    price: 0,
    enabled: true,
    widget_types: [],
  })

function resolvePricingTab(raw) {
  if (raw === 'ops' || raw === 'support') return 'ops'
  if (raw === 'extras') return 'extras'
  return 'packages'
}

export default function ReboPricingClient() {
  const gate = useOwnerGate('/rebo-pricing')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { getAuthHeaders } = useAuth()
  const [pricing, setPricing] = useState(() => normalizeReboPricing({}))
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [tab, setTab] = useState(() =>
    resolvePricingTab(searchParams?.get('tab')),
  )
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(null)
  const [widgetQ, setWidgetQ] = useState('')
  const [itemQ, setItemQ] = useState('')

  const catalog = useMemo(() => listCatalogWidgets(), [])

  useEffect(() => {
    setTab(resolvePricingTab(searchParams?.get('tab')))
  }, [searchParams])

  const goTab = (id) => {
    setTab(id)
    if (id === 'packages') router.replace('/rebo-pricing')
    else router.replace(`/rebo-pricing?tab=${id}`)
  }

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const data = await fetchSiteSettings({ force: true })
      const rawPkgs = Array.isArray(data?.rebo_pricing?.packages)
        ? data.rebo_pricing.packages
        : []
      // فقط اگر موضوع اصلی کلاً غایب باشد اضافه کن — قیمت ذخیره‌شده را به ثابت کد برنگردان
      const missingCore = CORE_REBO_PACKAGES.some((core) => {
        return !rawPkgs.find(
          (p) =>
            p?.id === core.id ||
            String(p?.name || '').trim() === core.name,
        )
      })
      const next = normalizeReboPricing(data?.rebo_pricing)
      setPricing(next)
      if (missingCore) {
        try {
          const saved = await saveReboPricing(next, getAuthHeaders())
          setPricing(normalizeReboPricing(saved))
          setMsg(
            'موضوعات اصلی ربو (انبارداری، بدنسازی، بیلیارد) به لیست اضافه و ذخیره شد.',
          )
        } catch {
          /* نمایش محلی کافی است؛ ذخیره بعداً دستی */
        }
      }
    } catch (e) {
      setErr(e?.message || 'بارگذاری ناموفق')
    } finally {
      setLoading(false)
    }
  }, [getAuthHeaders])

  useEffect(() => {
    if (gate.allowed) load()
  }, [gate.allowed, load])

  const covered = useMemo(
    () => getCoveredWidgetTypes(pricing.packages),
    [pricing.packages],
  )

  const openNew = () => {
    const d = emptyDraft()
    setDraft(d)
    setEditingId(d.id)
    setWidgetQ('')
    goTab('packages')
  }

  const openEdit = (pkg) => {
    setDraft(normalizePackage(pkg))
    setEditingId(pkg.id)
    setWidgetQ('')
  }

  const cancelEdit = () => {
    setDraft(null)
    setEditingId(null)
  }

  const saveDraftToList = () => {
    if (!draft) return
    const next = normalizePackage({
      ...draft,
      name: draft.name?.trim() || 'موضوع بدون نام',
    })
    setPricing((prev) => {
      const data = normalizeReboPricing(prev)
      const idx = data.packages.findIndex((p) => p.id === next.id)
      const packages = [...data.packages]
      if (idx >= 0) packages[idx] = next
      else packages.push(next)
      return { ...data, packages }
    })
    setDraft(null)
    setEditingId(null)
    setMsg(null)
  }

  const removePackage = (id) => {
    setPricing((prev) => {
      const data = normalizeReboPricing(prev)
      return {
        ...data,
        packages: data.packages.filter((p) => p.id !== id),
      }
    })
    if (editingId === id) cancelEdit()
  }

  const addPreset = (preset) => {
    const pkg = packageFromPreset(preset)
    setPricing((prev) => {
      const data = normalizeReboPricing(prev)
      return { ...data, packages: [...data.packages, pkg] }
    })
    openEdit(pkg)
  }

  const toggleWidgetInDraft = (type) => {
    setDraft((d) => {
      if (!d) return d
      const set = new Set(d.widget_types || [])
      if (set.has(type)) set.delete(type)
      else set.add(type)
      return { ...d, widget_types: [...set] }
    })
  }

  const addCategoryToDraft = (categoryId) => {
    setDraft((d) => {
      if (!d) return d
      const set = new Set(d.widget_types || [])
      catalog
        .filter((w) => w.category === categoryId)
        .forEach((w) => set.add(w.type))
      return { ...d, widget_types: [...set] }
    })
  }

  const filteredCatalog = useMemo(() => {
    const term = widgetQ.trim().toLowerCase()
    if (!term) return catalog
    return catalog.filter(
      (w) =>
        w.label.toLowerCase().includes(term) ||
        w.type.toLowerCase().includes(term) ||
        (w.desc || '').toLowerCase().includes(term) ||
        categoryLabel(w.category).toLowerCase().includes(term),
    )
  }, [catalog, widgetQ])

  const catalogByCat = useMemo(() => {
    const map = new Map()
    filteredCatalog.forEach((w) => {
      const cat = w.category || 'extra'
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat).push(w)
    })
    return WIDGET_CATEGORIES.map((c) => ({
      id: c.id,
      label: c.label,
      items: map.get(c.id) || [],
    })).filter((g) => g.items.length)
  }, [filteredCatalog])

  const standaloneItems = useMemo(() => {
    const term = itemQ.trim().toLowerCase()
    return (pricing.items || []).filter((it) => {
      if (covered.has(it.type)) return false
      if (!term) return true
      return (
        it.label.toLowerCase().includes(term) ||
        it.type.toLowerCase().includes(term) ||
        categoryLabel(it.category).toLowerCase().includes(term)
      )
    })
  }, [pricing.items, covered, itemQ])

  const setItem = (type, patch) => {
    setPricing((prev) => {
      const next = normalizeReboPricing(prev)
      next.items = next.items.map((it) =>
        it.type === type ? { ...it, ...patch } : it,
      )
      return next
    })
    setMsg(null)
  }

  const onSave = async () => {
    setSaving(true)
    setErr(null)
    setMsg(null)
    try {
      let payload = normalizeReboPricing(pricing)
      if (draft) {
        const next = normalizePackage({
          ...draft,
          name: draft.name?.trim() || 'موضوع بدون نام',
        })
        const idx = payload.packages.findIndex((p) => p.id === next.id)
        const packages = [...payload.packages]
        if (idx >= 0) packages[idx] = next
        else packages.push(next)
        payload = { ...payload, packages }
        setPricing(payload)
        setDraft(null)
        setEditingId(null)
      }
      const saved = await saveReboPricing(payload, getAuthHeaders())
      setPricing(normalizeReboPricing(saved))
      setMsg('قیمت‌گذاری ذخیره شد')
    } catch (e) {
      setErr(e?.message || 'ذخیره ناموفق')
    } finally {
      setSaving(false)
    }
  }

  const packageCount = (pricing.packages || []).length
  const isOps = tab === 'ops'
  const navActive = isOps ? '/rebo-pricing?tab=ops' : '/rebo-pricing'
  const shellTitle = isOps ? 'پشتیبانی و سرور' : 'قیمت ربو'
  const shellTag = isOps
    ? 'پلن‌های پشتیبانی، سرور ابری و خدمات بر عهده مشتری'
    : 'موضوع‌ها و بسته‌های قیمت‌گذاری ربو'

  return (
    <OwnerPortalShell
      brand="وب"
      brandAccent="ادمین "
      tagline={shellTag}
      title={shellTitle}
      wide
      pageNav={getReboSystemPageNav(navActive)}
      {...gate}
    >
      <div className={local.toolbar}>
        {!isOps ? (
          <div className={styles.awTabs} role="tablist">
            <button
              type="button"
              className={`${styles.awTab} ${tab === 'packages' ? styles.awTabOn : ''}`}
              onClick={() => goTab('packages')}
            >
              موضوعات / بسته‌ها ({packageCount.toLocaleString('fa-IR')})
            </button>
            <button
              type="button"
              className={`${styles.awTab} ${tab === 'extras' ? styles.awTabOn : ''}`}
              onClick={() => goTab('extras')}
            >
              ویجت‌های تکی (خارج از بسته)
            </button>
          </div>
        ) : (
          <p className={local.hint} style={{ margin: 0 }}>
            <Headphones size={14} />
            پشتیبانی ماهانه و قیمت نمایشی سرور ابری — مدیریت سفارش ابری در بخش
            سرور.
          </p>
        )}
        <div className={local.actions}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={load}
            disabled={loading || saving}
          >
            <RefreshCw size={14} />
            بروزرسانی
          </button>
          <button
            type="button"
            className={styles.extBtn}
            onClick={onSave}
            disabled={loading || saving}
          >
            <Save size={14} />
            {saving ? 'در حال ذخیره…' : 'ذخیره'}
          </button>
        </div>
      </div>

      <div className={local.currencyRow}>
        <label>
          واحد نمایش
          <input
            value={pricing.currency_label || 'ریال'}
            onChange={(e) =>
              setPricing((p) => ({
                ...p,
                currency_label: e.target.value || 'ریال',
              }))
            }
          />
        </label>
        <p className={local.hint}>
          <Calculator size={14} />
          موضوع بسازید (مثلاً محله خبری)، ویجت‌هایش را تیک بزنید و یک قیمت نهایی
          بگذارید. در ماشین‌حساب عمومی فقط قیمت موضوع دیده می‌شود، نه اجزا.
        </p>
      </div>

      {msg ? <p className={local.ok}>{msg}</p> : null}
      {err ? <p className={local.err}>{err}</p> : null}

      {loading ? (
        <p className={local.loading}>در حال بارگذاری…</p>
      ) : tab === 'ops' ? (
        <div className={local.opsPanels}>
          <section className={local.opsPanel}>
            <h2>
              <Headphones size={16} /> پشتیبانی
            </h2>
            <p className={local.opsHint}>
              فقط دسته‌بندی پشتیبانی — بدون جزئیات خدمات. سه ماه رایگان، سپس
              پلن‌های ماهانه از مبتدی تا حرفه‌ای.
            </p>
            <div className={local.opsFields}>
              <label>
                عنوان
                <input
                  value={pricing.support?.title || ''}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      support: { ...p.support, title: e.target.value },
                    }))
                  }
                />
              </label>
              <label>
                توضیح
                <input
                  value={pricing.support?.desc || ''}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      support: { ...p.support, desc: e.target.value },
                    }))
                  }
                />
              </label>
              <label>
                ماه‌های پشتیبانی رایگان
                <input
                  type="number"
                  min={0}
                  dir="ltr"
                  value={pricing.support?.free_months ?? 0}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      support: {
                        ...p.support,
                        free_months: Math.max(
                          0,
                          Math.round(Number(e.target.value) || 0),
                        ),
                      },
                    }))
                  }
                />
              </label>
              <label>
                واحد پول
                <input
                  value={pricing.support?.currency_label || 'تومان'}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      support: {
                        ...p.support,
                        currency_label: e.target.value || 'تومان',
                      },
                    }))
                  }
                />
              </label>
              <label>
                یادداشت اطمینان
                <input
                  value={pricing.support?.notes || ''}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      support: { ...p.support, notes: e.target.value },
                    }))
                  }
                  placeholder="نگران به‌روزرسانی قالب و بک‌اند نباشید"
                />
              </label>
            </div>
            <div className={local.opsFields} style={{ marginTop: '1rem' }}>
              {(pricing.support?.plans || []).map((plan, idx) => (
                <label key={plan.id || idx}>
                  پلن {idx + 1} — نام / قیمت ماهانه (
                  {pricing.support?.currency_label || 'تومان'})
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.5rem',
                    }}
                  >
                    <input
                      value={plan.name || ''}
                      onChange={(e) =>
                        setPricing((p) => {
                          const plans = [...(p.support?.plans || [])]
                          plans[idx] = {
                            ...plans[idx],
                            name: e.target.value,
                          }
                          return {
                            ...p,
                            support: {
                              ...p.support,
                              plans,
                              monthly_price:
                                plans[0]?.monthly_price ??
                                p.support?.monthly_price,
                            },
                          }
                        })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      step={100000}
                      dir="ltr"
                      value={plan.monthly_price ?? 0}
                      onChange={(e) =>
                        setPricing((p) => {
                          const plans = [...(p.support?.plans || [])]
                          const monthly_price = Math.max(
                            0,
                            Math.round(Number(e.target.value) || 0),
                          )
                          plans[idx] = { ...plans[idx], monthly_price }
                          return {
                            ...p,
                            support: {
                              ...p.support,
                              plans,
                              monthly_price:
                                plans[0]?.monthly_price ?? monthly_price,
                            },
                          }
                        })
                      }
                    />
                  </div>
                  <em className={local.pricePreview}>
                    {formatMoney(
                      plan.monthly_price || 0,
                      pricing.support?.currency_label || 'تومان',
                    )}{' '}
                    / ماه
                  </em>
                </label>
              ))}
            </div>
          </section>

          <section className={local.opsPanel}>
            <h2>
              <Cloud size={16} /> سرور ابری اشتراکی (روزانه)
            </h2>
            <p className={local.opsHint}>
              قیمت نمایشی ویترین و نرخ کسر روزانه — مدیریت سفارش، شارژ، پیامک و
              حذف داده در{' '}
              <Link href="/serversystem">
                بخش سرور <ExternalLink size={12} />
              </Link>
            </p>
            <button
              type="button"
              className={local.toggleRow}
              onClick={() =>
                setPricing((p) => ({
                  ...p,
                  cloud_server: {
                    ...p.cloud_server,
                    enabled: !p.cloud_server?.enabled,
                  },
                }))
              }
            >
              {pricing.cloud_server?.enabled ? (
                <ToggleRight size={22} className={local.on} />
              ) : (
                <ToggleLeft size={22} />
              )}
              نمایش به کاربر
            </button>
            <div className={local.opsFields}>
              <label>
                عنوان
                <input
                  value={pricing.cloud_server?.title || ''}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      cloud_server: {
                        ...p.cloud_server,
                        title: e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <label>
                توضیح
                <input
                  value={pricing.cloud_server?.desc || ''}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      cloud_server: {
                        ...p.cloud_server,
                        desc: e.target.value,
                      },
                    }))
                  }
                />
              </label>
              <label>
                هزینه روزانه (
                {pricing.cloud_server?.currency_label || 'تومان'})
                <input
                  type="number"
                  min={0}
                  step={1000}
                  dir="ltr"
                  value={pricing.cloud_server?.daily_price ?? 0}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      cloud_server: {
                        ...p.cloud_server,
                        daily_price: Math.max(
                          0,
                          Math.round(Number(e.target.value) || 0),
                        ),
                      },
                    }))
                  }
                />
                <em className={local.pricePreview}>
                  روزانه{' '}
                  {formatMoney(
                    pricing.cloud_server?.daily_price || 0,
                    pricing.cloud_server?.currency_label || 'تومان',
                  )}{' '}
                  · تقریبی ماهانه{' '}
                  {formatMoney(
                    cloudMonthlyEstimate(pricing.cloud_server?.daily_price),
                    pricing.cloud_server?.currency_label || 'تومان',
                  )}
                </em>
              </label>
              <label>
                واحد پول
                <input
                  value={pricing.cloud_server?.currency_label || 'تومان'}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      cloud_server: {
                        ...p.cloud_server,
                        currency_label: e.target.value || 'تومان',
                      },
                    }))
                  }
                />
              </label>
              <label>
                یادداشت
                <input
                  value={pricing.cloud_server?.notes || ''}
                  onChange={(e) =>
                    setPricing((p) => ({
                      ...p,
                      cloud_server: {
                        ...p.cloud_server,
                        notes: e.target.value,
                      },
                    }))
                  }
                />
              </label>
            </div>

            <div className={local.specHead}>
              <h3>مشخصات سرور</h3>
              <button
                type="button"
                className={styles.extBtn}
                onClick={() =>
                  setPricing((p) => ({
                    ...p,
                    cloud_server: {
                      ...p.cloud_server,
                      specs: [
                        ...(p.cloud_server?.specs || []),
                        {
                          id: newServiceId(),
                          label: 'مشخصه جدید',
                          value: '',
                        },
                      ],
                    },
                  }))
                }
              >
                <Plus size={14} />
                مشخصه
              </button>
            </div>
            <div className={local.specList}>
              {(pricing.cloud_server?.specs || []).map((spec, idx) => (
                <div key={spec.id || idx} className={local.specRow}>
                  <input
                    placeholder="عنوان (مثلاً رم)"
                    value={spec.label || ''}
                    onChange={(e) =>
                      setPricing((p) => {
                        const specs = [...(p.cloud_server?.specs || [])]
                        specs[idx] = { ...specs[idx], label: e.target.value }
                        return {
                          ...p,
                          cloud_server: { ...p.cloud_server, specs },
                        }
                      })
                    }
                  />
                  <input
                    placeholder="مقدار (مثلاً ۸ گیگابایت)"
                    value={spec.value || ''}
                    onChange={(e) =>
                      setPricing((p) => {
                        const specs = [...(p.cloud_server?.specs || [])]
                        specs[idx] = { ...specs[idx], value: e.target.value }
                        return {
                          ...p,
                          cloud_server: { ...p.cloud_server, specs },
                        }
                      })
                    }
                  />
                  <button
                    type="button"
                    className={local.iconBtn}
                    onClick={() =>
                      setPricing((p) => ({
                        ...p,
                        cloud_server: {
                          ...p.cloud_server,
                          specs: (p.cloud_server?.specs || []).filter(
                            (_, i) => i !== idx,
                          ),
                        },
                      }))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className={local.opsPanel}>
            <div className={local.specHead}>
              <h2>خدمات بر عهده مشتری</h2>
              <button
                type="button"
                className={styles.extBtn}
                onClick={() =>
                  setPricing((p) => ({
                    ...p,
                    customer_services: [
                      ...(p.customer_services || []),
                      {
                        id: newServiceId(),
                        name: 'خدمت جدید',
                        desc: '',
                        price: 0,
                        unit: '',
                        note: 'بر عهده مشتری',
                        enabled: true,
                      },
                    ],
                  }))
                }
              >
                <Plus size={14} />
                خدمت
              </button>
            </div>
            <div className={local.svcList}>
              {(pricing.customer_services || []).map((svc, idx) => (
                <div key={svc.id || idx} className={local.svcRow}>
                  <button
                    type="button"
                    className={local.toggle}
                    onClick={() =>
                      setPricing((p) => {
                        const list = [...(p.customer_services || [])]
                        list[idx] = {
                          ...list[idx],
                          enabled: !list[idx].enabled,
                        }
                        return { ...p, customer_services: list }
                      })
                    }
                  >
                    {svc.enabled ? (
                      <ToggleRight size={22} className={local.on} />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>
                  <div className={local.svcFields}>
                    <input
                      placeholder="نام (پیامک، نقشه نشان…)"
                      value={svc.name || ''}
                      onChange={(e) =>
                        setPricing((p) => {
                          const list = [...(p.customer_services || [])]
                          list[idx] = { ...list[idx], name: e.target.value }
                          return { ...p, customer_services: list }
                        })
                      }
                    />
                    <input
                      placeholder="توضیح"
                      value={svc.desc || ''}
                      onChange={(e) =>
                        setPricing((p) => {
                          const list = [...(p.customer_services || [])]
                          list[idx] = { ...list[idx], desc: e.target.value }
                          return { ...p, customer_services: list }
                        })
                      }
                    />
                    <input
                      placeholder="واحد / تعرفه"
                      value={svc.unit || ''}
                      onChange={(e) =>
                        setPricing((p) => {
                          const list = [...(p.customer_services || [])]
                          list[idx] = { ...list[idx], unit: e.target.value }
                          return { ...p, customer_services: list }
                        })
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      dir="ltr"
                      placeholder="قیمت (۰ = فقط توضیحی)"
                      value={svc.price ?? 0}
                      onChange={(e) =>
                        setPricing((p) => {
                          const list = [...(p.customer_services || [])]
                          list[idx] = {
                            ...list[idx],
                            price: Math.max(
                              0,
                              Math.round(Number(e.target.value) || 0),
                            ),
                          }
                          return { ...p, customer_services: list }
                        })
                      }
                    />
                    <input
                      placeholder="یادداشت (بر عهده مشتری)"
                      value={svc.note || ''}
                      onChange={(e) =>
                        setPricing((p) => {
                          const list = [...(p.customer_services || [])]
                          list[idx] = { ...list[idx], note: e.target.value }
                          return { ...p, customer_services: list }
                        })
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className={local.iconBtn}
                    onClick={() =>
                      setPricing((p) => ({
                        ...p,
                        customer_services: (p.customer_services || []).filter(
                          (_, i) => i !== idx,
                        ),
                      }))
                    }
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : tab === 'packages' ? (
        <div className={local.pkgLayout}>
          <div className={local.pkgList}>
            <div className={local.pkgListHead}>
              <h2>موضوع‌ها</h2>
              <button type="button" className={styles.extBtn} onClick={openNew}>
                <Plus size={14} />
                موضوع جدید
              </button>
            </div>

            <div className={local.presets}>
              <span>پیشنهاد سریع:</span>
              {PACKAGE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={local.presetChip}
                  onClick={() => addPreset(p)}
                >
                  <Copy size={12} />
                  {p.name}
                </button>
              ))}
            </div>

            {(pricing.packages || []).length === 0 ? (
              <p className={local.loading}>
                هنوز موضوعی نیست. «موضوع جدید» یا یکی از پیشنهادها را بزنید.
              </p>
            ) : (
              <ul className={local.pkgCards}>
                {(pricing.packages || []).map((pkg) => (
                  <li
                    key={pkg.id}
                    className={`${local.pkgCard} ${editingId === pkg.id ? local.pkgCardOn : ''}`}
                  >
                    <button
                      type="button"
                      className={local.pkgCardMain}
                      onClick={() => openEdit(pkg)}
                    >
                      <strong>{pkg.name}</strong>
                      <span>
                        {formatRial(pkg.price)} {pricing.currency_label}
                      </span>
                      <small>
                        {(pkg.widget_types || []).length.toLocaleString('fa-IR')}{' '}
                        ویجت
                        {pkg.enabled === false ? ' · غیرفعال' : ''}
                        {getPackagePriceInfo(pkg).active
                          ? ` · تخفیف ${getPackagePriceInfo(pkg).percent.toLocaleString('fa-IR')}٪`
                          : ''}
                      </small>
                    </button>
                    <button
                      type="button"
                      className={local.iconBtn}
                      title="حذف"
                      onClick={() => removePackage(pkg.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={local.pkgEditor}>
            {!draft ? (
              <p className={local.loading}>
                یک موضوع را انتخاب کنید یا موضوع جدید بسازید.
              </p>
            ) : (
              <>
                <div className={local.editorFields}>
                  <label>
                    نام موضوع
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                      placeholder="مثلاً سیستم محله خبری"
                    />
                  </label>
                  <label>
                    توضیح کوتاه
                    <input
                      value={draft.desc}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, desc: e.target.value }))
                      }
                      placeholder="چه چیزی داخل این موضوع است؟"
                    />
                  </label>
                  <label className={local.featuresField}>
                    امکانات اصلی (هر خط یک مورد — برای نمایش به مخاطب)
                    <textarea
                      rows={5}
                      value={(draft.features || []).join('\n')}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          features: e.target.value
                            .split('\n')
                            .map((l) => l.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder={'تابلو آگهی\nجستجو و فیلتر\nرزومه کارجو'}
                    />
                  </label>
                  <label>
                    قیمت نهایی ({pricing.currency_label || 'ریال'})
                    <input
                      type="number"
                      min={0}
                      step={1_000_000}
                      dir="ltr"
                      value={draft.price ?? 0}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          price: Math.max(
                            0,
                            Math.round(Number(e.target.value) || 0),
                          ),
                        }))
                      }
                    />
                    <em className={local.pricePreview}>
                      {formatRial(draft.price)} {pricing.currency_label}
                    </em>
                  </label>
                  <button
                    type="button"
                    className={local.toggleRow}
                    onClick={() =>
                      setDraft((d) => ({ ...d, enabled: !d.enabled }))
                    }
                  >
                    {draft.enabled ? (
                      <ToggleRight size={22} className={local.on} />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                    {draft.enabled
                      ? 'فعال در ماشین‌حساب'
                      : 'غیرفعال در ماشین‌حساب'}
                  </button>

                  <div className={local.discountBox}>
                    <button
                      type="button"
                      className={local.toggleRow}
                      onClick={() =>
                        setDraft((d) => {
                          const disc = normalizePackageDiscount(d.discount)
                          const next = {
                            ...disc,
                            enabled: !disc.enabled,
                          }
                          if (next.enabled && !next.ends_at) {
                            return {
                              ...d,
                              discount: startDiscountForDays(next, 7),
                            }
                          }
                          return { ...d, discount: next }
                        })
                      }
                    >
                      {draft.discount?.enabled ? (
                        <ToggleRight size={22} className={local.on} />
                      ) : (
                        <ToggleLeft size={22} />
                      )}
                      تخفیف مهلت‌دار
                    </button>

                    {draft.discount?.enabled ? (
                      <>
                        <div className={local.discountFields}>
                          <label>
                            درصد تخفیف
                            <input
                              type="number"
                              min={1}
                              max={100}
                              dir="ltr"
                              value={draft.discount?.percent ?? 20}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  discount: {
                                    ...normalizePackageDiscount(d.discount),
                                    type: 'percent',
                                    percent: Math.max(
                                      0,
                                      Math.min(
                                        100,
                                        Math.round(Number(e.target.value) || 0),
                                      ),
                                    ),
                                  },
                                }))
                              }
                            />
                          </label>
                          <label>
                            برچسب (اختیاری)
                            <input
                              value={draft.discount?.label || ''}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  discount: {
                                    ...normalizePackageDiscount(d.discount),
                                    label: e.target.value,
                                  },
                                }))
                              }
                              placeholder="مثلاً جشنواره ۷ روزه"
                            />
                          </label>
                        </div>
                        <div className={local.catQuick}>
                          <span className={local.discHint}>شروع از الان:</span>
                          {[3, 7, 14, 30].map((days) => (
                            <button
                              key={days}
                              type="button"
                              className={local.presetChip}
                              onClick={() =>
                                setDraft((d) => ({
                                  ...d,
                                  discount: startDiscountForDays(
                                    d.discount,
                                    days,
                                  ),
                                }))
                              }
                            >
                              {days.toLocaleString('fa-IR')} روز
                            </button>
                          ))}
                        </div>
                        {draft.discount?.ends_at ? (
                          <p className={local.discEnd}>
                            پایان:{' '}
                            {moment(draft.discount.ends_at).format(
                              'jD jMMMM jYYYY · HH:mm',
                            )}
                            {(() => {
                              const info = getPackagePriceInfo(draft)
                              if (!info.active) return ' · منقضی / غیرفعال'
                              return ` · قیمت با تخفیف: ${formatRial(info.finalPrice)} ${pricing.currency_label}`
                            })()}
                          </p>
                        ) : null}
                      </>
                    ) : null}
                  </div>
                </div>

                <div className={local.widgetPickHead}>
                  <h3>ویجت‌های داخل این موضوع</h3>
                  <div className={local.searchWrap}>
                    <Search size={16} />
                    <input
                      type="search"
                      className={local.search}
                      placeholder="جستجوی ویجت…"
                      value={widgetQ}
                      onChange={(e) => setWidgetQ(e.target.value)}
                    />
                  </div>
                </div>

                <div className={local.catQuick}>
                  {WIDGET_CATEGORIES.filter((c) => c.id !== 'platform').map(
                    (c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={local.presetChip}
                        onClick={() => addCategoryToDraft(c.id)}
                      >
                        + همهٔ {c.label}
                      </button>
                    ),
                  )}
                </div>

                <p className={local.pickedCount}>
                  {(draft.widget_types || []).length.toLocaleString('fa-IR')}{' '}
                  ویجت انتخاب‌شده — قیمت این اجزا در ماشین‌حساب جدا نشان داده
                  نمی‌شود.
                </p>

                <div className={local.pickGroups}>
                  {catalogByCat.map((g) => (
                    <div key={g.id} className={local.pickGroup}>
                      <h4>{g.label}</h4>
                      <div className={local.pickGrid}>
                        {g.items.map((w) => {
                          const on = (draft.widget_types || []).includes(w.type)
                          return (
                            <label
                              key={w.type}
                              className={`${local.pickItem} ${on ? local.pickItemOn : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={on}
                                onChange={() => toggleWidgetInDraft(w.type)}
                              />
                              <span>
                                <strong>{w.label}</strong>
                                <code>{w.type}</code>
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={local.editorActions}>
                  <button
                    type="button"
                    className={styles.extBtnGhost}
                    onClick={cancelEdit}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    className={styles.extBtn}
                    onClick={saveDraftToList}
                  >
                    تأیید موضوع در لیست
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className={local.groups}>
          <p className={local.hint} style={{ marginBottom: '0.75rem' }}>
            فقط ویجت‌هایی که داخل هیچ موضوع فعالی نیستند اینجا قیمت تکی دارند.
            ویجت‌های پوشیده‌شده با بسته: {covered.size.toLocaleString('fa-IR')}
          </p>
          <div className={local.searchWrap} style={{ marginBottom: '0.75rem' }}>
            <Search size={16} />
            <input
              type="search"
              className={local.search}
              placeholder="جستجو در ویجت‌های تکی…"
              value={itemQ}
              onChange={(e) => setItemQ(e.target.value)}
            />
          </div>
          <div className={local.table}>
            {standaloneItems.map((it) => (
              <div key={it.type} className={local.row}>
                <button
                  type="button"
                  className={local.toggle}
                  onClick={() => setItem(it.type, { enabled: !it.enabled })}
                >
                  {it.enabled ? (
                    <ToggleRight size={22} className={local.on} />
                  ) : (
                    <ToggleLeft size={22} />
                  )}
                </button>
                <div className={local.meta}>
                  <strong>{it.label}</strong>
                  <code>{it.type}</code>
                  <small>{categoryLabel(it.category)}</small>
                </div>
                <label className={local.priceField}>
                  قیمت ({pricing.currency_label || 'ریال'})
                  <input
                    type="number"
                    min={0}
                    step={100000}
                    dir="ltr"
                    value={it.price ?? 0}
                    disabled={!it.enabled}
                    onChange={(e) =>
                      setItem(it.type, {
                        price: Math.max(
                          0,
                          Math.round(Number(e.target.value) || 0),
                        ),
                      })
                    }
                  />
                  <span className={local.pricePreview}>
                    {formatRial(it.price)} {pricing.currency_label || 'ریال'}
                  </span>
                </label>
              </div>
            ))}
            {!standaloneItems.length ? (
              <p className={local.loading}>
                همه ویجت‌ها داخل موضوعات هستند یا موردی نیست.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </OwnerPortalShell>
  )
}
