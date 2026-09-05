// app/quiz/page.jsx

import { Suspense } from 'react';
import Quiz from '@/components/Quiz';
import styles from '@/components/Quiz/Quiz.module.css';

export const metadata = {
  // ✅ تایتل اختصاصی - بدون "نبض ساختمان"
  title: 'آزمون تخصصی مهندسان',
  
  // ✅ توضیحات اختصاصی
  description: 'آزمون تخصصی رایگان برای مهندسان در ۱۶ حوزه تخصصی عمران، معماری، تاسیسات و ... توسط هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری سازه‌های سبک فولادی LSF در ایران',
  
  // ✅ کلمات کلیدی اختصاصی
  keywords: [
    'آزمون تخصصی مهندسان',
    'آزمون مهندسی',
    'آزمون عمران',
    'آزمون معماری',
    'آزمون تاسیسات',
    'آزمون رایگان مهندسی',
    'تست مهندسی',
    'سوالات تخصصی مهندسی',
    'آزمون آنلاین مهندسی',
    'هلدینگ آریا استاد',
    'سازه ال اس اف',
    'LSF'
  ],
  
  // ✅ OpenGraph اختصاصی
  openGraph: {
    title: 'آزمون تخصصی مهندسان | هلدینگ آریا استاد',
    description: 'آزمون تخصصی رایگان برای مهندسان در ۱۶ حوزه تخصصی عمران، معماری، تاسیسات و ... توسط هلدینگ آریا استاد',
    url: 'https://ariastudholding.com/quiz',
    images: [
      {
        url: 'https://ariastudholding.com/images/quiz-og.jpg',
        width: 1200,
        height: 630,
        alt: 'آزمون تخصصی مهندسان | هلدینگ آریا استاد',
      },
    ],
  },
  
  // ✅ Twitter اختصاصی
  twitter: {
    title: 'آزمون تخصصی مهندسان | هلدینگ آریا استاد',
    description: 'آزمون تخصصی رایگان برای مهندسان در ۱۶ حوزه تخصصی توسط هلدینگ آریا استاد',
    images: ['https://ariastudholding.com/images/quiz-og.jpg'],
  },
  
  // ✅ مسیر متعارف
  alternates: {
    canonical: 'https://ariastudholding.com/quiz',
  },
};

export default function QuizPage() {
  return (
    <>
      {/* ✅ h1 اختصاصی برای سئو */}
      <h1 className="sr-only">
        آزمون تخصصی مهندسان | هلدینگ آریا استاد - بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی LSF در ایران
      </h1>
      
      <Suspense fallback={<QuizLoading />}>
        <Quiz />
      </Suspense>
    </>
  );
}

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