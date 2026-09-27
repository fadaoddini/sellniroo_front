// app/profile/page.jsx
import ProfilePage from "@/modules/profile/components/ProfilePage";

export const metadata = {
  title: "پروفایل من | سلنیرو",
  description:
    "مدیریت کامل آگهی‌های استخدامی و کاریابی، مشاهده درخواست‌ها و ذخیره‌شده‌ها در سلنیرو.",
};

export default function Page() {
  return <ProfilePage />;
}