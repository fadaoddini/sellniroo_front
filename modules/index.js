// modules/index.js

// ایمپورت مستقیم از فایل‌ها
import KanafPage from './kanaf/KanafPage';
import LsfPage from './lsf/LsfPage';
import DefaultPage from './default/DefaultPage';



// ============================================
// گرفتن کامپوننت صفحه
// ============================================
export function getPageComponent(slug) {
  return PAGE_COMPONENTS[slug] || null;
}