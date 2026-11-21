import { redirect } from 'next/navigation'

/** مدیریت دسته‌بندی در داشبورد است — این مسیر دیگر پورتال جدا نیست */
export default function AdminCategoriesRedirectPage() {
  redirect('/shop-categories')
}
