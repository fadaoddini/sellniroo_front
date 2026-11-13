import GymBodybuildingProfilePage from '@/modules/profile/components/GymBodybuildingProfilePage'

export const metadata = {
  title: 'پروفایل باشگاه بدنسازی | سلنیرو',
  description: 'مدیریت باشگاه بدنسازی داخل پروفایل اختصاصی',
}

export const dynamic = 'force-dynamic'

/** همان پروفایل اختصاصی باشگاه — بدون ریدایرکت به /profile مدرسه */
export default function Page() {
  return <GymBodybuildingProfilePage />
}
