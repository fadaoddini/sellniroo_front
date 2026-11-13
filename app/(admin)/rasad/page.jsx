import RasadPage from '@/modules/rasad/components/RasadPage'

export const metadata = {
  title: 'رصد | سل نیرو',
  description:
    'علاقه استانی جستجو و پالس جمعیتی جهان و ایران بر پایه UN و WHO',
  keywords: 'رصد, نقشه ایران, Google Trends, آمار جمعیت, نرخ تولد, نرخ مرگ',
}

export default function Page() {
  return (
    <>
      <h1 className="sr-only">رصد علاقه استانی و آمار جهان و ایران</h1>
      <RasadPage />
    </>
  )
}
