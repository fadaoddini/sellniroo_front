import GymBodybuildingProfilePage from '@/modules/profile/components/GymBodybuildingProfilePage'

export const metadata = {
  title: 'پروفایل باشگاه بدنسازی | سلنیرو',
  description: 'مدیریت، مربی و عضویت باشگاه بدنسازی',
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return <GymBodybuildingProfilePage />
}
