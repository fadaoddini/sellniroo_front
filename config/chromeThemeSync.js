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
  normalizeModulePageLayout,
  isModulePageContentWidget,
} from '@/config/modulePageLayouts'
import {
  isHeroWithMenuWidgetType,
  resolveHeroWithMenuChromeBreakingSettings,
} from '@/config/heroWithMenuSettings'

/** ویجت‌های هدر/نوار که رنگ و ظاهر را حمل می‌کنند */
export const CHROME_HEADER_TYPES = new Set([
  'breaking_news',
  'hero_slider',
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

/**
 * اگر خبر فوری داخل هیرو باشگاه/مدرسه embed شده باشد، برای صفحات داخلی
 * یک ویجت breaking_news جامد هم‌تم می‌سازد تا پروفایل با خانه هماهنگ بماند.
 */
function synthesizeEmbeddedChrome(homeLayout) {
  const L = normalizeHomeLayout(homeLayout)
  for (const row of L.rows || []) {
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
          (type === 'school_landing' || type === 'school_hero_breaking') &&
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
  }
  return []
}

/**
 * ویجت‌های هدر را به ترتیب ظاهر در صفحه اصلی برمی‌گرداند.
 */
export function extractChromeWidgets(homeLayout) {
  const L = normalizeHomeLayout(homeLayout)
  const out = []
  for (const row of L.rows || []) {
    for (const col of row.columns || []) {
      for (const w of col.widgets || []) {
        if (!isChromeWidget(w?.type)) continue
        out.push({
          type: w.type,
          settings: cloneSettings(w.settings),
        })
      }
    }
  }
  if (out.length) return out
  return synthesizeEmbeddedChrome(L)
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

  MODULE_PAGE_DEFS.forEach((def) => {
    const prev = normalizeModulePageLayout(moduleMap[def.key], def.key)
    moduleMap[def.key] = applyChromeToLayout(prev, home, {
      idPrefix: def.key,
      contentWidget: def.contentWidget,
    })
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

export { isChromeWidget, isContentWidget }
