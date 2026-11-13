import GymPage from '@/modules/gym/components/GymPage'

export const metadata = {
  title: 'مدیریت باشگاه‌های ورزشی | سلنیرو',
  description:
    'سیستم مدیریت یکپارچه باشگاه‌های ورزشی — بدنسازی، بیلیارد و سایر رشته‌ها',
}

export const dynamic = 'force-dynamic'

export default function Page() {
  return (
    <>
      <h1 className="sr-only">مدیریت باشگاه‌های ورزشی</h1>
      <GymPage />
    </>
  )
}
