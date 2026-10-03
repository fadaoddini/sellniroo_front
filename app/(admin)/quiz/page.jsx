// app/quiz/page.jsx

import { Suspense } from 'react';
import Quiz from '@/components/Quiz';
import styles from '@/components/Quiz/Quiz.module.css';

/* ============================================
   METADATA — آزمون تخصصی فروش و بازاریابی
   ============================================ */
export const metadata = {
  /* ---------- Title ---------- */
  title: 'آزمون تخصصی فروش و بازاریابی | سلنیرو',

  /* ---------- Description ---------- */
  description:
    'آزمون تخصصی رایگان فروش و بازاریابی سلنیرو؛ سنجش مهارت‌های فروشندگی، بازاریابی، ویزیتوری و مذاکره در حوزه‌های مختلف. مناسب کارجویان و کارفرمایان برای ارزیابی دقیق.',

  /* ---------- Keywords ---------- */
  keywords: [
    'آزمون تخصصی فروش',
    'آزمون بازاریابی',
    'آزمون فروشندگی',
    'آزمون ویزیتوری',
    'تست فروش',
    'تست بازاریابی',
    'آزمون آنلاین فروش',
    'آزمون رایگان فروش',
    'سنجش مهارت فروش',
    'سنجش مهارت بازاریابی',
    'تست مذاکره',
    'آزمون مذاکره فروش',
    'ارزیابی فروشنده',
    'ارزیابی بازاریاب',
    'استخدام فروشنده',
    'استخدام بازاریاب',
    'کاریابی فروش',
    'کاریابی بازاریابی',
    'سلنیرو',
    'Sellniroo',
  ],

  /* ---------- OpenGraph ---------- */
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://sellniroo.com/quiz',
    siteName: 'سلنیرو',
    title: 'آزمون تخصصی فروش و بازاریابی | سلنیرو',
    description:
      'آزمون تخصصی رایگان فروش و بازاریابی سلنیرو؛ مهارت‌های فروشندگی، بازاریابی و ویزیتوری خود را بسنجید.',
    images: [
      {
        url: 'https://sellniroo.com/images/quiz-og.jpg',
        width: 1200,
        height: 630,
        alt: 'آزمون تخصصی فروش و بازاریابی | سلنیرو',
      },
    ],
  },

  /* ---------- Twitter / X ---------- */
  twitter: {
    card: 'summary_large_image',
    title: 'آزمون تخصصی فروش و بازاریابی | سلنیرو',
    description:
      'آزمون تخصصی رایگان فروش و بازاریابی سلنیرو؛ مهارت‌های فروشندگی، بازاریابی و ویزیتوری خود را بسنجید.',
    images: ['https://sellniroo.com/images/quiz-og.jpg'],
  },

  /* ---------- Canonical ---------- */
  alternates: {
    canonical: 'https://sellniroo.com/quiz',
  },

  /* ---------- Robots ---------- */
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
};

/* ============================================
   PAGE COMPONENT
   ============================================ */
export default function QuizPage() {
  return (
    <>
      {/* ✅ h1 اختصاصی برای سئو — فقط برای screen reader */}
      <h1 className="sr-only">
        آزمون تخصصی فروش و بازاریابی | سلنیرو — سنجش مهارت فروشندگی، بازاریابی،
        ویزیتوری و مذاکره برای کارجویان و کارفرمایان
      </h1>

      <Suspense fallback={<QuizLoading />}>
        <Quiz />
      </Suspense>
    </>
  );
}

/* ============================================
   LOADING FALLBACK
   ============================================ */
function QuizLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>در حال بارگذاری آزمون...</p>
      </div>
    </div>
  );
}