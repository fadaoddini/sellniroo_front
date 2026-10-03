// app/game/page.jsx
import Game from '@/components/Game/Game';

/* ============================================
   METADATA — بازی بازاریاب پرنده
   ============================================ */
export const metadata = {
  /* ---------- Title ---------- */
  title: 'بازی بازاریاب پرنده | سلنیرو',

  /* ---------- Description ---------- */
  description:
    'بازی آنلاین بازاریاب پرنده سلنیرو - با پاراگلایدر پرواز کن، از ناامیدی، ترس و عجله فرار کن و رکورد بزن! بازی سرگرم‌کننده برای فروشندگان و بازاریابان.',

  /* ---------- Keywords ---------- */
  keywords: [
    'بازی بازاریاب',
    'بازی فروشنده',
    'بازی آنلاین',
    'بازی سلنیرو',
    'بازی پاراگلایدر',
    'بازی سرگرمی',
    'بازی موبایل',
    'بازی مرورگری',
    'بازی رایگان',
    'بازی فلپی',
    'Flappy Game',
    'Sellniroo Game',
    'بازی انگیزشی',
    'بازی موفقیت',
    'بازی فروش',
    'بازی بازاریابی',
  ],

  /* ---------- OpenGraph ---------- */
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: 'https://sellniroo.com/game',
    siteName: 'سلنیرو',
    title: 'بازی بازاریاب پرنده | سلنیرو',
    description:
      'با پاراگلایدر پرواز کن، از ناامیدی، ترس و عجله فرار کن و رکورد بزن! بازی سرگرم‌کننده سلنیرو برای فروشندگان و بازاریابان.',
    images: [
      {
        url: 'https://sellniroo.com/images/game-og.jpg',
        width: 1200,
        height: 630,
        alt: 'بازی بازاریاب پرنده | سلنیرو',
      },
    ],
  },

  /* ---------- Twitter / X ---------- */
  twitter: {
    card: 'summary_large_image',
    title: 'بازی بازاریاب پرنده | سلنیرو',
    description:
      'با پاراگلایدر پرواز کن و از ناامیدی، ترس و عجله فرار کن! بازی سرگرم‌کننده سلنیرو.',
    images: ['https://sellniroo.com/images/game-og.jpg'],
  },

  /* ---------- Canonical ---------- */
  alternates: {
    canonical: 'https://sellniroo.com/game',
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
export default function GamePage() {
  return (
    <>
      {/* ✅ h1 اختصاصی برای سئو — فقط برای screen reader */}
      <h1 className="sr-only">
        بازی بازاریاب پرنده | سلنیرو — با پاراگلایدر پرواز کن و از ناامیدی،
        ترس و عجله فرار کن
      </h1>

      <Game />
    </>
  );
}