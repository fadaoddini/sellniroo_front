/**
 * هدر / منو / فوتر سراسری — طراحی جدا در adminsettings
 * و انتخاب اختیاری روی هر صفحه (خانه، داخلی، پروفایل).
 */
import { normalizeHomeLayout, createColumn, createWidgetInstance } from '@/config/homeLayout'
import {
  normalizeModulePageLayout,
  normalizeSharedInternalLayout,
  getSharedInternalLayoutRaw,
  sharedInternalLayoutHasContent,
} from '@/config/modulePageLayouts'

export const CHROME_LAYOUT_KEYS = {
  header: 'chrome_header',
  menu: 'chrome_menu',
  footer: 'chrome_footer',
}

export const CHROME_LAYOUT_EVENT = {
  header: 'module-page-layout-changed:chrome_header',
  menu: 'module-page-layout-changed:chrome_menu',
  footer: 'module-page-layout-changed:chrome_footer',
}

/** @typedef {{ header: boolean, menu: boolean, footer: boolean }} PageChromeOpts */

export const DEFAULT_PAGE_CHROME = {
  header: false,
  menu: false,
  footer: false,
}

export function normalizePageChrome(raw) {
  const s = raw && typeof raw === 'object' ? raw : {}
  return {
    header: s.header === true,
    menu: s.menu === true,
    footer: s.footer === true,
  }
}

/** آیا روی این چیدمان مدل جدید (پرچم chrome) فعال است؟ */
export function layoutHasChromeOpts(layout) {
  return !!(layout && layout.chrome && typeof layout.chrome === 'object')
}

export function getPageChrome(layout) {
  if (!layoutHasChromeOpts(layout)) return null
  return normalizePageChrome(layout.chrome)
}

export function withPageChrome(layout, chromePatch) {
  const L = layout && typeof layout === 'object' ? layout : {}
  const prev = normalizePageChrome(L.chrome)
  const patch =
    chromePatch && typeof chromePatch === 'object' ? chromePatch : {}
  return {
    ...L,
    chrome: normalizePageChrome({ ...prev, ...patch }),
  }
}

function uid(prefix = 'chrome') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function cloneRows(rows, idPrefix) {
  const list = Array.isArray(rows) ? rows : []
  return list.map((row, ri) => ({
    ...row,
    id: `${idPrefix}_r${ri}_${uid('sec')}`,
    columns: (row.columns || []).map((col, ci) => ({
      ...col,
      id: `${idPrefix}_c${ri}_${ci}_${uid('col')}`,
      widgets: (col.widgets || []).map((w, wi) => ({
        ...w,
        id: `${idPrefix}_w${ri}_${ci}_${wi}_${uid('w')}`,
      })),
    })),
  }))
}

function layoutHasWidgets(layout) {
  return (layout?.rows || []).some((row) =>
    (row.columns || []).some((col) => (col.widgets || []).length > 0),
  )
}

export function createDefaultChromeLayout(kind = 'header') {
  const idBase = String(kind || 'header').replace(/[^a-z0-9_]/gi, '_')
  return normalizeHomeLayout({
    version: 2,
    page_width: 'full',
    max_width: 1200,
    gutter: 16,
    rows: [
      {
        id: `sec_${idBase}_default`,
        template: '1',
        width: 'full',
        padding_y: 'none',
        columns: [
          {
            id: `col_${idBase}_default`,
            span: 100,
            widgets: [],
          },
        ],
      },
    ],
  })
}

export function isChromeLayoutKey(key) {
  const k = String(key || '')
  return (
    k === CHROME_LAYOUT_KEYS.header ||
    k === CHROME_LAYOUT_KEYS.menu ||
    k === CHROME_LAYOUT_KEYS.footer
  )
}

export function normalizeChromeLayout(raw, kind = 'header') {
  const L = normalizeHomeLayout(raw || {})
  if (!L.rows?.length) return createDefaultChromeLayout(kind)
  return L
}

export function getChromeLayoutFromMap(modulePageLayouts, kind) {
  const key = CHROME_LAYOUT_KEYS[kind]
  if (!key) return createDefaultChromeLayout(kind)
  const root =
    modulePageLayouts && typeof modulePageLayouts === 'object'
      ? modulePageLayouts
      : {}
  return normalizeChromeLayout(root[key], kind)
}

/**
 * اگر هدر/منوی جدید خالی باشد، از چیدمان مشترک قدیمی به‌عنوان منبع موقت استفاده کن.
 */
function resolveChromeRows(settings, kind, enabled) {
  if (!enabled) return []
  const designed = getChromeLayoutFromMap(settings?.module_page_layouts, kind)
  if (layoutHasWidgets(designed)) {
    return cloneRows(designed.rows, kind)
  }
  // فقط برای هدر/منو: fallback به shared قدیمی (یک‌جا)
  if (kind === 'header' || kind === 'menu') {
    const shared = normalizeSharedInternalLayout(
      getSharedInternalLayoutRaw(settings?.module_page_layouts),
    )
    if (kind === 'header' && sharedInternalLayoutHasContent(shared)) {
      // shared کامل را فقط وقتی هر دو هدر و منو با هم خواسته شده‌اند نچسبان؛
      // اگر فقط یکی روشن است و طراحی جدا خالی است، چیزی نشان نده تا کاربر در تب مربوط طراحی کند.
      return []
    }
  }
  return []
}

/** ویجت‌هایی که می‌توانند هدر/منو را روی بک‌گراند خود بنشانند */
const CHROME_OVERLAY_WIDGET_TYPES = new Set([
  'school_hero_breaking',
  'school_landing',
  'school_hero',
])

export function widgetWantsChromeOverHero(widget) {
  const type = String(widget?.type || '')
  if (!CHROME_OVERLAY_WIDGET_TYPES.has(type)) return false
  const s = widget?.settings && typeof widget.settings === 'object'
    ? widget.settings
    : {}
  return s.chrome_over_hero === true || s.overlay_site_chrome === true
}

function findFirstChromeOverlayHeroRow(rows) {
  const list = Array.isArray(rows) ? rows : []
  for (let i = 0; i < list.length; i += 1) {
    const row = list[i]
    for (const col of row?.columns || []) {
      for (const w of col?.widgets || []) {
        if (widgetWantsChromeOverHero(w)) {
          return { index: i, row, widget: w }
        }
      }
    }
  }
  return null
}

/**
 * ظاهر منو/هدر حفظ می‌شود؛ فقط sticky روشن می‌شود تا با اسکرول بالا بمانند.
 * شفاف‌سازی فقط برای لایهٔ زیر (سکشن هیرو) است، نه بک‌گراند خود منو.
 */
function ensureChromeStickyOnHero(settings) {
  const s = settings && typeof settings === 'object' ? { ...settings } : {}
  const withSticky = (vp) => {
    const prev = s[vp] && typeof s[vp] === 'object' ? s[vp] : {}
    return { ...prev, sticky: true }
  }
  return {
    ...s,
    sticky: true,
    desktop: withSticky('desktop'),
    mobile: withSticky('mobile'),
    __chrome_over_hero: true,
  }
}

function markChromeOverlayRows(rows) {
  return (Array.isArray(rows) ? rows : []).map((row) => ({
    ...row,
    chrome_overlay_hero: true,
    padding_y: 'none',
    width: 'full',
    columns: (row.columns || []).map((col) => ({
      ...col,
      widgets: (col.widgets || []).map((w) => ({
        ...w,
        settings: ensureChromeStickyOnHero(w.settings),
      })),
    })),
  }))
}

function markHeroUnderlayRows(contentRows, hit) {
  if (!hit) return contentRows
  return (Array.isArray(contentRows) ? contentRows : []).map((row, i) => {
    if (i !== hit.index) return row
    return {
      ...row,
      chrome_underlay_hero: true,
      padding_y: 'none',
      width: row.width === 'boxed' ? row.width : 'full',
      columns: (row.columns || []).map((col) => ({
        ...col,
        widgets: (col.widgets || []).map((w) => {
          if (!widgetWantsChromeOverHero(w)) return w
          const prev =
            w.settings && typeof w.settings === 'object' ? w.settings : {}
          return {
            ...w,
            settings: {
              ...prev,
              chrome_over_hero: true,
              __chrome_underlay: true,
            },
          }
        }),
      })),
    }
  })
}

/**
 * اگر ویجت معرفی مدرسه (یا مشابه) chrome_over_hero دارد و هدر/منو روشن است،
 * ردیف‌های کروم را برای قرارگیری روی هیرو علامت می‌زند.
 */
function applyChromeOverHeroPack(headerRows, menuRows, contentRows) {
  const wants =
    (headerRows?.length || 0) + (menuRows?.length || 0) > 0 &&
    findFirstChromeOverlayHeroRow(contentRows)
  if (!wants) {
    return {
      headerRows,
      menuRows,
      contentRows,
      overlayActive: false,
    }
  }
  return {
    headerRows: markChromeOverlayRows(headerRows),
    menuRows: markChromeOverlayRows(menuRows),
    contentRows: markHeroUnderlayRows(contentRows, wants),
    overlayActive: true,
  }
}

/**
 * هدر (بالا) → منو → محتوای صفحه → فوتر (پایین)
 */
export function composeWithSiteChrome(pageLayout, settings, options = {}) {
  const pageKey = options.pageKey || 'page'
  const base = normalizeModulePageLayout(pageLayout, pageKey)
  const chrome = getPageChrome(base) || DEFAULT_PAGE_CHROME

  let headerRows = resolveChromeRows(settings, 'header', chrome.header)
  let menuRows = resolveChromeRows(settings, 'menu', chrome.menu)
  const footerRows = resolveChromeRows(settings, 'footer', chrome.footer)

  let contentRows = [...(base.rows || [])]
  if (!contentRows.length && options.contentWidget) {
    contentRows = [
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

  const packed = applyChromeOverHeroPack(headerRows, menuRows, contentRows)
  headerRows = packed.headerRows
  menuRows = packed.menuRows
  contentRows = packed.contentRows

  const rows = [...headerRows, ...menuRows, ...contentRows, ...footerRows]
  return normalizeHomeLayout({
    ...base,
    chrome,
    chrome_over_hero: packed.overlayActive || undefined,
    rows,
  })
}

/** خانه — همان منطق، بدون اجبار contentWidget */
export function composeHomeWithSiteChrome(homeLayout, settings) {
  const base = normalizeHomeLayout(homeLayout || {})
  const chrome = getPageChrome(base)
  if (!chrome) return base
  if (!chrome.header && !chrome.menu && !chrome.footer) return base

  let headerRows = resolveChromeRows(settings, 'header', chrome.header)
  let menuRows = resolveChromeRows(settings, 'menu', chrome.menu)
  const footerRows = resolveChromeRows(settings, 'footer', chrome.footer)
  let contentRows = [...(base.rows || [])]

  const packed = applyChromeOverHeroPack(headerRows, menuRows, contentRows)
  headerRows = packed.headerRows
  menuRows = packed.menuRows
  contentRows = packed.contentRows

  return normalizeHomeLayout({
    ...base,
    chrome,
    chrome_over_hero: packed.overlayActive || undefined,
    rows: [...headerRows, ...menuRows, ...contentRows, ...footerRows],
  })
}
