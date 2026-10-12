// app/(site)/about/page.jsx
// داده از API /api/about/ — ماژول سایت: about_us
import AboutSlot from '@/components/modules/AboutSlot'
import {
  fetchAboutPage,
  buildAboutMetadata,
  DEFAULT_ABOUT_SEO,
} from '@/services/aboutPage'

export async function generateMetadata() {
  try {
    const page = await fetchAboutPage({ force: false })
    return buildAboutMetadata(page)
  } catch {
    return buildAboutMetadata(DEFAULT_ABOUT_SEO)
  }
}

export default function About() {
  return (
    <>
      <h1 className="sr-only">
        درباره سلنیرو | سایت کاریابی تخصصی فروش و بازاریابی در ایران
      </h1>
      <AboutSlot />
    </>
  )
}
