// modules/index.js

// ایمپورت مستقیم از فایل‌ها
import KanafPage from './kanaf/KanafPage';
import LsfPage from './lsf/LsfPage';
import DefaultPage from './default/DefaultPage';

// صادرات برای استفاده در جای دیگه
export { KanafPage, LsfPage, DefaultPage };

// ============================================
// مپ صفحات برای مسیریابی
// ============================================
export const PAGE_COMPONENTS = {
  'کناف': KanafPage,
  'الـاسـاف': LsfPage,
  // صفحات جدید رو اینجا اضافه کنید
};

// ============================================
// گرفتن کامپوننت صفحه
// ============================================
export function getPageComponent(slug) {
  return PAGE_COMPONENTS[slug] || null;
}