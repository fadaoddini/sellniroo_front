'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AppWindow,
  BookOpen,
  Brain,
  Briefcase,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  ClipboardList,
  CreditCard,
  Database,
  FileText,
  GalleryHorizontal,
  GraduationCap,
  HelpCircle,
  Images,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Package,
  PanelTop,
  Radio,
  Settings2,
  Shield,
  ShoppingBag,
  Store,
  Tags,
  Users,
  Wallet,
  Wrench,
} from 'lucide-react'
import styles from './ReboDashboardSkeleton.module.css'

export const REBO_DASHBOARD_SYSTEMS = [
  {
    id: 'news',
    label: 'اخبار',
    icon: Newspaper,
    title: 'مدیریت سیستم خبری',
    desc: 'انتشار، ویرایش، اسلایدر ویژه، کامنت و اتصال پیام‌رسان',
    accent: '#e67e22',
    stats: ['اخبار منتشرشده', 'پیش‌نویس', 'بازدید', 'کامنت‌ها'],
    panels: [
      'لیست اخبار',
      'اسلایدر ویژه',
      'کامنت‌ها',
      'سینگل خبر',
      'اتصالات پیام‌رسان',
    ],
    features: [
      { icon: Newspaper, label: 'مدیریت اخبار', hint: 'ایجاد، ویرایش، انتشار و آرشیو' },
      { icon: GalleryHorizontal, label: 'اسلایدر ویژه', hint: 'خبرهای برجسته صفحه اصلی' },
      { icon: FileText, label: 'چیدمان سینگل', hint: 'ترکیب بلوک‌های صفحه خبر' },
      { icon: Radio, label: 'پیام‌رسان', hint: 'ارسال خودکار به کانال‌ها' },
      { icon: Megaphone, label: 'نوار خبر فوری', hint: 'تیترهای متحرک' },
      { icon: Tags, label: 'دسته‌بندی', hint: 'موضوعات و رنگ‌ها' },
    ],
    rows: ['خبر ویژه بازار', 'گزارش صنعت', 'تحلیل فروش', 'گفت‌وگو با مدیر'],
  },
  {
    id: 'jobs',
    label: 'کاریابی',
    icon: Briefcase,
    title: 'مدیریت سیستم کاریابی',
    desc: 'آگهی، شرکت، رزومه، درخواست و داده‌های پایه',
    accent: '#0d9488',
    stats: ['آگهی فعال', 'در انتظار تأیید', 'شرکت‌ها', 'رزومه‌ها'],
    panels: [
      'آگهی‌ها',
      'سینگل آگهی',
      'شهر و موقعیت',
      'نوع همکاری',
      'دسته‌بندی',
      'شرکت‌ها',
      'درخواست‌ها',
      'رزومه‌ها',
    ],
    features: [
      { icon: Briefcase, label: 'مدیریت آگهی‌ها', hint: 'تأیید، ویژه، فعال/غیرفعال' },
      { icon: FileText, label: 'سینگل آگهی', hint: 'ترکیب صفحه جزئیات شغل' },
      { icon: Database, label: 'داده‌های پایه', hint: 'شهر، دسته، عنوان، فیلتر' },
      { icon: Building2, label: 'شرکت‌ها', hint: 'تأیید هویت کارفرما' },
      { icon: ClipboardList, label: 'درخواست‌ها', hint: 'پیگیری ارسال رزومه' },
      { icon: Users, label: 'رزومه‌ها', hint: 'بانک رزومه کارجویان' },
    ],
    rows: ['کارشناس فروش', 'مدیر بازاریابی', 'ویزیتور', 'سرپرست شعبه'],
  },
  {
    id: 'booking',
    label: 'نوبت‌دهی',
    icon: CalendarCheck,
    title: 'مدیریت سیستم نوبت‌دهی',
    desc: 'خدمات، پرسنل، تقویم، تعطیلی و حسابداری',
    accent: '#2563eb',
    stats: ['نوبت امروز', 'خدمات', 'پرسنل', 'درآمد دوره'],
    panels: [
      'تنظیمات رزرو',
      'نوبت‌ها',
      'خدمات',
      'پرسنل',
      'حسابداری',
      'ساعات کاری',
      'تعطیلی‌ها',
    ],
    features: [
      { icon: CalendarCheck, label: 'نوبت‌ها', hint: 'لیست، وضعیت و پیگیری کد' },
      { icon: Tags, label: 'خدمات', hint: 'مدت، قیمت و ظرفیت' },
      { icon: Users, label: 'پرسنل', hint: 'تخصیص خدمت و شیفت' },
      { icon: Wallet, label: 'حسابداری', hint: 'سهم پرسنل و تسویه' },
      { icon: Settings2, label: 'ساعات کاری', hint: 'برنامه هفتگی' },
      { icon: ClipboardList, label: 'تعطیلی‌ها', hint: 'استثناهای تقویم' },
    ],
    rows: ['نوبت ۱۰:۳۰ — اصلاح', 'نوبت ۱۲:۰۰ — مشاوره', 'نوبت ۱۶:۱۵ — سرویس'],
  },
  {
    id: 'shop',
    label: 'فروشگاه تکی',
    icon: Store,
    title: 'مدیریت فروشگاه تکی',
    desc: 'محصول، موجودی، دسته، سینگل و طراحی ویترین',
    accent: '#c2410c',
    stats: ['محصول', 'موجودی کم', 'سفارش', 'فروش امروز'],
    panels: ['محصولات', 'دسته‌بندی', 'سینگل محصول', 'طراحی ویترین', 'تنظیمات فروشگاه'],
    features: [
      { icon: Package, label: 'محصولات', hint: 'قیمت، موجودی و تصاویر' },
      { icon: ShoppingBag, label: 'دسته‌بندی', hint: 'درخت دسته و قالب مشاغل' },
      { icon: FileText, label: 'سینگل محصول', hint: 'چیدمان صفحه کالا' },
      { icon: LayoutDashboard, label: 'طراحی ویترین', hint: 'لیست و ویجت‌های فروشگاه' },
      { icon: Store, label: 'پنل فروشگاه', hint: 'ساعات، نقشه و اطلاعات بانکی' },
      { icon: CreditCard, label: 'پرداخت', hint: 'اتصال به درگاه سراسری' },
    ],
    rows: ['محصول ویژه A', 'بسته پرفروش B', 'کالای تخفیف‌دار C'],
  },
  {
    id: 'marketplace',
    label: 'چندفروشندگی',
    icon: ShoppingBag,
    title: 'مدیریت مارکت‌پلیس',
    desc: 'فروشگاه‌ها، محصولات چندفروشنده، کارمزد و تسویه',
    accent: '#b45309',
    stats: ['فروشگاه', 'محصول', 'در انتظار تسویه', 'کارمزد'],
    panels: ['فروشگاه‌ها', 'محصولات', 'تسویه', 'کارمزد', 'دسته‌بندی'],
    features: [
      { icon: Store, label: 'فروشگاه‌ها', hint: 'فعال‌سازی و مشخصات فروشنده' },
      { icon: Package, label: 'محصولات فروشگاه‌ها', hint: 'کنترل کاتالوگ چندمنبعی' },
      { icon: Wallet, label: 'تسویه حساب', hint: 'پرداخت سهم فروشندگان' },
      { icon: Tags, label: 'کارمزد', hint: 'قوانین کمیسیون' },
      { icon: ShoppingBag, label: 'دسته‌بندی سراسری', hint: 'درخت مشترک مارکت' },
      { icon: Shield, label: 'نظارت', hint: 'تأیید و محدودیت فروشنده' },
    ],
    rows: ['فروشگاه آفتاب', 'فروشگاه نوآور', 'فروشگاه سبز'],
  },
  {
    id: 'video',
    label: 'ویدیو و استوری',
    icon: Clapperboard,
    title: 'مدیریت ویدیو و استوری',
    desc: 'استوری دایره‌ای، آرشیو ویدیو و تنظیمات نمایش',
    accent: '#7c3aed',
    stats: ['استوری', 'ویدیو', 'بازدید', 'فعال'],
    panels: ['استوری‌ها', 'آرشیو ویدیو', 'ویدیو برجسته', 'ظاهر و متن'],
    features: [
      { icon: Images, label: 'استوری دایره‌ای', hint: 'مدیریت آیتم‌ها و ترتیب' },
      { icon: Clapperboard, label: 'آرشیو ویدیو', hint: 'گالری و گرید آرشیو' },
      { icon: GalleryHorizontal, label: 'ویدیو برجسته', hint: 'نمایش ویژه در صفحه' },
      { icon: Settings2, label: 'ظاهر', hint: 'رنگ، متن و نمایش موبایل' },
    ],
    rows: ['استوری محصول', 'ویدیو معرفی', 'کلیپ پشت‌صحنه'],
  },
  {
    id: 'catalog',
    label: 'کاتالوگ',
    icon: BookOpen,
    title: 'مدیریت کاتالوگ دیجیتال',
    desc: 'فلیپ‌بوک، صفحات، جلد و لینک دانلود',
    accent: '#0f766e',
    stats: ['صفحه', 'بازدید', 'دانلود', 'نسخه'],
    panels: ['صفحات کاتالوگ', 'جلد', 'دانلود', 'پیش‌نمایش'],
    features: [
      { icon: BookOpen, label: 'فلیپ‌بوک', hint: 'چینش صفحات با کشیدن و رها کردن' },
      { icon: Images, label: 'جلد', hint: 'پیش‌نمایش جلد و لینک باز کردن' },
      { icon: FileText, label: 'دانلود', hint: 'فایل PDF / لینک دانلود' },
      { icon: Settings2, label: 'نمایش', hint: 'حالت فشرده و کامل' },
    ],
    rows: ['صفحه ۱ — معرفی', 'صفحه ۲ — محصولات', 'صفحه ۳ — تماس'],
  },
  {
    id: 'repairs',
    label: 'تعمیرات',
    icon: Wrench,
    title: 'مدیریت تعمیرات و سرویس',
    desc: 'سفارش، سرویسکار، اجرت، قطعه و یادآور',
    accent: '#b91c1c',
    stats: ['سفارش باز', 'سرویسکار', 'اجرت', 'یادآور'],
    panels: ['سفارش‌ها', 'تعمیرکاران', 'اجرت‌ها', 'قطعات', 'یادآورها', 'تنظیمات'],
    features: [
      { icon: ClipboardList, label: 'سفارش‌ها', hint: 'ثبت، پیگیری و مراحل پرداخت' },
      { icon: Users, label: 'تعمیرکاران', hint: 'اعزام و وضعیت حضور' },
      { icon: Tags, label: 'اجرت‌ها', hint: 'تعرفه خدمات' },
      { icon: Package, label: 'قطعات', hint: 'موجودی و مصرف قطعه' },
      { icon: Megaphone, label: 'یادآورها', hint: 'پیام پیگیری به مشتری' },
      { icon: Wallet, label: 'پرداخت مرحله‌ای', hint: 'اتصال به درگاه' },
    ],
    rows: ['سفارش #۱۲۰۴', 'سفارش #1205', 'سفارش #1206'],
  },
  {
    id: 'school',
    label: 'مدرسه',
    icon: GraduationCap,
    title: 'مدیریت مدرسه آنلاین',
    desc: 'معلم، دانش‌آموز، درس، تکلیف و آزمون',
    accent: '#1d4ed8',
    stats: ['معلم', 'دانش‌آموز', 'تکلیف', 'آزمون'],
    panels: ['نمای کلی', 'معلمان', 'دانش‌آموزان', 'فعالیت‌ها', 'تنظیمات'],
    features: [
      { icon: GraduationCap, label: 'نمای کلی', hint: 'وضعیت کلاس‌ها و فعالیت' },
      { icon: Users, label: 'معلمان', hint: 'دسترسی پنل معلم' },
      { icon: Users, label: 'دانش‌آموزان', hint: 'ثبت‌نام و کلاس' },
      { icon: BookOpen, label: 'دروس و سرفصل', hint: 'درخت آموزش' },
      { icon: ClipboardList, label: 'تکالیف', hint: 'تعریف و پیگیری' },
      { icon: Brain, label: 'آزمون مدرسه', hint: 'ارزیابی دوره‌ای' },
    ],
    rows: ['کلاس ریاضی', 'کلاس علوم', 'کلاس زبان'],
  },
  {
    id: 'softapps',
    label: 'نرم‌افزارها',
    icon: AppWindow,
    title: 'مدیریت نرم‌افزارهای کاربردی',
    desc: 'انتشار، دسته، دانلود رایگان/پولی و حسابداری',
    accent: '#4f46e5',
    stats: ['نرم‌افزار', 'دانلود', 'خرید', 'درآمد'],
    panels: ['نرم‌افزارها', 'دسته‌ها', 'حسابداری', 'تنظیمات'],
    features: [
      { icon: AppWindow, label: 'نرم‌افزارها', hint: 'آپلود، قیمت و انتشار' },
      { icon: Tags, label: 'دسته‌ها', hint: 'گروه‌بندی ویترین' },
      { icon: Wallet, label: 'حسابداری', hint: 'خریدها و تسویه' },
      { icon: CreditCard, label: 'پرداخت', hint: 'دانلود پولی با درگاه' },
    ],
    rows: ['ابزار گزارش', 'مبدل فایل', 'ماشین‌حساب تخصصی'],
  },
  {
    id: 'quiz',
    label: 'آزمون',
    icon: Brain,
    title: 'مدیریت آزمون تخصصی',
    desc: 'سوالات، شرکت‌کنندگان، نفرات برتر و تنظیمات',
    accent: '#9333ea',
    stats: ['سوال', 'شرکت‌کننده', 'نفر برتر', 'تخصص'],
    panels: ['خلاصه', 'نفرات برتر', 'شرکت‌کنندگان', 'سوالات', 'تنظیمات'],
    features: [
      { icon: Brain, label: 'سوالات', hint: 'بانک سوال تخصصی' },
      { icon: Users, label: 'شرکت‌کنندگان', hint: 'نتایج و تاریخچه' },
      { icon: GalleryHorizontal, label: 'نفرات برتر', hint: 'جدول رتبه‌بندی' },
      { icon: Settings2, label: 'تنظیمات آزمون', hint: 'زمان، نمره و تخصص‌ها' },
    ],
    rows: ['آزمون فروش', 'آزمون بازاریابی', 'آزمون مذاکره'],
  },
  {
    id: 'corporate',
    label: 'شرکتی',
    icon: Building2,
    title: 'سایت شرکتی و برند',
    desc: 'ظاهر، منو، درباره ما، تماس و تنظیمات سئو',
    accent: '#a16207',
    stats: ['منو', 'صفحه', 'فرم تماس', 'سئو'],
    panels: ['چیدمان صفحه اصلی', 'ظاهر شرکتی', 'درباره ما', 'منو', 'سئو'],
    features: [
      { icon: LayoutDashboard, label: 'چیدمان صفحه اصلی', hint: 'صفحه‌ساز ویجتی' },
      { icon: PanelTop, label: 'منو و ظاهر', hint: 'هدر، برند و ناوبری' },
      { icon: Building2, label: 'درباره ما', hint: 'بخش‌ها، تیم و دستاورد' },
      { icon: Megaphone, label: 'نوار خبر / هیرو', hint: 'اسلایدر و تیترها' },
      { icon: HelpCircle, label: 'FAQ', hint: 'سوالات متداول' },
      { icon: Settings2, label: 'سئو و برند', hint: 'عنوان، OG و تماس' },
    ],
    rows: ['هدر برند', 'اسلایدر معرفی', 'فرم مشاوره'],
  },
  {
    id: 'sales',
    label: 'فروش و پرداخت',
    icon: CreditCard,
    title: 'فروش، لید و پرداخت',
    desc: 'انواع درخواست، پیگیری مشتری و درگاه پرداخت',
    accent: '#0f766e',
    stats: ['لید', 'پیگیری', 'درگاه', 'پرداخت موفق'],
    panels: ['لیدها', 'انواع درخواست', 'درگاه‌ها', 'اهداف پرداخت', 'پرداخت‌های اخیر'],
    features: [
      { icon: ClipboardList, label: 'لید و پیگیری', hint: 'قیف فروش و یادداشت' },
      { icon: Tags, label: 'انواع درخواست', hint: 'فرم‌های تماس سفارشی' },
      { icon: CreditCard, label: 'درگاه‌ها', hint: 'فعال‌سازی پرداخت سراسری' },
      { icon: Wallet, label: 'اهداف پرداخت', hint: 'فروشگاه، اخبار، نرم‌افزار…' },
    ],
    rows: ['لید جدید — مشاوره', 'پیگیری تماس', 'پرداخت موفق # thr'],
  },
  {
    id: 'team',
    label: 'تیم',
    icon: Users,
    title: 'مدیریت تیم و دسترسی',
    desc: 'کارمندان، بخش‌ها و سطح دسترسی داشبورد',
    accent: '#334155',
    stats: ['کارمند', 'فعال', 'بخش', 'سطح دسترسی'],
    panels: ['کارمندان', 'دسترسی‌ها', 'بخش‌ها', 'آمار فعالیت'],
    features: [
      { icon: Users, label: 'کارمندان', hint: 'ایجاد و مدیریت حساب' },
      { icon: Shield, label: 'سطح دسترسی', hint: 'محدودسازی کارت‌های داشبورد' },
      { icon: Tags, label: 'بخش‌ها', hint: 'اخبار، فروشگاه، کاریابی…' },
      { icon: LayoutDashboard, label: 'نمای داشبورد', hint: 'فقط ابزارهای مجاز هر نفر' },
    ],
    rows: ['مدیر محتوا', 'پشتیبان فروش', 'اپراتور نوبت'],
  },
]

function SkelRows({ rows }) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHead}>
        <span className={styles.skelLine} style={{ width: '28%' }} />
        <span className={styles.skelLine} style={{ width: '18%' }} />
        <span className={styles.skelLine} style={{ width: '14%' }} />
        <span className={styles.skelLine} style={{ width: '12%' }} />
      </div>
      {rows.map((row) => (
        <div key={row} className={styles.tableRow}>
          <span className={styles.rowLabel}>{row}</span>
          <span className={styles.skelLine} style={{ width: '22%' }} />
          <span className={styles.skelPill} />
          <span className={styles.skelBtnSm} />
        </div>
      ))}
    </div>
  )
}

/** @deprecated use REBO_DASHBOARD_SYSTEMS */
export const SYSTEMS = REBO_DASHBOARD_SYSTEMS

export function getReboDashboardSystem(id) {
  return (
    REBO_DASHBOARD_SYSTEMS.find((s) => s.id === id) || REBO_DASHBOARD_SYSTEMS[0]
  )
}

/**
 * @param {{
 *   systemId?: string
 *   embedded?: boolean
 *   hideTabs?: boolean
 *   variant?: 'desktop' | 'mobile'
 * }} [props]
 */
export default function ReboDashboardSkeleton({
  systemId,
  embedded = false,
  hideTabs = false,
  variant = 'desktop',
  theme = 'light',
} = {}) {
  const isDark = theme === 'dark'
  const controlled = systemId != null
  const [activeId, setActiveId] = useState(
    systemId || REBO_DASHBOARD_SYSTEMS[0].id,
  )
  const trackRef = useRef(null)
  const activeTabRef = useRef(null)
  const swipeRef = useRef({ x: 0, active: false })

  const resolvedId = controlled ? systemId : activeId
  const activeIndex = useMemo(() => {
    const i = REBO_DASHBOARD_SYSTEMS.findIndex((s) => s.id === resolvedId)
    return i < 0 ? 0 : i
  }, [resolvedId])
  const active = useMemo(
    () => getReboDashboardSystem(resolvedId),
    [resolvedId],
  )
  const ActiveIcon = active.icon
  const isMobileVariant = variant === 'mobile'
  const stats = isMobileVariant ? active.stats.slice(0, 2) : active.stats
  const features = isMobileVariant
    ? active.features.slice(0, 4)
    : active.features
  const rows = isMobileVariant ? active.rows.slice(0, 3) : active.rows
  const panels = isMobileVariant ? active.panels.slice(0, 4) : active.panels

  const selectByIndex = useCallback(
    (index) => {
      if (controlled) return
      const n = REBO_DASHBOARD_SYSTEMS.length
      if (!n) return
      const next = ((index % n) + n) % n
      setActiveId(REBO_DASHBOARD_SYSTEMS[next].id)
    },
    [controlled],
  )

  const goPrev = useCallback(
    () => selectByIndex(activeIndex - 1),
    [activeIndex, selectByIndex],
  )
  const goNext = useCallback(
    () => selectByIndex(activeIndex + 1),
    [activeIndex, selectByIndex],
  )

  useEffect(() => {
    const el = activeTabRef.current
    if (!el) return
    el.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [resolvedId])

  const onTrackPointerDown = (e) => {
    if (e.pointerType === 'mouse') return
    swipeRef.current = { x: e.clientX, active: true }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onTrackPointerUp = (e) => {
    if (!swipeRef.current.active) return
    swipeRef.current.active = false
    const dx = e.clientX - swipeRef.current.x
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
    if (Math.abs(dx) < 42) return
    // در RTL: کشیدن به راست → قبلی، به چپ → بعدی
    if (dx > 0) goPrev()
    else goNext()
  }

  const panel = (
    <div
      className={`${styles.dash} ${isMobileVariant ? styles.dashMobile : ''} ${embedded ? styles.dashEmbedded : ''}`}
      role="tabpanel"
      style={{ '--sys-accent': active.accent }}
    >
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>
            <ActiveIcon size={isMobileVariant ? 18 : 22} />
          </span>
          <div>
            <p className={styles.pageTitle}>{active.title}</p>
            {!isMobileVariant ? (
              <p className={styles.pageDesc}>{active.desc}</p>
            ) : null}
          </div>
        </div>
        {!isMobileVariant ? (
          <div className={styles.headerActions}>
            <span className={styles.skelBtn} />
            <span className={`${styles.skelBtn} ${styles.skelBtnDark}`} />
          </div>
        ) : null}
      </header>

      <div className={styles.statsGrid}>
        {stats.map((label) => (
          <article key={label} className={styles.statCard}>
            <span className={styles.statBone} />
            <div>
              <span className={styles.skelValue} />
              <strong>{label}</strong>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.panelTabs}>
        {panels.map((p, i) => (
          <span
            key={p}
            className={`${styles.panelTab} ${i === 0 ? styles.panelTabOn : ''}`}
          >
            {p}
          </span>
        ))}
      </div>

      <div className={styles.bodyGrid}>
        <div className={styles.mainCol}>
          <div className={styles.panelHead}>
            <h3>{panels[0]}</h3>
            <span className={styles.skelBtnSm} />
          </div>
          <SkelRows rows={rows} />
        </div>

        {!isMobileVariant ? (
          <aside className={styles.sideCol}>
            <h3 className={styles.sideTitle}>امکانات این سیستم</h3>
            <div className={styles.featureList}>
              {features.map(({ icon: Icon, label, hint }) => (
                <div key={label} className={styles.featureCard}>
                  <span className={styles.featureIcon}>
                    <Icon size={15} strokeWidth={1.75} />
                  </span>
                  <div>
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </div>
                  <span className={styles.actionShimmer} aria-hidden />
                </div>
              ))}
            </div>
          </aside>
        ) : (
          <aside className={styles.sideCol}>
            <div className={styles.featureList}>
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className={styles.featureCard}>
                  <span className={styles.featureIcon}>
                    <Icon size={14} strokeWidth={1.75} />
                  </span>
                  <div>
                    <strong>{label}</strong>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  )

  if (embedded) {
    return (
      <div
        className={`${styles.embeddedRoot} ${isDark ? styles.themeDark : ''}`}
        dir="rtl"
        aria-label={`پیش‌نمایش ${active.label}`}
      >
        {panel}
      </div>
    )
  }

  return (
    <div
      className={`${styles.wrap} ${isDark ? styles.themeDark : ''}`}
      dir="rtl"
      aria-label="پیش‌نمایش داشبورد به تفکیک سیستم"
    >
      <div className={styles.frame}>
        <div className={styles.chrome}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.chromeTitle}>
            داشبورد مدیریت — پیش‌نمایش سیستم‌ها
          </span>
        </div>

        {!hideTabs ? (
          <div className={styles.tabNav}>
            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnDesktop}`}
              onClick={goNext}
              aria-label="سیستم بعدی"
            >
              <ChevronLeft size={18} strokeWidth={2.2} />
            </button>

            <div
              className={styles.tabTrack}
              ref={trackRef}
              role="tablist"
              aria-label="سیستم‌های مدیریت"
              onPointerDown={onTrackPointerDown}
              onPointerUp={onTrackPointerUp}
              onPointerCancel={onTrackPointerUp}
            >
              {REBO_DASHBOARD_SYSTEMS.map((s) => {
                const Icon = s.icon
                const on = s.id === resolvedId
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    ref={on ? activeTabRef : undefined}
                    className={`${styles.tab} ${on ? styles.tabOn : ''}`}
                    style={
                      on
                        ? {
                            '--tab-accent': s.accent,
                            borderColor: `${s.accent}55`,
                            background: `${s.accent}22`,
                            color: '#fff',
                          }
                        : undefined
                    }
                    onClick={() => {
                      if (!controlled) setActiveId(s.id)
                    }}
                  >
                    <Icon size={14} strokeWidth={2} />
                    <span>{s.label}</span>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className={`${styles.navBtn} ${styles.navBtnDesktop}`}
              onClick={goPrev}
              aria-label="سیستم قبلی"
            >
              <ChevronRight size={18} strokeWidth={2.2} />
            </button>
          </div>
        ) : null}

        {panel}
      </div>
    </div>
  )
}
