// app/design/page.jsx

import React from 'react'
import DesignModule from '../../modules/design/components/DesignModule'

export const metadata = {
  // ✅ تایتل اختصاصی
  title: 'طراحی و محاسبه سازه ال اس اف',
  
  // ✅ توضیحات اختصاصی با کلمات کلیدی مهم
  description: 'طراحی و محاسبه تخصصی سازه‌های سبک فولادی ال اس اف (LSF) توسط هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری سازه‌های LSF در ایران',
  
  // ✅ کلمات کلیدی اختصاصی
  keywords: [
    'طراحی سازه ال اس اف',
    'محاسبه سازه LSF',
    'طراحی سازه سبک فولادی',
    'محاسبه سازه سبک',
    'طراحی ال اس اف',
    'محاسبه ال اس اف',
    'نرم افزار طراحی LSF',
    'سازه ال اس اف',
    'طراحی سازه فولادی سبک',
    'محاسبه اسکلت فلزی سبک',
    'هلدینگ آریا استاد',
    'طراحی ویلا ال اس اف',
    'محاسبه سازه پیش ساخته',
    'طراحی ساختمان LSF',
    'سازه سبک فولادی'
  ],
  
  // ✅ OpenGraph اختصاصی
  openGraph: {
    title: 'طراحی و محاسبه سازه ال اس اف | هلدینگ آریا استاد',
    description: 'طراحی و محاسبه تخصصی سازه‌های سبک فولادی ال اس اف (LSF) توسط هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری سازه‌های LSF در ایران',
    url: 'https://ariastudholding.com/design',
    images: [
      {
        url: 'https://ariastudholding.com/images/design-og.jpg',
        width: 1200,
        height: 630,
        alt: 'طراحی و محاسبه سازه ال اس اف | هلدینگ آریا استاد',
      },
    ],
  },
  
  // ✅ Twitter اختصاصی
  twitter: {
    title: 'طراحی و محاسبه سازه ال اس اف | هلدینگ آریا استاد',
    description: 'طراحی و محاسبه تخصصی سازه‌های سبک فولادی ال اس اف (LSF) توسط هلدینگ آریا استاد',
    images: ['https://ariastudholding.com/images/design-og.jpg'],
  },
  
  // ✅ مسیر متعارف
  alternates: {
    canonical: 'https://ariastudholding.com/design',
  },
};

export default function DesignPage() {
  return (
    <>
      {/* ✅ h1 اختصاصی برای سئو */}
      <h1 className="sr-only">
        طراحی و محاسبه سازه ال اس اف | هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی LSF در ایران
      </h1>
      
      <div className="container">
        <DesignModule />
      </div>
    </>
  );
}