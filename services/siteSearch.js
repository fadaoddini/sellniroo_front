/**
 * جستجوی یکپارچه سایت — اخبار + آگهی (در صورت فعال بودن)
 */
import newsService from '@/services/newsService'
import jobisellApi from '@/services/jobisellApi'
import { fetchSiteModules } from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

function newsHref(item) {
  const slug = item?.slug || item?.id
  return slug ? `/news/${slug}` : '/news'
}

function jobHref(item) {
  const id = item?.id || item?.pk
  return id ? `/jobs/${id}` : '/jobs'
}

function mapNewsItem(item) {
  return {
    id: `news_${item.id || item.slug}`,
    type: 'news',
    typeLabel: 'خبر',
    title: item.title || item.headline || 'بدون عنوان',
    excerpt:
      item.excerpt ||
      item.subtitle ||
      item.description ||
      '',
    href: newsHref(item),
    image:
      item.cover_image ||
      item.image ||
      item.thumbnail ||
      item.og_image ||
      '',
    meta: item.category?.name || item.category_name || item.publish_date || '',
    date: item.publish_date || item.created_at || '',
    raw: item,
  }
}

function mapJobItem(item) {
  return {
    id: `job_${item.id || item.pk}`,
    type: 'jobs',
    typeLabel: 'آگهی',
    title: item.title || item.position || 'آگهی شغلی',
    excerpt:
      item.description ||
      item.short_description ||
      item.company_name ||
      '',
    href: jobHref(item),
    image: item.image || item.company_logo || '',
    meta:
      item.city_name ||
      item.city?.name ||
      item.company_name ||
      item.company?.name ||
      '',
    date: item.created_at || item.publish_date || '',
    raw: item,
  }
}

export async function searchSite({
  q = '',
  type = 'all',
  category = '',
  moduleMap = null,
} = {}) {
  const query = String(q || '').trim()
  if (!query) {
    return { success: true, items: [], total: 0, query }
  }

  let map = moduleMap
  if (!map) {
    try {
      const mods = await fetchSiteModules({ force: false })
      map = mods?.map || {}
    } catch {
      map = {}
    }
  }

  const newsOn =
    !Object.prototype.hasOwnProperty.call(map, SITE_MODULE_KEYS.NEWS) ||
    !!map[SITE_MODULE_KEYS.NEWS]
  const jobsOn = !!map[SITE_MODULE_KEYS.JOB_BOARD]

  const wantNews = type === 'all' || type === 'news'
  const wantJobs = type === 'all' || type === 'jobs'

  const tasks = []
  if (wantNews && newsOn) {
    tasks.push(
      newsService
        .searchNews(query, category || null)
        .then((res) => ({
          kind: 'news',
          ok: !!res?.success,
          items: (res?.data || []).map(mapNewsItem),
        }))
        .catch(() => ({ kind: 'news', ok: false, items: [] })),
    )
  }
  if (wantJobs && jobsOn) {
    tasks.push(
      jobisellApi
        .searchJobs(query)
        .then((data) => {
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : Array.isArray(data?.data)
                ? data.data
                : []
          return {
            kind: 'jobs',
            ok: true,
            items: list.map(mapJobItem),
          }
        })
        .catch(() => ({ kind: 'jobs', ok: false, items: [] })),
    )
  }

  const parts = await Promise.all(tasks)
  const items = parts.flatMap((p) => p.items || [])
  return {
    success: true,
    items,
    total: items.length,
    query,
    counts: {
      news: parts.find((p) => p.kind === 'news')?.items?.length || 0,
      jobs: parts.find((p) => p.kind === 'jobs')?.items?.length || 0,
    },
    available: { news: newsOn, jobs: jobsOn },
  }
}
