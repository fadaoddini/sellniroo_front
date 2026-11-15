import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import SystemPreviewClient from './SystemPreviewClient'

export const dynamic = 'force-dynamic'

/**
 * بسته‌هایی که پیش‌نمایش زنده از روی چیدمان ذخیره‌شده دارند.
 * - file: فایل JSON چیدمان
 * - layoutKey: اگر فایل module_page_layouts باشد، کلید صفحه (مثل school)
 */
const PACK_PREVIEWS = {
  job_theme_two: {
    file: 'job_theme_two_home_layout.json',
    title: 'سیستم کاریابی تم دو',
    description: 'پیش‌نمایش زنده چیدمان سیستم کاریابی تم دو',
  },
  school_theme_one: {
    file: 'school_theme_one_module_page_layouts.json',
    layoutKey: 'school',
    title: 'سیستم مدرسه تم یک',
    description: 'پیش‌نمایش زنده سامانه مدرسه',
  },
  inventory_theme_one: {
    file: 'inventory_theme_one_home_layout.json',
    title: 'انبارداری پیشرفته',
    description: 'پیش‌نمایش زنده سیستم انبارداری پیشرفته',
  },
  gym_bodybuilding_theme_one: {
    file: 'gym_bodybuilding_theme_one_home_layout.json',
    title: 'باشگاه بدنسازی',
    description: 'پیش‌نمایش زنده باشگاه بدنسازی',
  },
}

function loadPackJson(fileName) {
  const candidates = [
    path.join(process.cwd(), '..', 'admin', 'news', 'topic_pack_data', fileName),
    path.join(process.cwd(), 'admin', 'news', 'topic_pack_data', fileName),
    path.join(
      process.cwd(),
      '..',
      'customers',
      'rebo_theme_one',
      'news',
      'topic_pack_data',
      fileName,
    ),
  ]
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
    } catch {
      /* try next */
    }
  }
  return null
}

function resolveLayout(raw, meta) {
  if (!raw || typeof raw !== 'object') return null
  if (meta.layoutKey) {
    const page = raw[meta.layoutKey]
    if (page?.rows?.length) return page
    return null
  }
  if (raw.rows?.length) return raw
  return null
}

export async function generateMetadata({ params }) {
  const pack = params?.pack
  const meta = PACK_PREVIEWS[pack]
  if (!meta) return { title: 'پیش‌نمایش سیستم' }
  return {
    title: `${meta.title} | پیش‌نمایش`,
    description: meta.description,
    robots: { index: false, follow: false },
  }
}

export default async function SystemPreviewPage({ params }) {
  const pack = params?.pack
  const meta = PACK_PREVIEWS[pack]
  if (!meta) notFound()

  const raw = loadPackJson(meta.file)
  const layout = resolveLayout(raw, meta)
  if (!layout?.rows?.length) notFound()

  return <SystemPreviewClient layout={layout} title={meta.title} />
}
