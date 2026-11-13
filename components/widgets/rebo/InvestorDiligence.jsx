'use client'

import React from 'react'
import {
  Building2,
  CalendarRange,
  CircleDollarSign,
  ClipboardCheck,
  DoorOpen,
  FileText,
  Layers,
  Scale,
  ScrollText,
  Swords,
  UserCog,
  Wallet,
} from 'lucide-react'
import styles from './InvestorDiligence.module.css'

const REVENUE_MIX = [
  {
    stream: 'فروش سایت / سامانه',
    year1: 'اصل درآمد',
    year2: 'ادامه دارد',
    year3: 'ادامه دارد',
    note: 'همین‌جا پول اصلی از فروش پروژه می‌آید',
  },
  {
    stream: 'پشتیبانی سالانه',
    year1: 'شروع می‌شود',
    year2: 'رشد می‌کند',
    year3: 'با تورم بالا می‌رود',
    note: 'هر سال تمدید می‌شود؛ درآمد تکراری است',
  },
  {
    stream: 'سرور ابری',
    year1: 'شروع می‌شود',
    year2: 'تکراری',
    year3: 'تکراری',
    note: 'مشتری برای ماندن روی سرور شارژ می‌کند',
  },
  {
    stream: 'داده مشاغل',
    year1: 'جمع می‌شود',
    year2: 'قابل فروش',
    year3: 'کانال جدا',
    note: 'به مرور برای هر صنف داده داریم که ارزش بازاریابی دارد',
  },
  {
    stream: 'ماژول اضافه',
    year1: 'حاشیه',
    year2: 'حاشیه',
    year3: 'حاشیه',
    note: 'مشتری امکان بیشتر می‌خرد؛ هسته را از نو نمی‌سازیم',
  },
  {
    stream: 'اشتراک حوزه‌ای',
    year1: 'قابل شروع',
    year2: 'رشد',
    year3: 'رشد جدی',
    note: 'مثل سامانه باشگاه‌ها؛ ماهانه بر اساس تعداد نفرات — در هر صنفی قابل اجرا',
  },
]

const SCENARIOS = [
  {
    name: 'اگر فروش کم باشد',
    sales: '۶۰۰',
    avg: '۵۰ میلیون',
    margin: '۵۰٪',
    revenue: '۳۰ میلیارد',
    profit: '۱۵ میلیارد',
    yours70: '۱۰٫۵ میلیارد',
    yours90: '۱۳٫۵ میلیارد',
    note: 'زیر ۱۰۰۰ فروش؛ ضمانت من اعمال می‌شود و سهم شما ۹۰٪ است',
  },
  {
    name: 'فرض پایه من',
    sales: '۱٬۰۰۰',
    avg: '۵۰ میلیون',
    margin: '۵۰٪',
    revenue: '۵۰ میلیارد',
    profit: '۲۵ میلیارد',
    yours70: '۱۷٫۵ میلیارد',
    yours90: '—',
    note: 'از ۱۰۰۰ به بالا ضمانت ۹۰٪ نیست؛ سهم عادی ۷۰٪',
    highlight: true,
  },
  {
    name: 'اگر خوب جلو برویم',
    sales: '۵٬۰۰۰',
    avg: '۵۰ میلیون',
    margin: '۷۰٪',
    revenue: '۲۵۰ میلیارد',
    profit: '۱۷۵ میلیارد',
    yours70: '۱۲۲٫۵ میلیارد',
    yours90: '—',
    note: 'فروش بالا؛ همان تقسیم عادی ۷۰٪ شما',
  },
]

const SHARE_PAYMENT = [
  {
    item: 'این ۵۰ میلیارد چیست؟',
    detail: 'پول خرید ۷۰٪ سهم شماست — هزینه روزمره شرکت نیست',
  },
  {
    item: 'کجا واریز می‌شود؟',
    detail: 'به حساب شخصی من، در ازای واگذاری همان ۷۰٪',
  },
  {
    item: 'سند رسمی',
    detail: 'بعد از ثبت شرکت، سند رسمی سهم را تنظیم می‌کنیم تا مالکیت شما محکم باشد',
  },
  {
    item: 'ثبت شرکت',
    detail: 'از اول شرکت دوشریکه می‌زنیم: ۷۰٪ به نام شما، ۳۰٪ به نام من',
  },
]

const OPS_FUNDING = [
  {
    item: 'تبلیغات و جذب مشتری',
    you: '۷۰٪',
    founder: '۳۰٪',
    note: 'مثل بقیه هزینه‌ها، همان نسبت سهم',
  },
  {
    item: 'نیرو و دفتر و کار روزانه',
    you: '۷۰٪',
    founder: '۳۰٪',
    note: 'هر هزینه جاری شرکت همین‌طور تقسیم می‌شود',
  },
  {
    item: 'سرور و امنیت',
    you: '۷۰٪',
    founder: '۳۰٪',
    note: 'اول از درآمد کم می‌شود، بعد سود تقسیم می‌گردد',
  },
  {
    item: 'کار فنی و نگهداری',
    you: '۷۰٪ هزینه',
    founder: '۳۰٪ هزینه + خود کار',
    note: 'پول هزینه مشترک است؛ انجام کار فنی با من است، حقوق ماهانه جدا نمی‌گیرم',
  },
]

const GOVERNANCE = [
  {
    topic: 'سهم شرکت',
    you: '۷۰٪',
    founder: '۳۰٪',
    note: 'از روز ثبت همین است؛ با سند رسمی محکم می‌شود',
  },
  {
    topic: 'سود در حالت عادی',
    you: '۷۰٪',
    founder: '۳۰٪',
    note: 'بعد از کم کردن هزینه‌های شرکت',
  },
  {
    topic: 'ضمانت فروش من',
    you: '۹۰٪',
    founder: '۱۰٪',
    note: '۵ سال اول، اگر فروش زیر ۱۰۰۰ باشد و هنوز سر‌به‌سر نشده باشید',
    highlight: true,
  },
  {
    topic: 'فروش یا انتقال سهم',
    you: 'آزادتر',
    founder: 'همراه',
    note: 'اساسنامه را طوری می‌چینیم که سهم شما گیر قانونی بی‌خودی نداشته باشد',
  },
  {
    topic: 'کار فنی',
    you: 'نظارت کلی',
    founder: 'اجرا با من',
    note: 'ساخت و نگهداری نرم‌افزار با من؛ فروش و بقیه امور با همفکری',
  },
  {
    topic: 'نقش کلی شما',
    you: 'مشاوره و نظارت',
    founder: 'همراه فنی',
    note: 'شما بر عملکرد کلی نظارت می‌کنید؛ تصمیم‌های فروش را با هم می‌گیریم',
  },
  {
    topic: 'امضای مهم',
    you: 'با هم',
    founder: 'فنی محدود',
    note: 'چک و قراردادهای سنگین دو امضایی؛ کار فنی محدود و مشخص',
  },
  {
    topic: 'هزینه شرکت',
    you: '۷۰٪',
    founder: '۳۰٪',
    note: 'جدا از آن ۵۰ میلیارد بهای سهم',
  },
  {
    topic: 'برگشت پول / رشد',
    you: 'سود و ارزش سهم',
    founder: 'کنار شما در فنی',
    note: 'از سود سالانه، یا بعداً فروش بخشی از سهم',
  },
]

const CHARTER_ROWS = [
  {
    clause: 'انتقال سهم',
    text: 'می‌نویسیم سهم شما راحت قابل انتقال باشد و پشت قانون پیش‌فرض گیر نکند',
  },
  {
    clause: 'تقسیم سود',
    text: 'اول هزینه شرکت، بعد سود به نسبت سهم؛ من حقوق ثابت جدا نمی‌گیرم',
  },
  {
    clause: 'اختیار کار',
    text: 'فنی با من؛ پول و تعهدهای بزرگ با توافق دو نفره',
  },
]

const CONTRACT_ROWS = [
  {
    clause: 'پرداخت ۵۰ میلیارد',
    text: 'به حساب من بابت سهم شما؛ بعد سند رسمی را در مهلت توافق می‌زنیم',
  },
  {
    clause: 'کار من چیست؟',
    text: 'ساخت و نگهداری نرم‌افزار، رفع مشکل و امنیت با من است. فروش و بقیه کارها را با همفکری هم پیش می‌بریم',
  },
  {
    clause: 'کار شما چیست؟',
    text: 'مشاوره و نظارت بر عملکرد کلی مجموعه؛ در فروش و سایر امور هم کنار هم تصمیم می‌گیریم',
  },
  {
    clause: 'هزینه شرکت',
    text: '۷۰٪ شما، ۳۰٪ من — برای همه هزینه‌ها؛ جدا از بهای سهم',
  },
  {
    clause: 'اگر هزینه نرسد',
    text: 'اگر هرکدام سهم هزینه را ندهد و کار بخوابد، در قرارداد حق اقدام می‌گذاریم',
  },
  {
    clause: 'اختلاف',
    text: 'داوری می‌گذاریم تا اگر اختلاف شد، سریع‌تر از دادگاه جلو برویم',
  },
]

const MILESTONES = [
  {
    when: 'ماه ۰ تا ۲',
    title: 'آماده‌سازی',
    items: 'بسته فروش، سرور، روند تحویل، تیم اولیه',
  },
  {
    when: 'ماه ۳ تا ۶',
    title: 'شروع فروش',
    items: 'فروش واقعی، تحویل تا ۷ روز کاری، پشتیبانی اول',
  },
  {
    when: 'ماه ۶ تا ۱۲',
    title: 'جا افتادن',
    items: 'تمدید پشتیبانی، رشد سرور، اصلاح محصول با بازخورد',
  },
  {
    when: 'سال ۲',
    title: 'رشد و داده',
    items: 'بانک داده مشاغل، فروش بهتر به هر صنف',
  },
  {
    when: 'سال ۳ به بعد',
    title: 'گسترش',
    items: 'هوش مصنوعی روی عناوین، بازار بزرگ‌تر',
  },
]

const UNIT_PRODUCTS = [
  {
    title: 'نوبت‌دهی',
    price: '۳۵ میلیون',
    cost: 'سبک',
    margin: 'خوب',
    note: 'زود تحویل می‌شود؛ برای فروش زیاد مناسب است',
  },
  {
    title: 'تعمیرات و سرویس',
    price: '۳۵ میلیون',
    cost: 'سبک',
    margin: 'خوب',
    note: 'چرخه فروش کوتاه',
  },
  {
    title: 'سیستم شرکتی',
    price: '۲۵ میلیون',
    cost: 'سبک',
    margin: 'خوب',
    note: 'ورودی مناسب برای سازمان‌ها و تیم‌های داخلی',
  },
  {
    title: 'محله خبری',
    price: '۳۵ میلیون',
    cost: 'متوسط',
    margin: 'خوب',
    note: 'محتوا می‌ماند و مخاطب می‌سازد',
  },
  {
    title: 'مدرسه آنلاین',
    price: '۵۰ میلیون',
    cost: 'متوسط',
    margin: 'خوب',
    note: 'نزدیک میانگین ۵۰ میلیونی که حساب کرده‌ام',
  },
  {
    title: 'فروشگاه تکی',
    price: '۵۵ میلیون',
    cost: 'متوسط',
    margin: 'خوب',
    note: 'فروش آنلاین واقعی با پرداخت',
  },
  {
    title: 'کاریابی',
    price: '۶۵ میلیون',
    cost: 'بالاتر',
    margin: 'متوسط رو به بالا',
    note: 'پلتفرم است؛ مشتری بیشتر می‌ماند',
  },
  {
    title: 'مارکت‌پلیس',
    price: '۹۵ میلیون',
    cost: 'سنگین‌تر',
    margin: 'متوسط',
    note: 'پروژه بزرگ‌تر؛ اثر برند قوی‌تر',
  },
  {
    title: 'ویدیو و استوری',
    price: '۸ میلیون',
    cost: 'سبک',
    margin: 'خوب',
    note: 'کنار بسته‌های اصلی فروخته می‌شود',
  },
  {
    title: 'اشتراک حوزه‌ای (مثال باشگاه)',
    price: 'ماهانه',
    cost: 'متوسط',
    margin: 'تکرارشونده',
    note: 'بر اساس تعداد اعضا؛ در هر حوزه خدماتی قابل تعمیم',
  },
]

const ASSETS = [
  { item: 'هسته نرم‌افزار', status: 'آماده', note: 'با پایتون و Next.js ساخته شده' },
  { item: 'صفحه‌ساز ویجتی', status: 'آماده', note: 'سایت را بدون از صفر نوشتن می‌چینیم' },
  { item: 'بسته‌های مشاغل', status: 'آماده', note: 'از شرکتی و نوبت‌دهی تا مارکت‌پلیس' },
  { item: 'مدل اشتراک حوزه‌ای', status: 'قابل اجرا در شراکت', note: 'مثل باشگاه‌ها؛ ماهانه بر اساس تعداد نفرات' },
  { item: 'پنل مدیریت', status: 'آماده', note: 'محتوا، سفارش، کاربر، تنظیمات' },
  { item: 'پرداخت', status: 'آماده', note: 'مسیر پول مشتری باز است' },
  { item: 'سرور ابری', status: 'آماده', note: 'خودش یک محصول درآمدی است' },
  { item: 'دامنه و برند ربو', status: 'داخل معامله', note: 'با مشارکت می‌آید' },
  { item: 'نسخه موبایل (PWA)', status: 'آماده', note: 'مثل اپ روی گوشی کار می‌کند' },
  { item: 'هوش مصنوعی', status: 'نقشه راه', note: 'بعد از جا افتادن فروش اضافه می‌کنیم' },
  { item: 'فرآیند تحویل', status: 'در ۲ ماه اول', note: 'بسته فروش و تحویل را منظم می‌کنیم' },
]

const COMPETITION = [
  {
    topic: 'سرعت شروع',
    wp: 'سریع ولی سطحی',
    custom: 'کند و گران',
    rebo: 'سریع و کاربردی',
  },
  {
    topic: 'به درد کسب‌وکار',
    wp: 'بیشتر ویترین',
    custom: 'بستگی به پول دارد',
    rebo: 'ماژول واقعی برای مشاغل',
  },
  {
    topic: 'هزینه',
    wp: 'ارزان شروع، گران نگهداشت',
    custom: 'از اول سنگین',
    rebo: 'بسته شفاف',
  },
  {
    topic: 'تکرار فروش برای شما',
    wp: 'سخت',
    custom: 'هر بار از صفر',
    rebo: 'یک موتور، بارها فروش',
  },
  {
    topic: 'درآمد بعدی',
    wp: 'کم',
    custom: 'کم',
    rebo: 'پشتیبانی + سرور + داده',
  },
  {
    topic: 'وابستگی فنی',
    wp: 'پلاگین‌های پراکنده',
    custom: 'به تیم پروژه',
    rebo: 'هسته واحد؛ من کنار شما می‌مانم',
  },
]

const EXIT_PATHS = [
  {
    path: 'سود سالانه',
    when: 'از سال اول',
    note: 'در حالت عادی ۷۰٪ سود شماست؛ در ضمانت فروش کم، تا ۹۰٪',
  },
  {
    path: 'رشد ارزش سهم',
    when: 'با فروش بیشتر',
    note: 'هرچه فروش و داده بیشتر، سهم شما ارزشمندتر',
  },
  {
    path: 'فروش بخشی از سهم',
    when: 'بعد از جا افتادن',
    note: 'می‌توانید بخشی از رشد را نقد کنید',
  },
  {
    path: 'همکاری با نماینده فروش',
    when: 'سال ۲ به بعد',
    note: 'اگر بخواهیم فروش را بزرگ کنیم، می‌توانیم با تیم یا کانال فروش قرارداد ببندیم — بدون اینکه مجبور شویم سهم شرکت را بین آدم‌های جدید تقسیم کنیم',
  },
  {
    path: 'فروش کل مجموعه',
    when: 'بلندمدت',
    note: 'اگر روزی خریدار بزرگ پیدا شود',
  },
]

function TableCard({ icon: Icon, title, desc, children }) {
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <Icon size={18} strokeWidth={1.9} />
        <div>
          <h3>{title}</h3>
          <p>{desc}</p>
        </div>
      </header>
      <div className={styles.scroll}>{children}</div>
    </article>
  )
}

export default function InvestorDiligence() {
  return (
    <section className={styles.wrap} id="diligence" aria-label="جداول بررسی سرمایه‌گذاری من">
      <header className={styles.sectionHead}>
        <h2>می‌خواهم همه چیز را شفاف ببینید</h2>
        <p>
          این جداول را برای شما چیده‌ام تا از درآمد تا سهم و هزینه و زمان‌بندی، با
          زبان ساده ببینید من چه پیشنهادی می‌دهم.
        </p>
      </header>

      <div className={styles.grid}>
        <TableCard
          icon={Layers}
          title="۱. پول از کجا می‌آید؟"
          desc="فقط یک‌بار فروش نیست؛ پشتیبانی و سرور و داده هم جلوتر درآمد می‌سازند."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>منبع درآمد</th>
                <th>سال ۱</th>
                <th>سال ۲</th>
                <th>سال ۳</th>
                <th>به زبان ساده</th>
              </tr>
            </thead>
            <tbody>
              {REVENUE_MIX.map((row) => (
                <tr key={row.stream}>
                  <td>{row.stream}</td>
                  <td>{row.year1}</td>
                  <td>{row.year2}</td>
                  <td>{row.year3}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={Scale}
          title="۲. اگر کم بفروشیم / پایه / خوب"
          desc="سه حالت می‌گویم تا فقط یک عدد قشنگ وسط هوا نباشد."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>حالت</th>
                <th>فروش</th>
                <th>میانگین</th>
                <th>سود خالص</th>
                <th>درآمد</th>
                <th>سود کل</th>
                <th>سهم شما ۷۰٪</th>
                <th>سهم شما با ضمانت ۹۰٪</th>
                <th>حرف من</th>
              </tr>
            </thead>
            <tbody>
              {SCENARIOS.map((row) => (
                <tr
                  key={row.name}
                  className={row.highlight ? styles.rowOn : undefined}
                >
                  <td>{row.name}</td>
                  <td>{row.sales}</td>
                  <td>{row.avg}</td>
                  <td>{row.margin}</td>
                  <td>{row.revenue}</td>
                  <td>{row.profit}</td>
                  <td>{row.yours70}</td>
                  <td className={row.yours90 !== '—' ? styles.reboCell : undefined}>
                    {row.yours90}
                  </td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={Building2}
          title="۳. این ۵۰ میلیارد چیست؟"
          desc="پول خرید سهم شماست. هزینه دفتر و نیرو از این محل نیست."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>سؤال</th>
                <th>جواب من</th>
              </tr>
            </thead>
            <tbody>
              {SHARE_PAYMENT.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={Wallet}
          title="۴. هزینه شرکت را چطور می‌دهیم؟"
          desc="جدا از ۵۰ میلیارد. هر هزینه شرکت: ۷۰٪ شما، ۳۰٪ من."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>چه هزینه‌ای؟</th>
                <th>شما</th>
                <th>من</th>
                <th>توضیح کوتاه</th>
              </tr>
            </thead>
            <tbody>
              {OPS_FUNDING.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>{row.you}</td>
                  <td>{row.founder}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={UserCog}
          title="۵. بعد از معامله کارها دست کیست؟"
          desc="سهم، سود، فنی، امضا و هزینه — ساده و روشن."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>موضوع</th>
                <th>شما</th>
                <th>من</th>
                <th>حرف من</th>
              </tr>
            </thead>
            <tbody>
              {GOVERNANCE.map((row) => (
                <tr
                  key={row.topic}
                  className={row.highlight ? styles.rowHighlight : undefined}
                >
                  <td>{row.topic}</td>
                  <td>{row.you}</td>
                  <td>{row.founder}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={ScrollText}
          title="۶. در اساسنامه چه می‌نویسیم؟"
          desc="سه چیز مهم که خیال شما را راحت کند."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>بند</th>
                <th>به زبان ساده</th>
              </tr>
            </thead>
            <tbody>
              {CHARTER_ROWS.map((row) => (
                <tr key={row.clause}>
                  <td>{row.clause}</td>
                  <td>{row.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={FileText}
          title="۷. در قرارداد همکاری چه می‌گویم؟"
          desc="پرداخت، کار من، هزینه، و اگر یکی کم بگذارد."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>بند</th>
                <th>به زبان ساده</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACT_ROWS.map((row) => (
                <tr key={row.clause}>
                  <td>{row.clause}</td>
                  <td>{row.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={CalendarRange}
          title="۸. زمان‌بندی کار"
          desc="از آماده‌سازی تا فروش و رشد."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>کی؟</th>
                <th>چه مرحله‌ای؟</th>
                <th>چه خروجی؟</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONES.map((row) => (
                <tr key={row.when}>
                  <td>{row.when}</td>
                  <td>{row.title}</td>
                  <td>{row.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={CircleDollarSign}
          title="۹. هر محصول حدوداً چقدر؟"
          desc="قیمت فروش و اینکه تحویلش سبک است یا سنگین."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>محصول</th>
                <th>قیمت</th>
                <th>سختی تحویل</th>
                <th>حاشیه</th>
                <th>نکته من</th>
              </tr>
            </thead>
            <tbody>
              {UNIT_PRODUCTS.map((row) => (
                <tr key={row.title}>
                  <td>{row.title}</td>
                  <td>{row.price}</td>
                  <td>{row.cost}</td>
                  <td>{row.margin}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={ClipboardCheck}
          title="۱۰. الان چه چیزی آماده است؟"
          desc="چه چیزی همین امروز دارید می‌خرید، چه چیزی در دو ماه اول جمع می‌شود."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>چی؟</th>
                <th>وضعیت</th>
                <th>توضیح</th>
              </tr>
            </thead>
            <tbody>
              {ASSETS.map((row) => (
                <tr key={row.item}>
                  <td>{row.item}</td>
                  <td>
                    <span className={styles.badge}>{row.status}</span>
                  </td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={Swords}
          title="۱۱. ربو کنار بقیه گزینه‌ها"
          desc="فرقش با وردپرس و پروژه اختصاصی گران چیست."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>موضوع</th>
                <th>وردپرس</th>
                <th>اختصاصی سنگین</th>
                <th>ربو</th>
              </tr>
            </thead>
            <tbody>
              {COMPETITION.map((row) => (
                <tr key={row.topic}>
                  <td>{row.topic}</td>
                  <td>{row.wp}</td>
                  <td>{row.custom}</td>
                  <td className={styles.reboCell}>{row.rebo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>

        <TableCard
          icon={DoorOpen}
          title="۱۲. پول چطور برمی‌گردد؟"
          desc="مسیرهای واقعی برگشت و رشد — بدون قول الکی."
        >
          <table className={styles.table}>
            <thead>
              <tr>
                <th>مسیر</th>
                <th>حدوداً کی؟</th>
                <th>توضیح</th>
              </tr>
            </thead>
            <tbody>
              {EXIT_PATHS.map((row) => (
                <tr key={row.path}>
                  <td>{row.path}</td>
                  <td>{row.when}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>
    </section>
  )
}
