// lib/pageConfig.js

// ============================================
// کانفیگ همه صفحات
// ============================================
export const PAGE_CONFIG = {
  'کناف': {
    title: 'کناف | آریا استاد هلدینگ',
    description: 'اجرای تخصصی کناف، سقف کناف، دیوار کناف و سازه‌های خشک با بیش از ۱۷۰۰ پروژه موفق',
    keywords: ['کناف', 'سقف کناف', 'دیوار کناف', 'سازه خشک'],
    ogImage: '/images/kanaf-og.jpg',
  },
  'الـاسـاف': {
    title: 'ال اس اف (LSF) | آریا استاد هلدینگ',
    description: 'اجرای تخصصی سازه‌های سبک فولادی LSF با بیش از ۱۷۰۰ پروژه موفق در ایران',
    keywords: ['ال اس اف', 'LSF', 'سازه سبک', 'سازه فولادی'],
    ogImage: '/images/lsf-og.jpg',
  },
  'lsf': {
    // برای پشتیبانی از lsf انگلیسی
    redirect: '/الـاسـاف',
  },
  'گچ': {
    title: 'گچ | آریا استاد هلدینگ',
    description: 'اجرای تخصصی گچ و گچبری با بالاترین کیفیت',
    keywords: ['گچ', 'گچبری', 'ساختمان'],
    ogImage: '/images/gach-og.jpg',
  },
  'ویلا': {
    title: 'ویلا | آریا استاد هلدینگ',
    description: 'طراحی و ساخت ویلاهای مدرن و لوکس با سازه‌های LSF',
    keywords: ['ویلا', 'ساخت ویلا', 'ویلاسازی'],
    ogImage: '/images/villa-og.jpg',
  },
};

// ============================================
// گرفتن کانفیگ یک صفحه
// ============================================
export function getPageConfig(slug) {
  return PAGE_CONFIG[slug] || null;
}

// ============================================
// گرفتن متادیتا برای یک صفحه
// ============================================
export function getPageMetadata(slug) {
  const config = getPageConfig(slug);
  
  if (!config) {
    // متادیتای پیش‌فرض
    return {
      title: `${slug} | آریا استاد هلدینگ`,
      description: `خدمات تخصصی ${slug} توسط آریا استاد هلدینگ`,
    };
  }
  
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    openGraph: {
      title: config.title,
      description: config.description,
      images: config.ogImage ? [{ url: config.ogImage }] : [],
    },
  };
}