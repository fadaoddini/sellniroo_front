// app/[slug]/page.jsx
import { notFound } from 'next/navigation';
import LsfPage from '@/modules/lsf/LsfPage';  // ایمپورت مستقیم

// ============================================
// تابع برای دیکد کردن slug
// ============================================
function decodeSlug(slug) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// ============================================
// تابع نرمال‌سازی
// ============================================
function normalizeSlug(slug) {
  return slug
    .replace(/ـ/g, '')        // حذف خط تیره
    .replace(/\s/g, '')       // حذف فاصله
    .replace(/‌/g, '');       // حذف نیم‌فاصله
}

// ============================================
// ✅ generateMetadata
// ============================================
export async function generateMetadata({ params }) {
  const slug = decodeSlug(params.slug);
  const normalized = normalizeSlug(slug);
  
  // متادیتا برای ال اس اف
  if (normalized === 'الاساف' || slug.includes('اساف')) {
    return {
      title: 'ال اس اف (LSF) | آریا استاد هلدینگ',
      description: 'اجرای تخصصی سازه‌های سبک فولادی LSF با بیش از ۱۷۰۰ پروژه موفق در ایران',
    };
  }
  
  // متادیتا برای کناف
  if (normalized === 'کناف') {
    return {
      title: 'کناف | آریا استاد هلدینگ',
      description: 'اجرای تخصصی کناف، سقف کناف، دیوار کناف و سازه‌های خشک',
    };
  }
  
  return {
    title: `${slug} | آریا استاد هلدینگ`,
    description: `خدمات تخصصی ${slug} توسط آریا استاد هلدینگ`,
  };
}

// ============================================
// ✅ صفحه اصلی
// ============================================
export default function SlugPage({ params }) {
  const slug = decodeSlug(params.slug);
  const normalized = normalizeSlug(slug);
  
  // تشخیص صفحات خاص
  if (normalized === 'کناف') {
    return <KanafPage />;
  }
  
  // ✅ ال اس اف - با هر شکلی که وارد بشه
  if (normalized === 'الاساف' || slug.includes('اساف') || slug === 'lsf') {
    return <LsfPage />;
  }
  
  return <DefaultPage slug={slug} />;
}

// ============================================
// کامپوننت‌های صفحات
// ============================================
function KanafPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-primary mb-8">
        اجرای تخصصی کناف | آریا استاد هلدینگ
      </h1>
      <div className="bg-gray-50 p-6 rounded-xl mb-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          آریا استاد هلدینگ با بیش از ۱۷۰۰ پروژه موفق، مجری تخصصی 
          کناف، سقف کناف، دیوار کناف و سازه‌های خشک در ایران
        </p>
      </div>
    </div>
  );
}

function DefaultPage({ slug }) {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold text-primary mb-8">
        {slug} | آریا استاد هلدینگ
      </h1>
      <p className="text-lg text-gray-700">خدمات تخصصی {slug}</p>
    </div>
  );
}