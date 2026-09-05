// app/about/page.jsx

import AboutUs from '@/components/About'

export const metadata = {
  // ✅ استفاده از "هلدینگ آریا استاد"
  title: 'درباره ما',
  
  description: 'درباره هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران با بیش از ۱۷۰۰ پروژه موفق',
  
  keywords: [
    'درباره هلدینگ آریا استاد',
    'تاریخچه هلدینگ آریا استاد',
    'ماموریت هلدینگ آریا استاد',
    'چشم انداز هلدینگ آریا استاد',
    'تیم هلدینگ آریا استاد',
    'سازه ال اس اف',
    'تولیدکننده LSF',
    'مجری LSF'
  ],
  
  openGraph: {
    title: 'درباره ما | هلدینگ آریا استاد',
    description: 'درباره هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران',
    url: 'https://ariastudholding.com/about',
    images: [
      {
        url: 'https://ariastudholding.com/images/about-og.jpg',
        width: 1200,
        height: 630,
        alt: 'درباره هلدینگ آریا استاد',
      },
    ],
  },
  
  twitter: {
    title: 'درباره ما | هلدینگ آریا استاد',
    description: 'درباره هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی LSF در ایران',
    images: ['https://ariastudholding.com/images/about-og.jpg'],
  },
  
  alternates: {
    canonical: 'https://ariastudholding.com/about',
  },
};

export default function About() {
  return (
    <>
      <h1 className="sr-only">
        درباره هلدینگ آریا استاد | بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی ال اس اف در ایران
      </h1>
      
      <AboutUs />
    </>
  );
}