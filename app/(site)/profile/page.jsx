// app/(site)/profile/page.jsx
// job_profile روشن → پروفایل کاریابی | خاموش → پروفایل عادی (+ تب آزمون اگر quiz فعال باشد)
import ProfileSlot from '@/components/modules/ProfileSlot'

export const metadata = {
  title: 'پروفایل من',
  description:
    'مدیریت آگهی‌های استخدامی و کاریابی، درخواست‌ها، ذخیره‌شده‌ها، شرکت و رزومه.',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <ProfileSlot />
}
