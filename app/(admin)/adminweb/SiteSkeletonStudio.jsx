'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Plus,
  Trash2,
  RefreshCw,
  Save,
  GripVertical,
  LayoutTemplate,
  BoxSelect,
  Maximize2,
  ChevronUp,
  ChevronDown,
  Settings2,
  Layers,
  Paintbrush,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchSiteModules } from '@/services/siteModules'
import {
  fetchSiteSettings,
  saveHomeLayout,
  saveNewsSingleLayout,
  saveNewsListLayout,
  saveJobSingleLayout,
  saveProductSingleLayout,
  saveShopListLayout,
  saveShopListLayoutVariant,
  saveProductSingleLayoutVariant,
  saveModulePageLayout,
  syncHomeChromeTheme,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import { getShopLayoutModeDef } from '@/config/shopLayoutModes'
import {
  createDefaultModulePageLayout,
  createDefaultSharedInternalLayout,
  getModulePageDef,
  getSharedInternalLayoutRaw,
  isSharedInternalLayoutKey,
  normalizeModulePageLayout,
  normalizeSharedInternalLayout,
  SHARED_INTERNAL_LAYOUT_EVENT,
  SHARED_INTERNAL_LAYOUT_KEY,
} from '@/config/modulePageLayouts'
import {
  DEFAULT_HOME_LAYOUT,
  DEFAULT_NEWS_SINGLE_LAYOUT,
  DEFAULT_NEWS_LIST_LAYOUT,
  DEFAULT_JOB_SINGLE_LAYOUT,
  DEFAULT_PRODUCT_SINGLE_LAYOUT,
  DEFAULT_SHOP_LIST_LAYOUT,
  PAGE_WIDTH_OPTIONS,
  SECTION_WIDTH_OPTIONS,
  SECTION_PADDING_OPTIONS,
  normalizeHomeLayout,
  normalizeNewsSingleLayout,
  normalizeNewsListLayout,
  normalizeJobSingleLayout,
  normalizeProductSingleLayout,
  normalizeShopListLayout,
  createSection,
  applyTemplateToSection,
  updateColumnSpan,
  addWidgetToColumn,
  removeWidgetFromColumn,
  updateWidgetSettings,
  findWidgetInLayout,
  moveWidgetInLayout,
} from '@/config/homeLayout'
import { SECTION_TEMPLATES } from '@/config/sectionTemplates'
import { widgetMeta } from '@/config/pageBuilderWidgets'
import { isNavWidgetType } from '@/config/navWidgetSettings'
import { isSiteTopNavWidgetType } from '@/config/siteTopNavWidgetSettings'
import { isPostJobButtonWidgetType } from '@/config/postJobButtonWidgetSettings'
import { isSliderWidgetType } from '@/config/sliderWidgetSettings'
import { isNewsWidgetType } from '@/config/newsWidgetSettings'
import { isCtaWidgetType } from '@/config/ctaWidgetSettings'
import { isJobBoardWidgetType } from '@/config/jobBoardWidgetSettings'
import { isShopWidgetType } from '@/config/shopWidgetSettings'
import { isSoftAppsWidgetType } from '@/config/softappsWidgetSettings'
import { isRepairsWidgetType } from '@/config/repairsWidgetSettings'
import { isReboWidgetType } from '@/config/reboWidgetSettings'
import { isHeroWithMenuWidgetType } from '@/config/heroWithMenuSettings'
import WidgetHeroWithMenuSettings from './WidgetHeroWithMenuSettings'
import {
  isBookingCtaWidgetType,
  isBookingFormWidgetType,
  isBookingLookupWidgetType,
  isBookingServicesWidgetType,
  isBookingStaffWidgetType,
} from '@/config/bookingWidgetSettings'
import WidgetPickerDialog from './WidgetPickerDialog'
import WidgetNavSettings from './WidgetNavSettings'
import WidgetSliderSettings from './WidgetSliderSettings'
import WidgetSiteTopNavSettings from './WidgetSiteTopNavSettings'
import WidgetPostJobButtonSettings from './WidgetPostJobButtonSettings'
import WidgetNewsSettings from './WidgetNewsSettings'
import WidgetCtaSettings from './WidgetCtaSettings'
import WidgetJobBoardSettings from './WidgetJobBoardSettings'
import WidgetShopSettings from './WidgetShopSettings'
import WidgetShopSearchSettings from './WidgetShopSearchSettings'
import WidgetSoftAppsSettings from './WidgetSoftAppsSettings'
import WidgetRepairsSettings from './WidgetRepairsSettings'
import WidgetBookingSettings from './WidgetBookingSettings'
import WidgetBookingCtaSettings from './WidgetBookingCtaSettings'
import WidgetBookingServicesSettings from './WidgetBookingServicesSettings'
import WidgetBookingStaffSettings from './WidgetBookingStaffSettings'
import WidgetBookingLookupSettings from './WidgetBookingLookupSettings'
import WidgetReboSettings from './WidgetReboSettings'
import WidgetDeepSliderSettings from './WidgetDeepSliderSettings'
import { isDeepSliderWidgetType } from '@/config/deepSliderSettings'
import WidgetNobatSettings from './WidgetNobatSettings'
import WidgetSadraPixelSettings from './WidgetSadraPixelSettings'
import WidgetFeatureCardsSettings from './WidgetFeatureCardsSettings'
import WidgetVideoArchiveSettings from './WidgetVideoArchiveSettings'
import WidgetSchoolHeroBreakingSettings, {
  isSchoolHeroBreakingWidgetType,
} from './WidgetSchoolHeroBreakingSettings'
import { isFeatureCardsWidgetType } from '@/config/featureCardsWidgetSettings'
import { isVideoArchiveWidgetType } from '@/config/videoArchiveWidgetSettings'
import { isNobatWidgetType } from '@/config/nobatWidgetSettings'
import {
  LayoutDndProvider,
  DroppableColumn,
} from './SiteSkeletonDnd'
import styles from './AdminWeb.module.css'

const LAYOUT_MODE_META = {
  home: {
    empty: DEFAULT_HOME_LAYOUT,
    normalize: normalizeHomeLayout,
    settingsKey: 'home_layout',
    save: saveHomeLayout,
    event: 'home-layout-changed',
    title: 'طراحی صفحه اصلی',
    hint: 'سکشن و ویجت‌های صفحه اصلی را بچینید و ذخیره کنید.',
    savedMsg: 'چیدمان صفحه ذخیره شد',
  },
  news_single: {
    empty: DEFAULT_NEWS_SINGLE_LAYOUT,
    normalize: normalizeNewsSingleLayout,
    settingsKey: 'news_single_layout',
    save: saveNewsSingleLayout,
    event: 'news-single-layout-changed',
    title: 'طراحی صفحه سینگل خبر',
    hint: 'نمایش سینگل فقط از این چیدمان است. ویجت «محتوای کامل سینگل» را بگذارید؛ برای موبایل ستون‌ها زیر هم می‌آیند.',
    savedMsg: 'چیدمان صفحه سینگل ذخیره شد',
  },
  news_list: {
    empty: DEFAULT_NEWS_LIST_LAYOUT,
    normalize: normalizeNewsListLayout,
    settingsKey: 'news_list_layout',
    save: saveNewsListLayout,
    event: 'news-list-layout-changed',
    title: 'طراحی صفحه لیست اخبار',
    hint: 'چیدمان /news فقط از اینجاست. ویجت «محتوای کامل لیست اخبار» را بگذارید؛ می‌توانید استوری، منو و ویجت‌های دیگر را هم اضافه کنید.',
    savedMsg: 'چیدمان صفحه لیست اخبار ذخیره شد',
  },
  job_single: {
    empty: DEFAULT_JOB_SINGLE_LAYOUT,
    normalize: normalizeJobSingleLayout,
    settingsKey: 'job_single_layout',
    save: saveJobSingleLayout,
    event: 'job-single-layout-changed',
    title: 'طراحی صفحه سینگل آگهی',
    hint: 'نمایش سینگل آگهی فقط از این چیدمان است. ویجت «محتوای کامل سینگل آگهی» را بگذارید؛ برای موبایل ستون‌ها زیر هم می‌آیند.',
    savedMsg: 'چیدمان صفحه سینگل آگهی ذخیره شد',
  },
  product_single: {
    empty: DEFAULT_PRODUCT_SINGLE_LAYOUT,
    normalize: normalizeProductSingleLayout,
    settingsKey: 'product_single_layout',
    save: saveProductSingleLayout,
    event: 'product-single-layout-changed',
    title: 'طراحی صفحه سینگل محصول',
    hint: 'نمایش سینگل محصول فقط از این چیدمان است. ویجت «محتوای کامل سینگل محصول» را بگذارید؛ ویجت‌های فروشگاه را کنارش بچینید.',
    savedMsg: 'چیدمان صفحه سینگل محصول ذخیره شد',
  },
  shop_list: {
    empty: DEFAULT_SHOP_LIST_LAYOUT,
    normalize: normalizeShopListLayout,
    settingsKey: 'shop_list_layout',
    save: saveShopListLayout,
    event: 'shop-list-layout-changed',
    title: 'طراحی صفحه لیست فروشگاه',
    hint: 'چیدمان /shop فقط از اینجاست. ویجت «محتوای کامل لیست فروشگاه» را بگذارید؛ می‌توانید سبد ویژه، استوری و ویجت‌های دیگر را هم اضافه کنید.',
    savedMsg: 'چیدمان صفحه لیست فروشگاه ذخیره شد',
  },
}

function resolveLayoutModeMeta(layoutMode, moduleMap = {}) {
  const mode = String(layoutMode || 'home')
  if (mode.startsWith('module:')) {
    const pageKey = mode.slice('module:'.length)
    if (isSharedInternalLayoutKey(pageKey)) {
      return {
        empty: createDefaultSharedInternalLayout(),
        normalize: (raw) => normalizeSharedInternalLayout(raw),
        settingsKey: 'module_page_layouts',
        getRaw: (settings) =>
          getSharedInternalLayoutRaw(settings?.module_page_layouts),
        save: (layout, headers) =>
          saveModulePageLayout(SHARED_INTERNAL_LAYOUT_KEY, layout, headers),
        event: SHARED_INTERNAL_LAYOUT_EVENT,
        title: 'چیدمان مشترک صفحات داخلی',
        hint:
          'خبر فوری، منو و ویجت‌های مشترک را اینجا بگذارید و ذخیره کنید. همه صفحات داخلی از همین چیدمان می‌گیرند — نه از صفحه اصلی و نه از چیدمان تک‌تک صفحات. صفحه اصلی جداست.',
        savedMsg: 'چیدمان مشترک صفحات داخلی ذخیره شد',
        modulePageKey: SHARED_INTERNAL_LAYOUT_KEY,
        contentWidget: null,
        isSharedInternal: true,
      }
    }
    const def = getModulePageDef(pageKey)
    return {
      empty: createDefaultModulePageLayout(pageKey),
      normalize: (raw) => normalizeModulePageLayout(raw, pageKey),
      settingsKey: 'module_page_layouts',
      getRaw: (settings) => settings?.module_page_layouts?.[pageKey],
      save: (layout, headers) => saveModulePageLayout(pageKey, layout, headers),
      event: def?.event || `module-page-layout-changed:${pageKey}`,
      title: def ? `طراحی ${def.label}` : `طراحی صفحه ${pageKey}`,
      hint: def
        ? `فقط محتوای اختصاصی ${def.path} را اینجا بچینید. هدر و ظاهر مشترک از «چیدمان مشترک» می‌آید؛ ویجت «محتوای کامل» را نگه دارید.`
        : 'چیدمان صفحه داخلی ماژول',
      savedMsg: def
        ? `چیدمان ${def.label} ذخیره شد`
        : 'چیدمان صفحه داخلی ذخیره شد',
      modulePageKey: pageKey,
      contentWidget: def?.contentWidget || null,
    }
  }
  if (mode === 'shop_list' || mode.startsWith('shop_list:')) {
    const variant =
      mode === 'shop_list' ? 'default' : mode.slice('shop_list:'.length) || 'default'
    const def = getShopLayoutModeDef(variant)
    const isDefault = variant === 'default'
    return {
      empty: DEFAULT_SHOP_LIST_LAYOUT,
      normalize: normalizeShopListLayout,
      settingsKey: isDefault ? 'shop_list_layout' : 'shop_list_layouts',
      getRaw: (settings) => {
        const fromMap = settings?.shop_list_layouts?.[variant]
        if (fromMap && typeof fromMap === 'object') return fromMap
        if (isDefault) return settings?.shop_list_layout
        return null
      },
      save: (layout, headers) =>
        saveShopListLayoutVariant(variant, layout, headers, {
          alsoPublish: false,
          moduleMap,
        }),
      event: 'shop-list-layout-changed',
      title: `طراحی فروشگاه · ${def.label}`,
      hint: isDefault
        ? 'چیدمان /shop برای حالت پیش‌فرض فروشگاه. ویجت «محتوای کامل لیست فروشگاه» را بگذارید.'
        : `چیدمان /shop مخصوص «${def.label}». با فعال بودن این سیستم، همین چیدمان روی /shop دیده می‌شود. منو و CTA را مطابق همان سیستم تنظیم کنید.`,
      savedMsg: `چیدمان فروشگاه «${def.label}» ذخیره شد`,
      shopLayoutVariant: variant,
      contentWidget: 'shop_page',
    }
  }
  if (mode === 'product_single' || mode.startsWith('product_single:')) {
    const variant =
      mode === 'product_single'
        ? 'default'
        : mode.slice('product_single:'.length) || 'default'
    const def = getShopLayoutModeDef(variant)
    const isDefault = variant === 'default'
    return {
      empty: DEFAULT_PRODUCT_SINGLE_LAYOUT,
      normalize: normalizeProductSingleLayout,
      settingsKey: isDefault ? 'product_single_layout' : 'product_single_layouts',
      getRaw: (settings) => {
        const fromMap = settings?.product_single_layouts?.[variant]
        if (fromMap && typeof fromMap === 'object') return fromMap
        if (isDefault) return settings?.product_single_layout
        return null
      },
      save: (layout, headers) =>
        saveProductSingleLayoutVariant(variant, layout, headers, {
          alsoPublish: false,
          moduleMap,
        }),
      event: 'product-single-layout-changed',
      title: `طراحی سینگل محصول · ${def.label}`,
      hint: isDefault
        ? 'چیدمان /shop/products برای حالت پیش‌فرض. ویجت «محتوای کامل سینگل محصول» را بگذارید.'
        : `چیدمان سینگل محصول مخصوص «${def.label}». با فعال بودن این سیستم روی /shop/products دیده می‌شود.`,
      savedMsg: `چیدمان سینگل «${def.label}» ذخیره شد`,
      shopLayoutVariant: variant,
      contentWidget: 'product_article',
    }
  }
  return LAYOUT_MODE_META[mode] || LAYOUT_MODE_META.home
}

/**
 * بیلدر صفحه: بوم | تنظیمات
 * layoutMode: 'home' | 'news_single' | … | 'module:repairs' | 'module:apps' | …
 */
export default function SiteSkeletonStudio({
  moduleMap: moduleMapProp = {},
  standalone = false,
  layoutMode = 'home',
}) {
  const { getAuthHeaders } = useAuth()
  const [moduleMap, setModuleMap] = useState(moduleMapProp)
  const modeMeta = resolveLayoutModeMeta(layoutMode, moduleMap)
  const emptyLayout = modeMeta.empty
  const [layout, setLayout] = useState(emptyLayout)
  const [savedLayout, setSavedLayout] = useState(emptyLayout)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [selectedWidgetRef, setSelectedWidgetRef] = useState(null) // { sectionId, columnId, widgetId }
  const [picker, setPicker] = useState(null) // { sectionId, columnId }
  const [showTemplates, setShowTemplates] = useState(false)
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [syncingChrome, setSyncingChrome] = useState(false)
  const layoutRef = useRef(layout)
  const savingRef = useRef(false)
  const layoutEvent = modeMeta.event
  const studioTitle = modeMeta.title
  const studioHint = modeMeta.hint
  const isHomeStudio = String(layoutMode || 'home') === 'home'

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  const normalizeLayout = modeMeta.normalize

  const dirty =
    JSON.stringify(normalizeLayout(layout)) !==
    JSON.stringify(normalizeLayout(savedLayout))

  useEffect(() => {
    setModuleMap(moduleMapProp || {})
  }, [moduleMapProp])

  const refresh = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      clearSiteSettingsCache()
      const [settings, mods] = await Promise.all([
        fetchSiteSettings({ force: true }),
        fetchSiteModules({ force: true }).catch(() => ({ map: {} })),
      ])
      const raw =
        typeof modeMeta.getRaw === 'function'
          ? modeMeta.getRaw(settings)
          : settings?.[modeMeta.settingsKey]
      const L = normalizeLayout(raw)
      setLayout(L)
      setSavedLayout(L)
      if (mods?.map) setModuleMap(mods.map)
      if (L.rows?.[0] && !selectedSectionId) {
        setSelectedSectionId(L.rows[0].id)
      }
    } catch (e) {
      setErr(e.message || 'بارگذاری ناموفق بود')
    } finally {
      setLoading(false)
    }
  }, [selectedSectionId, modeMeta, normalizeLayout])

  useEffect(() => {
    refresh()
    const onLayout = (ev) => {
      // هنگام ذخیرهٔ محلی خودمان، state را دوباره از event بازنویسی نکن
      // مگر بعد از اتمام save — در saveAll صریحاً set می‌کنیم
      if (savingRef.current) return
      if (ev?.detail) {
        const L = normalizeLayout(ev.detail)
        setLayout(L)
        setSavedLayout(L)
        layoutRef.current = L
      }
    }
    const onModules = () => {
      fetchSiteModules({ force: true })
        .then(({ map }) => setModuleMap(map || {}))
        .catch(() => {})
    }
    window.addEventListener(layoutEvent, onLayout)
    window.addEventListener('site-modules-changed', onModules)
    return () => {
      window.removeEventListener(layoutEvent, onLayout)
      window.removeEventListener('site-modules-changed', onModules)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutMode])

  const selectedSection =
    layout.rows?.find((r) => r.id === selectedSectionId) || null

  const selectedWidgetInfo = selectedWidgetRef
    ? findWidgetInLayout(layout, selectedWidgetRef.widgetId)
    : null

  const patchLayout = (patch) => {
    setLayout((prev) => normalizeLayout({ ...prev, ...patch }))
  }

  const updateRow = (sectionId, updater) => {
    setLayout((prev) => {
      const L = normalizeLayout(prev)
      return normalizeLayout({
        ...L,
        rows: L.rows.map((r) => (r.id === sectionId ? updater(r) : r)),
      })
    })
  }

  const addSection = (templateId = '1') => {
    const sec = createSection(templateId)
    setLayout((prev) => {
      const L = normalizeLayout(prev)
      return normalizeLayout({ ...L, rows: [...L.rows, sec] })
    })
    setSelectedSectionId(sec.id)
    setSelectedWidgetRef(null)
    setShowTemplates(false)
    setMsg('سکشن جدید اضافه شد')
  }

  const removeSection = (sectionId) => {
    setLayout((prev) => {
      const L = normalizeLayout(prev)
      return { ...L, rows: L.rows.filter((r) => r.id !== sectionId) }
    })
    if (selectedSectionId === sectionId) setSelectedSectionId(null)
    if (selectedWidgetRef?.sectionId === sectionId) setSelectedWidgetRef(null)
  }

  const moveSection = (sectionId, dir) => {
    setLayout((prev) => {
      const L = normalizeLayout(prev)
      const idx = L.rows.findIndex((r) => r.id === sectionId)
      if (idx < 0) return L
      const to = idx + dir
      if (to < 0 || to >= L.rows.length) return L
      const rows = [...L.rows]
      const [item] = rows.splice(idx, 1)
      rows.splice(to, 0, item)
      return { ...L, rows }
    })
  }

  const persistLayout = useCallback(
    async (nextLayout, successMsg) => {
      const payload = normalizeLayout(nextLayout)
      setSaving(true)
      savingRef.current = true
      setErr(null)
      setMsg(null)
      try {
        const next = await modeMeta.save(payload, getAuthHeaders())
        const normalized = normalizeLayout(next)
        setLayout(normalized)
        setSavedLayout(normalized)
        layoutRef.current = normalized
        setMsg(successMsg || modeMeta.savedMsg)
        return normalized
      } catch (e) {
        setErr(e.message || 'ذخیره ناموفق بود')
        throw e
      } finally {
        savingRef.current = false
        setSaving(false)
      }
    },
    [getAuthHeaders, modeMeta, normalizeLayout]
  )

  const saveAll = async () => {
    try {
      await persistLayout(layoutRef.current)
    } catch {
      /* err already set */
    }
  }

  const syncChromeToAllPages = async () => {
    if (!isHomeStudio) return
    setSyncingChrome(true)
    setErr(null)
    setMsg(null)
    try {
      // اول چیدمان خانه را اگر dirty است ذخیره کن
      if (dirty) {
        await persistLayout(layoutRef.current, 'چیدمان صفحه اصلی ذخیره شد')
      }
      const result = await syncHomeChromeTheme(getAuthHeaders())
      const n = result?.summary?.targets?.length || 0
      const types = (result?.chrome?.types || []).join('، ')
      setMsg(
        `سکشن ۱ صفحه اصلی روی ${n.toLocaleString('fa-IR')} چیدمان اعمال شد` +
          (types ? ` (${types})` : '') +
          '. فقط ویجت‌های سکشن اول منتقل شدند؛ سکشن‌های بعدی دست‌نخورده ماندند.',
      )
    } catch (e) {
      setErr(e?.message || 'همگام‌سازی هدر ناموفق بود')
    } finally {
      setSyncingChrome(false)
    }
  }

  const onPickWidget = (type) => {
    if (!picker) return
    updateRow(picker.sectionId, (sec) =>
      addWidgetToColumn(sec, picker.columnId, type)
    )
    setMsg('ویجت اضافه شد — ذخیره را بزنید')
  }

  const onMoveWidget = useCallback(
    async (move) => {
      const next = moveWidgetInLayout(layoutRef.current, move)
      layoutRef.current = next
      setLayout(next)
      if (move?.widgetId) {
        setSelectedSectionId(move.toSectionId)
        setSelectedWidgetRef({
          sectionId: move.toSectionId,
          columnId: move.toColumnId,
          widgetId: move.widgetId,
        })
      }
      try {
        await persistLayout(next, 'جابه‌جایی ذخیره شد')
      } catch {
        setMsg('جابه‌جایی انجام شد ولی ذخیره نشد — دوباره ذخیره را بزنید')
      }
    },
    [persistLayout]
  )

  const onRemoveWidget = (sectionId, columnId, widgetId) => {
    updateRow(sectionId, (sec) =>
      removeWidgetFromColumn(sec, columnId, widgetId)
    )
    if (selectedWidgetRef?.widgetId === widgetId) {
      setSelectedWidgetRef(null)
    }
  }

  const Wrap = standalone ? 'section' : 'aside'
  const wrapClass = standalone
    ? `${styles.section} ${styles.layoutStudio}`
    : styles.studioRight

  return (
    <Wrap className={wrapClass} aria-label={studioTitle}>
      <div className={styles.studioRightHead}>
        <div>
          <h2>
            <Layers size={16} />
            {studioTitle}
          </h2>
          <p>{studioHint}</p>
        </div>
        <div className={styles.studioRightActions}>
          {isHomeStudio ? (
            <button
              type="button"
              className={styles.extBtnGhost}
              onClick={syncChromeToAllPages}
              disabled={loading || saving || syncingChrome}
              title="فقط ویجت‌های سکشن ۱ صفحه اصلی را به چیدمان مشترک و بقیه صفحات منتقل می‌کند (سکشن‌های بعدی نه)"
            >
              {syncingChrome ? (
                <RefreshCw size={14} className={styles.spin} />
              ) : (
                <Paintbrush size={14} />
              )}
              اعمال هدر و رنگ به همه
            </button>
          ) : null}
          <button
            type="button"
            className={styles.extBtnGhost}
            onClick={refresh}
            disabled={loading || saving || syncingChrome}
          >
            <RefreshCw size={14} className={loading ? styles.spin : undefined} />
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={saveAll}
            disabled={loading || saving || syncingChrome || !dirty}
          >
            {saving ? <RefreshCw size={14} className={styles.spin} /> : <Save size={14} />}
            ذخیره
          </button>
        </div>
      </div>

      {err ? <div className={styles.lsAlert}>{err}</div> : null}
      {msg ? <div className={styles.lsOk}>{msg}</div> : null}
      {dirty ? <div className={styles.lsDirty}>تغییرات ذخیره‌نشده</div> : null}

      <div className={styles.pbShell}>
        {/* ستون راست (RTL): بوم */}
        <div className={styles.pbCanvas}>
          <div className={styles.pbPageBar}>
            <div className={styles.lbWidthToggle} role="group" aria-label="عرض صفحه">
              {PAGE_WIDTH_OPTIONS.map((opt) => {
                const on = layout.page_width === opt.id
                const Icon = opt.id === 'boxed' ? BoxSelect : Maximize2
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`${styles.lbWidthBtn} ${on ? styles.lbWidthBtnOn : ''}`}
                    onClick={() => patchLayout({ page_width: opt.id })}
                  >
                    <Icon size={13} />
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <label className={styles.lbInlineField}>
              <span>عرض</span>
              <input
                type="number"
                min={640}
                max={1920}
                step={10}
                value={layout.max_width}
                disabled={layout.page_width === 'full'}
                onChange={(e) =>
                  patchLayout({ max_width: Number(e.target.value) || 1200 })
                }
              />
            </label>
          </div>

          <div
            className={`${styles.pbPage} ${layout.page_width === 'full' ? styles.pbPageFluid : ''}`}
            style={
              layout.page_width === 'boxed'
                ? { maxWidth: layout.max_width }
                : undefined
            }
          >
            {loading ? (
              <div className={styles.jbRowSkeleton} />
            ) : layout.rows.length === 0 ? (
              <div className={styles.pbEmpty}>
                <LayoutTemplate size={28} />
                <p>هنوز سکشنی ندارید</p>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setShowTemplates(true)}
                >
                  <Plus size={14} />
                  افزودن اولین سکشن
                </button>
              </div>
            ) : (
              <LayoutDndProvider layout={layout} onMoveWidget={onMoveWidget}>
                {layout.rows.map((row, rowIndex) => {
                  const selected = selectedSectionId === row.id
                  return (
                    <div
                      key={row.id}
                      className={`${styles.pbSection} ${selected && !selectedWidgetRef ? styles.pbSectionOn : ''}`}
                      onClick={() => {
                        setSelectedSectionId(row.id)
                        setSelectedWidgetRef(null)
                      }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setSelectedSectionId(row.id)
                          setSelectedWidgetRef(null)
                        }
                      }}
                    >
                      <div className={styles.pbSectionBar}>
                        <span>
                          <GripVertical size={12} />
                          سکشن {rowIndex + 1}
                          <small>
                            {SECTION_TEMPLATES.find((t) => t.id === row.template)?.label ||
                              row.template}
                          </small>
                        </span>
                        <div className={styles.pbSectionActs} onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            title="بالا"
                            onClick={() => moveSection(row.id, -1)}
                            disabled={rowIndex === 0}
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            title="پایین"
                            onClick={() => moveSection(row.id, 1)}
                            disabled={rowIndex === layout.rows.length - 1}
                          >
                            <ChevronDown size={14} />
                          </button>
                          <button
                            type="button"
                            title="حذف"
                            className={styles.pbDanger}
                            onClick={() => removeSection(row.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div
                        className={styles.pbColumns}
                        style={{
                          gridTemplateColumns: (row.columns || [])
                            .map((c) => `minmax(0, ${Number(c.span) || 1}fr)`)
                            .join(' '),
                        }}
                      >
                        {row.columns.map((col) => (
                          <DroppableColumn
                            key={col.id}
                            sectionId={row.id}
                            column={col}
                            selectedWidgetId={selectedWidgetRef?.widgetId}
                            onSelectWidget={(ref) => {
                              setSelectedSectionId(ref.sectionId)
                              setSelectedWidgetRef(ref)
                            }}
                            onRemoveWidget={onRemoveWidget}
                            onAddWidget={(sectionId, columnId) =>
                              setPicker({ sectionId, columnId })
                            }
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </LayoutDndProvider>
            )}

            <button
              type="button"
              className={styles.pbAddSection}
              onClick={() => setShowTemplates(true)}
            >
              <Plus size={16} />
              افزودن سکشن
            </button>
          </div>
        </div>

        {/* ستون چپ: تنظیمات */}
        <aside className={styles.pbInspector}>
          <div className={styles.lbInspectorTabs}>
            <span className={`${styles.lbInspTab} ${styles.lbInspTabOn}`}>
              <Settings2 size={13} />
              {selectedWidgetInfo
                ? 'تنظیمات ویجت'
                : selectedSection
                  ? 'تنظیمات سکشن'
                  : 'تنظیمات صفحه'}
            </span>
          </div>

          {selectedWidgetInfo?.widget ? (
            <div className={`${styles.lbInspectorBody} ${styles.wsInspector}`}>
              <div className={styles.wsInspectorHead}>
                <div>
                  <span className={styles.wsEyebrow}>ویجت</span>
                  <h3 className={styles.lbInspTitle}>
                    {widgetMeta(selectedWidgetInfo.widget.type)?.label ||
                      selectedWidgetInfo.widget.type}
                  </h3>
                </div>
                <button
                  type="button"
                  className={styles.wsBackBtn}
                  onClick={() => setSelectedWidgetRef(null)}
                >
                  بازگشت
                </button>
              </div>

              {isNavWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetNavSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isSliderWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetSliderSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isSiteTopNavWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetSiteTopNavSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isPostJobButtonWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetPostJobButtonSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isNewsWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetNewsSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isCtaWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetCtaSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isJobBoardWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetJobBoardSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : selectedWidgetInfo.widget.type === 'shop_search_bar' ? (
                <WidgetShopSearchSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isShopWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetShopSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isSoftAppsWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetSoftAppsSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isRepairsWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetRepairsSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isBookingFormWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetBookingSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isBookingCtaWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetBookingCtaSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isBookingServicesWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetBookingServicesSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isBookingStaffWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetBookingStaffSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isBookingLookupWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetBookingLookupSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isHeroWithMenuWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetHeroWithMenuSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isDeepSliderWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetDeepSliderSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isReboWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetReboSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isNobatWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetNobatSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : selectedWidgetInfo.widget.type === 'sadra_pixel_title' ? (
                <WidgetSadraPixelSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isFeatureCardsWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetFeatureCardsSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isVideoArchiveWidgetType(selectedWidgetInfo.widget.type) ? (
                <WidgetVideoArchiveSettings
                  type={selectedWidgetInfo.widget.type}
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : isSchoolHeroBreakingWidgetType(
                  selectedWidgetInfo.widget.type,
                ) ? (
                <WidgetSchoolHeroBreakingSettings
                  settings={selectedWidgetInfo.widget.settings}
                  onChange={(patch) => {
                    if (!selectedWidgetRef) return
                    updateRow(selectedWidgetRef.sectionId, (sec) =>
                      updateWidgetSettings(
                        sec,
                        selectedWidgetRef.columnId,
                        selectedWidgetRef.widgetId,
                        patch
                      )
                    )
                  }}
                />
              ) : (
                <p className={styles.paletteHint}>
                  این ویجت فعلاً تنظیمات اختصاصی ندارد.
                </p>
              )}
            </div>
          ) : !selectedSection ? (
            <div className={styles.lbInspectorBody}>
              <p className={styles.paletteHint}>
                یک سکشن را در بوم انتخاب کنید یا سکشن جدید بسازید.
              </p>
              <div className={styles.lbStatRow}>
                <span>تعداد سکشن</span>
                <strong>{layout.rows.length}</strong>
              </div>
              <div className={styles.lbStatRow}>
                <span>عرض صفحه</span>
                <strong>{layout.page_width === 'full' ? 'Fluid' : 'Container'}</strong>
              </div>
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={() => setShowTemplates(true)}
              >
                <Plus size={14} />
                سکشن جدید
              </button>
            </div>
          ) : (
            <div className={styles.lbInspectorBody}>
              <h3 className={styles.lbInspTitle}>سکشن انتخاب‌شده</h3>

              <div className={styles.pbTplLabel}>قالب ستون‌بندی</div>
              <div className={styles.pbTplGrid}>
                {SECTION_TEMPLATES.map((tpl) => {
                  const on = selectedSection.template === tpl.id
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      className={`${styles.pbTplCard} ${on ? styles.pbTplCardOn : ''}`}
                      onClick={() =>
                        updateRow(selectedSection.id, (sec) =>
                          applyTemplateToSection(sec, tpl.id)
                        )
                      }
                      title={tpl.desc}
                    >
                      <span className={styles.pbTplPreview} aria-hidden>
                        {tpl.spans.map((s, i) => (
                          <i key={i} style={{ flex: s }} />
                        ))}
                      </span>
                      <strong>{tpl.label}</strong>
                    </button>
                  )
                })}
              </div>

              <label className={styles.lbStackField}>
                <span className={styles.lbFieldLabel}>عرض سکشن</span>
                <select
                  value={selectedSection.width}
                  onChange={(e) =>
                    updateRow(selectedSection.id, (sec) => ({
                      ...sec,
                      width: e.target.value,
                    }))
                  }
                >
                  {SECTION_WIDTH_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.lbStackField}>
                <span className={styles.lbFieldLabel}>فاصله عمودی</span>
                <select
                  value={selectedSection.padding_y}
                  onChange={(e) =>
                    updateRow(selectedSection.id, (sec) => ({
                      ...sec,
                      padding_y: e.target.value,
                    }))
                  }
                >
                  {SECTION_PADDING_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.pbTplLabel}>اندازه ستون‌ها (%)</div>
              {selectedSection.columns.map((col, i) => (
                <label key={col.id} className={styles.lbStackField}>
                  <span className={styles.lbFieldLabel}>ستون {i + 1}</span>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    step={1}
                    value={col.span}
                    onChange={(e) =>
                      updateRow(selectedSection.id, (sec) =>
                        updateColumnSpan(sec, col.id, Number(e.target.value))
                      )
                    }
                  />
                </label>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* دیالوگ انتخاب قالب سکشن */}
      {showTemplates ? (
        <div className={styles.wpOverlay} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.wpBackdrop}
            onClick={() => setShowTemplates(false)}
            aria-label="بستن"
          />
          <div className={styles.wpDialog}>
            <header className={styles.wpHead}>
              <div>
                <h3>
                  <LayoutTemplate size={16} />
                  انتخاب قالب سکشن
                </h3>
                <p>چند ستون می‌خواهید؟ بعداً اندازه را تغییر می‌دهید</p>
              </div>
            </header>
            <div className={styles.wpBody}>
              <div className={styles.pbTplGridDialog}>
                {SECTION_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    className={styles.pbTplCard}
                    onClick={() => addSection(tpl.id)}
                  >
                    <span className={styles.pbTplPreview} aria-hidden>
                      {tpl.spans.map((s, i) => (
                        <i key={i} style={{ flex: s }} />
                      ))}
                    </span>
                    <strong>{tpl.label}</strong>
                    <small>{tpl.desc}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <WidgetPickerDialog
        open={!!picker}
        moduleMap={moduleMap}
        layoutMode={layoutMode}
        onClose={() => setPicker(null)}
        onPick={onPickWidget}
      />
    </Wrap>
  )
}
