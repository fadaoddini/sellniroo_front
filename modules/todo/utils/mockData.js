export const employees = [
  { id: 1, name: 'احمد رضایی', role: 'توسعه‌دهنده ارشد', avatar: '/avatar-1.svg', department: 'فنی' },
  { id: 2, name: 'سارا محمدی', role: 'طراح UI/UX', avatar: '/avatar-2.svg', department: 'طراحی' },
  { id: 3, name: 'علی کریمی', role: 'مدیر پروژه', avatar: '/avatar-3.svg', department: 'مدیریت' },
  { id: 4, name: 'مریم حسینی', role: 'توسعه‌دهنده فرانت‌اند', avatar: '/avatar-4.svg', department: 'فنی' },
  { id: 5, name: 'رضا نوروزی', role: 'کارشناس بازاریابی', avatar: '/avatar-5.svg', department: 'بازاریابی' },
]

export const labels = [
  { id: 1, name: 'بحرانی', color: '#ff3b30' },
  { id: 2, name: 'بالا', color: '#ff9500' },
  { id: 3, name: 'متوسط', color: '#ffcc00' },
  { id: 4, name: 'پایین', color: '#34c759' },
  { id: 5, name: 'آموزشی', color: '#007aff' },
]

export const initialTasks = [
  {
    id: 1,
    title: 'توسعه داشبورد مدیریت',
    description: 'طراحی و پیاده‌سازی داشبورد اصلی مدیریت با قابلیت‌های پیشرفته',
    status: 'todo',
    label: 'بحرانی',
    assignee: 1,
    dueDate: '2026-06-25',
    createdAt: '2026-06-15',
    updatedAt: '2026-06-15',
    comments: [],
  },
  {
    id: 2,
    title: 'طراحی رابط کاربری اپلیکیشن',
    description: 'طراحی تمام صفحات اپلیکیشن با رویکرد Material Design',
    status: 'inProgress',
    label: 'بالا',
    assignee: 2,
    dueDate: '2026-06-28',
    createdAt: '2026-06-14',
    updatedAt: '2026-06-16',
    comments: [
      { id: 1, text: 'نیاز به بازبینی در بخش تنظیمات', createdAt: '2026-06-16', author: 'مدیر' }
    ],
  },
  {
    id: 3,
    title: 'برگزاری جلسه هماهنگی تیم',
    description: 'برنامه‌ریزی و هماهنگی جلسه هفتگی تیم توسعه',
    status: 'review',
    label: 'متوسط',
    assignee: 3,
    dueDate: '2026-06-20',
    createdAt: '2026-06-13',
    updatedAt: '2026-06-17',
    comments: [
      { id: 2, text: 'تایید شد', createdAt: '2026-06-17', author: 'مدیر' }
    ],
  },
  {
    id: 4,
    title: 'آماده‌سازی مستندات فنی',
    description: 'تهیه مستندات کامل فنی پروژه برای تحویل به مشتری',
    status: 'done',
    label: 'پایین',
    assignee: 4,
    dueDate: '2026-06-18',
    createdAt: '2026-06-10',
    updatedAt: '2026-06-18',
    comments: [
      { id: 3, text: 'مستندات تکمیل شد', createdAt: '2026-06-18', author: 'مریم حسینی' }
    ],
  },
  {
    id: 5,
    title: 'بررسی استراتژی بازاریابی',
    description: 'تحلیل و بررسی استراتژی‌های جدید بازاریابی دیجیتال',
    status: 'todo',
    label: 'متوسط',
    assignee: 5,
    dueDate: '2026-06-30',
    createdAt: '2026-06-16',
    updatedAt: '2026-06-16',
    comments: [],
  },
  {
    id: 6,
    title: 'رفع باگ‌های نسخه جدید',
    description: 'شناسایی و رفع باگ‌های موجود در نسخه جدید نرم‌افزار',
    status: 'inProgress',
    label: 'بحرانی',
    assignee: 1,
    dueDate: '2026-06-22',
    createdAt: '2026-06-17',
    updatedAt: '2026-06-18',
    comments: [
      { id: 4, text: 'باگ شماره ۱۲۳ رفع شد', createdAt: '2026-06-18', author: 'احمد رضایی' }
    ],
  },
  {
    id: 7,
    title: 'آپدیت کتابخانه‌های پروژه',
    description: 'به‌روزرسانی کتابخانه‌های فرانت‌اند به آخرین نسخه‌ها',
    status: 'todo',
    label: 'پایین',
    assignee: 4,
    dueDate: '2026-07-05',
    createdAt: '2026-06-18',
    updatedAt: '2026-06-18',
    comments: [],
  },
  {
    id: 8,
    title: 'طراحی سیستم اعلانات',
    description: 'پیاده‌سازی سیستم اعلانات هوشمند برای کاربران',
    status: 'review',
    label: 'بالا',
    assignee: 2,
    dueDate: '2026-06-24',
    createdAt: '2026-06-12',
    updatedAt: '2026-06-19',
    comments: [
      { id: 5, text: 'نیاز به تغییر در بخش نمایش', createdAt: '2026-06-19', author: 'مدیر' }
    ],
  },
]
