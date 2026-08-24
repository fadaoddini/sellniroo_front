// modules/lsf/context/LsfData.js

export const LSF_TRANSLATIONS = {
  fa: {
    // ========== هیرو سکشن ==========
    hero: {
      badge: "سازه‌های سبک فولادی LSF",
      title: "سازه‌های ال اس اف",
      titleSuffix: "آینده ساختمان‌سازی",
      subtitle: "هلدینگ آریا استاد، بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی LSF با بیش از ۲۵ سال تجربه و ۱۷۰۰+ پروژه موفق در ایران",
      primaryBtn: "مشاهده پلان‌ها",
      secondaryBtn: "مشاوره رایگان",
      teamText: "۲۵۰+ متخصص در تیم",
      floatingLabel: "رضایت ۱۴۰۰+ مشتری",
    },

    // ========== آمار ==========
    stats: [
      { value: '۱۷۰۰+', label: 'پروژه موفق' },
      { value: '۳', label: 'کارخانه فعال' },
      { value: '۲۵۰+', label: 'تیم متخصص' },
      { value: '۱۴۰۰+', label: 'مشتری راضی' },
    ],

    // ========== محصولات ==========
    products: {
      section: {
        badge: "محصولات ما",
        title: "محصولات ال اس اف",
        desc: "انواع سازه‌های ال اس اف برای مصارف مسکونی، تجاری و صنعتی با بالاترین کیفیت",
      },
      items: [
        {
          id: 1,
          title: 'سازه ال اس اف مسکونی',
          description: 'سازه‌های سبک فولادی مناسب برای ویلا و ساختمان‌های مسکونی با سرعت اجرای بالا و افزایش ۹ تا ۱۲ درصدی فضای مفید',
          features: ['مقاوم در برابر زلزله تا ۸ ریشتر', 'عایق حرارتی و صوتی', 'سرعت اجرا ۳ برابر سریع‌تر'],
          price: 'از ۱,۲۰۰,۰۰۰ تومان',
        },
        {
          id: 2,
          title: 'سازه ال اس اف تجاری',
          description: 'سازه‌های سبک فولادی برای ساختمان‌های تجاری، اداری و صنعتی با دهانه‌های بزرگ و قابلیت گسترش',
          features: ['دهانه‌های بزرگ تا ۱۲ متر', 'سازه سبک ۲۵-۳۰٪ سبک‌تر', 'قابلیت گسترش و توسعه'],
          price: 'از ۱,۵۰۰,۰۰۰ تومان',
        },
        {
          id: 3,
          title: 'سازه ال اس اف صنعتی',
          description: 'سازه‌های سبک فولادی برای سالن‌های تولید، انبار و کارخانه با مقاومت بالا و دوام طولانی',
          features: ['مقاومت بالا در برابر بارهای سنگین', 'عایق صوتی و حرارتی', 'دوام طولانی و مقاوم در برابر خوردگی'],
          price: 'از ۱,۸۰۰,۰۰۰ تومان',
        },
        {
          id: 4,
          title: 'پنل‌های ال اس اف',
          description: 'پنل‌های پیش‌ساخته ال اس اف برای دیوار، سقف و کف با کیفیت عالی و نصب سریع',
          features: ['نصب سریع و آسان', 'کیفیت یکنواخت کارخانه‌ای', 'قیمت مناسب و اقتصادی'],
          price: 'از ۸۵۰,۰۰۰ تومان',
        },
      ],
      btn: "استعلام قیمت",
    },

    // ========== کارخانه‌ها ==========
    factories: {
      section: {
        badge: "کارخانه‌های ما",
        title: "کارخانه‌های فعال",
        desc: "سه کارخانه فعال و مجهز در نقاط استراتژیک کشور با بالاترین ظرفیت تولید",
      },
      items: [
        {
          id: 1,
          name: 'کارخانه مشهد',
          location: 'مشهد، شهرک صنعتی بینالود، خیابان خودکفایی، قطعه ۱۹/۶',
          capacity: '۵۰۰۰ مترمربع در ماه',
          employees: 120,
        },
        {
          id: 2,
          name: 'کارخانه تهران',
          location: 'تهران، شهر قدس، شهرک ابریشم، خیابان صنعت‌گران، پلاک ۱۳',
          capacity: '۴۰۰۰ مترمربع در ماه',
          employees: 95,
        },
        {
          id: 3,
          name: 'کارخانه ساری',
          location: 'ساری، کیلومتر ۵ جاده ساری به نکاح، روستای سمسکنده، بلوار ولیعصر، جنب سبدسازی قاسمی',
          capacity: '۳۰۰۰ مترمربع در ماه',
          employees: 75,
        },
      ],
      capacityLabel: "ظرفیت تولید:",
      employeesLabel: "پرسنل",
    },

    // ========== زمان‌بندی ==========
    timeline: {
      section: {
        badge: "زمان‌بندی اجرا",
        title: "زمان‌بندی پروژه",
        desc: "فرآیند اجرای پروژه‌های ال اس اف در چند مرحله سریع و کارآمد",
      },
      items: [
        { step: 1, title: 'مشاوره و طراحی', duration: '۵-۷ روز', description: 'بررسی نیازها، طراحی اولیه و ارائه پلان توسط تیم مهندسی مجرب' },
        { step: 2, title: 'تولید قطعات', duration: '۱۰-۱۵ روز', description: 'تولید قطعات در کارخانه با کیفیت تضمینی و نظارت کامل' },
        { step: 3, title: 'آماده‌سازی زمین', duration: '۳-۵ روز', description: 'آماده‌سازی محل پروژه، پی‌سازی و زیرسازی مناسب' },
        { step: 4, title: 'نصب و اجرا', duration: '۱۵-۳۰ روز', description: 'نصب قطعات با تیم تخصصی و نظارت مهندسی (سازه ۴ طبقه در ۱۲۰ روز)' },
        { step: 5, title: 'تکمیل و تحویل', duration: '۳-۷ روز', description: 'تکمیل نهایی، تست‌های کیفی و تحویل پروژه به کارفرما' },
      ],
    },

    // ========== مزایا ==========
    advantages: {
      section: {
        badge: "مزایای رقابتی",
        title: "چالش‌ها و مزایای ال اس اف",
        desc: "سازه‌های ال اس اف با مزایای منحصر‌به‌فرد، چالش‌های ساختمان‌سازی را کاهش می‌دهند",
      },
      items: [
        { id: 1, title: 'مقاوم در برابر زلزله', description: 'سازه‌های LSF تا ۸ ریشتر مقاومت دارند و به دلیل سبکی ۲۵-۳۰٪، نیروی زلزله کاهش می‌یابد' },
        { id: 2, title: 'سرعت اجرای بالا', description: 'اجرا در ۴۰-۶۰ روز نسبت به روش‌های سنتی (۳ برابر سریع‌تر)' },
        { id: 3, title: 'سازگار با محیط زیست', description: 'قابلیت بازیافت ۱۰۰٪ و کاهش مصرف انرژی تا ۵۰٪' },
        { id: 4, title: 'مقاوم در برابر آتش', description: 'عایق‌های ضد حریق استاندارد و مقاوم در برابر آتش‌سوزی' },
        { id: 5, title: 'عایق صوتی عالی', description: 'کاهش ۸۰٪ انتقال صدا بین فضاها با عایق‌بندی استاندارد' },
        { id: 6, title: 'مقاوم در برابر رطوبت', description: 'مقاوم در برابر پوسیدگی، قارچ و رطوبت با پوشش گالوانیزه' },
        { id: 7, title: 'افزایش فضای مفید', description: 'افزایش ۹ تا ۱۲ درصدی فضای مفید داخلی به دلیل کاهش ضخامت دیوارها' },
        { id: 8, title: 'اجرای آسان تأسیسات', description: 'مسیرهای استاندارد در جان مقاطع برای عبور تأسیسات مکانیکی و برقی' },
      ],
    },

    // ========== سوالات متداول ==========
    faq: {
      section: {
        badge: "پرسش‌های متداول",
        title: "سوالات متداول",
        desc: "پاسخ به سوالات رایج درباره سازه‌های ال اس اف",
      },
      items: [
        {
          question: 'سازه ال اس اف (LSF) چیست و چه کاربردی دارد؟',
          answer: 'سازه ال اس اف یا همان اسکلت فولادی سبک، یک سیستم ساختمانی مدرن و پیشرفته است که از پروفیل‌های فولادی گالوانیزه با ضخامت کم (نورد سرد) تشکیل شده است. این سیستم به عنوان اسکلت اصلی ساختمان‌ها و دیوارهای باربر مورد استفاده قرار می‌گیرد و دارای تاییدیه فنی از مرکز تحقیقات ساختمان و مسکن می‌باشد.'
        },
        {
          question: 'مهم‌ترین مزایای سازه ال اس اف نسبت به سازه‌های سنتی چیست؟',
          answer: 'مزایای بی‌نظیر سازه ال اس اف شامل: سرعت بسیار بالای اجرا (۳ برابر سریع‌تر از روش‌های سنتی)، افزایش ۹ تا ۱۲ درصدی فضای مفید داخلی، کاهش ۲۵ تا ۳۰ درصدی وزن سازه و در نتیجه کاهش نیروی زلزله، هزینه تمام‌شده کمتر، عایق‌بندی حرارتی و صوتی عالی، مقاومت بالا در برابر خوردگی و رطوبت، قابلیت بازیافت ۱۰۰ درصدی و ایمنی بالا در برابر آتش‌سوزی می‌باشد.'
        },
        {
          question: 'مدت زمان اجرای یک پروژه با سیستم ال اس اف چقدر است؟',
          answer: 'سیستم LSF این فرصت را برای سازندگان ایجاد می‌کند تا سرمایه آن‌ها در کمترین زمان بازگردد. برای مثال، احداث یک سازه ۴ طبقه با زیربنای هزار متر مربع تنها به ۱۲۰ روز کاری نیاز دارد که حدود ۳ برابر سریع‌تر از روش‌های سنتی است.'
        },
        {
          question: 'آیا سازه‌های ال اس اف در برابر زلزله مقاوم هستند؟',
          answer: 'بله! به دلیل سبکی سازه‌های LSF (حدوداً ۲۵ تا ۳۰ درصد سازه‌های معمول)، نیروی زلزله وارد بر ساختمان به همان نسبت کاهش می‌یابد و مقاومت آن در برابر زمین‌لرزه به طرز چشمگیری افزایش می‌یابد. همچنین از سیستم‌های دیوار برشی و اتصالات فولادی مورب (بادبندها) برای افزایش مقاومت لرزه‌ای استفاده می‌شود.'
        },
        {
          question: 'هزینه ساخت با سیستم ال اس اف نسبت به روش‌های سنتی چگونه است؟',
          answer: 'هزینه تمام‌شده سازه LSF به مراتب کمتر از سازه‌های بتنی و فولادی است. علاوه بر کاهش وزن فولاد مصرفی، هزینه‌های حمل‌ونقل، نیروی کار و زمان نیز به طور قابل توجهی کاهش می‌یابد و در بلندمدت به دلیل عایق‌بندی عالی، صرفه‌جویی قابل‌توجهی در هزینه‌های گرمایش و سرمایش ایجاد می‌کند.'
        },
        {
          question: 'آیا سازه‌های ال اس اف در مناطق مرطوب و شمال کشور قابل اجرا هستند؟',
          answer: 'بله! تمام مقاطع فولادی در سیستم LSF گالوانیزه هستند و در برابر خوردگی، رطوبت و شرایط جوی متفاوت (مانند مناطق شمالی و جنوبی کشور) از مقاومت و عمر مفید بسیار بالایی برخوردارند.'
        },
        {
          question: 'آیا می‌توان از نماهای سنتی در ساختمان‌های ال اس اف استفاده کرد؟',
          answer: 'بله! در نمای خارجی و داخلی ساختمان‌های LSF می‌توان از هر نوع مصالحی (سنگ، آجر، چوب، رنگ، کاغذ دیواری و ...) استفاده کرد و هیچ تفاوتی با ساختمان‌های معمولی از نظر ظاهری احساس نمی‌شود.'
        },
        {
          question: 'آیا سازه ال اس اف قابلیت بازیافت دارد؟',
          answer: 'بله! اکثر قطعات این سازه‌ها به صورت پیچی اجرا می‌شوند و در پایان عمر مفید ساختمان، قابلیت بازیافت، دمونتاژ و استفاده مجدد دارند که آن را به گزینه‌ای کاملاً دوستدار محیط زیست تبدیل کرده است.'
        },
        {
          question: 'عایق‌بندی در سازه‌های ال اس اف چگونه است؟',
          answer: 'سازه‌های LSF دارای عایق‌بندی حرارتی و صوتی بسیار مناسب هستند. تبادل انرژی در این ساختمان‌ها به حداقل می‌رسد و عایق‌های به کار رفته در این سیستم از استانداردهای ضد حریق برخوردار هستند و ایمنی بالایی در برابر آتش‌سوزی ایجاد می‌کنند.'
        },
        {
          question: 'آیا اجرای تأسیسات در سازه‌های ال اس اف دشوار است؟',
          answer: 'خیر! مسیرهای استانداردی در جان مقاطع برای عبور تأسیسات مکانیکی و برقی در نظر گرفته شده است که سرعت و دقت اجرای تأسیسات را افزایش می‌دهد.'
        },
        {
          question: 'حداکثر تعداد طبقات در سازه‌های ال اس اف چند طبقه است؟',
          answer: 'تحقیقات جهانی نشان داده است که سازه‌های LSF به عنوان جایگزینی بسیار مقاوم، ارزان‌قیمت و سبک‌تر نسبت به سازه‌های سنتی، به ویژه در ساختمان‌های کوچک و متوسط (۱ تا ۴ طبقه) عملکردی عالی دارند. البته با استفاده از سیستم‌های پیشرفته‌تر، امکان ساخت طبقات بیشتر نیز وجود دارد.'
        },
        {
          question: 'آیا هلدینگ آریا استاد گواهینامه‌های معتبر دارد؟',
          answer: 'بله! هلدینگ آریا استاد موفق به اخذ بالاترین گواهینامه‌های اجرایی در کشور شده است از جمله: گرید ۲ انبوه‌سازی از سازمان مسکن و شهرسازی و گرید ابنیه و راه‌سازی از سازمان برنامه و بودجه که نشان از تعهد و کیفیت بالای کار این مجموعه دارد.'
        },
        {
          question: 'چگونه می‌توانم با کارشناسان هلدینگ آریا استاد مشاوره رایگان بگیرم؟',
          answer: 'برای مشاوره رایگان می‌توانید از طریق وب‌سایت رسمی مجموعه به نشانی ariastudholding.com با کارشناسان هلدینگ آریا استاد در ارتباط باشید. همچنین می‌توانید با شماره تماس ۰۵۱۳۷۶۸۸۵۰۰ یا ۰۹۱۵۱۲۴۴۸۹۸ تماس حاصل فرمایید.'
        },
        {
          question: 'تفاوت سازه ال اس اف با سازه فولادی سنگین چیست؟',
          answer: 'سازه ال اس اف از پروفیل‌های فولادی گالوانیزه با ضخامت کم (نورد سرد) تشکیل شده است در حالی که سازه فولادی سنگین از تیرآهن‌های سنگین و ستون‌های قوی استفاده می‌کند. ال اس اف بسیار سبک‌تر، سریع‌الاجراتر و اقتصادی‌تر بوده و برای ساختمان‌های تا ۴ طبقه گزینه مناسب‌تری است.'
        },
        {
          question: 'آیا هلدینگ آریا استاد کارخانه تولیدی دارد؟',
          answer: 'بله! هلدینگ آریا استاد با بهره‌مندی از سه کارخانه فعال و مجهز در نقاط استراتژیک کشور (مشهد، تهران و ساری) توانایی پاسخگویی به نیازهای پروژه‌های بزرگ را دارد.'
        },
        {
          question: 'چه مدت زمانی طول می‌کشد تا یک ساختمان با ال اس اف ساخته شود؟',
          answer: 'مدت زمان اجرای پروژه‌های ال اس اف بسته به پیچیدگی طراحی و متراژ، بسیار کمتر از روش‌های سنتی است. به عنوان مثال، احداث یک سازه ۴ طبقه با زیربنای هزار متر مربع تنها به ۱۲۰ روز کاری نیاز دارد.'
        },
        {
          question: 'آدرس دفتر مرکزی هلدینگ آریا استاد کجاست؟',
          answer: 'دفتر مرکزی هلدینگ آریا استاد در مشهد، خیام جنوبی ۲۲، پلاک ۴۸ واقع شده است. مدیریت این مجموعه بر عهده جناب آقای مهندس مرتضی شریعتی می‌باشد.'
        },
        {
          question: 'چگونه می‌توانم از خدمات هلدینگ آریا استاد استفاده کنم؟',
          answer: 'برای استفاده از خدمات هلدینگ آریا استاد می‌توانید با شماره‌های ۰۵۱۳۷۶۸۸۵۰۰ یا ۰۹۱۵۱۲۴۴۸۹۸ تماس بگیرید و یا از طریق وب‌سایت ariastudholding.com درخواست مشاوره رایگان ثبت کنید. کارشناسان ما در اسرع وقت با شما تماس خواهند گرفت.'
        },
      ],
    },

    // modules/lsf/context/LsfData.js - بخش contact را به‌روز کنید

// ========== فرم تماس ==========
contact: {
  title: "درخواست مشاوره رایگان",
  desc: "کارشناسان ما با بررسی دقیق نیازهای شما، بهترین راهکار را ارائه می‌دهند",
  phone: "۰۵۱۳۷۶۸۸۵۰۰",
  phoneLabel: "پشتیبانی ",
  mobile: "۰۹۱۵۱۲۴۴۸۹۸",
  mobileLabel: "ارتباط با کارشناس",
  email: "info@ariastudholding.com",
  emailLabel: "ارسال ایمیل",
  address: "مشهد، خیام جنوبی ۲۲، پلاک ۴۸",
  addressLabel: "دفتر مرکزی",
  form: {
    name: "نام و نام خانوادگی",
    phone: "شماره موبایل",
    email: "ایمیل (اختیاری)",
    message: "توضیحات درخواست شما...",
    options: {
      consulting: "مشاوره رایگان",
      cooperation: "درخواست همکاری",
      wholesale: "فروش عمده",
      technical: "پشتیبانی فنی",
    },
    submit: "ارسال درخواست",
    success: "✅ درخواست شما با موفقیت ارسال شد",
    error: "❌ خطا در ارسال درخواست، لطفاً مجدداً تلاش کنید",
  },
},

    // ========== فوتر ==========
    footer: {
      about: "هلدینگ آریا استاد با بیش از ۲۵ سال تجربه، بزرگترین تولیدکننده و مجری تخصصی سازه‌های سبک فولادی LSF در ایران با ۳ کارخانه فعال و ۱۷۰۰+ پروژه موفق",
      quickLinks: "دسترسی سریع",
      services: "خدمات ما",
      contact: "ارتباط با ما",
      rights: "تمام حقوق مادی و معنوی این سایت متعلق به هلدینگ آریا استاد می‌باشد.",
    },
  },

  en: {
    // ========== Hero Section ==========
    hero: {
      badge: "Light Steel Frame Structures LSF",
      title: "LSF Structures",
      titleSuffix: "The Future of Construction",
      subtitle: "Aria Stud Holding, the largest manufacturer and specialized executor of LSF lightweight steel structures with over 25 years of experience and 1700+ successful projects in Iran",
      primaryBtn: "View Plans",
      secondaryBtn: "Free Consultation",
      teamText: "250+ Experts in Team",
      floatingLabel: "1400+ Satisfied Clients",
    },

    // ========== Stats ==========
    stats: [
      { value: '1700+', label: 'Successful Projects' },
      { value: '3', label: 'Active Factories' },
      { value: '250+', label: 'Expert Team' },
      { value: '1400+', label: 'Satisfied Clients' },
    ],

    // ========== Products ==========
    products: {
      section: {
        badge: "Our Products",
        title: "LSF Products",
        desc: "Various LSF structures for residential, commercial and industrial use with the highest quality",
      },
      items: [
        {
          id: 1,
          title: 'Residential LSF Structure',
          description: 'Lightweight steel structures suitable for villas and residential buildings with high execution speed and 9-12% increase in useful space',
          features: ['Earthquake Resistant up to 8 Richter', 'Thermal & Sound Insulation', '3x Faster Execution'],
          price: 'From 1,200,000 Tomans',
        },
        {
          id: 2,
          title: 'Commercial LSF Structure',
          description: 'Lightweight steel structures for commercial, office and industrial buildings with large spans and expandability',
          features: ['Large Spans up to 12m', '25-30% Lighter', 'Expandable & Developable'],
          price: 'From 1,500,000 Tomans',
        },
        {
          id: 3,
          title: 'Industrial LSF Structure',
          description: 'Lightweight steel structures for production halls, warehouses and factories with high strength and long durability',
          features: ['High Load Resistance', 'Sound & Thermal Insulation', 'Long Durability & Corrosion Resistant'],
          price: 'From 1,800,000 Tomans',
        },
        {
          id: 4,
          title: 'LSF Panels',
          description: 'Prefabricated LSF panels for walls, ceilings and floors with excellent quality and quick installation',
          features: ['Quick & Easy Installation', 'Factory Quality', 'Affordable Price'],
          price: 'From 850,000 Tomans',
        },
      ],
      btn: "Request Price",
    },

    // ========== Factories ==========
    factories: {
      section: {
        badge: "Our Factories",
        title: "Active Factories",
        desc: "Three active and equipped factories in strategic locations across the country with the highest production capacity",
      },
      items: [
        {
          id: 1,
          name: 'Mashhad Factory',
          location: 'Mashhad, Between Road Industrial City, Khodkafayi St., Plot 19/6',
          capacity: '5000 sqm per month',
          employees: 120,
        },
        {
          id: 2,
          name: 'Tehran Factory',
          location: 'Tehran, Ghods City, Abrisham Industrial Town, Sanatgaran St., No. 13',
          capacity: '4000 sqm per month',
          employees: 95,
        },
        {
          id: 3,
          name: 'Sari Factory',
          location: 'Sari, Km 5 Sari to Nekah Road, Samsakandeh Village, Valiasr Blvd., Next to Ghasemi Basket Factory',
          capacity: '3000 sqm per month',
          employees: 75,
        },
      ],
      capacityLabel: "Production Capacity:",
      employeesLabel: "Employees",
    },

    // ========== Timeline ==========
    timeline: {
      section: {
        badge: "Execution Timeline",
        title: "Project Timeline",
        desc: "The process of executing LSF projects in several fast and efficient stages",
      },
      items: [
        { step: 1, title: 'Consultation & Design', duration: '5-7 Days', description: 'Needs assessment, initial design and plan presentation by experienced engineering team' },
        { step: 2, title: 'Parts Production', duration: '10-15 Days', description: 'Production of parts in the factory with guaranteed quality and full supervision' },
        { step: 3, title: 'Site Preparation', duration: '3-5 Days', description: 'Site preparation, foundation and proper substructure' },
        { step: 4, title: 'Installation & Execution', duration: '15-30 Days', description: 'Installation of parts by specialized team and engineering supervision (4-story structure in 120 days)' },
        { step: 5, title: 'Completion & Delivery', duration: '3-7 Days', description: 'Final completion, quality testing and project delivery to client' },
      ],
    },

    // ========== Advantages ==========
    advantages: {
      section: {
        badge: "Competitive Advantages",
        title: "LSF Challenges & Benefits",
        desc: "LSF structures with unique advantages reduce construction challenges",
      },
      items: [
        { id: 1, title: 'Earthquake Resistant', description: 'LSF structures resist up to 8 Richter and due to 25-30% lighter weight, earthquake force is reduced' },
        { id: 2, title: 'High Execution Speed', description: 'Execution in 40-60 days compared to traditional methods (3x faster)' },
        { id: 3, title: 'Eco-Friendly', description: '100% recyclable and up to 50% reduction in energy consumption' },
        { id: 4, title: 'Fire Resistant', description: 'Standard fireproof insulation and fire resistant' },
        { id: 5, title: 'Excellent Sound Insulation', description: '80% reduction in sound transmission between spaces with standard insulation' },
        { id: 6, title: 'Moisture Resistant', description: 'Resistant to decay, fungus and moisture with galvanized coating' },
        { id: 7, title: 'Increased Useful Space', description: '9-12% increase in useful indoor space due to reduced wall thickness' },
        { id: 8, title: 'Easy Installation of Facilities', description: 'Standard channels in sections for mechanical and electrical installations' },
      ],
    },

    // ========== FAQ ==========
    faq: {
      section: {
        badge: "Frequently Asked Questions",
        title: "FAQ",
        desc: "Answers to common questions about LSF structures",
      },
      items: [
        {
          question: 'What is LSF (Light Steel Frame) structure and what is it used for?',
          answer: 'LSF (Light Steel Frame) is a modern and advanced building system made of lightweight galvanized steel sections (cold-formed). This system is used as the main frame of buildings and load-bearing walls and has technical approval from the Building and Housing Research Center.'
        },
        {
          question: 'What are the most important advantages of LSF compared to traditional structures?',
          answer: 'The unique advantages of LSF structures include: very high execution speed (3x faster than traditional methods), 9-12% increase in useful space, 25-30% reduction in structure weight and consequently reduced earthquake force, lower total cost, excellent thermal and sound insulation, high resistance to corrosion and moisture, 100% recyclability, and high fire safety.'
        },
        {
          question: 'How long does an LSF project take to execute?',
          answer: 'The LSF system allows builders to recover their investment in the shortest possible time. For example, constructing a 4-story structure with 1000 square meters of floor area takes only 120 working days, which is about 3 times faster than traditional methods.'
        },
        {
          question: 'Are LSF structures resistant to earthquakes?',
          answer: 'Yes! Due to the lightness of LSF structures (approximately 25-30% of conventional structures), the earthquake force on the building is proportionally reduced, and their resistance to earthquakes significantly increases. Shear wall systems and diagonal steel connections (braces) are also used to increase seismic resistance.'
        },
        {
          question: 'How does the cost of LSF construction compare to traditional methods?',
          answer: 'The total cost of LSF structures is significantly lower than concrete and steel structures. In addition to reducing steel consumption, transportation, labor, and time costs are also significantly reduced, and in the long term, due to excellent insulation, considerable savings are made in heating and cooling costs.'
        },
        {
          question: 'Can LSF structures be implemented in humid areas and northern regions of Iran?',
          answer: 'Yes! All steel sections in the LSF system are galvanized and have very high resistance and useful life against corrosion, moisture, and different weather conditions (such as northern and southern regions of the country).'
        },
        {
          question: 'Can traditional facades be used in LSF buildings?',
          answer: 'Yes! Any type of material (stone, brick, wood, paint, wallpaper, etc.) can be used for the exterior and interior facades of LSF buildings, and there is no visual difference from conventional buildings.'
        },
        {
          question: 'Is LSF structure recyclable?',
          answer: 'Yes! Most parts of these structures are installed with screws and at the end of the building\'s useful life, they can be recycled, dismantled, and reused, making it a completely environmentally friendly option.'
        },
        {
          question: 'How is insulation in LSF structures?',
          answer: 'LSF structures have very suitable thermal and sound insulation. Energy exchange in these buildings is minimized, and the insulation used in this system meets fireproof standards and provides high fire safety.'
        },
        {
          question: 'Is installing facilities difficult in LSF structures?',
          answer: 'No! Standard channels are provided in the sections for mechanical and electrical installations, which increases the speed and accuracy of facility installation.'
        },
        {
          question: 'What is the maximum number of floors in LSF structures?',
          answer: 'Global research has shown that LSF structures, as a very strong, affordable, and lighter alternative to traditional structures, perform excellently especially in small and medium buildings (1 to 4 floors). Of course, with more advanced systems, it is possible to build more floors.'
        },
        {
          question: 'Does Aria Stud Holding have valid certifications?',
          answer: 'Yes! Aria Stud Holding has obtained the highest executive certifications in the country, including: Grade 2 Mass Construction from the Housing and Urban Development Organization and Grade Building and Road Construction from the Planning and Budget Organization, which demonstrates the commitment and high quality of this group\'s work.'
        },
        {
          question: 'How can I get a free consultation with Aria Stud Holding experts?',
          answer: 'For a free consultation, you can contact Aria Stud Holding experts through the official website at ariastudholding.com. You can also call 05137688500 or 09151244898.'
        },
        {
          question: 'What is the difference between LSF and heavy steel structures?',
          answer: 'LSF structures consist of lightweight galvanized steel sections (cold-formed), while heavy steel structures use heavy beams and strong columns. LSF is much lighter, faster to execute, and more economical, and is a more suitable option for buildings up to 4 floors.'
        },
        {
          question: 'Does Aria Stud Holding have production factories?',
          answer: 'Yes! Aria Stud Holding, with three active and equipped factories in strategic locations across the country (Mashhad, Tehran, and Sari), has the capability to meet the needs of large projects.'
        },
        {
          question: 'How long does it take to build a building with LSF?',
          answer: 'The execution time of LSF projects, depending on design complexity and area, is much less than traditional methods. For example, constructing a 4-story structure with 1000 square meters of floor area takes only 120 working days.'
        },
        {
          question: 'Where is the headquarters of Aria Stud Holding located?',
          answer: 'The headquarters of Aria Stud Holding is located in Mashhad, South Khayyam 22, No. 48. The management of this group is led by Mr. Engineer Morteza Shariati.'
        },
        {
          question: 'How can I use the services of Aria Stud Holding?',
          answer: 'To use the services of Aria Stud Holding, you can call 05137688500 or 09151244898, or register a free consultation request through the website ariastudholding.com. Our experts will contact you as soon as possible.'
        },
      ],
    },

    // ========== Contact Form ==========
    contact: {
      title: "Request Free Consultation",
      desc: "Our experts will provide the best solution by carefully examining your needs",
      phone: "05137688500",
      phoneLabel: "24/7 Support",
      mobile: "09151244898",
      mobileLabel: "Contact Expert",
      email: "info@ariastudholding.com",
      emailLabel: "Send Email",
      address: "Mashhad, South Khayyam 22, No. 48",
      addressLabel: "Headquarters",
      form: {
        name: "Full Name",
        phone: "Mobile Number",
        email: "Email (Optional)",
        message: "Your request details...",
        options: {
          consulting: "Free Consultation",
          cooperation: "Cooperation Request",
          wholesale: "Wholesale",
          technical: "Technical Support",
        },
        submit: "Submit Request",
        success: "✅ Your request was sent successfully",
        error: "❌ Error sending request, please try again",
      },
    },

    // ========== Footer ==========
    footer: {
      about: "Aria Stud Holding, with over 25 years of experience, is the largest manufacturer and specialized executor of LSF lightweight steel structures in Iran with 3 active factories and 1700+ successful projects",
      quickLinks: "Quick Links",
      services: "Our Services",
      contact: "Contact Us",
      rights: "All rights reserved by Aria Stud Holding.",
    },
  },
};

// ============================================
// دیتای استاتیک برای استفاده در بخش‌های مختلف
// ============================================
export const LSF_STATIC_DATA = {
  heroImage: '/images/lsf.jpeg',
  productImages: {
    1: '/images/products/lsf-residential.jpg',
    2: '/images/products/lsf-commercial.jpg',
    3: '/images/products/lsf-industrial.jpg',
    4: '/images/products/lsf-panels.jpg',
  },

  factoryImages: {
    1: '/images/lsf.jpeg',
    2: '/images/lsf.jpeg',
    3: '/images/lsf.jpeg',
  },
};