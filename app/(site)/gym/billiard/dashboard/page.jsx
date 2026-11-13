import BilliardDashboard from '@/modules/gym/components/BilliardDashboard'

export const metadata = {
  title: 'داشبورد باشگاه بیلیارد | سلنیرو',
  description: 'داشبورد مدیریت باشگاه بیلیارد',
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <>
      <h1 className="sr-only">داشبورد مدیریت باشگاه بیلیارد</h1>
      <BilliardDashboard />
    </>
  )
}
