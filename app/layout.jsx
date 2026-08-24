// app/layout.jsx
import React from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Header from "@/components/common/Header";
import BreakingNews from "@/components/common/BreakingNews";
import "@/styles/globals.css";

export const metadata = {
  metadataBase: new URL('https://ariastudholding.com'),
  
  // ✅ تایتل عمومی
  title: {
    default: 'هلدینگ آریا استاد | بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
    template: '%s | هلدینگ آریا استاد'
  },
  
  // ✅ توضیحات عمومی
  description: 'بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
  
  // ✅ کلمات کلیدی عمومی
  keywords: [
    "آریا استاد",
    "آریا استاد هلدینگ",
    "هلدینگ آریا استاد",
    "ال اس اف",
    "سازه ال اس اف",
    "سازه سبک",
    "سازه سبک فولادی",
    "سازه فلزی سبک",
    "ساختمان سبک",
    "ساختمان پیش ساخته",
    "خانه پیش ساخته",
    "خانه ویلایی",
    "ویلا",
    "ویلاسازی",
    "اجرای ویلا",
    "ساخت ویلا",
    "ویلای مدرن",
    "ویلا پیش ساخته",
    "سازه پیش ساخته",
    "سازه خشک",
    "دیوار خشک",
    "کناف",
    "اجرای کناف",
    "سقف کناف",
    "دیوار کناف",
    "گچ",
    "گچ کاری",
    "گچبری",
    "اجرای گچ",
    "اسکلت فلزی",
    "اسکلت سبک",
    "پیمانکاری ساختمان",
    "اجرای ساختمان",
    "طراحی سازه",
    "طراحی ویلا",
    "قیمت ال اس اف",
    "هزینه ساخت ویلا",
    "اجرای سازه سبک",
    "بهترین شرکت LSF",
    "سازه فولادی",
    "ساختمان مقاوم",
    "خانه ضد زلزله",
    "ساختمان ضد زلزله",
    "LSF",
    "Light Steel Frame",
    "Light Steel Framing",
    "Light Gauge Steel",
    "Light Gauge Steel Frame",
    "Cold Formed Steel",
    "Cold Formed Steel Structure",
    "Steel Frame",
    "Steel Structure",
    "Steel Construction",
    "Prefab",
    "Prefabricated Building",
    "Prefabricated House",
    "Prefabricated Villa",
    "Modular Building",
    "Modular House",
    "Villa Construction",
    "Villa Builder",
    "Drywall",
    "Gypsum Board",
    "False Ceiling",
    "Ceiling System",
    "Partition Wall",
    "Interior Construction",
    "Construction Company",
    "Building Contractor",
    "Residential Construction",
    "Commercial Construction",
    "Modern Construction",
    "Green Building",
    "Sustainable Building"
  ],
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  authors: [{ 
    name: 'Aria stud Holding',
    url: 'https://ariastudholding.com'
  }],
  
  // ✅ OpenGraph عمومی
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://ariastudholding.com',
    siteName: 'هلدینگ آریا استاد',
    title: 'هلدینگ آریا استاد | بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
    description: 'بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
    images: [
      {
        url: 'https://ariastudholding.com/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'هلدینگ آریا استاد',
      },
    ],
  },
  
  // ✅ Twitter عمومی
  twitter: {
    card: 'summary_large_image',
    title: 'هلدینگ آریا استاد | بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
    description: 'بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
    images: ['https://ariastudholding.com/images/logo.png'],
  },
  
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
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