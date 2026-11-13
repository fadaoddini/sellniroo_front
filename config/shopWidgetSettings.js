// config/shopWidgetSettings.js — تنظیمات ویجت‌های طبقه فروشگاه

/** حالت‌های نمایش سبد / ویترین محصولات */
export const SHOP_DISPLAY_MODES = [
  { id: 'list', label: 'لیست' },
  { id: 'recycler', label: 'ریسایکلر' },
  { id: 'card', label: 'کارت' },
  { id: 'grid-2', label: 'دو ستونه' },
  { id: 'grid-3', label: 'سه ستونه' },
  { id: 'grid-4', label: 'چهار ستونه' },
  { id: 'stories', label: 'استوری' },
]

export const SHOP_SPACE_FIELDS = [
  { key: 'padding_top', label: 'بالا' },
  { key: 'padding_right', label: 'راست' },
  { key: 'padding_bottom', label: 'پایین' },
  { key: 'padding_left', label: 'چپ' },
]

export const SHOP_MARGIN_FIELDS = [
  { key: 'margin_top', label: 'بالا' },
  { key: 'margin_right', label: 'راست' },
  { key: 'margin_bottom', label: 'پایین' },
  { key: 'margin_left', label: 'چپ' },
]

export const SHOP_CARD_STYLES = [
  { id: 'soft', label: 'نرم' },
  { id: 'outline', label: 'خط‌دار' },
  { id: 'elevated', label: 'سایه‌دار' },
  { id: 'minimal', label: 'مینیمال' },
]

export const SHOP_HOVER_EFFECTS = [
  { id: 'fill', label: 'پر شدن پس‌زمینه' },
  { id: 'scale', label: 'بزرگ‌نمایی' },
  { id: 'lift', label: 'بالا آمدن + سایه' },
  { id: 'glow', label: 'درخشش اکسنت' },
  { id: 'border', label: 'برجسته‌شدن حاشیه' },
  { id: 'none', label: 'بدون هاور' },
]

export const SHOP_IMAGE_SHAPES = [
  { id: 'circle', label: 'دایره' },
  { id: 'rounded', label: 'مربع گرد' },
  { id: 'square', label: 'مربع تیز' },
]

export const SHOP_IMAGE_PLACEMENTS = [
  { id: 'top', label: 'بالا' },
  { id: 'start', label: 'شروع (راست در RTL)' },
  { id: 'end', label: 'پایان (چپ در RTL)' },
]

export const SHOP_CTA_STYLES = [
  { id: 'outline', label: 'خط‌دار' },
  { id: 'solid', label: 'توپر' },
  { id: 'icon', label: 'فقط آیکون' },
  { id: 'text', label: 'متنی' },
]

export const SHOP_ACTIONS_ZONES = [
  { id: 'bottom', label: 'پایین کارت' },
  { id: 'under_price', label: 'زیر قیمت' },
  { id: 'overlay', label: 'روی تصویر' },
]

export const SHOP_ACTIONS_ALIGNS = [
  { id: 'stretch', label: 'تمام‌عرض' },
  { id: 'start', label: 'راست / شروع' },
  { id: 'center', label: 'وسط' },
  { id: 'end', label: 'چپ / پایان' },
  { id: 'between', label: 'دو طرفه' },
]

export const SHOP_DISCOUNT_ZONES = [
  { id: 'actions', label: 'کنار دکمه‌ها' },
  { id: 'badge', label: 'نشان روی تصویر' },
  { id: 'near_price', label: 'کنار قیمت' },
]

export const SHOP_RATING_STYLES = [
  { id: 'icon_number', label: 'آیکون + عدد' },
  { id: 'stars', label: 'ستاره‌ها' },
  { id: 'stars_number', label: 'ستاره + عدد' },
  { id: 'number', label: 'فقط عدد' },
  { id: 'badge', label: 'نشان (بج)' },
  { id: 'text', label: 'متنی (از ۵)' },
]

export const SHOP_RATING_ZONES = [
  { id: 'under_title', label: 'زیر عنوان' },
  { id: 'under_lid', label: 'زیر توضیح کوتاه' },
  { id: 'under_meta', label: 'زیر نام فروشگاه' },
  { id: 'near_price', label: 'کنار قیمت' },
  { id: 'above_actions', label: 'بالای دکمه‌ها' },
  { id: 'image', label: 'روی تصویر' },
  { id: 'card', label: 'گوشه کارت' },
]

export const SHOP_RATING_ALIGNS = [
  { id: 'start', label: 'راست / شروع' },
  { id: 'center', label: 'وسط' },
  { id: 'end', label: 'چپ / پایان' },
]

export const SHOP_RATING_CORNERS = [
  { id: 'top_start', label: 'بالا راست' },
  { id: 'top_center', label: 'بالا وسط' },
  { id: 'top_end', label: 'بالا چپ' },
  { id: 'middle_start', label: 'وسط راست' },
  { id: 'middle_center', label: 'وسط وسط' },
  { id: 'middle_end', label: 'وسط چپ' },
  { id: 'bottom_start', label: 'پایین راست' },
  { id: 'bottom_center', label: 'پایین وسط' },
  { id: 'bottom_end', label: 'پایین چپ' },
]

export const SHOP_RECYCLER_ARROW_STYLES = [
  { id: 'circle', label: 'دایره' },
  { id: 'square', label: 'مربع' },
  { id: 'pill', label: 'کپسولی' },
  { id: 'ghost', label: 'شفاف' },
]

export const SHOP_RECYCLER_ARROW_ICONS = [
  { id: 'chevron', label: 'شورون' },
  { id: 'arrow', label: 'فلش' },
  { id: 'chevrons', label: 'دوشورون' },
]

export const SHOP_RECYCLER_ARROW_PLACES = [
  { id: 'outside', label: 'خارج از محدوده کارت‌ها' },
  { id: 'overlay', label: 'روی کارت‌ها' },
  { id: 'head', label: 'کنار عنوان' },
]

export const SHOP_RECYCLER_ARROW_RADIUS_CORNERS = [
  { key: 'recycler_arrow_radius_tl', label: 'بالا چپ' },
  { key: 'recycler_arrow_radius_tr', label: 'بالا راست' },
  { key: 'recycler_arrow_radius_br', label: 'پایین راست' },
  { key: 'recycler_arrow_radius_bl', label: 'پایین چپ' },
]

export const SHOP_RECYCLER_ARROW_SPACE_FIELDS = [
  { key: 'recycler_arrow_pad_t', label: 'پدینگ بالا' },
  { key: 'recycler_arrow_pad_r', label: 'پدینگ راست' },
  { key: 'recycler_arrow_pad_b', label: 'پدینگ پایین' },
  { key: 'recycler_arrow_pad_l', label: 'پدینگ چپ' },
  { key: 'recycler_arrow_mar_t', label: 'مارجین بالا' },
  { key: 'recycler_arrow_mar_r', label: 'مارجین راست' },
  { key: 'recycler_arrow_mar_b', label: 'مارجین پایین' },
  { key: 'recycler_arrow_mar_l', label: 'مارجین چپ' },
]

export const SHOP_HEAD_TITLE_WEIGHTS = [
  { id: '400', label: 'عادی' },
  { id: '500', label: 'متوسط' },
  { id: '700', label: 'ضخیم' },
  { id: '800', label: 'خیلی ضخیم' },
]

export const SHOP_HEAD_TITLE_ALIGNS = [
  { id: 'start', label: 'راست' },
  { id: 'center', label: 'وسط' },
  { id: 'end', label: 'چپ' },
  { id: 'between', label: 'عنوان و لینک دو طرف' },
]

export const SHOP_FONTS = [
  {
    id: 'iran',
    label: 'ایران',
    css: "var(--font-iran, 'iran', Tahoma, sans-serif)",
  },
  {
    id: 'iran_bold',
    label: 'ایران بولد',
    css: "var(--font-iran-bold, 'iran_bold', Tahoma, sans-serif)",
  },
  {
    id: 'iran_extra',
    label: 'ایران اکسترا',
    css: "var(--font-iran-extra, 'iran_extra', Tahoma, sans-serif)",
  },
  {
    id: 'iran_thin',
    label: 'ایران تین',
    css: "var(--font-iran-thin, 'iran_thin', Tahoma, sans-serif)",
  },
  {
    id: 'edameh',
    label: 'ادامه',
    css: "var(--font-edameh, 'edameh', Tahoma, sans-serif)",
  },
  {
    id: 'tahoma',
    label: 'تاهوما',
    css: 'Tahoma, Arial, sans-serif',
  },
]

export function shopFontCss(id) {
  return SHOP_FONTS.find((f) => f.id === id)?.css || SHOP_FONTS[0].css
}

/** رنگ‌ها گروه‌بندی‌شده برای تب رنگ */
export const SHOP_COLOR_GROUPS = [
  {
    id: 'section',
    label: 'بخش',
    keys: ['accent_color', 'ink_color', 'hover_fill'],
  },
  {
    id: 'card',
    label: 'کارت',
    keys: ['card_bg', 'title_color', 'lid_color', 'price_color', 'price_old_color'],
  },
  {
    id: 'badge',
    label: 'تخفیف و امتیاز',
    keys: ['discount_bg', 'discount_text', 'rating_color'],
  },
  {
    id: 'actions',
    label: 'دکمه‌ها',
    keys: ['btn_bg', 'btn_text', 'btn_border', 'like_color'],
  },
]

export const SHOP_SETTINGS_TABS = [
  { id: 'general', label: 'کلی' },
  { id: 'title', label: 'عنوان' },
  // اسکلتون‌ها همیشه دیده شوند؛ انتخاب هر اسکلتون display_mode را به recycler می‌برد
  { id: 'recycler', label: 'ریسایکلر' },
  { id: 'card', label: 'کارت' },
  { id: 'image', label: 'تصویر' },
  { id: 'content', label: 'عناصر' },
  { id: 'buttons', label: 'دکمه‌ها' },
  { id: 'colors', label: 'رنگ‌ها' },
  { id: 'layout', label: 'فاصله' },
]

export const SHOP_IMAGE_OVERFLOWS = [
  { id: 'none', label: 'بدون بیرون‌زدگی' },
  { id: 'half_top', label: 'نصف تصویر از بالا بیرون' },
]

export const SHOP_SURFACE_MODES = [
  { id: 'transparent', label: 'شفاف' },
  { id: 'color', label: 'رنگی' },
]

export const SHOP_SURFACE_SPANS = [
  { id: 'full', label: 'تمام عرض صفحه' },
  { id: 'container', label: 'فقط کانتینر' },
]

function r4(prefix, n) {
  return {
    [`${prefix}`]: n,
    [`${prefix}_tl`]: n,
    [`${prefix}_tr`]: n,
    [`${prefix}_br`]: n,
    [`${prefix}_bl`]: n,
  }
}

/**
 * اسکلتون‌های آماده ریسایکلر — با اعمال، تنظیمات کارت/تصویر/فلش ست می‌شود
 */
export const SHOP_RECYCLER_PRESETS = [
  {
    id: 'rebo_style',
    label: 'ربواستایل',
    desc: 'فلش کنار عنوان، کارت نرم، تصویر گوشه‌گرد، دکمه سبز',
    skeleton: 'rebo',
    patch: {
      recycler_preset: 'rebo_style',
      display_mode: 'recycler',
      use_demo_data: false,
      show_title: true,
      recycler_card_width: 168,
      gap: 20,
      card_style: 'soft',
      hover_effect: 'fill',
      hover_fill: '#f5f5f5',
      accent_color: '#36ab6e',
      ...r4('card_radius', 10),
      show_image: true,
      image_shape: 'rounded',
      image_placement: 'top',
      image_size: 80,
      image_ratio: '1_1',
      image_overflow: 'none',
      image_radius: 12,
      image_radius_tl: 12,
      image_radius_tr: 12,
      image_radius_br: 12,
      image_radius_bl: 12,
      show_product_title: true,
      show_lid: true,
      lid_color: '#d1d1d1',
      show_price: true,
      show_discount: true,
      discount_bg: '#d1d1d1',
      discount_zone: 'badge',
      show_shop: true,
      show_rating: true,
      rating_style: 'badge',
      rating_zone: 'image',
      rating_align: 'start',
      rating_corner: 'top_end',
      show_add_button: true,
      show_like: false,
      like_color: '#ee496a',
      cta_style: 'solid',
      actions_zone: 'bottom',
      actions_align: 'center',
      btn_bg: '#36ab6e',
      btn_text: '#ffffff',
      btn_border: '#d1d1d1',
      btn_height: 30,
      btn_pad_x: 14,
      btn_font_size: 10,
      btn_radius: 7,
      btn_radius_tl: 7,
      btn_radius_tr: 7,
      btn_radius_br: 7,
      btn_radius_bl: 7,
      more_link_color: '#fab700',
      recycler_show_arrows: true,
      recycler_arrow_place: 'head',
      recycler_arrow_style: 'square',
      recycler_arrow_icon: 'arrow',
      recycler_arrow_match_height: true,
      recycler_arrow_size: 36,
      recycler_arrow_gap: 10,
      recycler_arrow_bg: '#e0b415',
      recycler_arrow_color: '#ffffff',
      recycler_arrow_border: '#ffffff',
      recycler_arrow_radius: 10,
      recycler_arrow_radius_tl: 10,
      recycler_arrow_radius_tr: 10,
      recycler_arrow_radius_br: 10,
      recycler_arrow_radius_bl: 10,
      recycler_show_scrollbar: false,
    },
  },
  {
    id: 'classic',
    label: 'کلاسیک دایره‌ای',
    desc: 'تصویر گرد بالای کارت، هاور پرشونده',
    skeleton: 'classic',
    patch: {
      recycler_preset: 'classic',
      display_mode: 'recycler',
      recycler_card_width: 168,
      gap: 16,
      card_style: 'soft',
      hover_effect: 'fill',
      ...r4('card_radius', 28),
      show_image: true,
      image_shape: 'circle',
      image_placement: 'top',
      image_size: 110,
      image_ratio: '1_1',
      image_overflow: 'none',
      ...r4('image_radius', 999),
      show_product_title: true,
      show_lid: true,
      show_price: true,
      show_discount: true,
      show_shop: false,
      show_rating: true,
      rating_style: 'icon_number',
      rating_zone: 'under_meta',
      rating_align: 'center',
      discount_zone: 'actions',
      show_add_button: true,
      show_like: false,
      cta_style: 'outline',
      actions_zone: 'bottom',
      actions_align: 'between',
      btn_height: 30,
      ...r4('btn_radius', 25),
      recycler_show_arrows: true,
      recycler_arrow_place: 'outside',
      recycler_arrow_style: 'circle',
      recycler_arrow_match_height: false,
      recycler_arrow_size: 36,
      ...r4('recycler_arrow_radius', 999),
      recycler_show_scrollbar: false,
    },
  },
  {
    id: 'float_out',
    label: 'تصویر شناور',
    desc: 'نصف تصویر از بالای کارت بیرون زده',
    skeleton: 'float',
    patch: {
      recycler_preset: 'float_out',
      display_mode: 'recycler',
      recycler_card_width: 180,
      gap: 20,
      card_style: 'elevated',
      hover_effect: 'lift',
      ...r4('card_radius', 24),
      show_image: true,
      image_shape: 'circle',
      image_placement: 'top',
      image_size: 120,
      image_ratio: '1_1',
      image_overflow: 'half_top',
      ...r4('image_radius', 999),
      show_product_title: true,
      show_lid: false,
      show_price: true,
      show_discount: true,
      show_shop: false,
      show_rating: true,
      rating_style: 'badge',
      rating_zone: 'near_price',
      discount_zone: 'near_price',
      show_add_button: true,
      show_like: true,
      cta_style: 'solid',
      actions_zone: 'bottom',
      actions_align: 'stretch',
      btn_height: 34,
      ...r4('btn_radius', 999),
      recycler_show_arrows: true,
      recycler_arrow_place: 'outside',
      recycler_arrow_style: 'circle',
      recycler_arrow_match_height: false,
      recycler_arrow_size: 40,
      ...r4('recycler_arrow_radius', 999),
      recycler_show_scrollbar: false,
    },
  },
  {
    id: 'media_cover',
    label: 'کاور تصویری',
    desc: 'تصویر افقی تمام‌عرض بالای کارت',
    skeleton: 'cover',
    patch: {
      recycler_preset: 'media_cover',
      display_mode: 'recycler',
      recycler_card_width: 220,
      gap: 14,
      card_style: 'outline',
      hover_effect: 'scale',
      ...r4('card_radius', 18),
      show_image: true,
      image_shape: 'rounded',
      image_placement: 'top',
      image_size: 160,
      image_ratio: '4_3',
      image_overflow: 'none',
      ...r4('image_radius', 14),
      show_product_title: true,
      show_lid: false,
      show_price: true,
      show_discount: true,
      show_shop: true,
      show_rating: true,
      rating_style: 'stars_number',
      rating_zone: 'under_title',
      rating_align: 'start',
      discount_zone: 'badge',
      show_add_button: true,
      show_like: false,
      cta_style: 'outline',
      actions_zone: 'bottom',
      actions_align: 'stretch',
      btn_height: 36,
      ...r4('btn_radius', 12),
      recycler_show_arrows: true,
      recycler_arrow_place: 'outside',
      recycler_arrow_style: 'square',
      recycler_arrow_match_height: true,
      recycler_arrow_size: 40,
      ...r4('recycler_arrow_radius', 12),
      recycler_show_scrollbar: false,
    },
  },
  {
    id: 'side_row',
    label: 'افقی فشرده طلایی',
    desc: 'تصویر کنار متن، کارت پهن، اکسنت طلایی — مثل محصولات مشابه',
    skeleton: 'side',
    patch: {
      recycler_preset: 'side_row',
      display_mode: 'recycler',
      use_demo_data: false,
      show_title: true,
      show_more_link: true,
      accent_color: '#B38C00',
      more_link_color: '#B38C00',
      btn_bg: '#B38C00',
      btn_text: '#ffffff',
      btn_border: '#dbbe00',
      lid_color: '#dbbe00',
      discount_bg: '#B38C00',
      like_color: '#B38C00',
      hover_fill: '#FFF9E8',
      recycler_card_width: 260,
      gap: 12,
      card_style: 'soft',
      hover_effect: 'glow',
      ...r4('card_radius', 20),
      show_image: true,
      image_shape: 'rounded',
      image_placement: 'start',
      image_size: 88,
      image_ratio: '1_1',
      image_overflow: 'none',
      ...r4('image_radius', 16),
      show_product_title: true,
      show_lid: true,
      show_price: true,
      show_discount: true,
      show_shop: false,
      show_rating: false,
      discount_zone: 'near_price',
      show_add_button: true,
      show_like: false,
      cta_style: 'icon',
      actions_zone: 'bottom',
      actions_align: 'end',
      btn_height: 32,
      ...r4('btn_radius', 999),
      recycler_show_arrows: true,
      recycler_arrow_place: 'overlay',
      recycler_arrow_style: 'ghost',
      recycler_arrow_match_height: false,
      recycler_arrow_size: 34,
      ...r4('recycler_arrow_radius', 999),
      recycler_show_scrollbar: false,
      recycler_arrow_bg: '#dbbe00',
      recycler_arrow_color: '#1c1c1e',
      recycler_arrow_border: '#ffffff',
    },
  },
]

/** پچ اسکلتون افقی فشرده طلایی — مشترک با پیش‌فرض محصولات مشابه */
export function getShopSideRowGoldPatch() {
  return { ...(getShopRecyclerPreset('side_row')?.patch || {}) }
}

export function getShopRecyclerPreset(id) {
  return SHOP_RECYCLER_PRESETS.find((p) => p.id === id) || null
}

/** رنگ‌های قابل تنظیم کارت محصول */
export const SHOP_COLOR_FIELDS = [
  { key: 'accent_color', label: 'اکسنت', fallback: '#ff00a6' },
  { key: 'card_bg', label: 'پس‌زمینه کارت', fallback: '#ffffff' },
  { key: 'title_color', label: 'عنوان محصول', fallback: '#3f3f3f' },
  { key: 'lid_color', label: 'توضیح کوتاه', fallback: '#ff00a6' },
  { key: 'price_color', label: 'قیمت', fallback: '#3f3f3f' },
  { key: 'price_old_color', label: 'قیمت قبلی', fallback: '#ffba59' },
  { key: 'discount_bg', label: 'پس‌زمینه تخفیف', fallback: '#ff00a6' },
  { key: 'discount_text', label: 'متن تخفیف', fallback: '#ffffff' },
  { key: 'btn_bg', label: 'پس‌زمینه دکمه', fallback: '#ffffff' },
  { key: 'btn_text', label: 'متن دکمه', fallback: '#ff00a6' },
  { key: 'btn_border', label: 'حاشیه دکمه', fallback: '#ff00a6' },
  { key: 'like_color', label: 'لایک', fallback: '#ff00a6' },
  { key: 'rating_color', label: 'امتیاز / ستاره', fallback: '#f5a623' },
  { key: 'hover_fill', label: 'پرشدن هاور', fallback: '#e6e6e6' },
  { key: 'ink_color', label: 'متن بخش', fallback: '#3f3f3f' },
]

export const SHOP_CARD_RADIUS_CORNERS = [
  { key: 'card_radius_tl', label: 'بالا چپ' },
  { key: 'card_radius_tr', label: 'بالا راست' },
  { key: 'card_radius_br', label: 'پایین راست' },
  { key: 'card_radius_bl', label: 'پایین چپ' },
]

export const SHOP_IMAGE_RADIUS_CORNERS = [
  { key: 'image_radius_tl', label: 'بالا چپ' },
  { key: 'image_radius_tr', label: 'بالا راست' },
  { key: 'image_radius_br', label: 'پایین راست' },
  { key: 'image_radius_bl', label: 'پایین چپ' },
]

export const SHOP_BTN_RADIUS_CORNERS = [
  { key: 'btn_radius_tl', label: 'بالا چپ' },
  { key: 'btn_radius_tr', label: 'بالا راست' },
  { key: 'btn_radius_br', label: 'پایین راست' },
  { key: 'btn_radius_bl', label: 'پایین چپ' },
]

export const SHOP_IMAGE_RATIOS = [
  { id: '1_1', label: 'مربع ۱:۱', css: '1 / 1' },
  { id: '4_3', label: 'افقی ۴:۳', css: '4 / 3' },
  { id: '3_4', label: 'عمودی ۳:۴', css: '3 / 4' },
  { id: '16_9', label: 'افقی ۱۶:۹', css: '16 / 9' },
]

export const SHOP_SEARCH_STYLES = [
  { id: 'soft', label: 'نرم' },
  { id: 'outline', label: 'خط‌دار' },
  { id: 'minimal', label: 'مینیمال' },
  { id: 'pill', label: 'کپسولی' },
]

export const SHOP_SEARCH_SUBMIT_MODES = [
  { id: 'label', label: 'متن' },
  { id: 'icon', label: 'آیکون' },
  { id: 'both', label: 'هر دو' },
  { id: 'hidden', label: 'مخفی' },
]

export const SHOP_SEARCH_DEVICES = [
  { id: 'desktop', label: 'دسکتاپ' },
  { id: 'mobile', label: 'موبایل / اپ' },
]

export const SHOP_SEARCH_RADIUS_CORNERS = [
  { key: 'bar_radius_tl', label: 'بالا چپ' },
  { key: 'bar_radius_tr', label: 'بالا راست' },
  { key: 'bar_radius_br', label: 'پایین راست' },
  { key: 'bar_radius_bl', label: 'پایین چپ' },
]

/** کلیدهای جدا برای دسکتاپ / موبایل */
export const SHOP_SEARCH_VIEWPORT_KEYS = [
  'section_full',
  'sticky',
  'sticky_offset',
  'blur',
  'shadow',
  'border_width',
  'bar_height',
  'bar_radius',
  'bar_radius_tl',
  'bar_radius_tr',
  'bar_radius_br',
  'bar_radius_bl',
  'font_size',
  'max_width',
  'show_icon',
  'search_style',
  'submit_mode',
  'submit_label',
  'placeholder',
  'hint',
  'surface_bg',
  'border_color',
  'accent_color',
  'ink_color',
  'placeholder_color',
  'button_text',
  ...SHOP_SPACE_FIELDS.map((f) => f.key),
  ...SHOP_MARGIN_FIELDS.map((f) => f.key),
]

export const SHOP_SEARCH_SHARED_ROOT_KEYS = new Set([
  'show_on_mobile',
  'show_on_desktop',
  'results_href',
])

export const DEFAULT_SHOP_SEARCH_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: false,
  sticky: false,
  sticky_offset: 0,
  blur: 0,
  shadow: true,
  border_width: 1,
  placeholder: 'جستجوی محصول، برند، دسته…',
  hint: '',
  submit_label: 'جستجو',
  submit_mode: 'label',
  results_href: '/shop',
  show_icon: true,
  search_style: 'pill',
  bar_radius: 999,
  bar_radius_tl: 999,
  bar_radius_tr: 999,
  bar_radius_br: 999,
  bar_radius_bl: 999,
  bar_height: 48,
  font_size: 14,
  max_width: 1200,
  surface_bg: '#ffffff',
  border_color: 'rgba(15, 23, 42, 0.1)',
  accent_color: '#0f766e',
  ink_color: '#0f172a',
  placeholder_color: '#94a3b8',
  button_text: '#ffffff',
  padding_top: 8,
  padding_right: 16,
  padding_bottom: 8,
  padding_left: 16,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
}

/** پیش‌فرض موبایل هنگام ساخت ویجت */
export const DEFAULT_SHOP_SEARCH_MOBILE = {
  section_full: false,
  sticky: false,
  sticky_offset: 0,
  blur: 0,
  shadow: true,
  border_width: 1,
  bar_height: 46,
  bar_radius: 18,
  bar_radius_tl: 18,
  bar_radius_tr: 18,
  bar_radius_br: 18,
  bar_radius_bl: 18,
  font_size: 14,
  max_width: 1200,
  search_style: 'pill',
  show_icon: true,
  submit_mode: 'label',
  submit_label: 'جستجو',
  placeholder: 'جستجوی محصول، برند، دسته…',
  hint: '',
  surface_bg: '#ffffff',
  border_color: 'rgba(15, 23, 42, 0.1)',
  accent_color: '#0f766e',
  ink_color: '#0f172a',
  placeholder_color: '#94a3b8',
  button_text: '#ffffff',
  padding_top: 8,
  padding_right: 12,
  padding_bottom: 8,
  padding_left: 12,
  margin_top: 0,
  margin_right: 12,
  margin_bottom: 0,
  margin_left: 12,
}

/** همهٔ ویجت‌های فروشگاه با پنل تنظیمات */
export const SHOP_WIDGET_TYPES = new Set([
  'product_article',
  'product_similar',
  'shop_page',
  'featured_products',
  'latest_products',
  'bestsellers_products',
  'discounted_products',
  'products_recycler',
  'products_grid',
  'products_by_category',
  'product_stories',
  'shop_categories',
  'shop_search_bar',
])

export const SHOP_PRODUCT_STRIP_TYPES = new Set([
  'featured_products',
  'latest_products',
  'bestsellers_products',
  'discounted_products',
  'products_recycler',
  'products_grid',
  'products_by_category',
  'product_similar',
])

export const DEFAULT_SHOP_WIDGET_SETTINGS = {
  show_on_mobile: true,
  show_on_desktop: true,
  section_full: false,
  use_demo_data: false,
  show_title: true,
  show_more_link: true,
  more_href: '/shop',
  more_label: 'همه',
  title_text: '',
  limit: 8,
  offset: 0,
  display_mode: 'card',
  columns: 2,
  card_style: 'soft',
  hover_effect: 'fill',
  card_radius: 35,
  card_radius_tl: 35,
  card_radius_tr: 35,
  card_radius_br: 35,
  card_radius_bl: 35,
  image_ratio: '1_1',
  image_shape: 'circle',
  image_placement: 'top',
  image_size: 110,
  image_overflow: 'none',
  image_radius: 999,
  image_radius_tl: 999,
  image_radius_tr: 999,
  image_radius_br: 999,
  image_radius_bl: 999,
  show_image: true,
  show_product_title: true,
  show_lid: true,
  show_price: true,
  show_discount: true,
  show_shop: true,
  show_rating: true,
  rating_style: 'icon_number',
  rating_zone: 'under_meta',
  rating_align: 'center',
  rating_corner: 'top_end',
  show_add_button: true,
  show_like: false,
  cta_style: 'outline',
  actions_zone: 'bottom',
  actions_align: 'between',
  btn_height: 30,
  btn_pad_x: 15,
  btn_font_size: 12,
  btn_min_width: 0,
  btn_radius: 25,
  btn_radius_tl: 25,
  btn_radius_tr: 25,
  btn_radius_br: 25,
  btn_radius_bl: 25,
  discount_zone: 'actions',
  category_id: '',
  category_title: '',
  max_width: 1140,
  gap: 20,
  recycler_card_width: 168,
  recycler_preset: '',
  recycler_show_scrollbar: false,
  recycler_show_arrows: true,
  recycler_arrow_style: 'circle',
  recycler_arrow_icon: 'chevron',
  recycler_arrow_place: 'outside',
  recycler_arrow_gap: 10,
  recycler_arrow_match_height: false,
  recycler_arrow_size: 36,
  recycler_arrow_radius: 999,
  recycler_arrow_radius_tl: 999,
  recycler_arrow_radius_tr: 999,
  recycler_arrow_radius_br: 999,
  recycler_arrow_radius_bl: 999,
  recycler_arrow_pad_t: 0,
  recycler_arrow_pad_r: 0,
  recycler_arrow_pad_b: 0,
  recycler_arrow_pad_l: 0,
  recycler_arrow_mar_t: 0,
  recycler_arrow_mar_r: 0,
  recycler_arrow_mar_b: 0,
  recycler_arrow_mar_l: 0,
  recycler_arrow_bg: '#ffffff',
  recycler_arrow_color: '#3f3f3f',
  recycler_arrow_border: '#dbdbdb',
  head_title_size: 18,
  head_title_weight: '400',
  head_title_color: '#3f3f3f',
  head_title_align: 'between',
  head_title_font: 'edameh',
  product_title_font: 'iran',
  btn_font: 'iran',
  more_link_color: '#ff00a6',
  more_link_size: 14,
  story_size: 70,
  padding_top: 8,
  padding_right: 0,
  padding_bottom: 8,
  padding_left: 0,
  margin_top: 0,
  margin_right: 0,
  margin_bottom: 0,
  margin_left: 0,
  ink_color: '',
  accent_color: '#ff00a6',
  surface_mode: 'transparent',
  surface_bg: '#f5f5f5',
  surface_span: 'full',
  card_bg: '#ffffff',
  title_color: '#3f3f3f',
  lid_color: '#ff00a6',
  price_color: '#3f3f3f',
  price_old_color: '#ffba59',
  discount_bg: '#ff00a6',
  discount_text: '#ffffff',
  btn_bg: '#ffffff',
  btn_text: '#ff00a6',
  btn_border: '#ff00a6',
  like_color: '#ff00a6',
  rating_color: '#f5a623',
  hover_fill: '#e6e6e6',
}

function pxNum(v, fallback = 0, max = 240) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(0, Math.min(max, Math.round(n)))
}

function bool(raw, key, d) {
  return raw && Object.prototype.hasOwnProperty.call(raw, key) ? !!raw[key] : d[key]
}

/** نگاشت نوع ویجت → منبع داده / UI */
export function getShopWidgetVariant(type) {
  switch (type) {
    case 'featured_products':
      return {
        kind: 'strip',
        source: 'featured',
        gate: 'shop_listings',
        title: 'محصولات ویژه',
        defaultMode: 'card',
      }
    case 'latest_products':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'جدیدترین محصولات',
        defaultMode: 'recycler',
        defaultImageShape: 'rounded',
        defaultImageOverflow: 'half_top',
      }
    case 'bestsellers_products':
      return {
        kind: 'strip',
        source: 'bestsellers',
        gate: 'shop_listings',
        title: 'پرفروش‌ترین‌ها',
        defaultMode: 'grid-2',
      }
    case 'discounted_products':
      return {
        kind: 'strip',
        source: 'discounted',
        gate: 'shop_listings',
        title: 'محصولات تخفیف‌دار',
        defaultMode: 'card',
      }
    case 'products_recycler':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'ویترین افقی',
        defaultMode: 'recycler',
      }
    case 'products_grid':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'گرید محصولات',
        defaultMode: 'grid-3',
      }
    case 'products_by_category':
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'محصولات دسته',
        defaultMode: 'grid-2',
      }
    case 'product_stories':
      return {
        kind: 'stories',
        source: 'stories',
        gate: 'shop_listings',
        title: 'استوری محصولات',
        defaultMode: 'stories',
      }
    case 'shop_categories':
      return { kind: 'categories', gate: 'shop_listings', title: 'دسته‌های فروشگاه' }
    case 'shop_search_bar':
      return { kind: 'search', gate: 'shop' }
    case 'product_article':
      return { kind: 'article', gate: 'shop_product' }
    case 'product_similar':
      return {
        kind: 'strip',
        source: 'similar',
        gate: 'shop',
        title: 'محصولات مشابه',
        defaultMode: 'recycler',
      }
    case 'shop_page':
      return { kind: 'page', gate: 'shop' }
    default:
      return {
        kind: 'strip',
        source: 'latest',
        gate: 'shop_listings',
        title: 'محصولات',
        defaultMode: 'card',
      }
  }
}

export function isShopWidgetType(type) {
  return SHOP_WIDGET_TYPES.has(type)
}

export function normalizeShopWidgetSettings(raw = {}, type = 'featured_products') {
  const d = DEFAULT_SHOP_WIDGET_SETTINGS
  const s = { ...d, ...(raw || {}) }
  const variant = getShopWidgetVariant(type)

  s.show_on_mobile = bool(raw, 'show_on_mobile', d)
  s.show_on_desktop = bool(raw, 'show_on_desktop', d)
  s.section_full = bool(raw, 'section_full', d)
  s.use_demo_data = bool(raw, 'use_demo_data', d)
  s.show_title = bool(raw, 'show_title', d)
  s.show_more_link = bool(raw, 'show_more_link', d)
  s.show_image = bool(raw, 'show_image', d)
  s.show_product_title = bool(raw, 'show_product_title', d)
  s.show_lid = bool(raw, 'show_lid', d)
  s.show_price = bool(raw, 'show_price', d)
  s.show_discount = bool(raw, 'show_discount', d)
  s.show_shop = bool(raw, 'show_shop', d)
  s.show_rating = bool(raw, 'show_rating', d)
  s.show_add_button = bool(raw, 'show_add_button', d)
  s.show_like = bool(raw, 'show_like', d)
  s.recycler_show_scrollbar = bool(raw, 'recycler_show_scrollbar', d)
  s.recycler_show_arrows = bool(raw, 'recycler_show_arrows', d)
  s.recycler_arrow_match_height = bool(raw, 'recycler_arrow_match_height', d)

  s.more_href = String(s.more_href || d.more_href)
  s.more_label = String(s.more_label || d.more_label)
  s.title_text = String(s.title_text || '')
  s.category_id = String(s.category_id || '')
  s.category_title = String(s.category_title || '')
  SHOP_COLOR_FIELDS.forEach(({ key, fallback }) => {
    const v = s[key]
    // surface_bg جدا نرمال می‌شود
    if (key === 'surface_bg') return
    s[key] = v == null || v === '' ? (key === 'ink_color' ? '' : (d[key] || fallback)) : String(v)
  })
  // سازگاری قدیمی: اگر surface_mode نبود و surface_bg خالی بود → شفاف
  if (!SHOP_SURFACE_MODES.some((m) => m.id === s.surface_mode)) {
    if (raw?.surface_mode == null && raw?.surface_bg) {
      s.surface_mode = 'color'
    } else if (raw?.surface_mode == null && (raw?.surface_bg == null || raw?.surface_bg === '')) {
      s.surface_mode = d.surface_mode
    } else {
      s.surface_mode = d.surface_mode
    }
  }
  if (!SHOP_SURFACE_SPANS.some((m) => m.id === s.surface_span)) {
    s.surface_span = d.surface_span
  }
  s.surface_bg = String(
    s.surface_bg == null || s.surface_bg === ''
      ? d.surface_bg
      : s.surface_bg,
  )
  // سازگاری: اگر رنگ دکمه خالی بود از اکسنت پر شود
  if (!s.btn_text) s.btn_text = s.accent_color || d.btn_text
  if (!s.btn_border) s.btn_border = s.accent_color || d.btn_border
  if (!s.lid_color) s.lid_color = s.accent_color || d.lid_color
  if (!s.discount_bg) s.discount_bg = s.accent_color || d.discount_bg
  if (!s.like_color) s.like_color = s.accent_color || d.like_color

  s.limit = pxNum(s.limit, d.limit, 48)
  s.offset = pxNum(s.offset, d.offset, 100)
  s.columns = pxNum(s.columns, d.columns, 4)
  s.max_width = pxNum(s.max_width, d.max_width, 1600)
  s.gap = pxNum(s.gap, d.gap, 48)
  s.recycler_card_width = pxNum(s.recycler_card_width, d.recycler_card_width, 320)
  s.recycler_arrow_size = pxNum(s.recycler_arrow_size, d.recycler_arrow_size, 72)
  s.recycler_arrow_radius = pxNum(s.recycler_arrow_radius, d.recycler_arrow_radius, 999)
  SHOP_RECYCLER_ARROW_RADIUS_CORNERS.forEach(({ key }) => {
    const fallback =
      raw?.[key] == null && raw?.recycler_arrow_radius != null
        ? s.recycler_arrow_radius
        : d[key]
    s[key] = pxNum(s[key], fallback, 999)
  })
  SHOP_RECYCLER_ARROW_SPACE_FIELDS.forEach(({ key }) => {
    s[key] = pxNum(s[key], d[key], 80)
  })
  s.head_title_size = pxNum(s.head_title_size, d.head_title_size, 48)
  s.more_link_size = pxNum(s.more_link_size, d.more_link_size, 32)
  s.story_size = pxNum(s.story_size, d.story_size, 140)
  s.recycler_arrow_bg = String(s.recycler_arrow_bg || d.recycler_arrow_bg)
  s.recycler_arrow_color = String(s.recycler_arrow_color || d.recycler_arrow_color)
  s.recycler_arrow_border = String(s.recycler_arrow_border || d.recycler_arrow_border)
  s.head_title_color = String(s.head_title_color || d.head_title_color)
  s.more_link_color = String(s.more_link_color || s.accent_color || d.more_link_color)
  s.image_size = pxNum(s.image_size, d.image_size, 240)
  s.card_radius = pxNum(s.card_radius, d.card_radius, 80)
  s.image_radius = pxNum(s.image_radius, d.image_radius, 999)
  s.btn_height = pxNum(s.btn_height, d.btn_height, 80)
  s.btn_pad_x = pxNum(s.btn_pad_x, d.btn_pad_x, 80)
  s.btn_font_size = pxNum(s.btn_font_size, d.btn_font_size, 32)
  s.btn_min_width = pxNum(s.btn_min_width, d.btn_min_width, 320)
  s.btn_radius = pxNum(s.btn_radius, d.btn_radius, 999)

  SHOP_SPACE_FIELDS.concat(SHOP_MARGIN_FIELDS).forEach(({ key }) => {
    s[key] = pxNum(s[key], d[key], 240)
  })
  SHOP_CARD_RADIUS_CORNERS.forEach(({ key }) => {
    const fallback = raw?.[key] == null && raw?.card_radius != null ? s.card_radius : d[key]
    s[key] = pxNum(s[key], fallback, 80)
  })
  SHOP_IMAGE_RADIUS_CORNERS.forEach(({ key }) => {
    const fallback = raw?.[key] == null && raw?.image_radius != null ? s.image_radius : d[key]
    s[key] = pxNum(s[key], fallback, 999)
  })
  SHOP_BTN_RADIUS_CORNERS.forEach(({ key }) => {
    const fallback = raw?.[key] == null && raw?.btn_radius != null ? s.btn_radius : d[key]
    s[key] = pxNum(s[key], fallback, 999)
  })

  const modes = new Set(SHOP_DISPLAY_MODES.map((m) => m.id))
  if (!modes.has(s.display_mode)) {
    s.display_mode = variant.defaultMode || d.display_mode
  }
  // ویجت‌های تخصصی حالت پیش‌فرض خود را دارند مگر کاربر عوض کرده باشد
  if (type === 'products_recycler' && !(raw && raw.display_mode)) {
    s.display_mode = 'recycler'
  }
  // جدیدترین محصولات: مربع گوشه‌نرم + نصف بیرون‌زده از بالای کارت
  if (type === 'latest_products') {
    if (raw?._keep_image_style !== true) {
      s.image_shape = 'rounded'
      s.image_placement = 'top'
      s.image_ratio = '1_1'
      s.image_size = Math.max(96, Number(s.image_size) || 112)
      s.image_radius = 18
      s.image_radius_tl = 18
      s.image_radius_tr = 18
      s.image_radius_br = 18
      s.image_radius_bl = 18
    }
    // بیرون‌زدگی را همیشه اعمال کن مگر کاربر صریحاً «بدون بیرون‌زدگی» گذاشته باشد
    if (raw?.image_overflow !== 'none') {
      s.image_overflow = 'half_top'
    }
    // ارتفاع سکشن: فاصله بیشتر از پایین کارت‌ها
    if (
      raw?.padding_bottom == null ||
      Number(raw.padding_bottom) <= 8
    ) {
      s.padding_bottom = 28
    }
    if (raw?.padding_top == null || Number(raw.padding_top) <= 8) {
      s.padding_top = 16
    }
  }
  // محصولات مشابه همیشه ریسایکلر افقی (کارت تصویرکنارمتن)
  if (type === 'product_similar') {
    s.display_mode = 'recycler'
  }
  if (type === 'product_stories' && !(raw && raw.display_mode)) {
    s.display_mode = 'stories'
  }
  // پیش‌فرض زیبا برای مشابه: همان اسکلتون افقی فشرده طلایی
  if (type === 'product_similar') {
    const sideDefaults = {
      ...getShopSideRowGoldPatch(),
      title_text: 'محصولات مشابه',
      limit: 8,
      show_more_link: false,
      show_title: true,
    }
    Object.keys(sideDefaults).forEach((key) => {
      const hasRaw = raw && Object.prototype.hasOwnProperty.call(raw, key)
      // keys قدیمی/بی‌ربط گرید را نادیده بگیر و پیش‌فرض افقی بگذار
      if (!hasRaw || key === 'columns' || key === 'display_mode') {
        s[key] = sideDefaults[key]
      }
    })
    // اگر فقط تنظیمات قدیمی columns بوده، کامل افقی اعمال شود
    if (raw && Object.keys(raw).every((k) => ['columns', 'limit', 'title_text', 'show_title', 'show_on_mobile', 'show_on_desktop'].includes(k))) {
      Object.assign(s, sideDefaults, {
        limit: pxNum(raw.limit, sideDefaults.limit, 48),
        title_text: String(raw.title_text || sideDefaults.title_text),
        show_title:
          raw.show_title == null ? true : !!raw.show_title,
        show_on_mobile:
          raw.show_on_mobile == null ? true : !!raw.show_on_mobile,
        show_on_desktop:
          raw.show_on_desktop == null ? true : !!raw.show_on_desktop,
        display_mode: 'recycler',
      })
    }
  }
  if (type === 'products_grid' && !(raw && raw.display_mode)) {
    s.display_mode = 'grid-3'
  }

  if (!SHOP_CARD_STYLES.some((c) => c.id === s.card_style)) {
    s.card_style = d.card_style
  }
  if (!SHOP_HOVER_EFFECTS.some((c) => c.id === s.hover_effect)) {
    s.hover_effect = d.hover_effect
  }
  if (!SHOP_IMAGE_RATIOS.some((c) => c.id === s.image_ratio)) {
    s.image_ratio = d.image_ratio
  }
  if (!SHOP_IMAGE_SHAPES.some((c) => c.id === s.image_shape)) {
    s.image_shape = d.image_shape
  }
  // همگام‌سازی شعاع با شکل — اگر از دایره به مربع عوض شود ولی radius=999 بماند، هنوز دایره دیده می‌شود
  if (s.image_shape === 'circle') {
    s.image_radius = 999
    s.image_radius_tl = 999
    s.image_radius_tr = 999
    s.image_radius_br = 999
    s.image_radius_bl = 999
  } else if (s.image_shape === 'square') {
    s.image_radius = 0
    s.image_radius_tl = 0
    s.image_radius_tr = 0
    s.image_radius_br = 0
    s.image_radius_bl = 0
  } else if (s.image_shape === 'rounded') {
    const tooRound = (n) => Number(n) >= 100
    if (
      tooRound(s.image_radius) ||
      tooRound(s.image_radius_tl) ||
      tooRound(s.image_radius_tr) ||
      tooRound(s.image_radius_br) ||
      tooRound(s.image_radius_bl)
    ) {
      s.image_radius = 12
      s.image_radius_tl = 12
      s.image_radius_tr = 12
      s.image_radius_br = 12
      s.image_radius_bl = 12
    }
  }
  if (!SHOP_IMAGE_PLACEMENTS.some((c) => c.id === s.image_placement)) {
    s.image_placement = d.image_placement
  }
  if (!SHOP_IMAGE_OVERFLOWS.some((c) => c.id === s.image_overflow)) {
    s.image_overflow = d.image_overflow
  }
  s.recycler_preset = String(s.recycler_preset || '')
  if (s.recycler_preset && !SHOP_RECYCLER_PRESETS.some((p) => p.id === s.recycler_preset)) {
    s.recycler_preset = ''
  }
  if (!SHOP_CTA_STYLES.some((c) => c.id === s.cta_style)) {
    s.cta_style = d.cta_style
  }
  if (!SHOP_ACTIONS_ZONES.some((c) => c.id === s.actions_zone)) {
    s.actions_zone = d.actions_zone
  }
  if (!SHOP_ACTIONS_ALIGNS.some((c) => c.id === s.actions_align)) {
    s.actions_align = d.actions_align
  }
  if (!SHOP_DISCOUNT_ZONES.some((c) => c.id === s.discount_zone)) {
    s.discount_zone = d.discount_zone
  }
  if (!SHOP_RATING_STYLES.some((c) => c.id === s.rating_style)) {
    s.rating_style = d.rating_style
  }
  if (!SHOP_RATING_ZONES.some((c) => c.id === s.rating_zone)) {
    s.rating_zone = d.rating_zone
  }
  if (!SHOP_RATING_ALIGNS.some((c) => c.id === s.rating_align)) {
    s.rating_align = d.rating_align
  }
  if (!SHOP_RATING_CORNERS.some((c) => c.id === s.rating_corner)) {
    s.rating_corner = d.rating_corner
  }
  if (!SHOP_RECYCLER_ARROW_STYLES.some((c) => c.id === s.recycler_arrow_style)) {
    s.recycler_arrow_style = d.recycler_arrow_style
  }
  if (!SHOP_RECYCLER_ARROW_ICONS.some((c) => c.id === s.recycler_arrow_icon)) {
    s.recycler_arrow_icon = d.recycler_arrow_icon
  }
  // sides → overlay (سازگاری با تنظیمات قدیمی)
  if (s.recycler_arrow_place === 'sides') {
    s.recycler_arrow_place = 'overlay'
  }
  if (!SHOP_RECYCLER_ARROW_PLACES.some((c) => c.id === s.recycler_arrow_place)) {
    s.recycler_arrow_place = d.recycler_arrow_place
  }
  s.recycler_arrow_gap = pxNum(s.recycler_arrow_gap, d.recycler_arrow_gap, 48)
  if (!SHOP_HEAD_TITLE_WEIGHTS.some((c) => c.id === String(s.head_title_weight))) {
    s.head_title_weight = d.head_title_weight
  } else {
    s.head_title_weight = String(s.head_title_weight)
  }
  if (!SHOP_HEAD_TITLE_ALIGNS.some((c) => c.id === s.head_title_align)) {
    s.head_title_align = d.head_title_align
  }
  if (!SHOP_FONTS.some((c) => c.id === s.head_title_font)) {
    s.head_title_font = d.head_title_font
  }
  if (!SHOP_FONTS.some((c) => c.id === s.product_title_font)) {
    s.product_title_font = d.product_title_font
  }
  if (!SHOP_FONTS.some((c) => c.id === s.btn_font)) {
    s.btn_font = d.btn_font
  }

  if (!s.title_text && variant.title) {
    s._default_title = variant.title
  }

  if (type === 'shop_search_bar') {
    return normalizeShopSearchSettings(raw)
  }

  return s
}

function pickShopSearchViewportSlice(obj = {}) {
  const out = {}
  SHOP_SEARCH_VIEWPORT_KEYS.forEach((k) => {
    if (obj[k] !== undefined) out[k] = obj[k]
  })
  return out
}

export function mergeShopSearchViewportRaw(raw = {}, viewport = 'desktop') {
  const root = raw && typeof raw === 'object' ? raw : {}
  const flat = pickShopSearchViewportSlice(root)
  const desktopOv =
    root.desktop && typeof root.desktop === 'object' ? root.desktop : {}
  const mobileOv =
    root.mobile && typeof root.mobile === 'object' ? root.mobile : {}
  const desktop = { ...flat, ...desktopOv }
  if (viewport === 'mobile') {
    if (Object.keys(mobileOv).length > 0) return { ...flat, ...mobileOv }
    return desktop
  }
  return desktop
}

function coerceShopSearchSettings(merged, rawRoot = {}) {
  const d = DEFAULT_SHOP_SEARCH_SETTINGS
  const s = { ...d, ...merged }

  s.show_on_mobile =
    rawRoot.show_on_mobile === undefined ? true : !!rawRoot.show_on_mobile
  s.show_on_desktop =
    rawRoot.show_on_desktop === undefined ? true : !!rawRoot.show_on_desktop
  s.results_href =
    String((rawRoot.results_href ?? s.results_href) || '/shop').trim() ||
    '/shop'

  s.section_full = merged.section_full === undefined ? !!d.section_full : !!merged.section_full
  s.sticky = merged.sticky === undefined ? !!d.sticky : !!merged.sticky
  s.shadow = merged.shadow === undefined ? !!d.shadow : !!merged.shadow
  s.show_icon = merged.show_icon === undefined ? !!d.show_icon : !!merged.show_icon

  ;['placeholder', 'hint', 'submit_label'].forEach((k) => {
    s[k] = String(merged[k] !== undefined ? merged[k] : d[k] ?? '').trim()
    if (k === 'submit_label' && !s[k]) s[k] = d.submit_label
    if (k === 'placeholder' && !s[k]) s[k] = d.placeholder
  })

  ;[
    'surface_bg',
    'border_color',
    'accent_color',
    'ink_color',
    'placeholder_color',
    'button_text',
  ].forEach((k) => {
    const v = String(merged[k] !== undefined ? merged[k] : d[k] ?? '').trim()
    s[k] = v || d[k]
  })

  if (!SHOP_SEARCH_STYLES.some((x) => x.id === s.search_style)) {
    s.search_style = d.search_style
  }
  if (!SHOP_SEARCH_SUBMIT_MODES.some((x) => x.id === s.submit_mode)) {
    s.submit_mode = d.submit_mode
  }

  s.sticky_offset = Math.min(120, pxNum(s.sticky_offset, d.sticky_offset, 120))
  s.blur = Math.min(40, pxNum(s.blur, d.blur, 40))
  s.border_width = Math.min(8, pxNum(s.border_width, d.border_width, 8))
  s.bar_height = Math.max(
    28,
    Math.min(120, pxNum(s.bar_height, d.bar_height, 120))
  )
  s.font_size = Math.max(
    10,
    Math.min(22, pxNum(s.font_size, d.font_size, 22))
  )
  s.max_width = Math.max(
    240,
    Math.min(1400, pxNum(s.max_width, d.max_width, 1400))
  )
  s.bar_radius = pxNum(s.bar_radius, d.bar_radius, 999)
  ;['bar_radius_tl', 'bar_radius_tr', 'bar_radius_br', 'bar_radius_bl'].forEach(
    (k) => {
      const hasOwn =
        merged[k] !== undefined && merged[k] !== null && merged[k] !== ''
      s[k] = pxNum(hasOwn ? merged[k] : s.bar_radius, s.bar_radius, 999)
    }
  )

  SHOP_SPACE_FIELDS.concat(SHOP_MARGIN_FIELDS).forEach(({ key }) => {
    s[key] = pxNum(s[key], d[key], 240)
  })

  return s
}

/**
 * @param {object} raw
 * @param {{ viewport?: 'desktop'|'mobile' }} [opts]
 */
export function normalizeShopSearchSettings(raw = {}, opts = {}) {
  const viewport = opts.viewport === 'mobile' ? 'mobile' : 'desktop'
  const root = raw && typeof raw === 'object' ? raw : {}
  const merged = mergeShopSearchViewportRaw(root, viewport)
  return coerceShopSearchSettings(merged, root)
}

export function getShopSearchVisibilityFlags(raw = {}) {
  const root = raw && typeof raw === 'object' ? raw : {}
  return {
    show_on_mobile:
      root.show_on_mobile === undefined ? true : !!root.show_on_mobile,
    show_on_desktop:
      root.show_on_desktop === undefined ? true : !!root.show_on_desktop,
  }
}

export function snapshotShopSearchViewportSettings(raw = {}, viewport = 'desktop') {
  return pickShopSearchViewportSlice(
    normalizeShopSearchSettings(raw, { viewport })
  )
}

export function buildShopSearchViewportPatch(raw, device, key, value) {
  if (SHOP_SEARCH_SHARED_ROOT_KEYS.has(key)) {
    return { [key]: value }
  }
  const root = raw && typeof raw === 'object' ? raw : {}
  const vp = device === 'mobile' ? 'mobile' : 'desktop'
  const current = snapshotShopSearchViewportSettings(root, vp)
  return { [vp]: { ...current, [key]: value } }
}

export function createDefaultShopSearchSettings() {
  const desktop = pickShopSearchViewportSlice(DEFAULT_SHOP_SEARCH_SETTINGS)
  return {
    show_on_mobile: true,
    show_on_desktop: true,
    results_href: '/shop',
    ...desktop,
    desktop: { ...desktop },
    mobile: { ...DEFAULT_SHOP_SEARCH_MOBILE },
  }
}

export function shopSearchCssVars(settings, opts = {}) {
  const s = normalizeShopSearchSettings(settings || {}, opts)
  const fullBleed = !!s.section_full
  const r = (v) => (v >= 40 ? '999px' : `${v}px`)
  return {
    '--shop-pad-t': `${s.padding_top}px`,
    '--shop-pad-r': `${s.padding_right}px`,
    '--shop-pad-b': `${s.padding_bottom}px`,
    '--shop-pad-l': `${s.padding_left}px`,
    '--shop-mar-t': `${s.margin_top}px`,
    '--shop-mar-r': fullBleed ? '0px' : `${s.margin_right}px`,
    '--shop-mar-b': `${s.margin_bottom}px`,
    '--shop-mar-l': fullBleed ? '0px' : `${s.margin_left}px`,
    // اگر عرض سفارشی نزدیک عرض صفحه است، به عرض منو قفل شود
    '--shop-max':
      !s.max_width || s.max_width >= 1000
        ? 'var(--home-max-width, 1200px)'
        : `${s.max_width}px`,
    '--ss-h': `${s.bar_height}px`,
    '--ss-height': `${s.bar_height}px`,
    '--ss-sticky-top': s.sticky ? `${s.sticky_offset}px` : 'auto',
    '--ss-blur': `${s.blur}px`,
    '--ss-bw': `${s.border_width}px`,
    '--ss-fs': `${s.font_size}px`,
    '--ss-shadow': s.shadow ? '0 8px 22px rgba(15, 23, 42, 0.05)' : 'none',
    '--ss-radius': r(s.bar_radius),
    '--ss-rtl': r(s.bar_radius_tl),
    '--ss-rtr': r(s.bar_radius_tr),
    '--ss-rbr': r(s.bar_radius_br),
    '--ss-rbl': r(s.bar_radius_bl),
    '--ss-surface': s.surface_bg || '#ffffff',
    '--ss-border': s.border_color || 'rgba(15,23,42,0.1)',
    '--ss-accent': s.accent_color || '#0f766e',
    '--ss-ink': s.ink_color || '#0f172a',
    '--ss-ph': s.placeholder_color || '#94a3b8',
    '--ss-btn-text': s.button_text || '#ffffff',
  }
}

export function shopWidgetCssVars(settings) {
  const s = normalizeShopWidgetSettings(settings || {})
  const ratio = SHOP_IMAGE_RATIOS.find((r) => r.id === s.image_ratio)
  const imgRadii =
    s.image_shape === 'circle'
      ? '50%'
      : s.image_shape === 'square'
        ? '0'
        : `${Math.min(48, s.image_radius_tl)}px ${Math.min(48, s.image_radius_tr)}px ${Math.min(48, s.image_radius_br)}px ${Math.min(48, s.image_radius_bl)}px`
  return {
    '--shop-pad-t': `${s.padding_top || 0}px`,
    '--shop-pad-r': `${s.padding_right || 0}px`,
    '--shop-pad-b': `${s.padding_bottom || 0}px`,
    '--shop-pad-l': `${s.padding_left || 0}px`,
    '--shop-mar-t': `${s.margin_top || 0}px`,
    '--shop-mar-r': `${s.margin_right || 0}px`,
    '--shop-mar-b': `${s.margin_bottom || 0}px`,
    '--shop-mar-l': `${s.margin_left || 0}px`,
    '--shop-gap': `${s.gap || 12}px`,
    '--shop-max': s.max_width ? `${s.max_width}px` : '1140px',
    '--shop-accent': s.accent_color || '#ff00a6',
    '--shop-success-light': s.accent_color || '#ff00a6',
    '--shop-ink': s.ink_color || 'inherit',
    '--shop-surface':
      s.surface_mode === 'color' ? s.surface_bg || '#f5f5f5' : 'transparent',
    '--shop-card-bg': s.card_bg || '#ffffff',
    '--shop-title': s.title_color || '#3f3f3f',
    '--shop-lid': s.lid_color || s.accent_color || '#ff00a6',
    '--shop-price': s.price_color || '#3f3f3f',
    '--shop-price-old': s.price_old_color || '#ffba59',
    '--shop-discount-bg': s.discount_bg || s.accent_color || '#ff00a6',
    '--shop-discount-text': s.discount_text || '#ffffff',
    '--shop-btn-bg': s.btn_bg || '#ffffff',
    '--shop-btn-text': s.btn_text || s.accent_color || '#ff00a6',
    '--shop-btn-border': s.btn_border || s.accent_color || '#ff00a6',
    '--shop-like': s.like_color || s.accent_color || '#ff00a6',
    '--shop-rating': s.rating_color || '#f5a623',
    '--shop-hover-fill': s.hover_fill || '#e6e6e6',
    '--shop-ratio': ratio?.css || '1 / 1',
    '--shop-img-size': `${s.image_size || 110}px`,
    '--shop-card-radius': `${s.card_radius_tl}px ${s.card_radius_tr}px ${s.card_radius_br}px ${s.card_radius_bl}px`,
    '--shop-img-radius': imgRadii,
    '--shop-btn-h': `${s.btn_height || 30}px`,
    '--shop-btn-px': `${s.btn_pad_x || 15}px`,
    '--shop-btn-fs': `${s.btn_font_size || 12}px`,
    '--shop-btn-min-w': s.btn_min_width ? `${s.btn_min_width}px` : '0px',
    '--shop-btn-radius': `${s.btn_radius_tl}px ${s.btn_radius_tr}px ${s.btn_radius_br}px ${s.btn_radius_bl}px`,
    '--shop-recycler-w': `${s.recycler_card_width || 168}px`,
    '--shop-recycler-arrow': `${s.recycler_arrow_size || 36}px`,
    '--shop-recycler-arrow-gap': `${s.recycler_arrow_gap ?? 10}px`,
    '--shop-recycler-arrow-radius': `${s.recycler_arrow_radius_tl}px ${s.recycler_arrow_radius_tr}px ${s.recycler_arrow_radius_br}px ${s.recycler_arrow_radius_bl}px`,
    '--shop-recycler-arrow-pt': `${s.recycler_arrow_pad_t || 0}px`,
    '--shop-recycler-arrow-pr': `${s.recycler_arrow_pad_r || 0}px`,
    '--shop-recycler-arrow-pb': `${s.recycler_arrow_pad_b || 0}px`,
    '--shop-recycler-arrow-pl': `${s.recycler_arrow_pad_l || 0}px`,
    '--shop-recycler-arrow-mt': `${s.recycler_arrow_mar_t || 0}px`,
    '--shop-recycler-arrow-mr': `${s.recycler_arrow_mar_r || 0}px`,
    '--shop-recycler-arrow-mb': `${s.recycler_arrow_mar_b || 0}px`,
    '--shop-recycler-arrow-ml': `${s.recycler_arrow_mar_l || 0}px`,
    '--shop-recycler-arrow-bg': s.recycler_arrow_bg || '#ffffff',
    '--shop-recycler-arrow-color': s.recycler_arrow_color || '#3f3f3f',
    '--shop-recycler-arrow-border': s.recycler_arrow_border || '#dbdbdb',
    '--shop-head-title': s.head_title_color || '#3f3f3f',
    '--shop-head-title-size': `${s.head_title_size || 18}px`,
    '--shop-head-title-weight': String(s.head_title_weight || 400),
    '--shop-head-ff': shopFontCss(s.head_title_font),
    '--shop-card-title-ff': shopFontCss(s.product_title_font),
    '--shop-btn-ff': shopFontCss(s.btn_font),
    '--shop-more': s.more_link_color || s.accent_color || '#ff00a6',
    '--shop-more-size': `${s.more_link_size || 14}px`,
    '--shop-story': `${s.story_size || 70}px`,
  }
}
