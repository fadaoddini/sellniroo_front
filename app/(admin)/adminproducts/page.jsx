import { redirect } from 'next/navigation'

/** مدیریت محصولات در داشبورد است — این مسیر دیگر پورتال جدا نیست */
export default function AdminProductsRedirectPage() {
  redirect('/dashboard/my-shop?tab=products')
}
