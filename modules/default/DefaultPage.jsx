// modules/default/DefaultPage.jsx
import Breadcrumb from '@/components/common/Breadcrumb';

export default function DefaultPage({ slug }) {
  return (
    <div className="container py-12">
      {/* Breadcrumb */}
      <Breadcrumb items={['خانه', slug]} />
      
      {/* H1 */}
      <h1 className="text-4xl font-bold text-primary mb-8">
        {slug} | آریا استاد هلدینگ
      </h1>
      
      {/* معرفی */}
      <div className="bg-gray-50 p-6 rounded-xl mb-8">
        <p className="text-lg text-gray-700 leading-relaxed">
          خدمات تخصصی {slug} توسط آریا استاد هلدینگ
        </p>
      </div>
      
      {/* محتوای اصلی */}
      <div className="prose prose-lg max-w-none">
        <p>
          آریا استاد هلدینگ با بیش از ۱۷۰۰ پروژه موفق، آماده ارائه خدمات 
          تخصصی در زمینه {slug} می‌باشد.
        </p>
        
        <h2 className="text-2xl font-bold text-primary mt-8 mb-4">
          خدمات ما در حوزه {slug}
        </h2>
        <ul className="list-disc pr-8 space-y-2">
          <li>طراحی و مشاوره تخصصی</li>
          <li>اجرای حرفه‌ای با بالاترین کیفیت</li>
          <li>استفاده از بهترین متریال‌ها</li>
          <li>ضمانت کیفیت و خدمات پس از اجرا</li>
        </ul>
      </div>
    </div>
  );
}