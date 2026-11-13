import MosharekatProposal from '@/components/widgets/rebo/MosharekatProposal'

export const metadata = {
  title: 'پیشنهاد مشارکت | ربو',
  description:
    'واگذاری سهم از سامانه ربو — دامنه، موتور ساخت سایت، ماژول‌های درآمدی و مدل اقتصادی. بسته ۷۰٪ و ۶۰٪.',
  robots: { index: false, follow: false },
}

export default function MosharekatPage() {
  return (
    <>
      <h1 className="sr-only">پیشنهاد مشارکت در سامانه ربو</h1>
      <MosharekatProposal />
    </>
  )
}
