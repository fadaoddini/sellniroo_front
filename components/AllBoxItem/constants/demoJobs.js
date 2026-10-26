// دادهٔ فیک برای پیش‌نمایش ویجت سیستم کاریابی (شکل پاسخ API)

export const DEMO_FILTER_OPTIONS = {
  provinces: [
    { id: 1, name: 'تهران', slug: 'tehran' },
    { id: 2, name: 'اصفهان', slug: 'isfahan' },
    { id: 3, name: 'فارس', slug: 'fars' },
    { id: 4, name: 'خراسان رضوی', slug: 'khorasan-razavi' },
  ],
  cities: [
    { id: 11, name: 'تهران', province: 1, slug: 'tehran-city' },
    { id: 12, name: 'کرج', province: 1, slug: 'karaj' },
    { id: 21, name: 'اصفهان', province: 2, slug: 'isfahan-city' },
    { id: 31, name: 'شیراز', province: 3, slug: 'shiraz' },
    { id: 41, name: 'مشهد', province: 4, slug: 'mashhad' },
  ],
  neighborhoods: [
    { id: 101, name: 'آزادی', city: 11 },
    { id: 102, name: 'ولیعصر', city: 11 },
    { id: 103, name: 'سعادت‌آباد', city: 11 },
    { id: 201, name: 'چهارباغ', city: 21 },
    { id: 301, name: 'معلم', city: 31 },
    { id: 401, name: 'احمدآباد', city: 41 },
  ],
  cooperation_types: [
    { id: 1, name: 'تمام وقت', slug: 'full-time' },
    { id: 2, name: 'پاره وقت', slug: 'part-time' },
    { id: 3, name: 'دورکاری', slug: 'remote' },
    { id: 4, name: 'پروژه‌ای', slug: 'project' },
  ],
  job_titles: [
    { id: 1, name: 'ویزیتور حضوری', slug: 'visitor' },
    { id: 2, name: 'فروشنده فروشگاهی', slug: 'store-seller' },
    { id: 3, name: 'فروشنده تلفنی', slug: 'phone-seller' },
    { id: 4, name: 'فروشنده سازمانی و B2B', slug: 'b2b-seller' },
    { id: 5, name: 'صندوقدار فروشگاه', slug: 'cashier' },
    { id: 6, name: 'پروموتر', slug: 'promoter' },
    { id: 7, name: 'سرپرست فروش', slug: 'sales-supervisor' },
    { id: 8, name: 'مشاور فروش', slug: 'sales-consultant' },
    { id: 9, name: 'مدیر فروش', slug: 'sales-manager' },
    { id: 10, name: 'امور مشتریان و پشتیبانی فروش', slug: 'sales-support' },
  ],
  categories: [
    { id: 1, name: 'مواد غذایی و کالاهای تند مصرف FMCG', slug: 'fmcg' },
    { id: 2, name: 'فروشگاه‌های زنجیره‌ای و خرده‌فروشی', slug: 'retail' },
    { id: 3, name: 'لوازم خانگی و کالای دیجیتال', slug: 'home-digital' },
    { id: 4, name: 'پوشاک، مد و زیبایی', slug: 'fashion' },
    { id: 5, name: 'بیمه و خدمات مالی', slug: 'finance' },
    { id: 6, name: 'دارویی، پزشکی و تجهیزات سلامت', slug: 'health' },
    { id: 7, name: 'ساختمان و املاک', slug: 'real-estate' },
    { id: 8, name: 'خودرو و صنایع وابسته', slug: 'auto' },
    { id: 9, name: 'سایر', slug: 'other' },
  ],
  features: [
    { id: 1, name: 'بیمه', slug: 'insurance', icon: 'shield-check' },
    { id: 2, name: 'ایاب و ذهاب', slug: 'transport', icon: 'truck' },
    { id: 3, name: 'پاداش', slug: 'bonus', icon: 'award' },
    { id: 4, name: 'دورکاری', slug: 'remote', icon: 'wifi' },
    { id: 5, name: 'ساعت شناور', slug: 'flexible', icon: 'clock' },
  ],
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const DEMO_BASE = {
  is_demo: true,
  is_liked: false,
  is_bookmarked: false,
  has_applied: false,
  likes_count: 12,
  views_count: 84,
  shares_count: 3,
  status: 'published',
  is_active: true,
  company_logo: null,
  contact_email: 'demo@sellniroo.local',
}

/** @type {Array<Record<string, any>>} */
export const DEMO_JOBS = [
  {
    ...DEMO_BASE,
    id: 9001,
    type: 'hiring',
    title: 'فروشنده حرفه‌ای محصولات صنعتی',
    company_name: 'آریا استاد',
    company_is_verified: true,
    is_verified: true,
    is_featured: true,
    province_name: 'تهران',
    city_name: 'تهران',
    neighborhood_name: 'آزادی',
    province: 1,
    city: 11,
    neighborhood: 101,
    min_salary: 15000000,
    max_salary: 25000000,
    cooperation_type: 1,
    cooperation_type_name: 'تمام وقت',
    job_title: 1,
    job_title_name: 'فروشنده',
    category: 1,
    category_name: 'فروش',
    experience_level_name: '۳ تا ۵ سال',
    education_level_name: 'لیسانس',
    gender_name: 'آقا / خانم',
    age_range: '۲۵ تا ۴۰ سال',
    description:
      'فروشنده حرفه‌ای با سابقه کار در حوزه صنعتی. آشنایی با مذاکره، پیگیری مشتری و ارائه گزارش فروش الزامی است. این آگهی نمونه برای تست ویجت سیستم کاریابی است.',
    contact_phone: '02191000001',
    published_at: daysAgo(1),
    created_at: daysAgo(1),
    image: null,
    company_description: 'شرکت نمونه آریا استاد — داده نمایشی',
    tags: [{ id: 1, name: 'فروش' }, { id: 2, name: 'صنعتی' }],
    features: [
      {
        id: 1,
        feature: 1,
        feature_name: 'بیمه',
        feature_icon: 'shield-check',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 2,
        feature: 2,
        feature_name: 'ایاب و ذهاب',
        feature_icon: 'truck',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 3,
        feature: 3,
        feature_name: 'پاداش',
        feature_icon: 'award',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
    ],
  },
  {
    id: 9002,
    type: 'seeking',
    title: 'بازاریاب دیجیتال با ۳ سال سابقه',
    company_name: 'رضا محمدی',
    company_is_verified: false,
    is_verified: true,
    is_featured: false,
    city_name: 'تهران',
    neighborhood_name: 'سعادت‌آباد',
    province: 1,
    city: 11,
    neighborhood: 103,
    min_salary: null,
    max_salary: null,
    cooperation_type: 2,
    cooperation_type_name: 'پاره وقت',
    job_title: 2,
    category: 2,
    description: 'بازاریاب دیجیتال با تسلط بر شبکه‌های اجتماعی و سئو',
    contact_phone: '09120000002',
    published_at: daysAgo(2),
    created_at: daysAgo(2),
    image: null,
    tags: [{ id: 3, name: 'بازاریابی' }, { id: 4, name: 'دیجیتال' }],
    features: [
      {
        id: 4,
        feature: 4,
        feature_name: 'دورکاری',
        feature_icon: 'wifi',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 5,
        feature: 5,
        feature_name: 'ساعت شناور',
        feature_icon: 'clock',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
    ],
  },
  {
    id: 9003,
    type: 'hiring',
    title: 'مشاور فروش ساختمان',
    company_name: 'پارس بنا',
    company_is_verified: true,
    is_verified: true,
    is_featured: false,
    city_name: 'اصفهان',
    neighborhood_name: 'چهارباغ',
    province: 2,
    city: 21,
    neighborhood: 201,
    min_salary: 12000000,
    max_salary: 18000000,
    cooperation_type: 1,
    cooperation_type_name: 'تمام وقت',
    job_title: 3,
    category: 1,
    description: 'مشاور فروش با تجربه در حوزه ساختمان',
    contact_phone: '03131234567',
    published_at: daysAgo(3),
    created_at: daysAgo(3),
    image: null,
    tags: [{ id: 1, name: 'فروش' }, { id: 5, name: 'ساختمان' }],
    features: [
      {
        id: 6,
        feature: 1,
        feature_name: 'بیمه',
        feature_icon: 'shield-check',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 7,
        feature: 2,
        feature_name: 'ایاب و ذهاب',
        feature_icon: 'truck',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
    ],
  },
  {
    id: 9004,
    type: 'seeking',
    title: 'مدیر فروش منطقه‌ای با ۷ سال تجربه',
    company_name: 'سارا احمدی',
    company_is_verified: false,
    is_verified: false,
    is_featured: false,
    city_name: 'شیراز',
    neighborhood_name: 'معلم',
    province: 3,
    city: 31,
    neighborhood: 301,
    min_salary: null,
    max_salary: null,
    cooperation_type: 1,
    cooperation_type_name: 'تمام وقت',
    job_title: 4,
    category: 1,
    description: 'مدیر فروش با سابقه مدیریت تیم و افزایش فروش',
    contact_phone: '09171112233',
    published_at: daysAgo(4),
    created_at: daysAgo(4),
    image: null,
    tags: [{ id: 6, name: 'مدیریت' }, { id: 1, name: 'فروش' }],
    features: [],
  },
  {
    id: 9005,
    type: 'hiring',
    title: 'کارشناس فروش تلفنی',
    company_name: 'کال سنتر پلاس',
    company_is_verified: true,
    is_verified: true,
    is_featured: true,
    city_name: 'تهران',
    neighborhood_name: 'ولیعصر',
    province: 1,
    city: 11,
    neighborhood: 102,
    min_salary: 8000000,
    max_salary: 15000000,
    cooperation_type: 1,
    cooperation_type_name: 'تمام وقت',
    job_title: 1,
    category: 1,
    description: 'کارشناس فروش تلفنی با مهارت ارتباطی بالا',
    contact_phone: '02188000005',
    published_at: daysAgo(5),
    created_at: daysAgo(5),
    image: null,
    tags: [{ id: 7, name: 'فروش تلفنی' }],
    features: [
      {
        id: 8,
        feature: 1,
        feature_name: 'بیمه',
        feature_icon: 'shield-check',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 9,
        feature: 3,
        feature_name: 'پاداش',
        feature_icon: 'award',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 10,
        feature: 5,
        feature_name: 'ساعت شناور',
        feature_icon: 'clock',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
    ],
  },
  {
    id: 9006,
    type: 'seeking',
    title: 'بازاریاب شبکه‌های اجتماعی',
    company_name: 'محمد رضایی',
    company_is_verified: false,
    is_verified: false,
    is_featured: false,
    city_name: 'مشهد',
    neighborhood_name: 'احمدآباد',
    province: 4,
    city: 41,
    neighborhood: 401,
    min_salary: null,
    max_salary: null,
    cooperation_type: 2,
    cooperation_type_name: 'پاره وقت',
    job_title: 2,
    category: 2,
    description: 'بازاریاب با تسلط بر اینستاگرام و لینکدین',
    contact_phone: '09151112233',
    published_at: daysAgo(6),
    created_at: daysAgo(6),
    image: null,
    tags: [{ id: 3, name: 'بازاریابی' }, { id: 8, name: 'شبکه‌های اجتماعی' }],
    features: [
      {
        id: 11,
        feature: 4,
        feature_name: 'دورکاری',
        feature_icon: 'wifi',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
    ],
  },
  {
    id: 9007,
    type: 'hiring',
    title: 'نماینده فروش لوازم پزشکی',
    company_name: 'مدیکو تجهیز',
    company_is_verified: true,
    is_verified: true,
    is_featured: false,
    city_name: 'تهران',
    neighborhood_name: 'آزادی',
    province: 1,
    city: 11,
    neighborhood: 101,
    min_salary: 18000000,
    max_salary: 28000000,
    cooperation_type: 1,
    cooperation_type_name: 'تمام وقت',
    job_title: 1,
    category: 1,
    description: 'نماینده فروش با سابقه در حوزه تجهیزات پزشکی',
    contact_phone: '02166000007',
    published_at: daysAgo(7),
    created_at: daysAgo(7),
    image: null,
    tags: [{ id: 9, name: 'پزشکی' }, { id: 1, name: 'فروش' }],
    features: [
      {
        id: 12,
        feature: 1,
        feature_name: 'بیمه',
        feature_icon: 'shield-check',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 13,
        feature: 2,
        feature_name: 'ایاب و ذهاب',
        feature_icon: 'truck',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
      {
        id: 14,
        feature: 3,
        feature_name: 'پاداش',
        feature_icon: 'award',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
    ],
  },
  {
    id: 9008,
    type: 'hiring',
    title: 'ویزیتور فروش مواد غذایی',
    company_name: 'سپهر پخش',
    company_is_verified: false,
    is_verified: true,
    is_featured: false,
    city_name: 'کرج',
    neighborhood_name: '',
    province: 1,
    city: 12,
    neighborhood: null,
    min_salary: 14000000,
    max_salary: 20000000,
    cooperation_type: 1,
    cooperation_type_name: 'تمام وقت',
    job_title: 2,
    category: 1,
    description: 'ویزیتور فروش با خودرو و مسیر ثابت',
    contact_phone: '02634000008',
    published_at: daysAgo(8),
    created_at: daysAgo(8),
    image: null,
    tags: [{ id: 10, name: 'ویزیتور' }],
    features: [
      {
        id: 15,
        feature: 2,
        feature_name: 'ایاب و ذهاب',
        feature_icon: 'truck',
        feature_type: 'boolean',
        value_boolean: true,
        value: true,
      },
    ],
  },
]

const PROVINCE_NAME = Object.fromEntries(
  (DEMO_FILTER_OPTIONS.provinces || []).map((p) => [String(p.id), p.name])
)

function enrichDemoJob(job) {
  if (!job) return null
  return {
    ...DEMO_BASE,
    ...job,
    is_demo: true,
    province_name:
      job.province_name || PROVINCE_NAME[String(job.province)] || '',
    description:
      job.description ||
      `توضیحات نمونه برای آگهی «${job.title}». این رکورد دمو است و روی سرور ذخیره نشده.`,
    company_description:
      job.company_description ||
      `${job.company_name || 'شرکت نمونه'} — داده نمایشی برای تست`,
  }
}

/** آیا این شناسه متعلق به آگهی دمو است؟ */
export function isDemoJobId(id) {
  const n = Number(id)
  return Number.isFinite(n) && n >= 9000 && n < 10000
}

/** جزئیات آگهی دمو برای صفحه /jobs/[id] */
export function getDemoJobById(id) {
  const found = DEMO_JOBS.find((j) => String(j.id) === String(id))
  return enrichDemoJob(found)
}

/**
 * فیلتر و صفحه‌بندی کلاینتی روی دادهٔ دمو
 */
export function filterDemoJobs(allJobs, filters = {}, sortBy = '-created_at') {
  let list = [...(allJobs || DEMO_JOBS)]

  if (filters.adType) {
    list = list.filter((j) => j.type === filters.adType)
  }
  if (filters.province) {
    list = list.filter((j) => String(j.province) === String(filters.province))
  }
  if (filters.city) {
    list = list.filter((j) => String(j.city) === String(filters.city))
  }
  if (filters.neighborhood) {
    list = list.filter(
      (j) => String(j.neighborhood) === String(filters.neighborhood)
    )
  }
  if (filters.cooperationType) {
    list = list.filter(
      (j) => String(j.cooperation_type) === String(filters.cooperationType)
    )
  }
  if (filters.jobTitle) {
    list = list.filter((j) => String(j.job_title) === String(filters.jobTitle))
  }
  if (filters.category) {
    list = list.filter((j) => String(j.category) === String(filters.category))
  }
  if (filters.isVerified) {
    list = list.filter((j) => j.is_verified || j.company_is_verified)
  }
  if (Array.isArray(filters.features) && filters.features.length) {
    list = list.filter((j) => {
      const ids = (j.features || [])
        .filter((f) => f.value)
        .map((f) => String(f.feature))
      return filters.features.every((fid) => ids.includes(String(fid)))
    })
  }
  if (filters.q) {
    const q = String(filters.q).trim().toLowerCase()
    list = list.filter((j) => {
      const hay = [
        j.title,
        j.company_name,
        j.city_name,
        j.description,
        ...(j.tags || []).map((t) => t.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }

  if (sortBy === 'created_at') {
    list.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    )
  } else {
    list.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  }

  return list
}

export function paginateDemoJobs(list, page = 1, pageSize = 12) {
  const start = (page - 1) * pageSize
  const results = list.slice(start, start + pageSize)
  return {
    count: list.length,
    results,
    next: start + pageSize < list.length ? page + 1 : null,
  }
}

/** منبع ویجت کارت‌ها از دمو */
export function getDemoJobsBySource(source, limit = 8) {
  let list = DEMO_JOBS.map(enrichDemoJob)
  if (source === 'featured') list = list.filter((j) => j.is_featured)
  else if (source === 'hiring') list = list.filter((j) => j.type === 'hiring')
  else if (source === 'seeking') list = list.filter((j) => j.type === 'seeking')
  // latest = همه، جدیدتر اول
  list = filterDemoJobs(list, {}, '-created_at')
  return list.slice(0, Math.max(1, limit))
}

export const DEMO_CATEGORIES = [
  { id: 1, name: 'فروش', slug: 'sales', jobs_count: 42, icon: 'briefcase' },
  { id: 2, name: 'بازاریابی', slug: 'marketing', jobs_count: 28, icon: 'megaphone' },
  { id: 3, name: 'ویزیتوری', slug: 'visiting', jobs_count: 19, icon: 'map' },
  { id: 4, name: 'مدیریت فروش', slug: 'sales-mgmt', jobs_count: 11, icon: 'users' },
  { id: 5, name: 'فروش تلفنی', slug: 'telesales', jobs_count: 15, icon: 'phone' },
  { id: 6, name: 'دیجیتال مارکتینگ', slug: 'digital', jobs_count: 22, icon: 'globe' },
]

export const DEMO_COMPANIES = [
  {
    id: 1,
    name: 'آریا استاد',
    is_verified: true,
    city_name: 'تهران',
    jobs_count: 12,
    logo: null,
    description: 'شرکت نمونه تاییدشده',
  },
  {
    id: 2,
    name: 'پارس بنا',
    is_verified: true,
    city_name: 'اصفهان',
    jobs_count: 5,
    logo: null,
    description: 'ساختمان و فروش',
  },
  {
    id: 3,
    name: 'مدیکو تجهیز',
    is_verified: true,
    city_name: 'تهران',
    jobs_count: 8,
    logo: null,
    description: 'تجهیزات پزشکی',
  },
  {
    id: 4,
    name: 'سپهر پخش',
    is_verified: true,
    city_name: 'کرج',
    jobs_count: 3,
    logo: null,
    description: 'پخش مواد غذایی',
  },
]

export const DEMO_RESUMES = [
  {
    id: 1,
    slug: 'demo-reza',
    full_name: 'رضا محمدی',
    title: 'بازاریاب دیجیتال',
    city_name: 'تهران',
    experience_years: 3,
    is_public: true,
  },
  {
    id: 2,
    slug: 'demo-sara',
    full_name: 'سارا احمدی',
    title: 'مدیر فروش منطقه‌ای',
    city_name: 'شیراز',
    experience_years: 7,
    is_public: true,
  },
  {
    id: 3,
    slug: 'demo-mohammad',
    full_name: 'محمد رضایی',
    title: 'بازاریاب شبکه‌های اجتماعی',
    city_name: 'مشهد',
    experience_years: 2,
    is_public: true,
  },
]

export const DEMO_JOB_STATS = {
  total_jobs: 128,
  hiring_count: 86,
  seeking_count: 42,
  companies_count: 34,
  verified_companies: 18,
}
