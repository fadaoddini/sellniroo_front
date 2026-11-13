/**
 * نقش مدرسه و لینک‌های منو/پروفایل بر اساس school/me
 */
import {
  BookOpen,
  Brain,
  CalendarCheck,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  User,
  Users,
} from 'lucide-react'

export const SCHOOL_RANK_FA = {
  bronze: 'برنزی',
  silver: 'نقره‌ای',
  gold: 'طلایی',
  platinum: 'پلاتینیوم',
  diamond: 'الماس',
}

/**
 * @param {object|null} me — پاسخ school/me
 * @param {object|null} user — کاربر auth
 * @returns {'superuser'|'admin'|'counselor'|'teacher'|'student'|'none'}
 */
export function resolveSchoolRole(me, user = null) {
  if (user?.is_superuser || me?.is_superuser) return 'superuser'
  if (me?.is_admin) return 'admin'
  if (me?.counselor) return 'counselor'
  if (me?.teacher) return 'teacher'
  if (me?.student) return 'student'
  return 'none'
}

export function schoolRoleLabel(role) {
  switch (role) {
    case 'superuser':
      return 'مدیر کل'
    case 'admin':
      return 'مدیر مدرسه'
    case 'counselor':
      return 'مشاور'
    case 'teacher':
      return 'معلم'
    case 'student':
      return 'دانش‌آموز'
    default:
      return 'کاربر'
  }
}

/**
 * لینک‌های کشوی پروفایل نوار بالا — بر اساس نقش
 */
export function buildSchoolProfileMenuLinks(me, user = null) {
  const role = resolveSchoolRole(me, user)
  const links = []

  links.push({ href: '/profile', icon: User, label: 'پروفایل من', key: 'profile' })

  if (role === 'superuser' || role === 'admin') {
    links.push({
      href: '/dashboard',
      icon: LayoutDashboard,
      label: 'داشبورد',
      key: 'dashboard',
    })
    links.push({
      href: '/profile?tab=manage',
      icon: LayoutDashboard,
      label: 'مدیریت مدرسه',
      key: 'manage',
    })
  }

  if (
    role === 'superuser' ||
    role === 'admin' ||
    role === 'teacher' ||
    me?.can_view_teacher_panel
  ) {
    links.push({
      href: '/profile?tab=teacher',
      icon: GraduationCap,
      label: 'پنل معلم',
      key: 'teacher',
    })
  }

  if (
    role === 'superuser' ||
    role === 'admin' ||
    role === 'counselor' ||
    me?.can_view_counselor_panel
  ) {
    links.push({
      href: '/profile?tab=counselor',
      icon: HeartHandshake,
      label: 'پنل مشاور',
      key: 'counselor',
    })
  }

  if (
    role === 'superuser' ||
    role === 'admin' ||
    role === 'student' ||
    me?.can_view_student_panel
  ) {
    links.push({
      href: '/profile?tab=students',
      icon: BookOpen,
      label: 'پنل دانش‌آموز',
      key: 'student',
    })
  }

  links.push({ href: '/school', icon: GraduationCap, label: 'هاب مدرسه', key: 'hub' })

  return links
}

/**
 * تب‌های اصلی پروفایل مدرسه — بر اساس نقش و دسترسی
 * ترتیب ثابت: معلم · مدیریت · دانش‌آموزان · مشاور · حساب
 */
export function buildSchoolProfileTabs(me, user = null) {
  const role = resolveSchoolRole(me, user)
  const isAdmin = role === 'superuser' || role === 'admin'
  const account = { key: 'account', label: 'حساب', icon: 'user' }
  const tabs = []

  if (isAdmin || role === 'teacher' || me?.can_view_teacher_panel) {
    tabs.push({ key: 'teacher', label: 'معلم', icon: 'school' })
  }
  if (isAdmin || me?.can_view_manage_panel) {
    tabs.push({ key: 'manage', label: 'مدیریت', icon: 'building' })
  }
  if (isAdmin || role === 'student' || me?.can_view_student_panel) {
    tabs.push({ key: 'students', label: 'دانش‌آموزان', icon: 'users' })
  }
  if (isAdmin || role === 'counselor' || me?.can_view_counselor_panel) {
    tabs.push({ key: 'counselor', label: 'مشاور', icon: 'brain' })
  }

  tabs.push(account)
  return tabs
}

/** تب پیش‌فرض بر اساس نقش */
export function defaultSchoolProfileTab(me, user = null) {
  const role = resolveSchoolRole(me, user)
  const tabs = buildSchoolProfileTabs(me, user)
  const keys = new Set(tabs.map((t) => t.key))
  const preferred =
    role === 'teacher'
      ? 'teacher'
      : role === 'student'
        ? 'students'
        : role === 'counselor'
          ? 'counselor'
          : role === 'admin' || role === 'superuser'
            ? 'teacher'
            : 'account'
  if (keys.has(preferred)) return preferred
  return tabs[0]?.key || 'account'
}

/** کارت‌های نمای کلی پروفایل */
export function buildSchoolOverviewCards(role, me) {
  const cards = []
  if (role === 'superuser' || role === 'admin') {
    cards.push(
      {
        key: 'dash',
        href: '/dashboard',
        title: 'داشبورد',
        desc: 'پنل مدیریت سایت',
        icon: LayoutDashboard,
      },
      {
        key: 'manage',
        href: '/school-manage',
        title: 'مدیریت مدرسه',
        desc: 'کلاس، معلم، مشاور و دروس',
        icon: LayoutDashboard,
      },
      {
        key: 'teacher',
        href: '/profile?tab=teacher',
        title: 'پیش‌نمایش معلم',
        desc: 'ورود به پنل معلم',
        icon: GraduationCap,
        tab: 'teacher',
      },
      {
        key: 'student',
        href: '/school/student',
        title: 'پیش‌نمایش دانش‌آموز',
        desc: 'ورود به پنل دانش‌آموز',
        icon: BookOpen,
      },
      {
        key: 'counselor',
        href: '/school/counselor',
        title: 'پنل مشاور',
        desc: 'آزمون و پرونده‌ها',
        icon: HeartHandshake,
      },
    )
  } else if (role === 'teacher') {
    cards.push(
      {
        key: 'panel',
        href: '/profile?tab=teacher',
        title: 'پنل معلم',
        desc: 'کل امکانات /school/teacher',
        icon: GraduationCap,
        tab: 'teacher',
      },
      {
        key: 'account',
        href: '/profile?tab=account',
        title: 'حساب کاربری',
        desc: 'موبایل، ایمیل و نام',
        icon: User,
        tab: 'account',
      },
    )
  } else if (role === 'counselor') {
    cards.push(
      {
        key: 'panel',
        href: '/school/counselor',
        title: 'پنل مشاور',
        desc: 'داشبورد مشاوره',
        icon: HeartHandshake,
      },
      {
        key: 'tests',
        href: '/profile?tab=tests',
        title: 'بانک آزمون',
        desc: 'IQ، EQ و غربالگری',
        icon: Brain,
        tab: 'tests',
      },
      {
        key: 'files',
        href: '/profile?tab=files',
        title: 'پرونده‌ها',
        desc: 'پرونده دانش‌آموز و معلم',
        icon: ClipboardList,
        tab: 'files',
      },
    )
  } else if (role === 'student') {
    const student = me?.student
    cards.push(
      {
        key: 'panel',
        href: '/school/student',
        title: 'پنل دانش‌آموز',
        desc: student
          ? `${SCHOOL_RANK_FA[student.rank_tier] || student.rank_tier || 'رتبه'} · درس و تکلیف`
          : 'درس، تکلیف و آزمون',
        icon: BookOpen,
      },
      {
        key: 'report',
        href: '/profile?tab=report',
        title: 'کارنامه',
        desc: 'نمرات و رتبه کلاسی',
        icon: ClipboardList,
        tab: 'report',
      },
      {
        key: 'att',
        href: '/profile?tab=attendance',
        title: 'حضور و غیاب',
        desc: 'وضعیت حضور ماهانه',
        icon: CalendarCheck,
        tab: 'attendance',
      },
      {
        key: 'sched',
        href: '/profile?tab=schedule',
        title: 'برنامه هفتگی',
        desc: 'ساعت کلاس‌ها',
        icon: CalendarCheck,
        tab: 'schedule',
      },
      {
        key: 'counsel',
        href: '/profile?tab=counsel',
        title: 'مشاوره',
        desc: 'آزمون هوش و پرونده',
        icon: HeartHandshake,
        tab: 'counsel',
      },
    )
  } else {
    cards.push({
      key: 'hub',
      href: '/school',
      title: 'هاب مدرسه',
      desc: 'ورود نقش‌ها و معرفی سامانه',
      icon: GraduationCap,
    })
  }

  cards.push({
    key: 'hub2',
    href: '/school',
    title: 'صفحه مدرسه',
    desc: 'لندینگ و میانبر نقش‌ها',
    icon: Users,
  })

  return cards
}
