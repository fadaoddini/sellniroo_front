import GymBodybuildingProfilePage from '@/modules/profile/components/GymBodybuildingProfilePage'

export const dynamicParams = true
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return []
}

export const metadata = {
  title: 'پروفایل باشگاه بدنسازی | سلنیرو',
  description: 'مدیریت باشگاه بدنسازی داخل پروفایل اختصاصی',
}

/** همان پروفایل اختصاصی باشگاه — بدون ریدایرکت */
export default function Page() {
  return <GymBodybuildingProfilePage />
}
