// app/(site)/profile/page.jsx
import ProfilePage from "@/modules/profile/components/ProfilePage";

export const metadata = {
  title: "پروفایل من",
  description:
    "مدیریت آگهی‌های استخدامی و کاریابی، درخواست‌ها، ذخیره‌شده‌ها، شرکت و رزومه در سلنیرو.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ProfilePage />;
}