import SoftAppsSlot from '@/components/modules/SoftAppsSlot'

export async function generateMetadata({ params }) {
  const slug = params?.slug || ''
  return {
    title: `نرم‌افزار | سلنیرو`,
    description: 'جزئیات و دانلود نرم‌افزار کاربردی',
    alternates: {
      canonical: `https://selniro.com/apps/${slug}`,
    },
  }
}

export default function SoftAppDetailRoute({ params }) {
  return <SoftAppsSlot slug={params?.slug} />
}
