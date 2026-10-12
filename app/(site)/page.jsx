// app/(site)/page.jsx — صفحه اصلی؛ SEO و تیترها از SiteSettings (دیتابیس)

import HomePage from '@/modules/home/components/HomePage'
import {
  fetchSiteSettings,
  buildMetadataFromSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings'

export async function generateMetadata() {
  try {
    const settings = await fetchSiteSettings({ force: false })
    return buildMetadataFromSettings(settings)
  } catch {
    return buildMetadataFromSettings(DEFAULT_SITE_SETTINGS)
  }
}

export default async function Page() {
  let settings = DEFAULT_SITE_SETTINGS
  try {
    settings = await fetchSiteSettings()
  } catch {
    /* fallback */
  }

  const h1 =
    settings.logo_title ||
    settings.seo_title ||
    settings.site_name ||
    DEFAULT_SITE_SETTINGS.site_name

  const h2 = settings.seo_description || settings.og_description || ''

  return (
    <>
      <h1 className="sr-only">{h1}</h1>
      <HomePage seoSubtitle={h2} siteName={settings.site_name} />
    </>
  )
}
