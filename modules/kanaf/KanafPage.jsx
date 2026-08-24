// modules/kanaf/KanafPage.jsx
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/common/Breadcrumb';

export default function KanafPage() {
  return (
    <div className="container py-12">
      {/* Breadcrumb */}
      <Breadcrumb items={['خانه', 'کناف']} />
      
      {/* H1 */}
      <h1 className="text-4xl font-bold text-primary mb-8">
        اجرای تخصصی کناف | آریا استاد هلدینگ
      </h1>
      
      {/* معرفی */}
      <div className="bg-gray-50 p-6 rounded-xl mb-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          آریا استاد هلدینگ با بیش از ۱۷۰۰ پروژه موفق، مجری تخصصی 
          کناف، سقف کناف، دیوار کناف و سازه‌های خشک در ایران
        </p>
      </div>
      
      {/* محتوای اصلی */}
      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">
          خدمات کناف
        </h2>
        <ul className="list-disc pr-8 space-y-2">
          <li>سقف کناف</li>
          <li>دیوار کناف</li>
          <li>کناف تزئینی</li>
          <li>کناف ضدآب</li>
        </ul>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">
          مزایای استفاده از کناف
        </h2>
        <ul className="list-disc pr-8 space-y-2">
          <li>سبکی و کاهش بار ساختمان</li>
          <li>عایق حرارتی و صوتی</li>
          <li>سرعت اجرای بالا</li>
          <li>قابلیت اجرای طرح‌های متنوع</li>
        </ul>
      </div>
      
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "خدمات کناف",
            "description": "اجرای تخصصی کناف، سقف کناف و دیوار کناف",
            "provider": {
              "@type": "Organization",
              "name": "آریا استاد هلدینگ",
              "url": "https://ariastudholding.com"
            }
          })
        }}
      />
    </div>
  );
}