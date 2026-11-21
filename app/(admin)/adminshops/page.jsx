import { redirect } from 'next/navigation'

/** مدیریت فروشگاه در داشبورد است — این مسیر دیگر پورتال جدا نیست */
export default function AdminShopsRedirectPage() {
  redirect('/dashboard/my-shop')
}
