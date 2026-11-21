import { formatRial } from '@/config/reboPricing'

function faDate(d = new Date()) {
  try {
    return new Date(d).toLocaleDateString('fa-IR')
  } catch {
    return ''
  }
}

function money(n, cur = 'تومان') {
  return `${formatRial(n)} ${cur}`
}

export function buildContractArticles(board) {
  const order = board?.order || {}
  const summary = board?.summary || {}
  const stages = board?.stages || []
  const currency = summary.currency_label || order.currency_label || 'تومان'
  const total = Number(summary.total ?? order.amount ?? 0)
  const byKey = Object.fromEntries(stages.map((s) => [s.key, s]))
  const deposit = byKey.deposit?.amount ?? Math.floor((total * 40) / 100)
  const layout = byKey.layout?.amount ?? Math.floor((total * 30) / 100)
  const launch =
    byKey.launch?.amount ?? total - Math.floor((total * 40) / 100) - Math.floor((total * 30) / 100)
  const packages = (order.lines_json || [])
    .map((l) => `• ${l.title} — ${money(l.price, currency)}`)
    .join('\n')

  return {
    meta: {
      code: order.code || '—',
      date: faDate(order.created_at || Date.now()),
      customer: order.customer_name || '—',
      mobile: order.customer_mobile || '—',
      request: order.request_number || '—',
      totalLabel: money(total, currency),
      currency,
      packages,
    },
    title: 'قرارداد طراحی و راه‌اندازی وب‌سایت اختصاصی',
    subtitle: 'موتور ربو — سفارش بسته و اقساط مطابق ماده ۱',
    articles: [
      {
        id: 'a1',
        title: 'ماده ۱ — مبلغ قرارداد و نحوه پرداخت',
        body: [
          `مبلغ کل قرارداد برابر است با ${money(total, currency)} بابت بسته‌ها/خدمات زیر:`,
          packages || '—',
          '',
          'پرداخت مبلغ قرارداد طی سه قسط به شرح زیر انجام می‌شود:',
          `۱) پیش‌پرداخت (بیعانه) همزمان با امضای قرارداد و شروع پروژه: ۴۰٪ معادل ${money(deposit, currency)}`,
          `۲) پس از ارائه قالب و تأیید چیدمان توسط کارفرما: ۳۰٪ معادل ${money(layout, currency)}`,
          `۳) پس از تحویل نهایی و راه‌اندازی سایت: ۳۰٪ معادل ${money(launch, currency)}`,
          '',
          'ستون «پشتیبانی» در میزکار قرارداد پس از اتمام کار مرحله تحویل نهایی فعال می‌شود و قسط جداگانه از مبلغ قرارداد ندارد.',
        ].join('\n'),
      },
      {
        id: 'a1b',
        title: 'ماده ۱ مکرر — پشتیبانی پس از تحویل',
        body: [
          '۱) به‌محض اتمام کار مرحله «تحویل نهایی و راه‌اندازی» توسط مجری، دوره پشتیبانی فعال می‌شود و سه ماه نخست رایگان است.',
          '۲) پشتیبانی پس از تحویل شامل موارد زیر است و برای هر مورد مدت و شرایط مشخص دارد:',
          '• رفع باگ: خطای عملکردی گزارش‌شده در اولویت است؛ زمان رسیدگی تا ۷۲ ساعت کاری.',
          '• به‌روزرسانی: به‌روزرسانی‌های جزئی امنیتی و رفع مشکلات جزئی بدون هزینه اضافه.',
          '• راهنمایی: آموزش و راهنمایی پنل مدیریت (حداکثر ۲ ساعت در ماه).',
          '• پشتیبانی تلفنی/آنلاین: پاسخگویی در ساعات کاری ۹ صبح تا ۶ عصر از طریق تیکت، چت یا تماس.',
          '۳) خارج از پوشش: تغییرات اساسی، امکانات جدید خارج از سفارش اولیه و توسعه جدید مشمول پشتیبانی نیست و نیازمند الحاقیه جداگانه است.',
          '۴) تعرفه تمدید ماهانه پس از دوره رایگان:',
          '• پلن پایه: ۲٬۵۰۰٬۰۰۰ تومان — فقط پشتیبانی فنی محدود، رفع نواقص احتمالی و آموزش‌های استفاده از سامانه (بدون جلسات توسعه/نیازمندی منظم).',
          '• پلن برنزی: ۹٬۰۰۰٬۰۰۰ تومان — حدود ۱۰ ساعت در ماه (نیازمندی ۱×۲۰دقیقه/هفته، کار مفید ۲×۱ساعت/هفته، آنلاین ۱×۳۰دقیقه، گزارش ۳۰دقیقه) — مناسب پروژه‌های کوچک و متوسط.',
          '• پلن نقره‌ای: ۱۷٬۰۰۰٬۰۰۰ تومان — حدود ۱۶ ساعت در ماه (نیازمندی ۲×۲۰دقیقه/هفته، کار مفید ۳×۱ساعت/هفته، آنلاین ۲×۳۰دقیقه، گزارش ۳۰دقیقه) — مناسب پروژه‌های متوسط و بزرگ.',
          '• پلن طلایی: ۲۵٬۰۰۰٬۰۰۰ تومان — حدود ۲۶ ساعت در ماه (نیازمندی ۳×۲۰دقیقه/هفته، کار مفید ۵×۱ساعت/هفته، آنلاین ۲×۴۵دقیقه، گزارش ۳۰دقیقه) — مناسب پروژه‌های بزرگ و سازمانی.',
          '۵) تمدید اختیاری است و فقط از ۱۰ روز مانده به پایان دوره (یا پس از انقضا) در میزکار فعال می‌شود؛ قیمت‌ها ممکن است بر اساس تورم افزایش یابد.',
          '۶) مفاد پشتیبانی در ستون پشتیبانی میزکار /todorebo برای کارفرما قابل مشاهده و تأیید است.',
        ].join('\n'),
      },
      {
        id: 'a2',
        title: 'ماده ۲ — موضوع قرارداد',
        body: [
          'موضوع این قرارداد، طراحی، توسعه و راه‌اندازی وب‌سایت اختصاصی بر بستر موتور ربو',
          'مطابق بسته‌ها و امکانات انتخاب‌شده در سفارش کارفرما است.',
          'دامنه دقیق خدمات همان اقلام ثبت‌شده در سفارش است و هر مورد خارج از سبد، الحاقیه جداگانه می‌طلبد.',
        ].join('\n'),
      },
      {
        id: 'a3',
        title: 'ماده ۳ — تعهدات مجری (ربو)',
        body: [
          '۱) شروع کار پس از دریافت پیش‌پرداخت و تکمیل اطلاعات اولیه کارفرما.',
          '۲) ارائه قالب/چیدمان برای تأیید کارفرما قبل از قسط دوم.',
          '۳) تحویل نهایی و راه‌اندازی پس از تسویه قسط سوم.',
          '۴) فعال‌سازی سه ماه پشتیبانی رایگان پس از اتمام تحویل نهایی و امکان تمدید طبق ماده ۱ مکرر.',
        ].join('\n'),
      },
      {
        id: 'a4',
        title: 'ماده ۴ — تعهدات کارفرما',
        body: [
          '۱) پرداخت به‌موقع اقساط طبق ماده ۱.',
          '۲) ارائه محتوا، لوگو، دسترسی دامنه/هاست و بازخورد در زمان متعارف.',
          '۳) تأیید یا اعلام اصلاحات چیدمان در مهلت اعلام‌شده؛ تأخیر کارفرما موجب جابجایی زمان‌بندی می‌شود.',
        ].join('\n'),
      },
      {
        id: 'a5',
        title: 'ماده ۵ — زمان‌بندی و تغییرات',
        body: [
          'زمان‌بندی هر مرحله پس از پرداخت قسط مربوط و دریافت ورودی‌های لازم آغاز می‌شود.',
          'تغییر دامنه پروژه یا افزودن امکانات خارج از سفارش اولیه، نیازمند توافق و الحاقیه مالی است.',
        ].join('\n'),
      },
      {
        id: 'a6',
        title: 'ماده ۶ — فسخ و استرداد',
        body: [
          'در صورت انصراف کارفرما پس از شروع طراحی، پیش‌پرداخت بابت رزرو ظرفیت و کار انجام‌شده قابل استرداد نیست،',
          'مگر آنکه طرفین کتباً خلاف آن را توافق کنند.',
          'فسخ از سوی مجری تنها در صورت عدم همکاری یا عدم پرداخت اقساط پس از اخطار کتبی امکان‌پذیر است.',
        ].join('\n'),
      },
      {
        id: 'a7',
        title: 'ماده ۷ — پیگیری و مرجع',
        body: [
          `کد سفارش: ${order.code || '—'}`,
          `شماره پیگیری: ${order.request_number || '—'}`,
          'وضعیت اقساط و مراحل پروژه در نشانی /todorebo قابل مشاهده است.',
          'این سند نسخه الکترونیکی قرارداد پیوست سفارش موتور ربو است.',
        ].join('\n'),
      },
    ],
  }
}

export function openContractPrintWindow(doc) {
  if (typeof window === 'undefined' || !doc) return
  const w = window.open('', '_blank', 'noopener,noreferrer,width=820,height=960')
  if (!w) return

  const articlesHtml = doc.articles
    .map(
      (a) => `
      <section class="article">
        <h2>${a.title}</h2>
        <pre>${String(a.body || '').replace(/</g, '&lt;')}</pre>
      </section>`,
    )
    .join('')

  w.document.write(`<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${doc.title} — ${doc.meta.code}</title>
  <style>
    @page { margin: 16mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 18px 22px 28px;
      color: #12241f;
      background: #fff;
      font-family: Tahoma, "Iran", "iran", Arial, sans-serif;
      font-size: 11.5px;
      line-height: 1.75;
    }
    .head {
      border-bottom: 2px solid #1e3b2f;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 800;
    }
    .sub { margin: 4px 0 0; color: #5b6b64; font-size: 11px; }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 14px;
      margin-top: 10px;
      font-size: 11px;
    }
    .meta b { font-weight: 800; }
    .article { margin: 12px 0 0; page-break-inside: avoid; }
    .article h2 {
      margin: 0 0 6px;
      font-size: 12.5px;
      color: #1e3b2f;
      border-right: 3px solid #c8b48a;
      padding-right: 8px;
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: inherit;
      font-size: 11px;
      line-height: 1.8;
    }
    .foot {
      margin-top: 22px;
      padding-top: 10px;
      border-top: 1px dashed #cbd5d1;
      font-size: 10px;
      color: #64748b;
    }
    .actions {
      position: sticky;
      top: 0;
      background: #f5f0e6;
      padding: 8px 10px;
      margin: -18px -22px 14px;
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .actions button {
      border: 0;
      border-radius: 8px;
      padding: 7px 12px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      background: #1e3b2f;
      color: #fff;
    }
    @media print {
      .actions { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button type="button" onclick="window.print()">ذخیره / چاپ PDF</button>
  </div>
  <header class="head">
    <h1>${doc.title}</h1>
    <p class="sub">${doc.subtitle}</p>
    <div class="meta">
      <div>کد سفارش: <b dir="ltr">${doc.meta.code}</b></div>
      <div>تاریخ: <b>${doc.meta.date}</b></div>
      <div>کارفرما: <b>${doc.meta.customer}</b></div>
      <div>موبایل: <b dir="ltr">${doc.meta.mobile}</b></div>
      <div>پیگیری: <b dir="ltr">${doc.meta.request}</b></div>
      <div>مبلغ کل: <b>${doc.meta.totalLabel}</b></div>
    </div>
  </header>
  ${articlesHtml}
  <footer class="foot">
    این فایل را از دیالوگ چاپ مرورگر به‌صورت PDF ذخیره کنید. موتور اختصاصی ربو.
  </footer>
  <script>
    setTimeout(function () { try { window.print(); } catch (e) {} }, 350);
  </script>
</body>
</html>`)
  w.document.close()
}
