import FaqSlot from '@/components/modules/FaqSlot'

export const metadata = {
  title: 'سوالات متداول | سلنیرو',
  description: 'پاسخ به پرسش‌های پرتکرار درباره سلنیرو',
  alternates: {
    canonical: 'https://selniro.com/faq',
  },
}

export default function FaqRoutePage() {
  return <FaqSlot />
}
