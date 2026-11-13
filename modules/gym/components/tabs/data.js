// modules/gym/components/tabs/data.js

export const initialUsers = [
  { id: 1, name: 'احمد رضایی', phone: '09123456789', email: 'ahmad@email.com', gender: 'مرد', status: 'active', joinDate: '1403/01/15', membership: 'طلایی', package: 'تمرین روزانه', trainer: 'رضا کریمی', expirationDate: '1403/07/15', daysRemaining: 45, hasDiet: true, hasWorkout: true },
  { id: 2, name: 'سارا محمدی', phone: '09123456788', email: 'sara@email.com', gender: 'زن', status: 'active', joinDate: '1403/02/20', membership: 'نقره‌ای', package: 'روزهای زوج', trainer: 'علی نوری', expirationDate: '1403/06/20', daysRemaining: 20, hasDiet: true, hasWorkout: true },
  { id: 3, name: 'علی کریمی', phone: '09123456787', email: 'ali@email.com', gender: 'مرد', status: 'inactive', joinDate: '1403/03/10', membership: 'برنزی', package: 'یک روز در میان', trainer: '-', expirationDate: '1403/04/10', daysRemaining: -30, hasDiet: false, hasWorkout: true },
  { id: 4, name: 'مریم حسینی', phone: '09123456786', email: 'maryam@email.com', gender: 'زن', status: 'active', joinDate: '1403/04/05', membership: 'نقره‌ای', package: 'تمرین روزانه', trainer: 'رضا کریمی', expirationDate: '1403/08/05', daysRemaining: 60, hasDiet: true, hasWorkout: true },
  { id: 5, name: 'رضا نوری', phone: '09123456785', email: 'reza@email.com', gender: 'مرد', status: 'active', joinDate: '1403/04/12', membership: 'طلایی', package: 'روزهای فرد', trainer: 'علی نوری', expirationDate: '1403/07/12', daysRemaining: 35, hasDiet: false, hasWorkout: true },
];

export const initialPackages = [
  { id: 1, title: 'تمرین روزانه', price: 300000, discount: 10, hasAerobic: true, hasExtraFacilities: true, description: 'تمرین در تمام روزهای هفته با امکانات کامل', schedule: 'همه روزه', sessions: ['صبح', 'عصر'] },
  { id: 2, title: 'روزهای زوج', price: 250000, discount: 5, hasAerobic: true, hasExtraFacilities: false, description: 'تمرین در روزهای زوج هفته', schedule: 'زوج', sessions: ['صبح'] },
  { id: 3, title: 'روزهای فرد', price: 250000, discount: 5, hasAerobic: false, hasExtraFacilities: false, description: 'تمرین در روزهای فرد هفته', schedule: 'فرد', sessions: ['عصر'] },
  { id: 4, title: 'یک روز در میان', price: 200000, discount: 0, hasAerobic: false, hasExtraFacilities: false, description: 'تمرین یک روز در میان', schedule: 'یک روز در میان', sessions: ['صبح', 'عصر'] },
];

export const initialSessions = [
  { id: 1, name: 'صبح', startTime: '06:00', endTime: '12:00', gender: 'آقایان', capacity: 30, currentCount: 25 },
  { id: 2, name: 'عصر', startTime: '16:00', endTime: '22:00', gender: 'آقایان', capacity: 30, currentCount: 28 },
  { id: 3, name: 'صبح', startTime: '06:00', endTime: '12:00', gender: 'بانوان', capacity: 25, currentCount: 20 },
  { id: 4, name: 'عصر', startTime: '16:00', endTime: '22:00', gender: 'بانوان', capacity: 25, currentCount: 15 },
];

export const initialTrainers = [
  { id: 1, name: 'رضا کریمی', phone: '09123456780', email: 'reza.karimi@email.com', specialty: 'بدنسازی حرفه‌ای', clients: 12, status: 'active' },
  { id: 2, name: 'علی نوری', phone: '09123456781', email: 'ali.nouri@email.com', specialty: 'فیتنس و تناسب اندام', clients: 8, status: 'active' },
  { id: 3, name: 'محمد صادقی', phone: '09123456782', email: 'mohammad@email.com', specialty: 'تغذیه ورزشی', clients: 5, status: 'active' },
];

// ============================================
// محصولات باشگاه (مکمل، پوشاک، لوازم)
// ============================================
export const initialProducts = [
  {
    id: 1,
    name: 'پروتئین وی ۲ کیلویی',
    category: 'مکمل ورزشی',
    price: 3500000,
    memberPrice: 3200000,
    stock: 25,
    description: 'پروتئین وی ایزوله با کیفیت بالا مناسب عضله‌سازی',
    image: '',
    status: 'active',
  },
  {
    id: 2,
    name: 'کراتین مونوهیدرات',
    category: 'مکمل ورزشی',
    price: 1200000,
    memberPrice: 1050000,
    stock: 40,
    description: 'کراتین مونوهیدرات خالص برای افزایش قدرت و استقامت',
    image: '',
    status: 'active',
  },
  {
    id: 3,
    name: 'تی‌شرت ورزشی باشگاه',
    category: 'پوشاک',
    price: 450000,
    memberPrice: 350000,
    stock: 60,
    description: 'تی‌شرت ورزشی نخی با لوگوی باشگاه',
    image: '',
    status: 'active',
  },
  {
    id: 4,
    name: 'دستکش بدنسازی',
    category: 'لوازم ورزشی',
    price: 380000,
    memberPrice: 300000,
    stock: 15,
    description: 'دستکش بدنسازی چرم با محافظ مچ',
    image: '',
    status: 'active',
  },
  {
    id: 5,
    name: 'شیکر پروتئین ۷۰۰ml',
    category: 'لوازم ورزشی',
    price: 180000,
    memberPrice: 140000,
    stock: 0,
    description: 'شیکر پروتئین با توری مخصوص',
    image: '',
    status: 'inactive',
  },
];

// ============================================
// اطلاعات پلن سامانه (اشتراک REBO)
// ============================================
export const planInfo = {
  name: 'نقره‌ای',
  level: 'silver',
  icon: 'Gem',
  startDate: '1403/05/01',
  expirationDate: '1404/05/01',
  daysRemaining: 240,
  totalDays: 365,
  maxUsers: 200,
  currentUsers: 5,
  features: [
    { title: 'مدیریت عضویت و اشتراک پیشرفته', active: true },
    { title: 'برنامه تمرینی شخصی‌سازی شده', active: true },
    { title: 'برنامه غذایی تخصصی', active: true },
    { title: 'حضور و غیاب هوشمند', active: true },
    { title: 'گزارشات پیشرفت', active: true },
    { title: 'اپلیکیشن کاربران', active: true },
    { title: 'پنل پیامکی', active: true },
    { title: 'مدیریت محصولات و فروشگاه', active: true },
    { title: 'پشتیبانی اختصاصی', active: false },
    { title: 'گزارشات پیشرفته مالی', active: false },
  ],
};

// ============================================
// پنل پیامکی
// ============================================
export const smsPanelInfo = {
  credit: 1250000,          // موجودی به تومان
  pricePerSms: 250,          // قیمت هر پیامک
  minCharge: 200000,         // حداقل شارژ
  sentThisMonth: 342,        // پیامک ارسال شده این ماه
  sentTotal: 1876,           // کل پیامک‌های ارسالی
};