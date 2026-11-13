import BilliardPage from '@/modules/gym/components/BilliardPage'

export const metadata = {
  title: 'مدیریت باشگاه بیلیارد | سلنیرو',
  description:
    'سیستم مدیریت یکپارچه باشگاه بیلیارد — رزرو میز، تورنمنت‌ها، بازیکنان و گزارشات',
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <>
      <h1 className="sr-only">مدیریت باشگاه بیلیارد</h1>
      <BilliardPage />
    </>
  )
}
