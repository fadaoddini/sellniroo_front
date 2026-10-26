// config/pageBuilderWidgets.js — کاتالوگ ویجت‌های قابل افزودن به ستون‌ها
// طبقه‌بندی بر اساس ماژول‌های سایت؛ status: ready | planned | skeleton

/**
 * type: کلید پایدار ویجت
 * moduleKey: وابستگی به ماژول سایت (اختیاری)
 * category: دسته در دیالوگ انتخاب
 * renderKey: نگاشت به اسلات رندر زنده (اختیاری)
 * status: ready = پیاده | planned = فقط نام | skeleton = اسکلت ناقص
 * settingsPanel: پنل تنظیمات استودیو (اختیاری)
 */

export const WIDGET_CATEGORIES = [
  { id: 'breaking', label: 'نوار خبر فوری' },
  { id: 'menus', label: 'منو و ناوبری سایت' },
  { id: 'corporate', label: 'برند / شرکتی' },
  { id: 'hero', label: 'اسلایدر هیرو' },
  { id: 'jobs', label: 'سیستم کاریابی' },
  { id: 'shop', label: 'فروشگاه' },
  { id: 'news', label: 'اخبار' },
  { id: 'sales', label: 'بازاریابی و فروش' },
  { id: 'video', label: 'ویدیو و استوری' },
  { id: 'catalog', label: 'کاتالوگ دیجیتال' },
  { id: 'footer', label: 'فوتر سایت' },
  { id: 'about', label: 'درباره ما' },
  { id: 'quiz', label: 'آزمون تخصصی' },
  { id: 'faq', label: 'سوالات متداول' },
  { id: 'school', label: 'مدرسه' },
  { id: 'nav', label: 'ناوبری عمومی' },
  { id: 'extra', label: 'سایر (بک‌اند آماده)' },
  { id: 'tools', label: 'ابزار صفحه' },
]

function w(def) {
  return {
    status: 'planned',
    ...def,
  }
}

export const PAGE_BUILDER_WIDGETS = [
  // ─── نوار خبر فوری ───
  w({
    type: 'breaking_news',
    label: 'نوار خبر فوری',
    desc: 'تیتر خبر + منو، همبرگری و پروفایل',
    category: 'breaking',
    icon: 'Megaphone',
    moduleKey: 'breaking_news',
    renderKey: 'breaking_news',
    settingsPanel: 'nav',
    status: 'ready',
  }),
  w({
    type: 'breaking_headlines',
    label: 'نوار تیترهای فوری',
    desc: 'فقط تیترهای کوتاه خبر فوری',
    category: 'breaking',
    icon: 'Megaphone',
    moduleKey: 'breaking_news',
  }),
  w({
    type: 'persian_datetime',
    label: 'تاریخ و ساعت شمسی',
    desc: 'نمایش تاریخ و ساعت جاری',
    category: 'breaking',
    icon: 'Calendar',
    moduleKey: 'breaking_news',
  }),
  w({
    type: 'multi_ticker',
    label: 'تیکر چندخطی',
    desc: 'چند پیام تیکر هم‌زمان',
    category: 'breaking',
    icon: 'GalleryHorizontal',
    moduleKey: 'breaking_news',
  }),

  // ─── منو و ناوبری سایت (عمومی — برای هر قالب) ───
  w({
    type: 'site_menu',
    label: 'ویجت منو',
    desc: 'منوی بالا + اختیاری نوار پایین موبایل',
    category: 'menus',
    icon: 'PanelTop',
    renderKey: 'site_menu',
    settingsPanel: 'site_menu',
    moduleKey: 'advanced_menu',
    status: 'ready',
  }),
  w({
    type: 'post_job_button',
    label: 'دکمه ثبت آگهی',
    desc: 'دکمه CTA ثبت آگهی — جایگاه و ظاهر کامل',
    category: 'menus',
    icon: 'PlusCircle',
    renderKey: 'post_job_button',
    settingsPanel: 'post_job_button',
    status: 'ready',
  }),

  // ─── برند / شرکتی ───
  w({
    type: 'brand_bar',
    label: 'پروفایل برند',
    desc: 'نوار معرفی برند',
    category: 'corporate',
    icon: 'Building2',
    moduleKey: 'advanced_menu',
    renderKey: 'corporate_brand_bar',
    status: 'ready',
  }),
  w({
    type: 'brand_contact_card',
    label: 'کارت تماس برند',
    desc: 'اطلاعات تماس و لینک‌های برند',
    category: 'corporate',
    icon: 'Phone',
    moduleKey: 'advanced_menu',
  }),

  // ─── اسلایدر هیرو ───
  w({
    type: 'hero_slider',
    label: 'ویجت اسلایدر',
    desc: 'اسلایدر هیرو صفحه',
    category: 'hero',
    icon: 'Images',
    moduleKey: 'hero_slider',
    renderKey: 'hero_slider',
    settingsPanel: 'slider',
    status: 'ready',
  }),
  w({
    type: 'hero_video_block',
    label: 'هیرو متنی + ویدیو',
    desc: 'بنر متنی با پس‌زمینه ویدیو',
    category: 'hero',
    icon: 'Film',
    moduleKey: 'hero_slider',
  }),
  w({
    type: 'hero_stats_strip',
    label: 'نوار آمار هیرو',
    desc: 'آمار و اعداد زیر یا روی هیرو',
    category: 'hero',
    icon: 'Star',
    moduleKey: 'hero_slider',
  }),
  w({
    type: 'gallery_slider',
    label: 'اسلایدر گالری',
    desc: 'اسلایدر از گالری تصاویر',
    category: 'hero',
    icon: 'Images',
    moduleKey: 'hero_slider',
  }),

  // ─── سیستم کاریابی (همهٔ اجزا — وقتی ماژول مربوط روشن باشد) ───
  w({
    type: 'job_board_system',
    label: 'سیستم کاریابی',
    desc: 'کل بخش: فیلتر + تب + لیست آگهی',
    category: 'jobs',
    icon: 'Briefcase',
    moduleKey: 'job_board',
    renderKey: 'job_board_system',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_listings',
    label: 'لیست و فیلتر آگهی‌ها',
    desc: 'فیلتر و لیست کامل (ماژول job_listings)',
    category: 'jobs',
    icon: 'Briefcase',
    moduleKey: 'job_listings',
    renderKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_list_only',
    label: 'فقط گرید آگهی‌ها',
    desc: 'لیست بدون پنل فیلتر',
    category: 'jobs',
    icon: 'Briefcase',
    moduleKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_filters_only',
    label: 'فقط پنل فیلتر',
    desc: 'فیلترهای آگهی بدون لیست',
    category: 'jobs',
    icon: 'FolderOpen',
    moduleKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_search_bar',
    label: 'جستجوی شغل',
    desc: 'نوار جستجو + شهر → صفحه آگهی‌ها',
    category: 'jobs',
    icon: 'Search',
    moduleKey: 'job_board',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'featured_jobs',
    label: 'آگهی‌های ویژه',
    desc: 'کارت‌های آگهی برجسته',
    category: 'jobs',
    icon: 'Star',
    moduleKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'latest_jobs',
    label: 'آخرین آگهی‌ها',
    desc: 'جدیدترین فرصت‌های شغلی',
    category: 'jobs',
    icon: 'Briefcase',
    moduleKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'hiring_jobs',
    label: 'آگهی‌های استخدام',
    desc: 'فقط نوع استخدام',
    category: 'jobs',
    icon: 'Briefcase',
    moduleKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'seeking_jobs',
    label: 'آگهی‌های کارجو',
    desc: 'فقط نوع کارجو',
    category: 'jobs',
    icon: 'User',
    moduleKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_categories_grid',
    label: 'دسته‌های شغلی',
    desc: 'گرید دسته‌بندی مشاغل',
    category: 'jobs',
    icon: 'FolderOpen',
    moduleKey: 'job_board',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'verified_companies',
    label: 'شرکت‌های تاییدشده',
    desc: 'لیست شرکت‌های معتبر',
    category: 'jobs',
    icon: 'Building2',
    moduleKey: 'job_board',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'public_resumes',
    label: 'رزومه‌های عمومی',
    desc: 'نمونه رزومه‌های قابل مشاهده',
    category: 'jobs',
    icon: 'User',
    moduleKey: 'job_profile',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_quick_filters',
    label: 'فیلترهای سریع شغل',
    desc: 'چیپ‌های میانبر به /jobs',
    category: 'jobs',
    icon: 'FolderOpen',
    moduleKey: 'job_listings',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_stats_strip',
    label: 'آمار کاریابی',
    desc: 'نوار آمار آگهی و شرکت',
    category: 'jobs',
    icon: 'Trophy',
    moduleKey: 'job_board',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_header_bar',
    label: 'هدر کاریابی',
    desc: 'لوگو، جستجو و ثبت آگهی',
    category: 'jobs',
    icon: 'PanelTop',
    moduleKey: 'job_header',
    settingsPanel: 'job_board',
    status: 'ready',
  }),
  w({
    type: 'job_bottom_nav',
    label: 'منوی پایین کاریابی',
    desc: 'نوار پایین موبایل کاریابی',
    category: 'jobs',
    icon: 'Menu',
    moduleKey: 'job_mobile_nav',
    settingsPanel: 'job_board',
    status: 'ready',
  }),

  // ─── فروشگاه ───
  w({
    type: 'featured_products',
    label: 'سبد محصولات ویژه',
    desc: 'نمایش ویژه با حالت لیست / ریسایکلر / کارت / دو ستونه',
    category: 'shop',
    icon: 'Star',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'latest_products',
    label: 'جدیدترین محصولات',
    desc: 'آخرین محصولات افزوده‌شده',
    category: 'shop',
    icon: 'ShoppingBag',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'bestsellers_products',
    label: 'پرفروش‌ترین محصولات',
    desc: 'بر اساس تعداد فروش',
    category: 'shop',
    icon: 'Trophy',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'discounted_products',
    label: 'محصولات تخفیف‌دار',
    desc: 'فقط کالاهای دارای تخفیف',
    category: 'shop',
    icon: 'BadgePercent',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'products_recycler',
    label: 'ریسایکلر محصولات',
    desc: 'اسکرول افقی کارت محصولات',
    category: 'shop',
    icon: 'GalleryHorizontal',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'products_grid',
    label: 'گرید محصولات',
    desc: 'شبکه کارت ۲ یا ۳ ستونه',
    category: 'shop',
    icon: 'LayoutGrid',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'products_by_category',
    label: 'محصولات بر اساس دسته',
    desc: 'فیلتر روی یک دسته محصول',
    category: 'shop',
    icon: 'FolderOpen',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'product_stories',
    label: 'استوری محصولات',
    desc: 'دایره‌های استوری‌مانند محصولات',
    category: 'shop',
    icon: 'Circle',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'shop_categories',
    label: 'دسته‌های فروشگاه',
    desc: 'گرید دسته‌بندی محصولات',
    category: 'shop',
    icon: 'Tags',
    moduleKey: 'shop_listings',
    settingsPanel: 'shop',
    status: 'ready',
  }),
  w({
    type: 'shop_search_bar',
    label: 'جستجوی فروشگاه',
    desc: 'نوار جستجو → صفحه /shop',
    category: 'shop',
    icon: 'Search',
    moduleKey: 'shop',
    settingsPanel: 'shop',
    status: 'ready',
  }),

  // ─── اخبار ───
  w({
    type: 'latest_news',
    label: 'آخرین اخبار',
    desc: 'لیست فشرده آخرین اخبار — مدیریت داده از داشبورد',
    category: 'news',
    icon: 'Newspaper',
    moduleKey: 'news_section',
    renderKey: 'latest_news',
    settingsPanel: 'news',
    status: 'ready',
  }),
  w({
    type: 'news_by_category',
    label: 'ویجت اخبار یک دسته',
    desc: 'لیست اخبار یک دسته‌بندی — مدیریت داده از داشبورد',
    category: 'news',
    icon: 'FolderOpen',
    moduleKey: 'news_section',
    renderKey: 'news_by_category',
    settingsPanel: 'news',
    status: 'ready',
  }),
  w({
    type: 'featured_news',
    label: 'ویجت اخبار ویژه لیست سفارشی',
    desc: 'لیست سفارشی اخبار ویژه — مدیریت محتوا از داشبورد',
    category: 'news',
    icon: 'Star',
    moduleKey: 'news_section',
    renderKey: 'featured_news',
    settingsPanel: 'news',
    status: 'ready',
  }),
  w({
    type: 'featured_news_slider',
    label: 'اسلایدر اخبار ویژه',
    desc: 'نمایش اسلایدی اخبار ویژه — تنظیمات کامل مثل اسلایدر هیرو',
    category: 'news',
    icon: 'Images',
    moduleKey: 'news_section',
    renderKey: 'featured_news_slider',
    settingsPanel: 'slider',
    status: 'ready',
  }),
  w({
    type: 'latest_news_recycler',
    label: 'ریسایکلرویوی اخبار',
    desc: 'اسکرول افقی کارت‌های خبر — مدیریت داده از داشبورد',
    category: 'news',
    icon: 'GalleryHorizontal',
    moduleKey: 'news_section',
    renderKey: 'latest_news_recycler',
    settingsPanel: 'news',
    status: 'ready',
  }),
  w({
    type: 'news_list',
    label: 'لیست اخبار',
    desc: 'ظاهر مجله مثل /news — گرید کارت، صفحه‌بندی و فیلتر',
    category: 'news',
    icon: 'Newspaper',
    moduleKey: 'news_section',
    renderKey: 'news_list',
    settingsPanel: 'news',
    status: 'ready',
  }),
  w({
    type: 'news_categories',
    label: 'دسته‌های خبر',
    desc: 'گرید یا لیست دسته‌بندی اخبار',
    category: 'news',
    icon: 'FolderOpen',
    moduleKey: 'news_section',
  }),
  w({
    type: 'recent_comments',
    label: 'نظرات اخیر',
    desc: 'آخرین نظرات کاربران روی اخبار',
    category: 'news',
    icon: 'MessageCircle',
    moduleKey: 'news_section',
  }),
  w({
    type: 'news_videos',
    label: 'ویدیوهای خبری',
    desc: 'ویدیوهای بخش اخبار',
    category: 'news',
    icon: 'Film',
    moduleKey: 'news_section',
  }),
  w({
    type: 'breaking_news_cards',
    label: 'کارت خبر فوری',
    desc: 'کارت‌های خبر فوری در بدنه صفحه',
    category: 'news',
    icon: 'Megaphone',
    moduleKey: 'news_section',
  }),
  w({
    type: 'topic_pack_teaser',
    label: 'پکیج موضوعی',
    desc: 'پیش‌نمایش پکیج‌های موضوعی خبر',
    category: 'news',
    icon: 'Newspaper',
    moduleKey: 'news_section',
  }),

  // ─── بازاریابی و فروش ───
  w({
    type: 'cta_contact',
    label: 'تماس و درخواست',
    desc: 'فرم مشاوره / CTA',
    category: 'sales',
    icon: 'Phone',
    moduleKey: 'cta_section',
    renderKey: 'cta_section',
    settingsPanel: 'cta',
    status: 'ready',
  }),
  w({
    type: 'public_request_form',
    label: 'فرم درخواست عمومی',
    desc: 'ثبت درخواست از طریق requser',
    category: 'sales',
    icon: 'Type',
    moduleKey: 'cta_section',
  }),
  w({
    type: 'request_types_grid',
    label: 'انواع درخواست',
    desc: 'گرید انواع درخواست قابل انتخاب',
    category: 'sales',
    icon: 'FolderOpen',
    moduleKey: 'cta_section',
  }),
  w({
    type: 'contact_channels',
    label: 'کانال‌های تماس',
    desc: 'تلفن، پیام، شبکه‌های اجتماعی',
    category: 'sales',
    icon: 'Phone',
    moduleKey: 'cta_section',
  }),
  w({
    type: 'dual_cta_buttons',
    label: 'CTA دو دکمه‌ای',
    desc: 'دو فراخوان اقدام کنار هم',
    category: 'sales',
    icon: 'Zap',
    moduleKey: 'cta_section',
  }),

  // ─── ویدیو و استوری (فقط از صفحه‌ساز — سراسری نیست) ───
  w({
    type: 'story',
    label: 'استوری دایره‌ای',
    desc: 'نوار استوری‌های دایره‌ای — هر جا در چیدمان بگذارید',
    category: 'video',
    icon: 'Circle',
    moduleKey: 'videoinsta',
    renderKey: 'videoinsta',
    status: 'ready',
  }),
  w({
    type: 'story_circles',
    label: 'استوری دایره‌ای (فشرده)',
    desc: 'همان نوار استوری با حالت فشرده‌تر',
    category: 'video',
    icon: 'Circle',
    moduleKey: 'videoinsta',
    renderKey: 'videoinsta',
    status: 'ready',
  }),
  w({
    type: 'video_gallery',
    label: 'آرشیو ویدیو',
    desc: 'گالری / آرشیو کامل ویدیوها',
    category: 'video',
    icon: 'Film',
    moduleKey: 'videoinsta',
    renderKey: 'videoinsta',
    status: 'ready',
  }),
  w({
    type: 'video_archive_grid',
    label: 'گرید آرشیو ویدیو',
    desc: 'نمایش شبکه‌ای آرشیو ویدیو',
    category: 'video',
    icon: 'Film',
    moduleKey: 'videoinsta',
    renderKey: 'videoinsta',
    status: 'ready',
  }),
  w({
    type: 'featured_video',
    label: 'ویدیو برجسته',
    desc: 'نوار استوری با تمرکز روی ویدیو',
    category: 'video',
    icon: 'Film',
    moduleKey: 'videoinsta',
    renderKey: 'videoinsta',
    status: 'ready',
  }),

  // ─── کاتالوگ ───
  w({
    type: 'catalog',
    label: 'کاتالوگ دیجیتال',
    desc: 'فلیپ‌بوک کاتالوگ',
    category: 'catalog',
    icon: 'BookOpen',
    moduleKey: 'catalog',
    renderKey: 'catalog',
    status: 'ready',
  }),
  w({
    type: 'catalog_cover',
    label: 'پیش‌نمایش جلد',
    desc: 'جلد کاتالوگ با لینک باز کردن',
    category: 'catalog',
    icon: 'BookOpen',
    moduleKey: 'catalog',
  }),
  w({
    type: 'catalog_mini_flip',
    label: 'فلیپ‌بوک فشرده',
    desc: 'نسخه کوچک فلیپ‌بوک',
    category: 'catalog',
    icon: 'BookOpen',
    moduleKey: 'catalog',
  }),
  w({
    type: 'catalog_download',
    label: 'دانلود کاتالوگ',
    desc: 'لینک دانلود فایل کاتالوگ',
    category: 'catalog',
    icon: 'BookOpen',
    moduleKey: 'catalog',
  }),

  // ─── فوتر ───
  w({
    type: 'site_footer_columns',
    label: 'فوتر چندستونه',
    desc: 'ستون‌های لینک و معرفی',
    category: 'footer',
    icon: 'PanelTop',
    moduleKey: 'site_footer',
  }),
  w({
    type: 'social_links',
    label: 'شبکه‌های اجتماعی',
    desc: 'آیکون‌های شبکه‌های اجتماعی',
    category: 'footer',
    icon: 'Share2',
    moduleKey: 'site_footer',
  }),
  w({
    type: 'copyright_bar',
    label: 'نوار کپی‌رایت',
    desc: 'متن کپی‌رایت و اعتبار',
    category: 'footer',
    icon: 'Type',
    moduleKey: 'site_footer',
  }),

  // ─── درباره ما ───
  w({
    type: 'about_snippet',
    label: 'بلوک درباره ما',
    desc: 'خلاصه متن درباره ما',
    category: 'about',
    icon: 'Building2',
    moduleKey: 'about_us',
  }),
  w({
    type: 'team_grid',
    label: 'تیم / هیئت مدیره',
    desc: 'گرید اعضای تیم یا هیئت',
    category: 'about',
    icon: 'User',
    moduleKey: 'about_us',
  }),
  w({
    type: 'subsidiaries_grid',
    label: 'شرکت‌های تابعه',
    desc: 'لیست شرکت‌های زیرمجموعه',
    category: 'about',
    icon: 'Building2',
    moduleKey: 'about_us',
  }),

  // ─── آزمون ───
  w({
    type: 'quiz_start_card',
    label: 'شروع آزمون',
    desc: 'کارت ورود به آزمون تخصصی',
    category: 'quiz',
    icon: 'Trophy',
    moduleKey: 'quiz',
  }),
  w({
    type: 'quiz_leaderboard',
    label: 'جدول نفرات برتر',
    desc: 'رتبه‌بندی امتیاز آزمون',
    category: 'quiz',
    icon: 'Trophy',
    moduleKey: 'quiz',
  }),
  w({
    type: 'quiz_specialties',
    label: 'تخصص‌های آزمون',
    desc: 'لیست تخصص‌های قابل آزمون',
    category: 'quiz',
    icon: 'FolderOpen',
    moduleKey: 'quiz',
  }),
  w({
    type: 'quiz_my_history',
    label: 'تاریخچه آزمون من',
    desc: 'نتایج قبلی کاربر',
    category: 'quiz',
    icon: 'Trophy',
    moduleKey: 'quiz',
  }),

  // ─── FAQ ───
  w({
    type: 'faq_accordion',
    label: 'آکاردئون FAQ',
    desc: 'سوال و جواب تاشو',
    category: 'faq',
    icon: 'HelpCircle',
    moduleKey: 'faq',
  }),
  w({
    type: 'faq_by_category',
    label: 'FAQ یک دسته',
    desc: 'سوالات یک دسته‌بندی',
    category: 'faq',
    icon: 'HelpCircle',
    moduleKey: 'faq',
  }),
  w({
    type: 'faq_search',
    label: 'جستجوی FAQ',
    desc: 'جستجو در سوالات متداول',
    category: 'faq',
    icon: 'Search',
    moduleKey: 'faq',
  }),

  // ─── مدرسه ───
  w({
    type: 'school_overview',
    label: 'نمای کلی مدرسه',
    desc: 'خلاصه وضعیت مدرسه',
    category: 'school',
    icon: 'GraduationCap',
    moduleKey: 'school',
  }),
  w({
    type: 'lesson_list',
    label: 'لیست دروس',
    desc: 'فهرست دروس فعال',
    category: 'school',
    icon: 'BookOpen',
    moduleKey: 'school',
  }),
  w({
    type: 'curriculum_tree',
    label: 'درخت دروس',
    desc: 'ساختار درختی برنامه درسی',
    category: 'school',
    icon: 'FolderOpen',
    moduleKey: 'school',
  }),
  w({
    type: 'active_exercises',
    label: 'تکالیف فعال',
    desc: 'تمرین‌ها و تکالیف جاری',
    category: 'school',
    icon: 'GraduationCap',
    moduleKey: 'school',
  }),
  w({
    type: 'school_exams',
    label: 'آزمون‌های مدرسه',
    desc: 'لیست آزمون‌های آموزشی',
    category: 'school',
    icon: 'Trophy',
    moduleKey: 'school',
  }),

  // ─── ناوبری و هویت (بدون ماژول اجباری) ───
  w({
    type: 'nav_bar',
    label: 'نوار ناوبری (منو + پروفایل)',
    desc: 'همبرگری، فهرست منو و پروفایل',
    category: 'nav',
    icon: 'PanelTop',
    settingsPanel: 'nav',
    status: 'ready',
  }),
  w({
    type: 'logo',
    label: 'نمایش لوگو',
    desc: 'لوگوی برند سایت',
    category: 'nav',
    icon: 'Image',
    status: 'ready',
  }),
  w({
    type: 'hamburger_menu',
    label: 'منوی همبرگری',
    desc: 'منوی جمع‌شونده',
    category: 'nav',
    icon: 'Menu',
    settingsPanel: 'nav',
    status: 'ready',
  }),
  w({
    type: 'header_menu',
    label: 'منوی هدر',
    desc: 'لینک‌های افقی از یک فهرست',
    category: 'nav',
    icon: 'PanelTop',
    settingsPanel: 'nav',
    status: 'ready',
  }),
  w({
    type: 'profile',
    label: 'ویجت پروفایل',
    desc: 'ورود / تصویر و نام کاربر',
    category: 'nav',
    icon: 'User',
    settingsPanel: 'nav',
    status: 'ready',
  }),
  w({
    type: 'quick_actions',
    label: 'دکمه‌های کاربردی',
    desc: 'میانبرهای سریع — اسکلت',
    category: 'nav',
    icon: 'Zap',
    status: 'skeleton',
  }),

  // ─── سایر (بک‌اند آماده، بدون ماژول سایت) ───
  w({
    type: 'ai_chat_widget',
    label: 'چت هوش مصنوعی',
    desc: 'ویجت گفتگو با AI',
    category: 'extra',
    icon: 'MessageCircle',
  }),
  w({
    type: 'latest_tenders',
    label: 'آخرین مناقصات',
    desc: 'لیست مناقصات ستاد',
    category: 'extra',
    icon: 'Briefcase',
  }),
  w({
    type: 'org_tree',
    label: 'چارت سازمانی',
    desc: 'درخت ساختار سازمانی',
    category: 'extra',
    icon: 'FolderOpen',
  }),
  w({
    type: 'brands_carousel',
    label: 'لوگوهای برند',
    desc: 'اسلایدر لوگوهای برندها',
    category: 'extra',
    icon: 'Images',
  }),
  w({
    type: 'certificates_grid',
    label: 'گواهینامه‌ها',
    desc: 'گرید گواهینامه‌ها',
    category: 'extra',
    icon: 'Award',
  }),
  w({
    type: 'products_showcase',
    label: 'نمایش محصولات',
    desc: 'ویترین محصولات انبار',
    category: 'extra',
    icon: 'Package',
  }),
  w({
    type: 'login_otp_card',
    label: 'کارت ورود / OTP',
    desc: 'فرم ورود با کد یکبارمصرف',
    category: 'extra',
    icon: 'LogIn',
  }),

  // ─── ابزار صفحه ───
  w({
    type: 'calendar',
    label: 'ویجت تقویم',
    desc: 'تقویم رویدادها — اسکلت',
    category: 'tools',
    icon: 'Calendar',
    status: 'skeleton',
  }),
  w({
    type: 'spacer',
    label: 'فاصله‌گذار',
    desc: 'فضای خالی عمودی',
    category: 'tools',
    icon: 'MoveVertical',
    status: 'ready',
  }),
  w({
    type: 'html_block',
    label: 'بلوک متنی',
    desc: 'متن یا HTML ساده',
    category: 'tools',
    icon: 'Type',
    status: 'ready',
  }),
  w({
    type: 'news_article',
    label: 'محتوای کامل سینگل',
    desc: 'کل صفحه خبر (گالری، عنوان، متن، لایک، کامنت) — قابل چیدمان کنار تقویم و ویجت‌های دیگر',
    category: 'news',
    icon: 'Newspaper',
    status: 'ready',
    moduleKey: 'news',
    builderModes: ['news_single'],
  }),
  w({
    type: 'news_page',
    label: 'محتوای کامل لیست اخبار',
    desc: 'لیست، جستجو، دسته و صفحه‌بندی صفحه /news — کنار منو، استوری و ویجت‌های دیگر',
    category: 'news',
    icon: 'Newspaper',
    status: 'ready',
    moduleKey: 'news',
    builderModes: ['news_list'],
  }),
  w({
    type: 'job_article',
    label: 'محتوای کامل سینگل آگهی',
    desc: 'کل صفحه آگهی (تصویر، عنوان، حقوق، درخواست، شرکت، مشابه) — کنار ویجت‌های دیگر',
    category: 'jobs',
    icon: 'Briefcase',
    status: 'ready',
    moduleKey: 'job_board',
    builderModes: ['job_single'],
  }),
  w({
    type: 'product_article',
    label: 'محتوای کامل سینگل محصول',
    desc: 'گالری، قیمت، توضیحات و افزودن به سبد — قابل چیدمان کنار ویجت‌های فروشگاه',
    category: 'shop',
    icon: 'ShoppingBag',
    status: 'ready',
    moduleKey: 'shop_product',
    builderModes: ['product_single'],
  }),
  w({
    type: 'shop_page',
    label: 'محتوای کامل لیست فروشگاه',
    desc: 'جستجو، دسته و گرید محصولات صفحه /shop',
    category: 'shop',
    icon: 'Store',
    status: 'ready',
    moduleKey: 'shop',
    builderModes: ['shop_list'],
  }),
]

export function widgetMeta(type) {
  return PAGE_BUILDER_WIDGETS.find((w) => w.type === type) || null
}

/**
 * ویجت‌هایی که با ماژول‌های فعال (یا بدون وابستگی) قابل استفاده‌اند.
 * @param {Record<string, boolean>} moduleMap
 * @param {{ layoutMode?: 'home' | 'news_single' | 'news_list' | 'job_single' | 'product_single' | 'shop_list' }} [opts]
 */
export function availableBuilderWidgets(moduleMap = {}, opts = {}) {
  const mode = opts.layoutMode || 'home'
  return PAGE_BUILDER_WIDGETS.filter((w) => {
    // بسته‌های داده و ماژول‌های فقط‌داشبورد در لیست ویجت نیستند
    if (
      w.category === 'data_pack' ||
      (w.moduleKey &&
        (String(w.moduleKey).startsWith('data_pack_') || w.moduleKey === 'seo'))
    ) {
      return false
    }
    if (Array.isArray(w.builderModes) && w.builderModes.length) {
      if (!w.builderModes.includes(mode)) return false
    } else if (
      mode === 'news_single' ||
      mode === 'news_list' ||
      mode === 'job_single' ||
      mode === 'product_single' ||
      mode === 'shop_list'
    ) {
      // در حالت سینگل/لیست، ویجت‌های عمومی هم قابل افزودن‌اند
    }
    if (!w.moduleKey) return true
    if (moduleMap[w.moduleKey]) return true
    if (mode === 'news_list' && w.type === 'news_page') return true
    if (mode === 'news_single' && w.type === 'news_article') return true
    if (mode === 'job_single' && w.type === 'job_article') return true
    if (mode === 'product_single' && w.type === 'product_article') return true
    if (mode === 'shop_list' && w.type === 'shop_page') return true
    if (
      mode === 'job_single' &&
      moduleMap.job_board &&
      (w.moduleKey === 'job_listings' ||
        w.moduleKey === 'job_header' ||
        w.moduleKey === 'job_mobile_nav' ||
        w.moduleKey === 'job_profile')
    ) {
      return true
    }
    if (
      (mode === 'product_single' || mode === 'shop_list') &&
      moduleMap.shop &&
      (w.moduleKey === 'shop_listings' || w.moduleKey === 'shop_product')
    ) {
      return true
    }
    if (
      (mode === 'news_list' ||
        mode === 'news_single' ||
        mode === 'job_single' ||
        mode === 'product_single' ||
        mode === 'shop_list') &&
      !Object.keys(moduleMap || {}).length
    ) {
      return (
        !w.moduleKey ||
        w.moduleKey === 'news' ||
        w.moduleKey === 'job_board' ||
        w.moduleKey === 'shop' ||
        w.moduleKey === 'shop_listings' ||
        w.moduleKey === 'shop_product'
      )
    }
    return false
  })
}

export function groupWidgetsByCategory(widgets) {
  const map = {}
  WIDGET_CATEGORIES.forEach((c) => {
    map[c.id] = []
  })
  ;(widgets || []).forEach((w) => {
    const cat = w.category || 'tools'
    if (!map[cat]) map[cat] = []
    map[cat].push(w)
  })
  return map
}

export function widgetStatusLabel(status) {
  if (status === 'ready') return 'آماده'
  if (status === 'skeleton') return 'اسکلت'
  return 'به‌زودی'
}
