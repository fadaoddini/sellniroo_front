// config/sectionTemplates.js — قالب‌های آماده سکشن (ستون‌بندی)

/**
 * spans: درصد عرض هر ستون (جمع ≈ ۱۰۰)
 */
export const SECTION_TEMPLATES = [
  {
    id: '1',
    label: 'یک ستون',
    desc: 'تمام عرض — یک ستون',
    spans: [100],
  },
  {
    id: '2_50_50',
    label: 'دو ستون مساوی',
    desc: '۵۰ ٪ / ۵۰ ٪',
    spans: [50, 50],
  },
  {
    id: '2_30_70',
    label: 'سایدبار چپ',
    desc: '۳۰ ٪ / ۷۰ ٪',
    spans: [30, 70],
  },
  {
    id: '2_70_30',
    label: 'سایدبار راست',
    desc: '۷۰ ٪ / ۳۰ ٪',
    spans: [70, 30],
  },
  {
    id: '3_equal',
    label: 'سه ستون',
    desc: '۳۳ ٪ / ۳۳ ٪ / ۳۴ ٪',
    spans: [33, 33, 34],
  },
  {
    id: '4_equal',
    label: 'چهار ستون',
    desc: '۲۵ ٪ هر کدام',
    spans: [25, 25, 25, 25],
  },
]

export function templateById(id) {
  return SECTION_TEMPLATES.find((t) => t.id === id) || SECTION_TEMPLATES[0]
}
