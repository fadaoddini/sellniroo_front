// app/(site)/not-found — صفحه ۴۰۴ سفارشی سایت
import NotFoundView from '@/components/common/NotFoundView'

export const metadata = {
  title: 'صفحه پیدا نشد | سلنیرو',
  robots: { index: false, follow: false },
}

export default function SiteNotFound() {
  return <NotFoundView />
}
