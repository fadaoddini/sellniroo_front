// config/chromeThemeSync.js — استخراج هدر/رنگ از صفحه اصلی و اعمال روی چیدمان‌های دیگر
import {
  createColumn,
  createWidgetInstance,
  normalizeHomeLayout,
  normalizeJobSingleLayout,
  normalizeNewsListLayout,
  normalizeNewsSingleLayout,
  normalizeProductSingleLayout,
  normalizeShopListLayout,
} from '@/config/homeLayout'
import {
  MODULE_PAGE_DEFS,
  SHARED_INTERNAL_LAYOUT_KEY,
  SHARED_INTERNAL_LAYOUT_KEY_LEGACY,
  getSharedInternalLayoutRaw,
  normalizeModulePageLayout,
  normalizeSharedInternalLayout,
  createDefaultSharedInternalLayout,
  isModulePageContentWidget,
  sharedInternalLayoutHasContent,
} from '@/config/modulePageLayouts'
import {
  isHeroWithMenuWidgetType,
  resolveHeroWithMenuChromeBreakingSettings,
} from '@/config/heroWithMenuSettings'

/** ویجت‌های هدر/نوار که رنگ و ظاهر را حمل می‌کنند.
 * hero_slider محتواست نه کروم — روی صفحات داخلی (مثل /repairs) کپی نمی‌شود.
 */
export const CHROME_HEADER_TYPES = new Set([
  'breaking_news',
  'site_menu',
  'site_top_nav',
  'corporate_header',
  'nav_bar',
  'hamburger_menu',
  'header_menu',
  'profile',
])

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function cloneSettings(settings) {
  if (!settings || typeof settings !== 'object') return {}
  try {
    return JSON.parse(JSON.stringify(settings))
  } catch {
    return { ...settings }
  }
}

function isChromeWidget(type) {
  return CHROME_HEADER_TYPES.has(String(type || ''))
}

function isContentWidget(type) {
  const t = String(type || '')
  if (isModulePageContentWidget(t)) return true
  return (
    t === 'shop_list_content' ||
    t === 'shop_list_page' ||
    t === 'product_single_content' ||
    t === 'product_single_page' ||
    t === 'news_list_content' ||
    t === 'news_single_content' ||
    t === 'job_single_content' ||
    t === 'job_article' ||
    t === 'news_article' ||
    t === 'product_article' ||
    t.endsWith('_page') ||
    t.endsWith('_content')
  )
}

/** فقط سکشن ۱ (اولین ردیف) صفحه اصلی — منبع «اعمال هدر و رنگ به همه» */
function getHomeSectionOne(homeLayout) {
  const L = normalizeHomeLayout(homeLayout)
  const first = (L.rows || [])[0]
  return first && typeof first === 'object' ? first : null
}

/**
 * اگر خبر فوری داخل هیرو باشگاه/مدرسه در سکشن ۱ embed شده باشد،
 * برای صفحات داخلی یک ویجت breaking_news جامد هم‌تم می‌سازد.
 */
function synthesizeEmbeddedChrome(homeLayout) {
  const row = getHomeSectionOne(homeLayout)
  if (!row) return []
  for (const col of row.columns || []) {
    for (const w of col.widgets || []) {
      const type = String(w?.type || '')
      const s = w?.settings && typeof w.settings === 'object' ? w.settings : {}
      if (isHeroWithMenuWidgetType(type) && s.show_menu !== false) {
        return [
          {
            type: 'breaking_news',
            settings: resolveHeroWithMenuChromeBreakingSettings(s),
          },
        ]
      }
      if (
        type === 'school_landing' &&
        (s.embed_breaking === true || s.show_breaking_in_hero === true)
      ) {
        return [
          {
            type: 'breaking_news',
            settings: cloneSettings(s.breaking_news || s),
          },
        ]
      }
    }
  }
  return []
}

/**
 * تنظیمات ویجت‌های کروم چیدمان مشترک را با سکشن ۱ صفحه اصلی یکی می‌کند
 * (مثلاً خبر فوری /reboserver دقیقاً مثل خانه).
 */
export function applyHomeChromeSettingsToShared(sharedLayout, homeLayout) {
  const home = normalizeHomeLayout(homeLayout)
  const homeChrome = extractChromeWidgets(home)
  if (!homeChrome.length) {
    return normalizeSharedInternalLayout(sharedLayout)
  }
  const settingsByType = {}
  for (const w of homeChrome) {
    const t = String(w?.type || '')
    if (!t || settingsByType[t]) continue
    settingsByType[t] = cloneSettings(w.settings)
  }

  const shared = normalizeSharedInternalLayout(sharedLayout)
  let sawBreaking = false
  const rows = (shared.rows || []).map((row) => ({
    ...row,
    columns: (row.columns || []).map((col) => ({
      ...col,
      widgets: (col.widgets || []).map((w) => {
        const t = String(w?.type || '')
        if (t === 'breaking_news') {
          sawBreaking = true
          // تنظیمات ذخیره‌شدهٔ چیدمان مشترک (/ticker) اولویت دارد
          if (
            w.settings &&
            typeof w.settings === 'object' &&
            Object.keys(w.settings).length > 0
          ) {
            return w
          }
          if (settingsByType.breaking_news) {
            return {
              ...w,
              settings: cloneSettings(settingsByType.breaking_news),
            }
          }
          return w
        }
        if (t && settingsByType[t]) {
          return { ...w, settings: cloneSettings(settingsByType[t]) }
        }
        return w
      }),
    })),
  }))

  if (!sawBreaking && settingsByType.breaking_news) {
    return normalizeSharedInternalLayout({
      ...shared,
      rows: [
        buildChromeRow(
          [{ type: 'breaking_news', settings: settingsByType.breaking_news }],
          'home_bn',
        ),
        ...rows,
      ],
    })
  }

  return normalizeSharedInternalLayout({ ...shared, rows })
}

/**
 * منبع ظاهر کروم سراسری: چیدمان مشترک با تنظیمات هم‌تراز خانه، وگرنه خود خانه.
 */
export function resolveSiteChromeLayout(settings) {
  const home = normalizeHomeLayout(settings?.home_layout)
  const rawShared = getSharedInternalLayoutRaw(settings?.module_page_layouts)
  const shared = normalizeSharedInternalLayout(rawShared)
  if (sharedInternalLayoutHasContent(shared)) {
    return applyHomeChromeSettingsToShared(shared, home)
  }
  return home
}

/**
 * ویجت‌های سکشن ۱ صفحه اصلی را برای همگام‌سازی برمی‌گرداند.
 * سکشن‌های ۲ به بعد اصلاً خوانده نمی‌شوند.
 * ویجت‌های محتوای صفحه (*_page / *_content) منتقل نمی‌شوند.
 */
export function extractChromeWidgets(homeLayout) {
  const row = getHomeSectionOne(homeLayout)
  if (!row) return []
  const out = []
  for (const col of row.columns || []) {
    for (const w of col.widgets || []) {
      if (!w?.type) continue
      if (isContentWidget(w.type)) continue
      out.push({
        type: w.type,
        settings: cloneSettings(w.settings),
      })
    }
  }
  // اگر خبر فوری فقط داخل هیرو/لندینگ مدرسه embed شده، برای صفحات داخلی
  // یک ویجت breaking_news هم‌تم هم استخراج کن (حتی وقتی ویجت‌های دیگر در سکشن ۱ هستند)
  const hasBreaking = out.some((w) => w?.type === 'breaking_news')
  if (!hasBreaking) {
    const syn = synthesizeEmbeddedChrome(homeLayout)
    if (syn.length) out.push(...syn)
  }
  if (out.length) return out
  return synthesizeEmbeddedChrome(homeLayout)
}

/**
 * کل سکشن ۱ خانه را به‌صورت چیدمان مشترک کپی می‌کند (بدون ویجت محتوا).
 */
export function extractHomeSectionOneAsLayout(homeLayout) {
  const home = normalizeHomeLayout(homeLayout)
  const first = getHomeSectionOne(home)
  const base = createDefaultSharedInternalLayout()
  if (!first) {
    return normalizeSharedInternalLayout({
      ...base,
      page_width: home.page_width,
      max_width: home.max_width,
      gutter: home.gutter,
    })
  }
  const columns = (first.columns || []).map((col) => ({
    ...col,
    id: uid('col_shared'),
    widgets: (col.widgets || [])
      .filter((w) => w?.type && !isContentWidget(w.type))
      .map((w) => ({
        ...createWidgetInstance(w.type, cloneSettings(w.settings)),
        id: uid('w_shared'),
      })),
  }))
  const hasWidgets = columns.some((c) => (c.widgets || []).length > 0)
  if (!hasWidgets) {
    const synthesized = synthesizeEmbeddedChrome(home)
    if (synthesized.length) {
      return normalizeSharedInternalLayout({
        ...base,
        page_width: home.page_width,
        max_width: home.max_width,
        gutter: home.gutter,
        rows: [buildChromeRow(synthesized, 'shared')],
      })
    }
  }
  return normalizeSharedInternalLayout({
    ...base,
    page_width: home.page_width,
    max_width: home.max_width,
    gutter: home.gutter,
    rows: [
      {
        ...first,
        id: uid('sec_shared'),
        width: first.width === 'boxed' ? 'boxed' : 'full',
        columns: hasWidgets
          ? columns
          : [createColumn(100, [])],
      },
    ],
  })
}

/**
 * ردیف تمام‌عرض هدر از روی ویجت‌های استخراج‌شده.
 */
export function buildChromeRow(chromeWidgets, idPrefix = 'chrome') {
  const widgets = (chromeWidgets || []).map((w) => ({
    ...createWidgetInstance(w.type, cloneSettings(w.settings)),
    id: uid(`w_${idPrefix}`),
  }))
  return {
    id: uid(`sec_${idPrefix}`),
    template: '1',
    width: 'full',
    padding_y: 'none',
    columns: [createColumn(100, widgets)],
  }
}

function stripChromeWidgets(layout) {
  const L = normalizeHomeLayout(layout)
  const rows = []
  for (const row of L.rows || []) {
    const columns = (row.columns || []).map((col) => ({
      ...col,
      widgets: (col.widgets || []).filter((w) => !isChromeWidget(w?.type)),
    }))
    const hasWidgets = columns.some((c) => (c.widgets || []).length > 0)
    if (!hasWidgets) continue
    rows.push({ ...row, columns })
  }
  return { ...L, rows }
}

const INHERITED_HERO_TYPES = new Set([
  'hero_slider',
  'deep_slider',
  'gallery_slider',
])

/** اسلایدرهایی که با «اعمال هدر» از خانه کپی شده‌اند (نه ویجت دستی صفحه). */
function isSyncedHeroWidget(widget) {
  const type = String(widget?.type || '')
  if (!INHERITED_HERO_TYPES.has(type)) return false
  const id = String(widget?.id || '')
  return (
    /_live_/i.test(id) ||
    /^w_mod_/i.test(id) ||
    /_sync_/i.test(id) ||
    /^w_chrome_/i.test(id)
  )
}

/**
 * هیرو/اسلایدر همگام‌شده از خانه را از چیدمان صفحه داخلی برمی‌دارد.
 * ویجت اسلایدری که کاربر خودش در صفحات داخلی گذاشته بماند.
 */
export function stripSyncedHeroWidgets(layout) {
  const L = normalizeHomeLayout(layout)
  const rows = []
  for (const row of L.rows || []) {
    const columns = (row.columns || []).map((col) => ({
      ...col,
      widgets: (col.widgets || []).filter((w) => !isSyncedHeroWidget(w)),
    }))
    const hasWidgets = columns.some((c) => (c.widgets || []).length > 0)
    if (!hasWidgets) continue
    rows.push({ ...row, columns })
  }
  return { ...L, rows }
}

/**
 * چیدمان مشترک صفحات داخلی را فقط از سکشن ۱ خانه می‌سازد.
 */
export function buildSharedInternalLayoutFromHome(homeLayout) {
  return extractHomeSectionOneAsLayout(homeLayout)
}

/**
 * چیدمان مشترک را بالای محتوای صفحه می‌چسباند.
 * کروم تکراری صفحه حذف می‌شود؛ ویجت‌های اختصاصی صفحه می‌مانند.
 */
export function composeInternalPageLayout(
  pageLayout,
  sharedLayout,
  options = {},
) {
  const shared = normalizeSharedInternalLayout(sharedLayout)
  if (!sharedInternalLayoutHasContent(shared)) {
    return normalizeModulePageLayout(pageLayout, options.pageKey)
  }
  const base = stripChromeWidgets(pageLayout)
  let rows = [...(shared.rows || []), ...(base.rows || [])]

  if (!rows.length && options.contentWidget) {
    rows = [
      {
        id: uid('sec_content'),
        template: '1',
        width: 'inherit',
        padding_y: 'none',
        columns: [
          createColumn(100, [
            {
              ...createWidgetInstance(options.contentWidget, {}),
              id: uid('w_content'),
            },
          ]),
        ],
      },
    ]
  }

  rows = rows.map((row) => {
    const widgets = (row.columns || []).flatMap((c) => c.widgets || [])
    if (!widgets.length) return row
    const onlyChrome = widgets.every((w) => isChromeWidget(w?.type))
    if (onlyChrome) return { ...row, width: 'full' }
    if (row.width === 'full') return { ...row, width: 'inherit' }
    return row
  })

  return normalizeHomeLayout({
    ...base,
    page_width: shared.page_width ?? base.page_width,
    max_width: shared.max_width ?? base.max_width,
    gutter: shared.gutter ?? base.gutter,
    rows,
  })
}

/**
 * هدر صفحه اصلی را بالای چیدمان هدف می‌گذارد و ویجت‌های هدر قبلی را عوض می‌کند.
 * عرض صفحه / gutter از خانه همگام می‌شود.
 */
export function applyChromeToLayout(targetLayout, homeLayout, options = {}) {
  const home = normalizeHomeLayout(homeLayout)
  const chromeWidgets = extractChromeWidgets(home)
  const base = stripChromeWidgets(targetLayout)
  const chromeRow = chromeWidgets.length
    ? buildChromeRow(chromeWidgets, options.idPrefix || 'sync')
    : null

  let rows = [...(base.rows || [])]
  if (chromeRow) {
    rows = [chromeRow, ...rows]
  }

  // اگر چیدمان خالی شد و contentWidget داریم، یک ردیف محتوا بساز
  if (!rows.length && options.contentWidget) {
    rows = [
      {
        id: uid('sec_content'),
        template: '1',
        width: 'inherit',
        padding_y: 'none',
        columns: [
          createColumn(100, [
            {
              ...createWidgetInstance(options.contentWidget, {}),
              id: uid('w_content'),
            },
          ]),
        ],
      },
    ]
  }

  // ردیف‌های محتوا نباید full باشند — وگرنه از عرض منو (home-max-width) می‌زنند بیرون
  rows = rows.map((row) => {
    const widgets = (row.columns || []).flatMap((c) => c.widgets || [])
    if (!widgets.length) return row
    const onlyChrome = widgets.every((w) => isChromeWidget(w?.type))
    if (onlyChrome) return { ...row, width: 'full' }
    if (row.width === 'full') return { ...row, width: 'inherit' }
    return row
  })

  return normalizeHomeLayout({
    ...base,
    page_width: home.page_width,
    max_width: home.max_width,
    gutter: home.gutter,
    rows,
  })
}

/**
 * هدف‌های همگام‌سازی یک‌کلیکه از صفحه اصلی.
 */
export function listChromeSyncTargets() {
  const moduleTargets = MODULE_PAGE_DEFS.map((d) => ({
    kind: 'module',
    key: d.key,
    label: d.label,
    path: d.path,
    contentWidget: d.contentWidget,
  }))
  return [
    ...moduleTargets,
    {
      kind: 'shop_list',
      key: 'shop_list',
      label: 'لیست فروشگاه / ویترین',
      path: '/shop',
      contentWidget: null,
    },
    {
      kind: 'product_single',
      key: 'product_single',
      label: 'سینگل محصول',
      path: '/shop/products',
      contentWidget: null,
    },
    {
      kind: 'job_single',
      key: 'job_single',
      label: 'سینگل آگهی',
      path: '/jobs',
      contentWidget: 'job_article',
    },
    {
      kind: 'news_single',
      key: 'news_single',
      label: 'سینگل خبر',
      path: '/news',
      contentWidget: 'news_article',
    },
    {
      kind: 'news_list',
      key: 'news_list',
      label: 'لیست اخبار',
      path: '/news',
      contentWidget: 'news_list_content',
    },
  ]
}

/**
 * روی آبجکت settings ذخیره‌شده، همه چیدمان‌های هدف را با هدر خانه به‌روز می‌کند.
 * خروجی شامل job_single / news_single / news_list هم هست.
 */
export function buildSyncedLayoutsFromHome(settings) {
  const home = normalizeHomeLayout(settings?.home_layout)
  const chromeCount = extractChromeWidgets(home).length
  const moduleMap = {
    ...(settings?.module_page_layouts &&
    typeof settings.module_page_layouts === 'object'
      ? settings.module_page_layouts
      : {}),
  }

  const applied = []

  // یک چیدمان مشترک برای همه صفحات داخلی؛ صفحه اصلی دست‌نخورده می‌ماند
  const shared = buildSharedInternalLayoutFromHome(home)
  moduleMap[SHARED_INTERNAL_LAYOUT_KEY] = shared
  delete moduleMap[SHARED_INTERNAL_LAYOUT_KEY_LEGACY]
  applied.push({
    key: SHARED_INTERNAL_LAYOUT_KEY,
    label: 'چیدمان مشترک صفحات داخلی',
    path: '/adminsettings?tab=pages&page=shared',
  })

  MODULE_PAGE_DEFS.forEach((def) => {
    const prev = normalizeModulePageLayout(moduleMap[def.key], def.key)
    // keepOwnChrome یا صفحات مدرسه (ownChromeWhenSchool): کروم صفحه حفظ شود
    if (def.keepOwnChrome || def.ownChromeWhenSchool) {
      moduleMap[def.key] = stripSyncedHeroWidgets(prev)
    } else {
      // فقط محتوا؛ کروم از shared در زمان اجرا می‌آید
      let contentOnly = stripSyncedHeroWidgets(stripChromeWidgets(prev))
      if (!(contentOnly.rows || []).length) {
        contentOnly = normalizeModulePageLayout(null, def.key)
      }
      moduleMap[def.key] = {
        ...contentOnly,
        page_width: shared.page_width,
        max_width: shared.max_width,
        gutter: shared.gutter,
      }
    }
    applied.push({ key: def.key, label: def.label, path: def.path })
  })

  const shopList = applyChromeToLayout(
    normalizeShopListLayout(settings?.shop_list_layout),
    home,
    { idPrefix: 'shop_list' },
  )
  applied.push({ key: 'shop_list', label: 'لیست فروشگاه', path: '/shop' })

  const productSingle = applyChromeToLayout(
    normalizeProductSingleLayout(settings?.product_single_layout),
    home,
    { idPrefix: 'product_single' },
  )
  applied.push({
    key: 'product_single',
    label: 'سینگل محصول',
    path: '/shop/products',
  })

  const jobSingle = applyChromeToLayout(
    normalizeJobSingleLayout(settings?.job_single_layout),
    home,
    { idPrefix: 'job_single', contentWidget: 'job_article' },
  )
  applied.push({ key: 'job_single', label: 'سینگل آگهی', path: '/jobs' })

  const newsSingle = applyChromeToLayout(
    normalizeNewsSingleLayout(settings?.news_single_layout),
    home,
    { idPrefix: 'news_single', contentWidget: 'news_article' },
  )
  applied.push({ key: 'news_single', label: 'سینگل خبر', path: '/news' })

  const newsList = applyChromeToLayout(
    normalizeNewsListLayout(settings?.news_list_layout),
    home,
    { idPrefix: 'news_list', contentWidget: 'news_list_content' },
  )
  applied.push({ key: 'news_list', label: 'لیست اخبار', path: '/news' })

  return {
    module_page_layouts: moduleMap,
    shop_list_layout: shopList,
    product_single_layout: productSingle,
    job_single_layout: jobSingle,
    news_single_layout: newsSingle,
    news_list_layout: newsList,
    summary: {
      chromeWidgets: chromeCount,
      targets: applied,
      page_width: home.page_width,
      max_width: home.max_width,
      gutter: home.gutter,
    },
  }
}

/**
 * رنگ‌های سینگل آگهی را از کروم خانه حدس می‌زند (هماهنگ با پالت تم).
 */
export function deriveJobSinglePageColorsFromHome(homeLayout) {
  const widgets = extractChromeWidgets(homeLayout)
  const pick = (...keys) => {
    for (const w of widgets) {
      const s = w.settings || {}
      const desk = s.desktop && typeof s.desktop === 'object' ? s.desktop : s
      for (const k of keys) {
        const v = String(desk?.[k] || s?.[k] || '').trim()
        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v)) return v
      }
    }
    return ''
  }
  const ink = pick('color_text', 'color_link', 'color_profile_text') || '#2A1A0E'
  const cream = pick('color_accent', 'color_cart_bg', 'color_drawer_bg') || '#FEF3E2'
  const mid = pick('color_btn_bg', 'color_bg', 'color_menu_icon') || '#F4AE52'
  const accent =
    pick('color_cart_icon', 'color_menu_hover_text') || '#D4621A'
  return {
    ink_color: ink,
    muted_color: '#6B5344',
    accent_color: accent,
    surface_bg: '#FFFFFF',
    _mid: mid,
    _cream: cream,
  }
}

export function describeChromeFromHome(homeLayout) {
  const widgets = extractChromeWidgets(homeLayout)
  return {
    count: widgets.length,
    types: widgets.map((w) => w.type),
  }
}

export { isChromeWidget, isContentWidget, stripChromeWidgets }
