import GymBodybuildingProfilePage from '@/modules/profile/components/GymBodybuildingProfilePage'

export const metadata = {
  title: 'پروفایل باشگاه بدنسازی | سلنیرو',
  description: 'مدیریت، مربی و عضویت باشگاه بدنسازی',
}

export const dynamic = 'force-dynamic'

/** مسیر قدیمی — همان پروفایل اختصاصی باشگاه، بدون صفحه جدا */
export default function Page() {
  return <GymBodybuildingProfilePage />
}
