
// app/page.jsx

import HomePage from "@/modules/home/components/HomePage";

export const metadata = {
  title: "سلنیرو | استخدام فروشنده و بازاریاب، کاریابی تخصصی فروش و بازاریابی",

  description:
    "سلنیرو، سایت تخصصی کاریابی و استخدام در حوزه فروش و بازاریابی. جدیدترین آگهی‌های استخدام فروشنده، بازاریاب، ویزیتور و کارشناس فروش را ببینید یا برای جذب نیروی فروش آگهی استخدام ثبت کنید.",

  alternates: {
    canonical: "https://sellniroo.com",
  },

  openGraph: {
    title:
      "سلنیرو | استخدام فروشنده و بازاریاب، کاریابی تخصصی فروش و بازاریابی",

    description:
      "جدیدترین فرصت‌های شغلی فروش و بازاریابی را در سلنیرو پیدا کنید. کارجویان فروشنده، بازاریاب و ویزیتور و کارفرمایان می‌توانند از سلنیرو برای پیدا کردن و جذب نیروی مناسب استفاده کنند.",

    url: "https://sellniroo.com",

    type: "website",

    locale: "fa_IR",

    siteName: "سلنیرو",

    images: [
      {
        url: "https://sellniroo.com/images/logo.png",
        width: 1200,
        height: 630,
        alt: "سلنیرو - سایت تخصصی استخدام فروشنده و بازاریاب",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "سلنیرو | استخدام فروشنده و بازاریاب، کاریابی تخصصی فروش و بازاریابی",

    description:
      "استخدام فروشنده، بازاریاب، ویزیتور و کارشناس فروش؛ جستجوی فرصت‌های شغلی و جذب نیروی فروش در سلنیرو.",

    images: ["https://sellniroo.com/images/logo.png"],
  },
};

export default function Page() {
  return (
    <>
      <h1 className="sr-only">
        سلنیرو | سایت تخصصی استخدام فروشنده، بازاریاب و کارشناس فروش
      </h1>

      <HomePage />
    </>
  );
}
