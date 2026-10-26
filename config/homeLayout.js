// config/homeLayout.js — چیدمان صفحه اصلی (سکشن / ستون / ویجت)
import { templateById } from './sectionTemplates'
import { createDefaultSiteTopNavSettings } from './siteTopNavWidgetSettings'
import { createDefaultPostJobButtonSettings } from './postJobButtonWidgetSettings'
import { createDefaultJobBoardWidgetSettings } from './jobBoardWidgetSettings'

export const PAGE_WIDTH_OPTIONS = [
  {
    id: 'boxed',
    label: 'Container',
    labelFa: 'محدود (Container)',
    desc: 'محتوا داخل کادر با عرض مشخص',
  },
  {
    id: 'full',
    label: 'Fluid',
    labelFa: 'تمام‌عرض (Fluid)',
    desc: 'سکشن‌ها می‌توانند تمام عرض صفحه را بگیرند',
  },
]

export const SECTION_WIDTH_OPTIONS = [
  { id: 'inherit', label: 'پیروی از صفحه' },
  { id: 'boxed', label: 'Container' },
  { id: 'full', label: 'Fluid / تمام‌عرض' },
]

export const SECTION_PADDING_OPTIONS = [
  { id: 'none', label: 'بدون فاصله' },
  { id: 'sm', label: 'کم' },
  { id: 'md', label: 'متوسط' },
  { id: 'lg', label: 'زیاد' },
]

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export function createColumn(span = 100, widgets = []) {
  return {
    id: uid('col'),
    span: clampSpan(span),
    widgets: Array.isArray(widgets) ? widgets : [],
  }
}

export function createWidgetInstance(type, settings = {}) {
  let base = settings && typeof settings === 'object' ? { ...settings } : {}
  if (
    (type === 'site_menu' ||
      type === 'site_top_nav' ||
      type === 'corporate_header') &&
    Object.keys(base).length === 0
  ) {
    base = createDefaultSiteTopNavSettings()
  }
  if (
    (type === 'post_job_button' || type === 'post_job_cta') &&
    Object.keys(base).length === 0
  ) {
    base = createDefaultPostJobButtonSettings()
  }
  // تنظیمات پیش‌فرض ویجت‌های منو
  if (
    ['breaking_news', 'nav_bar', 'hamburger_menu', 'header_menu', 'profile'].includes(
      type
    ) &&
    Object.keys(base).length === 0
  ) {
    base = {
      menu_slug: 'main',
      show_ticker: type === 'breaking_news',
      show_hamburger: true,
      show_menu_items: type === 'header_menu' || type === 'breaking_news' || type === 'nav_bar',
      show_on_mobile: true,
      show_on_desktop: true,
      profile_mode: 'avatar',
      avatar_shape: 'circle',
      guest_visible: true,
      guest_label: 'ورود',
      guest_icon: 'LogIn',
      guest_href: '/login',
      bar_full_bleed: true,
      bar_radius: 0,
      padding_top: 0,
      padding_right: 0,
      padding_bottom: 0,
      padding_left: 0,
      margin_top: 0,
      margin_right: 0,
      margin_bottom: 0,
      margin_left: 0,
      color_bg: '',
      color_text: '',
      color_accent: '',
      color_border: '',
      color_link: '',
      color_menu_hover_bg: '',
      color_menu_hover_text: '',
      color_menu_icon: '',
      color_drawer_bg: '',
      color_profile_bg: 'transparent',
      color_profile_text: '',
      color_avatar_border: '',
      avatar_border_width: 2,
      sheet_ms: 350,
      color_btn_bg: '',
      color_btn_text: '',
    }
    if (type === 'breaking_news') {
      /* دسکتاپ تمام‌عرض؛ موبایل کارت inset با فاصله و گردی */
      base.bar_full_bleed = true
      base.bar_radius = 0
      base.mobile = {
        bar_full_bleed: false,
        bar_radius: 14,
        margin_left: 12,
        margin_right: 12,
        margin_top: 8,
        margin_bottom: 0,
      }
    }
  }
  if (
    (type === 'hero_slider' || type === 'featured_news_slider') &&
    Object.keys(base).length === 0
  ) {
    const desktopDefaults = {
      autoplay: true,
      autoplay_ms: 5000,
      show_arrows: true,
      show_dots: true,
      show_caption: true,
      swipe_drag: true,
      height: 'md',
      full_bleed: true,
      padding_top: 0,
      padding_right: 0,
      padding_bottom: 0,
      padding_left: 0,
      margin_top: 0,
      margin_right: 0,
      margin_bottom: 0,
      margin_left: 0,
      radius_top_left: 0,
      radius_top_right: 0,
      radius_bottom_right: 0,
      radius_bottom_left: 0,
    }
    base = {
      show_on_mobile: true,
      show_on_desktop: true,
      ...desktopDefaults,
      desktop: { ...desktopDefaults },
      /* موبایل: کاملاً جدا — inset با فاصله و گردی */
      mobile: {
        ...desktopDefaults,
        full_bleed: false,
        height: 'sm',
        margin_left: 12,
        margin_right: 12,
        margin_top: 8,
        margin_bottom: 8,
        radius_top_left: 14,
        radius_top_right: 14,
        radius_bottom_right: 14,
        radius_bottom_left: 14,
        show_arrows: false,
        swipe_drag: true,
      },
    }
    if (type === 'featured_news_slider') {
      base.count = 5
      base.offset = 0
    }
  }
  if (
    [
      'job_board_system',
      'job_listings',
      'job_list_only',
      'job_filters_only',
      'job_search_bar',
      'featured_jobs',
      'latest_jobs',
      'hiring_jobs',
      'seeking_jobs',
      'job_categories_grid',
      'verified_companies',
      'public_resumes',
      'job_quick_filters',
      'job_stats_strip',
      'job_header_bar',
      'job_bottom_nav',
    ].includes(type) &&
    Object.keys(base).length === 0
  ) {
    base = createDefaultJobBoardWidgetSettings(type)
  }
  if (type === 'cta_contact' && Object.keys(base).length === 0) {
    base = {
      show_on_mobile: true,
      section_full: true,
      layout: 'info_form',
      max_width: 1120,
      columns_gap: 40,
      show_eyebrow: true,
      show_channels: true,
      show_form: true,
      show_email_field: true,
      show_request_type: true,
      show_bg_grid: true,
      show_bg_orb: true,
      eyebrow_text: '',
      form_title: '',
      form_subtitle: '',
      bg_from: '#0b1220',
      bg_to: '#121c2e',
      bg_accent: 'rgba(59, 130, 246, 0.22)',
      text_color: '#e8eef8',
      muted_color: '#93a4bd',
      title_color: '#f4f8ff',
      accent_color: '#60a5fa',
      accent_deep: '#1d4ed8',
      card_from: '#162033',
      card_to: '#1a2740',
      card_border: 'rgba(148, 180, 220, 0.16)',
      input_bg: 'rgba(8, 14, 26, 0.55)',
      input_border: 'rgba(148, 180, 220, 0.18)',
      button_from: '#3b82f6',
      button_to: '#1d4ed8',
      button_text: '#ffffff',
      channel_bg: 'rgba(22, 32, 51, 0.85)',
      title_size: 28,
      desc_size: 15,
      form_radius: 20,
      input_radius: 12,
      button_radius: 12,
      channel_radius: 14,
      form_padding: 22,
      form_shadow: true,
      padding_top: 76,
      padding_right: 20,
      padding_bottom: 76,
      padding_left: 20,
      margin_top: 0,
      margin_right: 0,
      margin_bottom: 0,
      margin_left: 0,
    }
  }
  if (type === 'news_list' && Object.keys(base).length === 0) {
    base = {
      show_on_mobile: true,
      title: 'مجله',
      show_title: true,
      show_search: true,
      show_categories: true,
      show_stats_bar: false,
      show_total_count: false,
      show_page_info: false,
      show_pagination: true,
      per_page: 12,
      category_slug: '',
      columns: 3,
      card_style: 'classic',
      pagination_style: 'classic',
      pagination_position: 'bottom',
      grid_min: 300,
      card_aspect: '16_9',
      card_radius: 16,
      card_radius_top_left: 16,
      card_radius_top_right: 16,
      card_radius_bottom_left: 16,
      card_radius_bottom_right: 16,
      card_border: true,
      card_border_width: 1,
      card_border_color: 'rgba(90, 60, 20, 0.12)',
      card_shadow: true,
      card_shadow_x: 0,
      card_shadow_y: 6,
      card_shadow_blur: 18,
      card_shadow_spread: 0,
      card_shadow_opacity: 8,
      section_max_width: 1200,
      show_card_image: true,
      show_card_title: true,
      show_card_excerpt: true,
      show_card_date: true,
      show_card_source: true,
      show_read_more: true,
      read_more_text: 'ادامه مطلب…',
      read_more_place: 'flow',
      read_more_align: 'right',
      read_more_as_button: false,
      read_more_color: '#c27800',
      show_likes: false,
      show_share: false,
      share_bale: true,
      share_eitaa: true,
      share_rubika: true,
      share_soroush: true,
      share_color: '#8b939e',
      like_color: '#e25555',
      ink_color: '#2a241c',
      muted_color: '#6f675c',
      surface_bg: '#ffffff',
      accent_color: '#c27800',
      accent_soft: '#fff3c4',
    }
  }
  if (
    [
      'latest_news',
      'news_by_category',
      'featured_news',
      'latest_news_recycler',
    ].includes(type) &&
    Object.keys(base).length === 0
  ) {
    base = {
      show_on_mobile: true,
      count: 5,
      offset: 0,
      category_slug: '',
      font_size: 14,
      font_bold: false,
      font_family: 'iran',
      show_image: true,
      image_size: 44,
      image_shape: 'rounded',
      image_border_width: 0,
      image_border_color: '',
      image_shadow: false,
      text_marker: 'circle_filled',
      text_marker_size: 8,
      text_marker_color: '',
      recycler_overlay_bg: 'transparent',
      recycler_show_gradient: true,
      recycler_card_shadow: false,
      recycler_card_border_width: 1,
      recycler_card_border_color: 'rgba(255, 255, 255, 0.12)',
      recycler_card_border_hover: 'rgba(251, 195, 0, 0.35)',
      recycler_text_color: '#ffffff',
      recycler_height: 280,
      recycler_aspect: '16_9',
      recycler_image_crop: true,
      recycler_text_y: 'bottom',
      recycler_text_x: 'full',
      recycler_visible_desktop: 4,
      recycler_show_arrows: true,
      recycler_autoplay: false,
      recycler_autoplay_ms: 4000,
      recycler_pause_on_hover: true,
      recycler_drag_scroll: true,
      recycler_section_full: true,
      recycler_section_from: '#071a2e',
      recycler_section_to: '#0e3d66',
      recycler_section_angle: 180,
      show_likes: true,
      like_color: '#e74c3c',
      views_color: '#8b939e',
      share_color: '#8b939e',
      stats_layout: 'stack',
      stats_icon_size: 14,
      stats_font_size: 10,
      stats_bg: 'transparent',
      stats_radius: 999,
      stats_gap: 6,
      stats_padding_x: 0,
      stats_padding_y: 0,
      stats_margin_x: 0,
      stats_margin_y: 0,
      show_views: true,
      show_author: false,
      show_lead: false,
      show_read_more: true,
      read_more_text: 'ادامه مطلب…',
      read_more_color: '',
      read_more_hover_color: '',
      read_more_bg: '',
      read_more_hover_bg: '',
      read_more_size: 12,
      read_more_bold: true,
      read_more_as_button: false,
      read_more_align: 'right',
      read_more_place: 'flow',
      read_more_inset: 8,
      read_more_on_hover: false,
      read_more_radius_top_left: 8,
      read_more_radius_top_right: 8,
      read_more_radius_bottom_right: 8,
      read_more_radius_bottom_left: 8,
      show_share: false,
      title_max_chars: 48,
      title_wrap: false,
      item_border: true,
      border_style: 'solid',
      border_width: 1,
      border_color: '',
      hover_bg: '',
      hover_text: '',
      hover_show_lead: true,
      hover_lead_image: true,
      card_bg: '',
      card_radius_top_left: 0,
      card_radius_top_right: 0,
      card_radius_bottom_right: 0,
      card_radius_bottom_left: 0,
      padding_top: 0,
      padding_right: 0,
      padding_bottom: 0,
      padding_left: 0,
      margin_top: 0,
      margin_right: 0,
      margin_bottom: 0,
      margin_left: 0,
    }
    if (type === 'latest_news_recycler') {
      base.stats_layout = 'row'
      base.stats_bg = 'transparent'
      base.stats_padding_x = 0
      base.stats_padding_y = 0
      base.stats_margin_x = 10
      base.stats_margin_y = 10
      base.show_share = true
      base.recycler_visible_desktop = 4
      base.recycler_aspect = '16_9'
      base.recycler_section_full = true
      base.recycler_section_from = '#071a2e'
      base.recycler_section_to = '#0e3d66'
      base.recycler_section_angle = 180
      base.padding_top = 28
      base.padding_bottom = 28
    }
  }
  return {
    id: uid('w'),
    type,
    settings: base,
  }
}

export function createSection(templateId = '1') {
  const tpl = templateById(templateId)
  return {
    id: uid('sec'),
    template: tpl.id,
    width: 'inherit',
    /* پیش‌فرض بدون پدینگ — فاصله فقط اگر در استودیو تنظیم شود */
    padding_y: 'none',
    columns: tpl.spans.map((span) => createColumn(span)),
  }
}

export const DEFAULT_HOME_LAYOUT = {
  version: 2,
  page_width: 'boxed',
  max_width: 1200,
  gutter: 24,
  rows: [],
}

/** چیدمان پیش‌فرض سینگل خبر — فقط صفحه‌ساز (بدون هدر/هیرو قدیمی سایت) */
export const DEFAULT_NEWS_SINGLE_LAYOUT = {
  version: 2,
  page_width: 'boxed',
  max_width: 1200,
  gutter: 16,
  rows: [
    {
      id: 'sec_news_article_default',
      template: '1',
      width: 'inherit',
      padding_y: 'none',
      columns: [
        {
          id: 'col_news_article_default',
          span: 100,
          widgets: [
            {
              id: 'w_news_article_default',
              type: 'news_article',
              settings: {},
            },
          ],
        },
      ],
    },
  ],
}

/**
 * نرمال‌سازی چیدمان سینگل — اگر خالی باشد قالب پیش‌فرض با «محتوای کامل سینگل»
 */
export function normalizeNewsSingleLayout(raw) {
  const L = normalizeHomeLayout(raw)
  if (!L.rows?.length) {
    return normalizeHomeLayout(DEFAULT_NEWS_SINGLE_LAYOUT)
  }
  return L
}

/** چیدمان پیش‌فرض لیست اخبار (/news) — مثل سینگل */
export const DEFAULT_NEWS_LIST_LAYOUT = {
  version: 2,
  page_width: 'boxed',
  max_width: 1200,
  gutter: 16,
  rows: [
    {
      id: 'sec_news_page_default',
      template: '1',
      width: 'inherit',
      padding_y: 'none',
      columns: [
        {
          id: 'col_news_page_default',
          span: 100,
          widgets: [
            {
              id: 'w_news_page_default',
              type: 'news_page',
              settings: {},
            },
          ],
        },
      ],
    },
  ],
}

export function normalizeNewsListLayout(raw) {
  const L = normalizeHomeLayout(raw)
  if (!L.rows?.length) {
    return normalizeHomeLayout(DEFAULT_NEWS_LIST_LAYOUT)
  }
  return L
}

/** چیدمان پیش‌فرض سینگل آگهی — صفحه‌ساز (اپ‌مانند روی موبایل؛ بدون نوار پایین سایت تا با CTA تداخل نکند) */
export const DEFAULT_JOB_SINGLE_LAYOUT = {
  version: 2,
  page_width: 'boxed',
  max_width: 1200,
  gutter: 0,
  rows: [
    {
      id: 'sec_job_article_default',
      template: '1',
      width: 'inherit',
      padding_y: 'none',
      columns: [
        {
          id: 'col_job_article_default',
          span: 100,
          widgets: [
            {
              id: 'w_job_article_default',
              type: 'job_article',
              settings: {},
            },
          ],
        },
      ],
    },
  ],
}

export function normalizeJobSingleLayout(raw) {
  const L = normalizeHomeLayout(raw)
  if (!L.rows?.length) {
    return normalizeHomeLayout(DEFAULT_JOB_SINGLE_LAYOUT)
  }
  return L
}

/** چیدمان پیش‌فرض سینگل محصول */
export const DEFAULT_PRODUCT_SINGLE_LAYOUT = {
  version: 2,
  page_width: 'boxed',
  max_width: 1200,
  gutter: 16,
  rows: [
    {
      id: 'sec_product_article_default',
      template: '1',
      width: 'inherit',
      padding_y: 'none',
      columns: [
        {
          id: 'col_product_article_default',
          span: 100,
          widgets: [
            {
              id: 'w_product_article_default',
              type: 'product_article',
              settings: {},
            },
          ],
        },
      ],
    },
  ],
}

export function normalizeProductSingleLayout(raw) {
  const L = normalizeHomeLayout(raw)
  if (!L.rows?.length) {
    return normalizeHomeLayout(DEFAULT_PRODUCT_SINGLE_LAYOUT)
  }
  return L
}

/** چیدمان پیش‌فرض لیست فروشگاه (/shop) */
export const DEFAULT_SHOP_LIST_LAYOUT = {
  version: 2,
  page_width: 'boxed',
  max_width: 1200,
  gutter: 16,
  rows: [
    {
      id: 'sec_shop_page_default',
      template: '1',
      width: 'inherit',
      padding_y: 'none',
      columns: [
        {
          id: 'col_shop_page_default',
          span: 100,
          widgets: [
            {
              id: 'w_shop_page_default',
              type: 'shop_page',
              settings: {},
            },
          ],
        },
      ],
    },
  ],
}

export function normalizeShopListLayout(raw) {
  const L = normalizeHomeLayout(raw)
  if (!L.rows?.length) {
    return normalizeHomeLayout(DEFAULT_SHOP_LIST_LAYOUT)
  }
  return L
}

function clampSpan(n) {
  const v = Number(n)
  if (!Number.isFinite(v)) return 100
  return Math.max(10, Math.min(100, Math.round(v)))
}

function normalizeColumn(raw) {
  const col = raw && typeof raw === 'object' ? raw : {}
  const widgets = Array.isArray(col.widgets)
    ? col.widgets
        .filter((w) => w && typeof w === 'object' && w.type)
        .map((w) => ({
          id: w.id || uid('w'),
          type: String(w.type),
          settings: w.settings && typeof w.settings === 'object' ? w.settings : {},
        }))
    : []
  return {
    id: col.id || uid('col'),
    span: clampSpan(col.span ?? 100),
    widgets,
  }
}

function normalizeRow(raw) {
  const row = raw && typeof raw === 'object' ? raw : {}
  const tpl = templateById(row.template || '1')
  let columns = Array.isArray(row.columns) ? row.columns.map(normalizeColumn) : []
  if (!columns.length) {
    columns = tpl.spans.map((span) => createColumn(span))
  }
  return {
    id: row.id || uid('sec'),
    template: tpl.id,
    width:
      row.width === 'boxed' || row.width === 'full' || row.width === 'inherit'
        ? row.width
        : 'inherit',
    padding_y: ['none', 'sm', 'md', 'lg'].includes(row.padding_y)
      ? row.padding_y
      : 'none',
    columns,
  }
}

/** نرمال‌سازی home_layout از API — نسخه ۲ با rows */
export function normalizeHomeLayout(raw) {
  const base = raw && typeof raw === 'object' ? { ...raw } : {}
  const page_width = base.page_width === 'full' ? 'full' : 'boxed'
  const mw = Number(base.max_width)
  const max_width = Number.isFinite(mw) && mw >= 640 && mw <= 1920 ? Math.round(mw) : 1200
  const gut = Number(base.gutter)
  const gutter = Number.isFinite(gut) && gut >= 0 && gut <= 64 ? Math.round(gut) : 24

  let rows = []
  if (Array.isArray(base.rows)) {
    rows = base.rows.map(normalizeRow)
  }

  return {
    version: 2,
    page_width,
    max_width,
    gutter,
    rows,
  }
}

export function applyTemplateToSection(section, templateId) {
  const tpl = templateById(templateId)
  const prev = section?.columns || []
  const columns = tpl.spans.map((span, i) => {
    const existing = prev[i]
    if (existing) {
      return { ...existing, span: clampSpan(span) }
    }
    return createColumn(span)
  })
  // ویجت‌های ستون‌های حذف‌شده را به آخرین ستون منتقل کن
  if (prev.length > columns.length) {
    const extra = prev.slice(columns.length).flatMap((c) => c.widgets || [])
    if (extra.length && columns.length) {
      const last = columns[columns.length - 1]
      columns[columns.length - 1] = {
        ...last,
        widgets: [...(last.widgets || []), ...extra],
      }
    }
  }
  return {
    ...section,
    template: tpl.id,
    columns,
  }
}

export function updateColumnSpan(section, columnId, span) {
  return {
    ...section,
    columns: (section.columns || []).map((c) =>
      c.id === columnId ? { ...c, span: clampSpan(span) } : c
    ),
  }
}

export function addWidgetToColumn(section, columnId, type) {
  return {
    ...section,
    columns: (section.columns || []).map((c) =>
      c.id === columnId
        ? { ...c, widgets: [...(c.widgets || []), createWidgetInstance(type)] }
        : c
    ),
  }
}

export function removeWidgetFromColumn(section, columnId, widgetId) {
  return {
    ...section,
    columns: (section.columns || []).map((c) =>
      c.id === columnId
        ? { ...c, widgets: (c.widgets || []).filter((w) => w.id !== widgetId) }
        : c
    ),
  }
}

export function updateWidgetSettings(section, columnId, widgetId, settingsPatch) {
  return {
    ...section,
    columns: (section.columns || []).map((c) => {
      if (c.id !== columnId) return c
      return {
        ...c,
        widgets: (c.widgets || []).map((w) => {
          if (w.id !== widgetId) return w
          const prev =
            w.settings && typeof w.settings === 'object' ? w.settings : {}
          const patch =
            settingsPatch && typeof settingsPatch === 'object'
              ? settingsPatch
              : {}
          const next = { ...prev, ...patch }
          ;['desktop', 'mobile'].forEach((vp) => {
            if (patch[vp] && typeof patch[vp] === 'object') {
              next[vp] = {
                ...(prev[vp] && typeof prev[vp] === 'object' ? prev[vp] : {}),
                ...patch[vp],
              }
            }
          })
          return { ...w, settings: next }
        }),
      }
    }),
  }
}

export function findWidgetInLayout(layout, widgetId) {
  const L = normalizeHomeLayout(layout)
  for (const row of L.rows || []) {
    for (const col of row.columns || []) {
      const w = (col.widgets || []).find((x) => x.id === widgetId)
      if (w) {
        return { section: row, column: col, widget: w }
      }
    }
  }
  return null
}

/** اولین ویجت با type مشخص در چیدمان (مثلاً site_menu) */
export function findFirstWidgetByType(layout, types) {
  const wanted = new Set(Array.isArray(types) ? types : [types])
  const L = normalizeHomeLayout(layout)
  for (const row of L.rows || []) {
    for (const col of row.columns || []) {
      for (const w of col.widgets || []) {
        if (wanted.has(w?.type)) return w
      }
    }
  }
  return null
}

/** همه ویجت‌های یک type در چیدمان */
export function findAllWidgetsByType(layout, types) {
  const wanted = new Set(Array.isArray(types) ? types : [types])
  const L = normalizeHomeLayout(layout)
  const out = []
  for (const row of L.rows || []) {
    for (const col of row.columns || []) {
      for (const w of col.widgets || []) {
        if (wanted.has(w?.type)) {
          out.push({
            sectionId: row.id,
            columnId: col.id,
            widget: w,
          })
        }
      }
    }
  }
  return out
}

/** اعمال پچ تنظیمات روی همه ویجت‌های یک type */
export function patchAllWidgetsByType(layout, types, settingsPatch) {
  const wanted = new Set(Array.isArray(types) ? types : [types])
  const L = normalizeHomeLayout(layout)
  return {
    ...L,
    rows: (L.rows || []).map((row) => ({
      ...row,
      columns: (row.columns || []).map((col) => ({
        ...col,
        widgets: (col.widgets || []).map((w) => {
          if (!wanted.has(w?.type)) return w
          const prev =
            w.settings && typeof w.settings === 'object' ? w.settings : {}
          const patch =
            settingsPatch && typeof settingsPatch === 'object'
              ? settingsPatch
              : {}
          return { ...w, settings: { ...prev, ...patch } }
        }),
      })),
    })),
  }
}

export function moveWidgetInColumn(section, columnId, fromIndex, toIndex) {
  return {
    ...section,
    columns: (section.columns || []).map((c) => {
      if (c.id !== columnId) return c
      const list = [...(c.widgets || [])]
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= list.length ||
        toIndex >= list.length
      ) {
        return c
      }
      const [item] = list.splice(fromIndex, 1)
      list.splice(toIndex, 0, item)
      return { ...c, widgets: list }
    }),
  }
}

/**
 * جابه‌جایی ویجت بین ستون‌ها / سکشن‌ها
 * @param {object} layout
 * @param {{ fromSectionId: string, fromColumnId: string, widgetId: string, toSectionId: string, toColumnId: string, toIndex?: number }} move
 */
export function moveWidgetInLayout(layout, move) {
  const {
    fromSectionId,
    fromColumnId,
    widgetId,
    toSectionId,
    toColumnId,
    toIndex,
  } = move || {}
  if (
    !fromSectionId ||
    !fromColumnId ||
    !widgetId ||
    !toSectionId ||
    !toColumnId
  ) {
    return normalizeHomeLayout(layout)
  }

  const L = normalizeHomeLayout(layout)
  let moved = null

  const without = {
    ...L,
    rows: L.rows.map((row) => {
      if (row.id !== fromSectionId) return row
      return {
        ...row,
        columns: (row.columns || []).map((col) => {
          if (col.id !== fromColumnId) return col
          const widgets = [...(col.widgets || [])]
          const idx = widgets.findIndex((w) => w.id === widgetId)
          if (idx < 0) return col
          ;[moved] = widgets.splice(idx, 1)
          return { ...col, widgets }
        }),
      }
    }),
  }

  if (!moved) return L

  // مثل arrayMove در dnd-kit: بعد از حذف، insertAt را روی آرایهٔ جدید clamp می‌کنیم
  let insertAt =
    typeof toIndex === 'number' && Number.isFinite(toIndex)
      ? toIndex
      : Number.POSITIVE_INFINITY

  return {
    ...without,
    rows: without.rows.map((row) => {
      if (row.id !== toSectionId) return row
      return {
        ...row,
        columns: (row.columns || []).map((col) => {
          if (col.id !== toColumnId) return col
          const widgets = [...(col.widgets || [])]
          const at = Math.max(0, Math.min(insertAt, widgets.length))
          widgets.splice(at, 0, moved)
          return { ...col, widgets }
        }),
      }
    }),
  }
}

// سازگاری با کدهای قدیمی که getSectionLayout می‌خواندند
export const DEFAULT_SECTION_LAYOUT = {
  width: 'inherit',
  padding_y: 'none',
}

export function getSectionLayout() {
  return { ...DEFAULT_SECTION_LAYOUT }
}

export function setSectionLayout(layout) {
  return normalizeHomeLayout(layout)
}

export function resolveSectionWidth(layout, _widgetId) {
  const L = normalizeHomeLayout(layout)
  return L.page_width
}
