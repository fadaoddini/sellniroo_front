// app/layout.jsx
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/common/Header";
import BreakingNews from "@/components/common/BreakingNews";
import "@/styles/globals.css";

export const metadata = {
  metadataBase: new URL("https://sellniroo.com"),

  // عنوان اصلی سایت
  title: {
    default:
      "سلنیرو | استخدام فروشنده و بازاریاب، کاریابی تخصصی فروش و بازاریابی",
    template: "%s | سلنیرو",
  },

  // توضیحات اصلی
  description:
    "سلنیرو، سایت کاریابی تخصصی فروش و بازاریابی؛ مشاهده جدیدترین آگهی‌های استخدام فروشنده، بازاریاب، ویزیتور و کارشناس فروش و ثبت آگهی استخدام برای شرکت‌ها و کارفرمایان.",

  // کلمات کلیدی هدفمند
  keywords: [
    // برند
    "سلنیرو",
    "Sellniroo",
    "sellniroo",
    "سایت سلنیرو",
    "کاریابی سلنیرو",

    // کاریابی
    "کاریابی",
    "سایت کاریابی",
    "کاریابی آنلاین",
    "استخدام",
    "آگهی استخدام",
    "استخدام امروز",
    "جدیدترین آگهی استخدام",
    "فرصت شغلی",
    "فرصت کاری",
    "پیدا کردن کار",
    "جستجوی کار",
    "کاریابی تخصصی",

    // فروش
    "استخدام فروشنده",
    "استخدام نیروی فروش",
    "استخدام کارشناس فروش",
    "استخدام مدیر فروش",
    "استخدام سرپرست فروش",
    "استخدام مسئول فروش",
    "استخدام مشاور فروش",
    "استخدام نماینده فروش",
    "استخدام فروشنده حضوری",
    "استخدام فروشنده تلفنی",
    "استخدام فروشنده حرفه ای",
    "استخدام کارمند فروش",
    "استخدام نیروی فروش حضوری",
    "استخدام نیروی فروش تلفنی",

    // بازاریابی
    "استخدام بازاریاب",
    "استخدام بازاریاب حرفه ای",
    "استخدام بازاریاب حضوری",
    "استخدام بازاریاب تلفنی",
    "استخدام بازاریاب پورسانتی",
    "استخدام کارشناس بازاریابی",
    "استخدام نیروی بازاریابی",
    "استخدام مدیر بازاریابی",
    "استخدام دیجیتال مارکتر",

    // ویزیتور
    "استخدام ویزیتور",
    "استخدام ویزیتور حضوری",
    "استخدام ویزیتور فروش",
    "استخدام ویزیتور پورسانتی",
    "استخدام بازاریاب و ویزیتور",

    // کارجو
    "کار فروشندگی",
    "کار بازاریابی",
    "شغل فروشندگی",
    "شغل بازاریابی",
    "شغل فروش",
    "فرصت شغلی فروش",
    "فرصت شغلی بازاریابی",
    "آگهی استخدام فروش",
    "آگهی استخدام بازاریابی",
    "استخدام بدون سابقه فروش",
    "استخدام فروشنده بدون سابقه",
    "کار با حقوق ثابت و پورسانت",
    "کار پورسانتی",
    "شغل پورسانتی",

    // کارفرما
    "استخدام نیرو",
    "جذب نیرو",
    "جذب نیروی فروش",
    "جذب فروشنده",
    "جذب بازاریاب",
    "جذب کارشناس فروش",
    "جذب ویزیتور",
    "ثبت آگهی استخدام",
    "ثبت آگهی استخدام رایگان",
    "درج آگهی استخدام",
    "استخدام فروشنده برای شرکت",
    "استخدام بازاریاب برای شرکت",
    "پیدا کردن نیروی فروش",
    "پیدا کردن فروشنده",
    "پیدا کردن بازاریاب",

    // حوزه‌های مرتبط
    "فروش",
    "بازاریابی",
    "فروشندگی",
    "ویزیتوری",
    "فروش تلفنی",
    "فروش حضوری",
    "بازاریابی تلفنی",
    "بازاریابی حضوری",
    "فروش B2B",
    "فروش B2C",
    "کارشناس فروش",
    "مدیر فروش",
    "سرپرست فروش",
    "بازاریاب",
    "ویزیتور",

    // انگلیسی
    "Sales Jobs",
    "Sales Job",
    "Sales Recruitment",
    "Sales Hiring",
    "Sales Representative Jobs",
    "Sales Representative",
    "Sales Specialist",
    "Sales Executive",
    "Sales Manager Jobs",
    "Marketing Jobs",
    "Marketing Recruitment",
    "Marketing Specialist",
    "Marketing Executive",
    "Job Board",
    "Job Search",
    "Recruitment",
    "Hiring",
  ],

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  authors: [
    {
      name: "Sellniroo",
      url: "https://sellniroo.com",
    },
  ],

  creator: "Sellniroo",
  publisher: "Sellniroo",

  // OpenGraph
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://sellniroo.com",
    siteName: "سلنیرو",
    title:
      "سلنیرو | استخدام فروشنده و بازاریاب، کاریابی تخصصی فروش و بازاریابی",
    description:
      "در سلنیرو جدیدترین فرصت‌های شغلی فروش و بازاریابی را پیدا کنید یا به‌عنوان کارفرما برای استخدام فروشنده، بازاریاب، ویزیتور و کارشناس فروش آگهی ثبت کنید.",
    images: [
      {
        url: "https://sellniroo.com/images/logo.png",
        width: 1200,
        height: 630,
        alt: "سلنیرو - کاریابی تخصصی فروش و بازاریابی",
      },
    ],
  },

  // Twitter / X
  twitter: {
    card: "summary_large_image",
    title:
      "سلنیرو | استخدام فروشنده و بازاریاب، کاریابی تخصصی فروش و بازاریابی",
    description:
      "جدیدترین آگهی‌های استخدام فروش، بازاریابی و ویزیتوری را در سلنیرو مشاهده کنید یا برای جذب نیروی فروش آگهی استخدام ثبت کنید.",
    images: ["https://sellniroo.com/images/logo.png"],
  },

  // آیکون‌ها
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  // جلوگیری از تشخیص اشتباه شماره تلفن و موارد مشابه
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

function LayoutContent({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <BreakingNews />
        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LayoutContent>{children}</LayoutContent>
      </AuthProvider>
    </LanguageProvider>
  );
}