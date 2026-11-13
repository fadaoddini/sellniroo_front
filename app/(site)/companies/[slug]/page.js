import CompanyPublicClient from './CompanyPublicClient'

export async function generateMetadata({ params }) {
  const slug = params?.slug || ''
  return {
    title: slug ? `شرکت ${decodeURIComponent(slug)}` : 'شرکت',
    description: 'صفحه عمومی شرکت در سامانه کاریابی',
  }
}

export default function CompanyPublicPage({ params }) {
  return <CompanyPublicClient slug={params?.slug || ''} />
}
