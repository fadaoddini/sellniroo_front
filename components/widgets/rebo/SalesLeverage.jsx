'use client'

import React, { useMemo, useState } from 'react'
import {
  Banknote,
  CircleDollarSign,
  Database,
  RefreshCw,
  ShieldAlert,
  ShoppingCart,
  Table2,
  TrendingDown,
} from 'lucide-react'
import styles from './SalesLeverage.module.css'

const AVG_PRICE = 50_000_000 // میانگین با احتساب سرور و پشتیبانی
const INVESTMENT = 50_000_000_000
const INVESTOR_SHARE = 0.7

const STEPS = [
  { sales: 1_000, label: '۱٬۰۰۰' },
  { sales: 2_000, label: '۲٬۰۰۰' },
  { sales: 5_000, label: '۵٬۰۰۰' },
  { sales: 10_000, label: '۱۰٬۰۰۰' },
  { sales: 50_000, label: '۵۰٬۰۰۰' },
  { sales: 100_000, label: '۱۰۰٬۰۰۰' },
  { sales: 1_000_000, label: '۱٬۰۰۰٬۰۰۰' },
]

const RISK_ROWS = [
  {
    topic: 'آمادگی محصول',
    level: 'پایین',
    tone: 'good',
    text: 'موتور ساخته شده و قابل فروش است؛ ریسک ساخت از صفر وجود ندارد.',
  },
  {
    topic: 'فنی و نگهداری',
    level: 'پایین',
    tone: 'good',
    text: '۳۰٪ سهم سازنده برای ادامه توسعه، بروزرسانی و حل چالش‌های نرم‌افزاری می‌ماند.',
  },
  {
    topic: 'سرعت تحویل',
    level: 'پایین',
    tone: 'good',
    text: 'بعد از آماده‌سازی دوماهه، هر پروژه تا ۷ روز کاری قابل تحویل است.',
  },
  {
    topic: 'بازار و فروش',
    level: 'متوسط',
    tone: 'mid',
    text: 'بازگشت به سرعت فروش وابسته است؛ در ۵ سال اول اگر فروش زیر ۱٬۰۰۰ باشد و هنوز سر‌به‌سر نشده باشید، سهم سود شما موقتاً ۹۰٪ می‌شود.',
  },
  {
    topic: 'رقابت',
    level: 'متوسط',
    tone: 'mid',
    text: 'وردپرس و سایت‌های ارزان هست؛ تمایز ربو در سامانه تخصصی و کاربردی برای مشاغل است.',
  },
  {
    topic: 'نقدینگی و مقیاس',
    level: 'قابل‌مدیریت',
    tone: 'mid',
    text: 'پشتیبانی تمدیدی، سرور و بانک داده مشاغل درآمد را چندلایه و تکرارشونده می‌کند.',
  },
  {
    topic: 'وابستگی به فرد',
    level: 'پایین',
    tone: 'good',
    text: 'هدف ضمانت ماندگاری ۵ ساله سامانه است؛ دانش و توسعه در خود محصول می‌ماند.',
  },
]

function fa(n) {
  return Number(n).toLocaleString('fa-IR')
}

/** حاشیه سود خالص بر اساس مقیاس فروش */
export function marginForSales(sales) {
  if (sales >= 5_000) return 0.7
  if (sales >= 2_000) return 0.6
  return 0.5
}

export function formatToman(amount) {
  const n = Math.round(Number(amount) || 0)
  if (n >= 1_000_000_000_000) {
    const v = n / 1_000_000_000_000
    const rounded = Math.round(v * 10) / 10
    return `${fa(rounded)} تریلیون تومان`
  }
  if (n >= 1_000_000_000) {
    const v = n / 1_000_000_000
    const rounded = Math.round(v * 10) / 10
    return `${fa(rounded)} میلیارد تومان`
  }
  if (n >= 1_000_000) {
    const v = n / 1_000_000
    const rounded = Math.round(v * 10) / 10
    return `${fa(rounded)} میلیون تومان`
  }
  return `${fa(n)} تومان`
}

function calc(sales) {
  const margin = marginForSales(sales)
  const revenue = sales * AVG_PRICE
  const profit = revenue * margin
  const investor = profit * INVESTOR_SHARE
  const paybackYears = investor > 0 ? INVESTMENT / investor : Infinity
  return { sales, margin, revenue, profit, investor, paybackYears }
}

function formatPayback(years) {
  if (!Number.isFinite(years)) return '—'
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12))
    return `≈ ${fa(months)} ماه`
  }
  const rounded = Math.round(years * 10) / 10
  return `≈ ${fa(rounded)} سال`
}

function formatPercent(margin) {
  return `${fa(Math.round(margin * 100))}٪`
}

export default function SalesLeverage() {
  const [idx, setIdx] = useState(0)
  const step = STEPS[idx]
  const rows = useMemo(() => STEPS.map((s) => calc(s.sales)), [])
  const current = rows[idx]
  const fill = (idx / (STEPS.length - 1)) * 100

  return (
    <section className={styles.wrap} id="leverage" aria-labelledby="leverage-title">
      <div className={styles.panel}>
        <header className={styles.head}>
          <h2 id="leverage-title" className={styles.title}>
            اهرم فروش و درآمد
          </h2>
          <p className={styles.subtitle}>
            غلتک را جابه‌جا کنید تا مقیاس را ببینید. میانگین هر فروش{' '}
            <strong>۵۰ میلیون تومان</strong> با احتساب هزینه سرور و پشتیبانی است؛
            حاشیه سود خالص با رشد فروش بهتر می‌شود.
          </p>
          <div className={styles.assumptions}>
            <span>میانگین فروش: ۵۰ میلیون</span>
            <span>۱٬۰۰۰ فروش → سود ۵۰٪</span>
            <span>۲٬۰۰۰ فروش → سود ۶۰٪</span>
            <span>۵٬۰۰۰+ فروش → سود ۷۰٪</span>
            <span>سهم شما: ۷۰٪ (عادی)</span>
            <span>ضمانت زیر ۱٬۰۰۰: ۹۰٪ شما</span>
            <span>ورود: ۵۰ میلیارد</span>
          </div>
        </header>

        <div className={styles.notes}>
          <div>
            <RefreshCw size={15} strokeWidth={2} />
            <p>
              پشتیبانی برای سال‌های بعد قابل تمدید است و با تورم افزایش می‌یابد —
              جریان درآمد تکرارشونده، نه فقط فروش یک‌باره.
            </p>
          </div>
          <div>
            <Database size={15} strokeWidth={2} />
            <p>
              به مرور بانک داده‌های مشاغل شکل می‌گیرد؛ دارایی قابل فروش و
              بازاریابی برای هر صنعت و حوزه جداگانه.
            </p>
          </div>
          <div>
            <TrendingDown size={15} strokeWidth={2} />
            <p>
              با افزایش فروش، نسبت هزینه کم می‌شود؛ به همین خاطر حاشیه سود خالص
              از ۵۰٪ به ۶۰٪ و سپس ۷۰٪ می‌رسد.
            </p>
          </div>
        </div>

        <div className={styles.heroNums}>
          <article className={styles.heroRev}>
            <span className={styles.heroIcon}>
              <Banknote size={18} strokeWidth={1.9} />
            </span>
            <em>درآمد کل سالانه</em>
            <strong key={`r-${idx}`}>{formatToman(current.revenue)}</strong>
          </article>
          <article className={styles.heroProfit}>
            <span className={styles.heroIcon}>
              <CircleDollarSign size={18} strokeWidth={1.9} />
            </span>
            <em>
              سود شما ({formatPercent(current.margin)} خالص × ۷۰٪ سهم)
            </em>
            <strong key={`p-${idx}`}>{formatToman(current.investor)}</strong>
          </article>
        </div>

        <div className={styles.sliderBlock}>
          <div className={styles.sliderTop}>
            <span>
              <ShoppingCart size={15} strokeWidth={2} />
              تعداد فروش در سال
            </span>
            <strong>
              {step.label}
              <small>سود خالص {formatPercent(current.margin)}</small>
            </strong>
          </div>

          <div className={styles.sliderTrack} style={{ '--fill': `${fill}%` }}>
            <input
              className={styles.slider}
              type="range"
              min={0}
              max={STEPS.length - 1}
              step={1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              aria-valuemin={0}
              aria-valuemax={STEPS.length - 1}
              aria-valuenow={idx}
              aria-valuetext={`${step.label} فروش`}
              aria-label="تعداد فروش سالانه"
            />
          </div>

          <div className={styles.ticks}>
            {STEPS.map((s, i) => (
              <button
                key={s.sales}
                type="button"
                className={`${styles.tick} ${i === idx ? styles.tickOn : ''}`}
                onClick={() => setIdx(i)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.pairChart}>
          <div className={styles.pairItem}>
            <div className={styles.pairMeta}>
              <span>درآمد کل</span>
              <strong>{formatToman(current.revenue)}</strong>
            </div>
            <div className={styles.pairTrack}>
              <i className={styles.pairRevFill} style={{ width: '100%' }} />
            </div>
          </div>
          <div className={styles.pairItem}>
            <div className={styles.pairMeta}>
              <span>سود خالص کل ({formatPercent(current.margin)})</span>
              <strong>{formatToman(current.profit)}</strong>
            </div>
            <div className={styles.pairTrack}>
              <i
                className={styles.pairProfitFill}
                style={{ width: `${current.margin * 100}%` }}
              />
            </div>
          </div>
          <div className={styles.pairItem}>
            <div className={styles.pairMeta}>
              <span>سهم شما از سود (۷۰٪)</span>
              <strong>{formatToman(current.investor)}</strong>
            </div>
            <div className={styles.pairTrack}>
              <i
                className={styles.pairInvestorFill}
                style={{ width: `${INVESTOR_SHARE * 100}%` }}
              />
            </div>
          </div>
        </div>

        <p className={styles.foot}>
          با {step.label} فروش × ۵۰ میلیون ≈{' '}
          <strong>{formatToman(current.revenue)}</strong> درآمد؛ سود خالص{' '}
          {formatPercent(current.margin)} ≈{' '}
          <strong>{formatToman(current.profit)}</strong> و سهم شما ≈{' '}
          <strong>{formatToman(current.investor)}</strong> — بازگشت تقریبی:{' '}
          <strong>{formatPayback(current.paybackYears)}</strong>.
        </p>
      </div>

      <div className={styles.tables}>
        <article className={styles.tableCard}>
          <header className={styles.tableHead}>
            <Table2 size={18} strokeWidth={1.9} />
            <div>
              <h3>جدول ارزش سرمایه‌گذاری</h3>
              <p>
                میانگین ۵۰ میلیون (با سرور و پشتیبانی)، حاشیه سود پلکانی، و سهم
                ۷۰٪ شما در برابر ورود ۵۰ میلیارد تومان.
              </p>
            </div>
          </header>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>فروش سالانه</th>
                  <th>سود خالص</th>
                  <th>درآمد کل</th>
                  <th>سود کل</th>
                  <th>سهم شما (۷۰٪)</th>
                  <th>بازگشت سرمایه</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={row.sales}
                    className={i === idx ? styles.rowOn : undefined}
                    onClick={() => setIdx(i)}
                  >
                    <td>{STEPS[i].label}</td>
                    <td>{formatPercent(row.margin)}</td>
                    <td>{formatToman(row.revenue)}</td>
                    <td>{formatToman(row.profit)}</td>
                    <td>{formatToman(row.investor)}</td>
                    <td>{formatPayback(row.paybackYears)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className={styles.tableCard}>
          <header className={styles.tableHead}>
            <ShieldAlert size={18} strokeWidth={1.9} />
            <div>
              <h3>جدول ریسک سرمایه</h3>
              <p>
                تصویر شفاف از ریسک‌های واقعی مشارکت — نه پنهان‌کاری، نه بزرگ‌نمایی.
              </p>
            </div>
          </header>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>عامل ریسک</th>
                  <th>سطح</th>
                  <th>توضیح</th>
                </tr>
              </thead>
              <tbody>
                {RISK_ROWS.map((row) => (
                  <tr key={row.topic}>
                    <td>{row.topic}</td>
                    <td>
                      <span
                        className={`${styles.riskLevel} ${
                          row.tone === 'good' ? styles.riskGood : styles.riskMid
                        }`}
                      >
                        {row.level}
                      </span>
                    </td>
                    <td>{row.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </section>
  )
}
