'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Bot,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarRange,
  Check,
  CircleDollarSign,
  Clapperboard,
  Clock3,
  Code2,
  Construction,
  Dumbbell,
  FileWarning,
  Flame,
  Gauge,
  Globe2,
  GraduationCap,
  Hammer,
  HeartHandshake,
  LandPlot,
  Lock,
  Layers,
  MapPin,
  MapPinned,
  Megaphone,
  Newspaper,
  Percent,
  Rocket,
  Scale,
  ShieldCheck,
  Vote,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Terminal,
  Timer,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'
import SalesLeverage from './SalesLeverage'
import InvestorDiligence from './InvestorDiligence'
import styles from './MosharekatProposal.module.css'

const MAIN_OFFER = {
  share: 70,
  keep: 30,
  cashLabel: '۵۰ میلیارد',
  points: [
    'ثبت شرکت با مسئولیت محدود دوشریکه با سهم‌الشرکه ۷۰٪ شما و ۳۰٪ من از ابتدا در شرکت‌نامه و اساسنامه',
    '۵۰ میلیارد تومان بهای انتقال ۷۰٪ سهم‌الشرکه — واریز به حساب شخصی من، سپس تنظیم سند رسمی انتقال',
    'تقسیم سود عادی ۷۰/۳۰ پس از کسر هزینه‌های عملیاتی شرکت (نه قبل از هزینه)',
    'ضمانت فروش ۵ سال اول: اگر فروش سالانه زیر ۱٬۰۰۰ باشد و هنوز سر‌به‌سر نشده باشید، سود شما ۹۰٪ و سهم من ۱۰٪',
    'تعهد من: ساخت و نگهداری نرم‌افزار، رفع مشکل و امنیت؛ فروش و بقیه امور با همفکری دو طرف',
    'همه هزینه‌های شرکت (اجاره، نیرو، تبلیغات، سرور و …) به نسبت سهم: ۷۰٪ شما و ۳۰٪ من',
  ],
}

const VALUE_PILLARS = [
  {
    icon: Hammer,
    title: 'سال‌ها کار، آماده بازار',
    text: 'محصول از صفر ساخته شده و برای فروش واقعی آماده است.',
  },
  {
    icon: Timer,
    title: 'تحویل تا ۷ روز کاری',
    text: 'بعد از آماده‌سازی دوماهه، هر پروژه سریع تحویل می‌شود.',
  },
  {
    icon: Layers,
    title: 'بازار چندلایه',
    text: 'فروش سایت، اشتراک، سرور و خدمات — درآمد تک‌کاناله نیست.',
  },
  {
    icon: Code2,
    title: 'من کنار شما می‌مانم',
    text: 'با ۳۰٪ سهم، تعهد فنی دارم و ۳۰٪ هزینه‌های شرکت هم با من است؛ فروش و عملیات اجرایی عمدتاً با شما.',
  },
]

const SALES = [
  {
    icon: CalendarCheck,
    title: 'سیستم نوبت‌دهی',
    forWho: 'سالن زیبایی، مطب، کلینیک، آموزشگاه',
    price: '۳۵ میلیون تومان',
    note: 'رزرو شمسی، خدمات، پرسنل و پیگیری کد',
  },
  {
    icon: Wrench,
    title: 'تعمیرات و سرویس',
    forWho: 'تعمیرکاران، خدمات منزل، سرویس سیار',
    price: '۳۵ میلیون تومان',
    note: 'اعزام، اجرت، قطعه و پرداخت مرحله‌ای',
  },
  {
    icon: Building2,
    title: 'سیستم شرکتی',
    forWho: 'شرکت‌ها، سازمان‌ها و تیم‌های داخلی',
    price: '۲۵ میلیون تومان',
    note: 'ساختار سازمانی، فرایندها و ابزار مدیریت کار',
  },
  {
    icon: Store,
    title: 'فروشگاه تکی',
    forWho: 'برند، بوتیک، فروش آنلاین تک‌فروشنده',
    price: '۵۵ میلیون تومان',
    note: 'ویترین، سبد، پرداخت و پنل فروشگاه',
  },
  {
    icon: Briefcase,
    title: 'سیستم کاریابی',
    forWho: 'پلتفرم استخدام و بانک رزومه',
    price: '۶۵ میلیون تومان',
    note: 'آگهی، کارجو، کارفرما و فیلترهای پیشرفته',
  },
  {
    icon: GraduationCap,
    title: 'مدرسه آنلاین',
    forWho: 'آموزشگاه و مدارس خصوصی',
    price: '۵۰ میلیون تومان',
    note: 'مدیر، معلم، کلاس، تکلیف و آزمون',
  },
  {
    icon: Newspaper,
    title: 'محله خبری',
    forWho: 'رسانه محلی و مجله تخصصی',
    price: '۳۵ میلیون تومان',
    note: 'لیست، سینگل، دسته و نوار خبر',
  },
  {
    icon: ShoppingBag,
    title: 'مارکت‌پلیس',
    forWho: 'چندفروشندگی و تسویه فروشندگان',
    price: '۹۵ میلیون تومان',
    note: 'چند فروشنده، ویترین و مدیریت تسویه',
  },
  {
    icon: Clapperboard,
    title: 'ویدیو و استوری',
    forWho: 'برند محتوایی و آرشیو ویدیو',
    price: '۸ میلیون تومان',
    note: 'استوری دایره‌ای و ویدیو برجسته',
  },
]

const COMPARE_ROWS = [
  {
    icon: LandPlot,
    topic: 'دارایی پایه',
    build: 'خرید زمین / ملک و مجوزهای سنگین',
    rebo: 'موتور آماده + دامنه + برند + ماژول‌ها',
  },
  {
    icon: Construction,
    topic: 'شروع کار',
    build: 'پیمانکار، مصالح، زمان‌بندی چندساله',
    rebo: 'بعد از آماده‌سازی ۲ ماهه، فروش فعال؛ تحویل هر پروژه تا ۷ روز کاری',
  },
  {
    icon: Banknote,
    topic: 'هزینه جاری',
    build: 'نیروی کار، نوسان قیمت، خواب سرمایه',
    rebo: 'هزینه عملیاتی سبک‌تر؛ مقیاس نرم‌افزاری',
  },
  {
    icon: AlertTriangle,
    topic: 'ریسک و پیچیدگی',
    build: 'پروانه، همسایه، تأخیر، دعوای قراردادی',
    rebo: 'ریسک اجرایی کمتر؛ محصول تست‌شده و قابل بهبود روزانه',
  },
  {
    icon: TrendingUp,
    topic: 'بازده',
    build: 'نقدشوندگی پایین‌تر و وابسته به ملک',
    rebo: 'فروش تکرارپذیر در ده‌ها شغل + درآمد اشتراک و سرور',
  },
  {
    icon: Globe2,
    topic: 'بازار هدف',
    build: 'محدود به منطقه و یک پروژه',
    rebo: 'کل ایران؛ هر کسب‌وکاری که به ابزار واقعی نیاز دارد',
  },
]

const PROCESS_ITEMS = [
  {
    icon: Building2,
    title: 'ثبت مستقیم ۷۰ / ۳۰',
    text: 'شرکت با مسئولیت محدود دوشریکه؛ سهم‌الشرکه از ابتدا ۷۰٪ شما و ۳۰٪ من در شرکت‌نامه و اساسنامه ثبت می‌شود — بدون ثبت ۱۰۰٪ به‌نام من و انتقال بعدی.',
  },
  {
    icon: FileWarning,
    title: 'سند رسمی سهم‌الشرکه',
    text: 'پس از تأسیس، انتقال/تثبیت مالکیت ۷۰٪ با سند رسمی در دفتر اسناد انجام می‌شود تا مالکیت شما محکم باشد؛ پرداخت ۵۰ میلیارد و تنظیم سند طبق قرارداد هم‌زمان یا پس از تکمیل پرداخت.',
  },
  {
    icon: Scale,
    title: 'اساسنامه باز برای انتقال',
    text: 'بند انتقال سهم‌الشرکه طوری نوشته می‌شود که گیر ۳/۴ سرمایه مانع انتقال سهم شما نشود؛ شرایط موافقت ساده یا بدون نیاز به موافقت سایر شرکا.',
  },
  {
    icon: Calculator,
    title: 'سود بعد از هزینه',
    text: 'ابتدا هزینه‌های عملیاتی از درآمد کسر می‌شود، سپس سود باقی‌مانده به نسبت سهم تقسیم می‌گردد — تا سهم ۳۰٪ فنی با باد کردن هزینه خالی نشود.',
  },
  {
    icon: UserCog,
    title: 'اختیار فنی با من',
    text: 'تصمیم‌های توسعه فنی، معماری و پشتیبانی فنی با مدیر فنی (من) است؛ حق امضای امور فنی محدود و مشخص می‌شود تا دامنه مالی بی‌ضابطه باز نباشد.',
  },
  {
    icon: Users,
    title: 'اجرا و هزینه با شما',
    text: 'شما مشاوره و نظارت کلی دارید؛ فروش و سایر امور را با همفکری پیش می‌بریم. همه هزینه‌های شرکت ۷۰٪ با شما و ۳۰٪ با من است.',
  },
]

const CHARTER_POINTS = [
  {
    title: 'انتقال سهم‌الشرکه',
    text: 'اساسنامه صریحاً انتقال را بدون مانع ۳/۴ سرمایه باز می‌گذارد یا موافقت را بسیار ساده می‌کند تا ۷۰٪ شما قابل اتکا و قابل انتقال باشد.',
  },
  {
    title: 'توزیع سود',
    text: 'هزینه عملیاتی (اجاره، حقوق، تبلیغات، سرور و …) اول کسر می‌شود؛ بعد سود به نسبت سهم. حقوق ثابت برای من در این مدل پیش‌بینی نشده.',
  },
  {
    title: 'مدیران و حق امضا',
    text: 'امور فنی: اختیار من. اسناد مهم مالی/تعهدآور: امضای مشترک یا دامنه محدود حق امضای منفرد — تا هر طرف نتواند بی‌ضابطه چک یا قرارداد سنگین ببندد.',
  },
]

const AGREEMENT_POINTS = [
  {
    title: 'پرداخت ۵۰ میلیارد',
    text: 'واریز به حساب شخصی من در ازای ۷۰٪ سهم‌الشرکه؛ پس از دریافت، ظرف مهلت توافق‌شده سند رسمی تنظیم می‌شود.',
  },
  {
    title: 'تعهد نرم‌افزاری من',
    text: 'ساخت و نگهداری نرم‌افزار، رفع مشکل، امنیت و کارکرد عادی سیستم با من است. فروش و بقیه کارها را با همفکری هم انجام می‌دهیم.',
  },
  {
    title: 'نقش شما',
    text: 'مشاوره و نظارت بر عملکرد کلی مجموعه؛ در فروش و سایر امور کنار هم تصمیم می‌گیریم.',
  },
  {
    title: 'هزینه جاری شرکت',
    text: 'همه هزینه‌های شرکت به نسبت سهم‌الشرکه تأمین می‌شود: ۷۰٪ سرمایه‌گذار و ۳۰٪ سازنده — جدا از ۵۰ میلیارد بهای انتقال سهم.',
  },
  {
    title: 'پیش‌فرض و اختلاف',
    text: 'اگر هریک از طرفین سهم خود از هزینه‌های توافق‌شده را تأمین نکند و شرکت از کار بیفتد، حق اقدام قراردادی محفوظ است؛ بند داوری پیشنهاد می‌شود.',
  },
]

const GUARANTEE_ITEMS = [
  {
    icon: ShieldCheck,
    title: 'انحصار پس از عقد قرارداد',
    text: 'از تاریخ عقد به بعد، اجرای موازی همین موتور با شخص یا برند دیگر انجام نمی‌شود.',
  },
  {
    icon: Percent,
    title: 'ضمانت حسن انجام فروش (۹۰ / ۱۰)',
    text: 'در ۵ سال اول، اگر فروش سالانه زیر ۱٬۰۰۰ باشد و شما هنوز به نقطه سر‌به‌سر نرسیده باشید، از بابت ضمانت حسن انجام کار و اطمینان از فرایند فروش، سود شما ۹۰٪ و سهم من فقط ۱۰٪ خواهد بود. به‌محض رسیدن به نقطه سر‌به‌سر، یا پس از پایان ۵ سال اول، این شرط حذف و تقسیم به حالت عادی ۷۰ / ۳۰ برمی‌گردد. اگر در همان سال فروش به ۱٬۰۰۰ یا بیشتر برسد، همان سال مشمول این ضمانت نیست.',
  },
  {
    icon: FileWarning,
    title: 'مسئولیت جبران خسارت',
    text: 'اگر پس از عقد، تحویل یا قراردادی از این دست با دیگری دیده شود، خودم مسئول جبران خسارت هستم.',
  },
  {
    icon: MapPin,
    title: 'حضور فیزیکی در مشهد',
    text: 'برای پایلوت اجرا در مشهد حضور دارم تا راه‌اندازی و هماهنگی عملیاتی نزدیک پیش برود.',
  },
  {
    icon: Vote,
    title: 'انتقال سهم بدون گیر اساسنامه',
    text: 'اساسنامه طوری تنظیم می‌شود که انتقال سهم‌الشرکه شما پشت مانع ۳/۴ سرمایه نماند؛ رقیق‌سازی و ورود شریک جدید طبق قرارداد همکاری با توافق طرفین روشن می‌شود.',
  },
  {
    icon: Gauge,
    title: 'ضمانت حرفه‌ای جهت اعتمادسازی',
    text: 'سامانه را طوری می‌چینم که بعد از ۵ سال، حتی بدون وابستگی به حضور من، ماندگاری مختل نشود.',
  },
]

function fa(n) {
  return Number(n).toLocaleString('fa-IR')
}

const STORY_SYSTEMS = [
  {
    id: 'booking',
    title: 'سیستم نوبت‌دهی',
    forWho: 'سالن زیبایی، مطب، کلینیک، آموزشگاه',
    desc: 'با ربو، نوبت‌دهی آنلاین با تقویم شمسی راه می‌افتد: مشتری خدمت و زمان را انتخاب می‌کند، پرسنل مدیریت می‌شود و وضعیت رزرو با کد پیگیری شفاف است — بدون سرگردانی تلفنی.',
  },
  {
    id: 'repairs',
    title: 'تعمیرات و سرویس',
    forWho: 'تعمیرکاران، خدمات منزل، سرویس سیار',
    desc: 'درخواست سرویس، اعزام نیرو، اجرت، قطعه و پرداخت مرحله‌ای در ربو روشن است؛ مشتری و تعمیرکار هر دو وضعیت کار را می‌بینند و کار بدون ابهام تمام می‌شود.',
  },
  {
    id: 'corp',
    title: 'سیستم شرکتی',
    forWho: 'شرکت‌ها، سازمان‌ها و تیم‌های داخلی',
    desc: 'برای شرکت‌ها ساختار و ابزار مدیریت کار را یکجا می‌چینیم؛ فرایند داخلی شفاف می‌شود و تیم بدون پراکندگی نرم‌افزاری جلو می‌رود.',
  },
  {
    id: 'shop',
    title: 'فروشگاه تکی',
    forWho: 'برند، بوتیک، فروش آنلاین تک‌فروشنده',
    desc: 'ربو ویترین، سبد خرید، پرداخت و پنل فروشگاه را یکجا می‌دهد؛ صاحب برند بدون پیچیدگی فنی می‌فروشد و سفارش و موجودی را خودش کنترل می‌کند.',
  },
  {
    id: 'jobs',
    title: 'سیستم کاریابی',
    forWho: 'پلتفرم استخدام و بانک رزومه',
    desc: 'آگهی شغلی، کارجو، کارفرما و فیلترهای پیشرفته روی ربو جمع می‌شود؛ اتصال درست بین نیرو و فرصت شغلی شکل می‌گیرد و مدیریت استخدام ساده می‌ماند.',
  },
  {
    id: 'school',
    title: 'مدرسه آنلاین',
    forWho: 'آموزشگاه و مدارس خصوصی',
    desc: 'مدیر، معلم، کلاس، تکلیف و آزمون روی ربو کنار هم هستند؛ آموزشگاه به‌جای سایت معرفی، سامانه واقعی برای اداره کلاس و پیگیری دانش‌آموز دارد.',
  },
  {
    id: 'news',
    title: 'محله خبری',
    forWho: 'رسانه محلی و مجله تخصصی',
    desc: 'لیست خبر، صفحه تک‌خبر، دسته‌بندی و نوار خبر با ربو آماده است؛ رسانه محلی یا مجله تخصصی محتوا را منظم منتشر می‌کند و مخاطب راحت دنبال می‌کند.',
  },
  {
    id: 'market',
    title: 'مارکت‌پلیس',
    forWho: 'چندفروشندگی و تسویه فروشندگان',
    desc: 'چند فروشنده، ویترین مشترک، سفارش متمرکز و تسویه روی ربو مدیریت می‌شود؛ وقتی یک فروشگاه کافی نیست، اکوسیستم فروش بدون ساخت از صفر شکل می‌گیرد.',
  },
  {
    id: 'video',
    title: 'ویدیو و استوری',
    forWho: 'برند محتوایی و آرشیو ویدیو',
    desc: 'استوری دایره‌ای و ویدیو برجسته کنار بقیه ماژول‌های سایت می‌آید؛ برند محتوایی آرشیو منظمی دارد و مخاطب سریع به محتوا می‌رسد.',
  },
]

function StoryPhoneDemo() {
  const [phase, setPhase] = useState('idle')
  const [selected, setSelected] = useState(null)

  return (
    <div className={styles.storyPhone}>
      <div className={styles.storyPhoneGlow} aria-hidden />
      <div className={styles.storyPhoneBody}>
        <div className={styles.storyPhoneNotch} aria-hidden />
        <div className={styles.storyPhoneScreen}>
          {phase === 'idle' && (
            <div className={styles.storyPhoneIdle}>
              <p className={styles.storyPhoneIdleBrand}>ربو</p>
              <p className={styles.storyPhoneIdleHint}>موتور ساخت سایت مشاغل</p>
              <button
                type="button"
                className={styles.storyPhoneStart}
                onClick={() => setPhase('pick')}
              >
                شروع با ربو
                <span className={styles.storyPhonePulse} aria-hidden />
              </button>
              <span className={styles.storyPhoneTapHint} aria-hidden>
                <span className={styles.storyPhoneTapDot} />
                کلیک کنید
              </span>
            </div>
          )}

          {phase === 'pick' && (
            <div className={styles.storyPhonePick}>
              <p className={styles.storyPhonePickTitle}>چه شغلی؟</p>
              <p className={styles.storyPhonePickSub}>یکی را انتخاب کنید</p>
              <div className={styles.storyPhonePickList}>
                {STORY_SYSTEMS.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.storyPhonePickBtn}
                    style={{ '--d': `${0.04 + index * 0.05}s` }}
                    onClick={() => {
                      setSelected(item)
                      setPhase('detail')
                    }}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'detail' && selected && (
            <div className={styles.storyPhoneDetail}>
              <button
                type="button"
                className={styles.storyPhoneBack}
                onClick={() => {
                  setSelected(null)
                  setPhase('pick')
                }}
              >
                ‹ بازگشت
              </button>
              <strong className={styles.storyPhoneDetailTitle}>
                {selected.title}
              </strong>
              <small className={styles.storyPhoneDetailWho}>
                {selected.forWho}
              </small>
              <p className={styles.storyPhoneDetailDesc}>{selected.desc}</p>
            </div>
          )}
        </div>
        <div className={styles.storyPhoneHome} aria-hidden />
      </div>
    </div>
  )
}

export default function MosharekatProposal() {
  return (
    <div className={styles.page} dir="rtl" lang="fa">
      {/* 1. Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroMesh} aria-hidden />
        <div className={styles.heroInner}>
          <p className={styles.brand}>ربو</p>
          <p className={styles.heroEyebrow}>
            <HeartHandshake size={13} strokeWidth={2.2} />
            پیشنهاد رسمی مشارکت از طرف سازنده
          </p>
          <h1 className={styles.heroTitle}>
            موتوری که ساختم تا مشاغل ایران سایتِ نمایشی نداشته باشند —
            سامانه واقعی داشته باشند
          </h1>
          <p className={styles.heroLead}>
            بعد از سال‌ها تجربه در برنامه‌نویسی، این محصول را آماده ورود به بازار
            کردم؛ موتوری که می‌تواند به یک جریان درآمد جدی تبدیل شود.
          </p>
          <div className={styles.heroCtas}>
            <a href="#offers" className={styles.ctaPrimary}>
              پیشنهاد مشارکت
              <ArrowLeft size={16} />
            </a>
            <a href="#story" className={styles.ctaGhost}>
              داستان محصول
            </a>
          </div>
          <div className={styles.heroStats}>
            <div>
              <Timer size={18} />
              <strong>۷ روز کاری</strong>
              <span>حداکثر زمان تحویل هر پروژه</span>
            </div>
            <div>
              <Target size={18} />
              <strong>۱٬۰۰۰ فروش</strong>
              <span>فرض محافظه‌کارانه در سال</span>
            </div>
            <div>
              <CircleDollarSign size={18} />
              <strong>۵۰ میلیارد</strong>
              <span>تومان درآمد تقریبی سالانه</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Story */}
      <section className={styles.storySection} id="story">
        <div className={styles.storyBanner}>
          <div className={styles.inner}>
            <div className={styles.storyBannerGrid}>
              <div className={styles.storyBannerCopy}>
                <h2 className={styles.storyBannerTitle}>
                  چرا این موتور را ساختم؟
                </h2>
                <div className={styles.storyBannerLead}>
                  <p>
                    هر کسب‌وکاری برای رشد به ابزاری نیاز دارد که مدیریت را سبک
                    کند و مسیر درآمد را بازتر کند — نه یک ویترین زیبا برای
                    پرستیژ. سال‌ها دیدم سایت‌ها و سامانه‌هایی که فقط هزینه
                    می‌سازند: سنگین‌اند، پیچیده می‌شوند، و در عمل به درد کار
                    روزمره نمی‌خورند.
                  </p>
                  <p>
                    من ربو را ساختم تا این فاصله را پر کنم؛ یک موتور واقعی که
                    مثل یک اپلیکیشن کاربردی برای مشاغل کار کند، جزئیات نیاز هر
                    کسب‌وکار را پوشش دهد، و خودش بار اضافه نباشد. هدفم این بود
                    که صاحب کسب‌وکار با هزینه معقول، ابزاری در دست داشته باشد
                    که ساده‌تر اداره کند، سریع‌تر بفروشد، و وقتش را صرف کار اصلی
                    کند — نه سروکله زدن با نرم‌افزار.
                  </p>
                  <p>
                    این موتور از اول با نگاه به بازار واقعی طراحی شده: نیاز
                    گسترده، برند دانش ایرانی، ظرفیت رفتن به بازار جهانی، و
                    تکنولوژی روز. برای من ربو فقط یک محصول فنی نیست؛ پاسخی است
                    به نیازی که تقریباً همه مشاغل دارند و هنوز درست برآورده
                    نشده.
                  </p>
                </div>
              </div>
              <aside className={styles.storyBannerAside} aria-label="نمایش موتور ربو">
                <StoryPhoneDemo />
              </aside>
            </div>
          </div>
        </div>

        <div className={styles.inner}>
          <div className={styles.storyTimeline}>
            <article className={styles.storyStep}>
              <div className={styles.storyStepHead}>
                <span className={styles.storyIcon}>
                  <Target size={20} strokeWidth={1.8} />
                </span>
                <em>۰۱</em>
              </div>
              <h3>نیاز گسترده بازار</h3>
              <p>
                همه به آن نیاز دارند. دایره سفارش‌دهندگان وسیع است و از نظر زمان
                و ریال، توجیه عقلی دارد.
              </p>
            </article>
            <article className={styles.storyStep}>
              <div className={styles.storyStepHead}>
                <span className={styles.storyIcon}>
                  <Flame size={20} strokeWidth={1.8} />
                </span>
                <em>۰۲</em>
              </div>
              <h3>برند دانش ایرانی</h3>
              <p>
                کاری که هرکسی از پسش برنمی‌آید؛ برندی که قدرت دانش ایرانی را به
                رخ جهانیان بکشد.
              </p>
            </article>
            <article className={styles.storyStep}>
              <div className={styles.storyStepHead}>
                <span className={styles.storyIcon}>
                  <Globe2 size={20} strokeWidth={1.8} />
                </span>
                <em>۰۳</em>
              </div>
              <h3>بازار فراتر از ایران</h3>
              <p>
                با زبان‌های بین‌المللی به بازار جهانی می‌روم؛ این محصول نیاز همه
                مشاغل دنیاست.
              </p>
            </article>
            <article className={styles.storyStep}>
              <div className={styles.storyStepHead}>
                <span className={styles.storyIcon}>
                  <Code2 size={20} strokeWidth={1.8} />
                </span>
                <em>۰۴</em>
              </div>
              <h3>پایتون و Next.js</h3>
              <p>
                از پیشرفته‌ترین‌های روز دنیا؛ تا کیفیت فنی در سطح ادعای محصول
                باشد.
              </p>
            </article>
          </div>

          <div className={styles.storyVersus}>
            <div className={styles.storyVersusHead}>
              <Scale size={16} strokeWidth={2} />
              <span>بازار رایج در برابر ربو</span>
            </div>
            <div className={styles.storyVersusGrid}>
              <article className={styles.storyVersusBad}>
                <header>
                  <AlertTriangle size={18} strokeWidth={1.8} />
                  <div>
                    <small>وضعیت رایج</small>
                    <strong>وردپرس و هزینه اختصاصی</strong>
                  </div>
                </header>
                <p>
                  بیشتر طراحی‌ها با CMS رایگان مثل وردپرس انجام می‌شود؛ هسته
                  سنگین و از نظر فنی ضعیف. طراحی اختصاصی هم معمولاً هزینه سنگین
                  می‌خواهد تا نیاز واقعی برآورده شود.
                </p>
              </article>
              <article className={styles.storyVersusGood}>
                <header>
                  <ShieldCheck size={18} strokeWidth={1.8} />
                  <div>
                    <small>پاسخ من</small>
                    <strong>تخصصی، ساده، به‌صرفه</strong>
                  </div>
                </header>
                <p>
                  جزئیات نیاز هر کسب‌وکار را پوشش می‌دهد، سادگی را سرلوحه دارد و
                  با کیفیت مرغوب، هزینه به‌نسبت کمتری برای مشاغل می‌سازد.
                </p>
              </article>
            </div>
          </div>

          <div className={styles.storyRoadmap}>
            <article>
              <span className={styles.planIcon}>
                <CalendarRange size={20} strokeWidth={1.8} />
              </span>
              <div>
                <small>پس از مشارکت</small>
                <strong>۲ ماه آماده‌سازی</strong>
                <p>
                  تکمیل بستر و فرایندها؛ بعد فروش جدی شروع می‌شود.
                </p>
              </div>
            </article>
            <article>
              <span className={styles.planIcon}>
                <Bot size={20} strokeWidth={1.8} />
              </span>
              <div>
                <small>مسیر محصول</small>
                <strong>هوش مصنوعی روی همه عناوین</strong>
                <p>
                  از کمک در نوبت و فروش تا پشتیبانی و محتوا.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 3. Sales examples */}
      <section className={styles.sectionAlt} id="examples">
        <div className={styles.inner}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>
              <Calculator size={12} />
              نمونه‌های فروش
            </p>
            <h2 className={styles.title}>تنوع بازار را ببینید</h2>
            <p className={styles.subtitle}>
              از سیستم شرکتی ۲۵ میلیونی و نوبت‌دهی ۳۵ میلیونی تا مارکت‌پلیس ۹۵
              میلیونی — میانگین محاسباتی ۵۰ میلیون با احتساب سرور و پشتیبانی.
            </p>
          </header>
          <div className={styles.salesGrid}>
            {SALES.map(({ icon: Icon, title, forWho, price, note }) => (
              <article key={title} className={styles.salesCard}>
                <div className={styles.salesHead}>
                  <span className={styles.salesIcon}>
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <strong>{title}</strong>
                </div>
                <p className={styles.salesFor}>{forWho}</p>
                <p className={styles.salesPrice}>{price}</p>
                <p className={styles.salesNote}>{note}</p>
              </article>
            ))}
          </div>
          <div className={styles.avgBox}>
            <Sparkles size={18} />
            <div>
              <strong>میانگین فرضی محاسبه: ۵۰ میلیون تومان</strong>
              <span>
                با احتساب سرور و پشتیبانی؛ پشتیبانی سال‌های بعد تمدیدپذیر است و با
                تورم افزایش می‌یابد.
              </span>
            </div>
          </div>

          <article className={styles.subscriptionBox}>
            <div className={styles.subscriptionHead}>
              <Dumbbell size={20} strokeWidth={1.8} />
              <div>
                <strong>فراتر از فروش یک‌باره — ورود اشتراکی به هر حوزه</strong>
                <span>
                  در هر صنفی می‌توانیم سامانه‌ای بسازیم که اشتراک بفروشد و خدمت
                  بدهد. همه این‌ها داخل همین شراکت قابل اجراست.
                </span>
              </div>
            </div>
            <p>
              مثال: سامانه خدمات به باشگاه‌های ورزشی — فروش اشتراک ماهانه بر اساس
              تعداد نفرات زیرمجموعه هر باشگاه، برای برنامه تمرینی و غذایی و مدیریت
              کامل باشگاه. هر ایده مشابهی که در هر نقطه‌ای قابل اجرا باشد، روی
              همین موتور قابل پیاده‌سازی است.
            </p>
            <ul>
              <li>درآمد ماهانه تکرارشونده، نه فقط پروژه یک‌باره</li>
              <li>قیمت‌گذاری بر اساس تعداد اعضا / مصرف واقعی</li>
              <li>قابل تعمیم به هر حوزه خدماتی و مدیریتی</li>
            </ul>
          </article>
        </div>
      </section>

      {/* 5. Scale + leverage */}
      <section className={styles.scaleSection} id="scale">
        <div className={styles.scaleHero}>
          <div className={styles.inner}>
            <h2 className={styles.scaleHeroTitle}>
              از الگوی جهانی تا فرصت ایران
            </h2>
            <p className={styles.scaleHeroLead}>
              موتور ساخت سایت یک صنعت واقعی است؛ حتی با فرض خیلی پایین در ایران
              هم عدد معناداری ساخته می‌شود.
            </p>

            <div className={styles.scaleBridge}>
              <article className={styles.scaleWorld}>
                <span className={styles.scaleTag}>
                  <Globe2 size={14} strokeWidth={2} />
                  نمونه جهانی
                </span>
                <strong className={styles.scaleBrand}>Wix.com</strong>
                <p>
                  پلتفرم ساخت سایت که طبق آمار منتشرشده در وب‌سایتش، حدود{' '}
                  <em>۳۰۰ میلیون</em> مقیاس فروش/عملکرد تجاری را تجربه کرده —
                  مدل «موتور برای همه» ثابت شده است.
                </p>
              </article>

              <div className={styles.scaleArrow} aria-hidden>
                <TrendingUp size={22} strokeWidth={2} />
                <span>همین مدل</span>
              </div>

              <article className={styles.scaleIran}>
                <span className={styles.scaleTag}>
                  <MapPinned size={14} strokeWidth={2} />
                  فرصت ایران
                </span>
                <strong className={styles.scaleBrand}>فرض محافظه‌کارانه</strong>
                <p>
                  فقط <em>۱٬۰۰۰ فروش در سال</em> با میانگین{' '}
                  <em>۵۰ میلیون تومان</em> (سرور + پشتیبانی) — عددی پایین نسبت
                  به ظرفیت واقعی بازار مشاغل.
                </p>
              </article>
            </div>

            <div className={styles.scaleResult}>
              <div className={styles.scaleResultEq}>
                <span>۱٬۰۰۰ فروش</span>
                <i>×</i>
                <span>۵۰ میلیون</span>
                <i>=</i>
              </div>
              <div className={styles.scaleResultMain}>
                <strong>≈ ۵۰ میلیارد تومان</strong>
                <small>درآمد کل سالانه در همین فرض پایین</small>
              </div>
              <p className={styles.scaleResultNote}>
                با سود خالص ۵۰٪ در این مقیاس، حدود ۲۵ میلیارد سود می‌ماند؛ سهم
                ۷۰٪ شما حدود ۱۷٫۵ میلیارد است — و با رشد فروش حاشیه تا ۷۰٪ بالا
                می‌رود.
              </p>
            </div>

            <div className={styles.scaleHints}>
              <div>
                <CalendarRange size={16} />
                <span>۲ ماه آماده‌سازی بستر بعد از مشارکت</span>
              </div>
              <div>
                <Clock3 size={16} />
                <span>سپس تحویل هر پروژه تا ۷ روز کاری</span>
              </div>
              <div>
                <Bot size={16} />
                <span>مسیر افزودن هوش مصنوعی به همه عناوین</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.inner}>
          <SalesLeverage />
        </div>
      </section>

      <section className={styles.diligenceBand}>
        <div className={styles.inner}>
          <InvestorDiligence />
        </div>
      </section>

      {/* 6. Compare */}
      <section className={styles.sectionAlt} id="compare">
        <div className={styles.inner}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>
              <Scale size={12} />
              مقایسه سرمایه‌گذاری
            </p>
            <h2 className={styles.title}>
              ساختمان‌سازی در برابر موتور نرم‌افزاری
            </h2>
            <p className={styles.subtitle}>
              اگر انرژی، پیچیدگی و بازده را کنار هم بگذارید، تصویر روشن‌تر
              می‌شود.
            </p>
          </header>

          <div className={styles.compareLegend}>
            <span>
              <Hammer size={14} />
              مسیر ساختمان / ملک
            </span>
            <span>
              <Rocket size={14} />
              مسیر ربو
            </span>
          </div>

          <div
            className={styles.compareTable}
            role="table"
            aria-label="مقایسه سرمایه‌گذاری"
          >
            <div className={styles.compareHead} role="row">
              <div role="columnheader">موضوع</div>
              <div role="columnheader">
                <Building2 size={15} />
                ساختمان‌سازی
              </div>
              <div role="columnheader">
                <Flame size={15} />
                ربو
              </div>
            </div>
            {COMPARE_ROWS.map(({ icon: Icon, topic, build, rebo }) => (
              <div key={topic} className={styles.compareRow} role="row">
                <div className={styles.compareTopic} role="cell">
                  <Icon size={16} />
                  {topic}
                </div>
                <div className={styles.compareBuild} role="cell">
                  {build}
                </div>
                <div className={styles.compareRebo} role="cell">
                  {rebo}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.compareCards}>
            <article className={styles.compareBad}>
              <Construction size={22} />
              <h3>مسیر سنتی</h3>
              <ul>
                <li>
                  <LandPlot size={14} /> خرید زمین و خواب سرمایه
                </li>
                <li>
                  <Users size={14} /> هماهنگی پیمانکار و نیروی انسانی
                </li>
                <li>
                  <AlertTriangle size={14} /> مجوز، تأخیر و پیچیدگی
                </li>
                <li>
                  <Banknote size={14} /> نقدشوندگی کندتر
                </li>
              </ul>
            </article>
            <article className={styles.compareGood}>
              <Rocket size={22} />
              <h3>مسیر ربو</h3>
              <ul>
                <li>
                  <Check size={14} /> ۲ ماه آماده‌سازی، بعد شروع فروش
                </li>
                <li>
                  <Check size={14} /> تحویل پروژه تا ۷ روز کاری
                </li>
                <li>
                  <Check size={14} /> افزودن هوش مصنوعی به عناوین
                </li>
                <li>
                  <Check size={14} /> درآمد تکرارشونده بعد از فروش
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* 7. Offer */}
      <section className={styles.sectionDark} id="offers">
        <div className={styles.inner}>
          <header className={styles.headLight}>
            <p className={styles.eyebrowLight}>
              <HeartHandshake size={12} />
              پیشنهاد من به شما
            </p>
            <h2 className={styles.titleLight}>
              ۷۰٪ سهم‌الشرکه در ازای ۵۰ میلیارد تومان
            </h2>
            <p className={styles.subtitleLight}>
              شرکت با مسئولیت محدود دوشریکه با ثبت مستقیم ۷۰٪ شما و ۳۰٪ من.
              ۵۰ میلیارد بهای انتقال سهم است (واریز به حساب شخصی من + سند رسمی)؛
              ۳۰٪ سهم من برای تعهد فنی می‌ماند — نه حقوق ماهانه.
            </p>
          </header>

          <article className={styles.mainOffer}>
            <span className={`${styles.offerBadge} ${styles.offerBadgeHot}`}>
              <Sparkles size={12} strokeWidth={2.2} />
              پیشنهاد رسمی
            </span>
            <div className={styles.mainOfferTop}>
              <div>
                <strong className={styles.offerShare}>
                  ٪{fa(MAIN_OFFER.share)}
                </strong>
                <span className={styles.offerKeep}>
                  ٪{fa(MAIN_OFFER.keep)} سهم خودم کنار شما می‌ماند
                </span>
              </div>
              <div className={styles.mainOfferPrice}>
                <b>{MAIN_OFFER.cashLabel}</b>
                <small>تومان — بهای انتقال سهم + سند رسمی</small>
              </div>
            </div>
            <ul className={styles.offerList}>
              {MAIN_OFFER.points.map((p) => (
                <li key={p}>
                  <Check size={14} strokeWidth={2.4} />
                  {p}
                </li>
              ))}
            </ul>
          </article>

          <div className={styles.valuePillars}>
            <p className={styles.valuePillarsTitle}>
              <Target size={15} />
              چرا این همکاری را پیشنهاد می‌کنم؟
            </p>
            <div className={styles.valuePillarsGrid}>
              {VALUE_PILLARS.map(({ icon: Icon, title, text }) => (
                <article key={title}>
                  <Icon size={18} />
                  <strong>{title}</strong>
                  <span>{text}</span>
                </article>
              ))}
            </div>
          </div>

          <div className={styles.dealBox}>
            <div>
              <p className={styles.dealLabel}>خلاصه پیشنهاد</p>
              <p className={styles.dealValue}>
                ٪{fa(MAIN_OFFER.share)} سهم‌الشرکه · {MAIN_OFFER.cashLabel} تومان ·
                ٪{fa(MAIN_OFFER.keep)} من · سند رسمی
              </p>
            </div>
            <Link href="/contact" className={styles.ctaPrimary}>
              آماده‌ام برای گفت‌وگو
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Process */}
      <section className={styles.sectionAlt} id="process">
        <div className={styles.inner}>
          <header className={styles.head}>
            <p className={styles.eyebrow}>
              <Building2 size={12} />
              ساختار همکاری
            </p>
            <h2 className={styles.title}>چطور با هم کار می‌کنیم؟</h2>
            <p className={styles.subtitle}>
              ثبت شرکت، اساسنامه، قرارداد همکاری و نقش‌ها از ابتدا با هم هماهنگ
              می‌شوند — قبل از امضا با وکیل مرور می‌کنیم.
            </p>
          </header>

          <div className={styles.processGrid}>
            {PROCESS_ITEMS.map(({ icon: Icon, title, text }) => (
              <article key={title} className={styles.processCard}>
                <span className={styles.processIcon}>
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>

          <div className={styles.legalGrid}>
            <article className={styles.legalCard}>
              <h3>بندهای کلیدی اساسنامه</h3>
              <ul>
                {CHARTER_POINTS.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </article>
            <article className={styles.legalCard}>
              <h3>قرارداد همکاری جداگانه</h3>
              <ul>
                {AGREEMENT_POINTS.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>

          <div className={styles.roleSplit}>
            <article className={styles.roleMine}>
              <div className={styles.roleHead}>
                <Terminal size={20} />
                <div>
                  <em>تعهد من (۳۰٪)</em>
                  <h3>فنی و نرم‌افزار</h3>
                </div>
              </div>
              <ul>
                <li>
                  <Check size={14} /> توسعه فنی و معماری سیستم
                </li>
                <li>
                  <Check size={14} /> نگهداری، رفع باگ، به‌روزرسانی امنیتی
                </li>
                <li>
                  <Check size={14} /> اطمینان از کارکرد عادی سامانه
                </li>
                <li>
                  <Check size={14} /> ۳۰٪ همه هزینه‌های شرکت
                </li>
                <li>
                  <Check size={14} /> همفکری در فروش و سایر امور
                </li>
              </ul>
            </article>
            <article className={styles.rolePartner}>
              <div className={styles.roleHead}>
                <Wallet size={20} />
                <div>
                  <em>تعهد شما (۷۰٪)</em>
                  <h3>مشاوره، نظارت و تأمین</h3>
                </div>
              </div>
              <ul>
                <li>
                  <Megaphone size={14} /> مشاوره و نظارت بر عملکرد کلی
                </li>
                <li>
                  <Building2 size={14} /> همفکری در فروش و بقیه کارها
                </li>
                <li>
                  <Users size={14} /> ۷۰٪ همه هزینه‌های شرکت
                </li>
                <li>
                  <Wallet size={14} /> راهبری کلان کنار هم
                </li>
              </ul>
            </article>
          </div>

          <p className={styles.roleNote}>
            ۵۰ میلیارد بهای انتقال سهم است، نه بودجه جاری. همه هزینه‌های شرکت
            ۷۰٪ شما و ۳۰٪ من است. کار فنی با من است؛ فروش و سایر امور را با
            همفکری پیش می‌بریم و شما بر عملکرد کلی نظارت و مشاوره دارید.
          </p>
        </div>
      </section>

      {/* 9. Guarantee */}
      <section className={styles.guaranteeSection} id="guarantee">
        <div className={styles.guaranteeGlow} aria-hidden />
        <div className={styles.inner}>
          <header className={styles.guaranteeHead}>
            <span className={styles.guaranteeSeal} aria-hidden>
              <Lock size={28} strokeWidth={1.8} />
            </span>
            <p className={styles.eyebrowLight}>
              <ShieldCheck size={12} />
              ضمانت من به شما
            </p>
            <h2 className={styles.titleLight}>ورود امن برای مشارکت‌کننده</h2>
            <p className={styles.subtitleLight}>
              برای خیال راحت شما از بابت ورود امن به این مشارکت، این تضمین‌ها را
              می‌دهم.
            </p>
          </header>

          <article className={styles.guaranteeHero}>
            <div className={styles.guaranteeHeroIcon}>
              <HeartHandshake size={26} strokeWidth={1.8} />
            </div>
            <div>
              <p className={styles.guaranteeHeroLabel}>تعهد اصلی</p>
              <h3>واگذاری انحصاری — بدون اجرای موازی</h3>
              <p>
                تضمین می‌دهم این پروژه تحت هیچ عنوان و برند دیگری با کسی اجرا
                نشود و فقط در قالب همین مشارکت پیش برود.
              </p>
            </div>
          </article>

          <div className={styles.guaranteeGrid}>
            {GUARANTEE_ITEMS.map(({ icon: Icon, title, text }) => (
              <article key={title} className={styles.guaranteeCard}>
                <span className={styles.guaranteeCardIcon}>
                  <Icon size={20} strokeWidth={1.9} />
                </span>
                <strong>{title}</strong>
                <span>{text}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Global horizon */}
      <section className={styles.horizonSection} id="horizon">
        <div className={styles.inner}>
          <div className={styles.horizonCard}>
            <span className={styles.horizonIcon}>
              <Globe2 size={22} strokeWidth={1.8} />
            </span>
            <h2>این اعداد فقط ایران است</h2>
            <p>
              هرچه تا اینجا گفتم — فروش، درآمد، سود و بازگشت سرمایه — فقط برای
              بازار داخل خاک ایران حساب شده. اگر همین موتور را در کشورهای همسایه
              با نرخ دلار و بازار ارزی عرضه کنیم، قاعدتاً درآمد چندبرابری
              می‌سازد؛ چون قیمت‌گذاری و قدرت خرید آنجا با ریال فرق دارد.
            </p>
            <p>
              نیاز به سامانه واقعی برای مشاغل، فقط مال ایران نیست؛ در همه دنیا
              هست و هنوز آن‌طور که باید و شاید به آن پرداخته نشده. راه برای درآمد
              بزرگ باز است — ایران نقطه شروع امن ماست، نه سقف ماجرا.
            </p>
          </div>
        </div>
      </section>

      {/* 11. Close */}
      <section className={styles.close}>
        <div className={styles.closeInner}>
          <p className={styles.brandDark}>ربو</p>
          <h2>این تازه شروع داستان است</h2>
          <p>
            اگر به‌دنبال موتور واقعی با بازار بزرگ و تحویل سریع هستید، پیشنهاد من
            ثبت شرکت دوشریکه با ۷۰٪ سهم‌الشرکه شما در ازای ۵۰ میلیارد تومان است —
            اول ایران را درست می‌گیریم، بعد افق همسایه و جهانی را باز می‌کنیم.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/contact" className={styles.ctaPrimary}>
              تماس برای شروع گفت‌وگو
              <ArrowLeft size={16} />
            </Link>
            <a href="#offers" className={styles.ctaGhostDark}>
              بازگشت به پیشنهاد
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
