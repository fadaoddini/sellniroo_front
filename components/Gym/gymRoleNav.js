/**
 * نقش و تب‌های پروفایل باشگاه بدنسازی — الگوی مدرسه
 */
import {
  Bell,
  Clock3,
  LayoutDashboard,
  Package,
  Salad,
  ShoppingBag,
  User,
  UserCog,
  Users,
} from 'lucide-react'

/** پروفایل اختصاصی باشگاه — جدا از /profile مدرسه و بقیه سیستم‌ها */
export const GYM_PROFILE_PATH = '/gym/profile'

export const GYM_MANAGE_SECTIONS = [
  { key: 'overview', label: 'نمای کلی' },
  { key: 'users', label: 'اعضا' },
  { key: 'packages', label: 'بسته‌ها' },
  { key: 'sessions', label: 'سانس‌ها' },
  { key: 'trainers', label: 'مربیان' },
  { key: 'products', label: 'محصولات' },
  { key: 'library', label: 'کتابخانه' },
  { key: 'alerts', label: 'هشدارها' },
]

export function resolveGymRole(me, user = null) {
  if (me?.role) return me.role
  if (user?.is_superuser || user?.is_staff || user?.is_staff_user) return 'admin'
  if (me?.is_trainer || me?.can_view_trainer_panel) return 'trainer'
  if (me?.is_member || (Array.isArray(me?.memberships) && me.memberships.length)) {
    return 'member'
  }
  return 'user'
}

export function gymRoleLabel(meOrUser = null, memberships = []) {
  if (meOrUser && typeof meOrUser === 'object' && meOrUser.role_label) {
    return meOrUser.role_label
  }
  if (meOrUser?.role) {
    return (
      {
        admin: 'مدیر باشگاه',
        trainer: 'مربی',
        member: 'عضو باشگاه',
        user: 'کاربر',
      }[meOrUser.role] || 'کاربر'
    )
  }
  if (meOrUser?.is_superuser || meOrUser?.is_staff) return 'مدیر باشگاه'
  if (Array.isArray(memberships) && memberships.length) return 'عضو باشگاه'
  return 'کاربر'
}

export function buildGymProfileTabs(me, user = null) {
  const role = resolveGymRole(me, user)
  const isAdmin = role === 'admin' || !!me?.can_view_manage_panel
  const isTrainer = role === 'trainer' || !!me?.is_trainer
  const isMember =
    role === 'member' ||
    !!me?.is_member ||
    (Array.isArray(me?.memberships) && me.memberships.length > 0)
  const tabs = []

  if (isAdmin) {
    tabs.push({ key: 'manage', label: 'مدیریت', icon: 'clipboard' })
  }
  if (isAdmin || isTrainer || me?.can_view_trainer_panel) {
    tabs.push({ key: 'trainer', label: 'مربی', icon: 'users' })
  }
  if (isAdmin || isMember || me?.can_view_member_panel) {
    tabs.push({ key: 'membership', label: 'ورزشکار', icon: 'users' })
  }
  if (isAdmin || isMember) {
    tabs.push({ key: 'orders', label: 'سفارش‌ها', icon: 'shopping' })
  }
  tabs.push({ key: 'account', label: 'حساب', icon: 'user' })
  return tabs
}

export function buildGymProfileShortcuts(me, user = null) {
  const role = resolveGymRole(me, user)
  const isAdmin = role === 'admin' || !!me?.can_view_manage_panel
  const isTrainer = role === 'trainer' || !!me?.is_trainer
  const isMember =
    role === 'member' ||
    !!me?.is_member ||
    (Array.isArray(me?.memberships) && me.memberships.length > 0)
  const items = []
  if (isAdmin) {
    items.push({
      href: gymProfileHref('manage'),
      label: 'مدیریت',
      icon: LayoutDashboard,
      primary: true,
    })
    items.push({
      href: gymProfileHref('trainer'),
      label: 'مربی',
      icon: UserCog,
    })
    items.push({
      href: gymProfileHref('membership'),
      label: 'ورزشکار',
      icon: Users,
    })
  }
  if (isTrainer && !isAdmin) {
    items.push({
      href: gymProfileHref('trainer'),
      label: 'شاگردها',
      icon: UserCog,
      primary: true,
    })
  }
  if (isMember && !isAdmin) {
    items.push({
      href: gymProfileHref('membership'),
      label: 'ورزشکار',
      icon: Users,
      primary: !isAdmin && !isTrainer,
    })
  }
  if (isAdmin || isMember) {
    items.push({ href: '/cart', label: 'سبد', icon: ShoppingBag })
    items.push({
      href: gymProfileHref('orders'),
      label: 'سفارش‌ها',
      icon: Package,
    })
  }
  return items
}

export function defaultGymProfileTab(me, user = null) {
  const role = resolveGymRole(me, user)
  if (role === 'admin' || me?.can_view_manage_panel) return 'manage'
  if (role === 'trainer' || me?.is_trainer) return 'trainer'
  if (role === 'member' || me?.is_member) return 'membership'
  return 'account'
}

export function gymProfileHref(tab, section = null) {
  const params = new URLSearchParams()
  if (tab) params.set('tab', tab)
  if (tab === 'manage') {
    const safe = GYM_MANAGE_SECTIONS.some((s) => s.key === section)
      ? section
      : section || 'overview'
    if (safe) params.set('section', safe)
  }
  const q = params.toString()
  return q ? `${GYM_PROFILE_PATH}?${q}` : GYM_PROFILE_PATH
}

export function gymManageHref(section = 'overview') {
  return gymProfileHref('manage', section)
}

export function resolveGymProfileBasePath(pathname = '') {
  if (pathname === '/profile' || pathname.startsWith('/profile/')) {
    return '/profile'
  }
  return GYM_PROFILE_PATH
}

/**
 * لینک‌های کشوی پروفایل خبر فوری — همه به پروفایل باشگاه
 */
export function buildGymProfileMenuLinks(user = null, me = null) {
  const links = [
    {
      href: GYM_PROFILE_PATH,
      icon: User,
      label: 'پروفایل باشگاه',
      key: 'profile',
    },
    {
      href: '/#gym-shop',
      icon: ShoppingBag,
      label: 'فروشگاه',
      key: 'shop',
    },
    {
      href: '/cart',
      icon: ShoppingBag,
      label: 'سبد خرید',
      key: 'cart',
    },
  ]

  const role = resolveGymRole(me, user)
  const canManage =
    role === 'admin' ||
    !!me?.can_view_manage_panel ||
    !!(user?.is_superuser || user?.is_staff || user?.is_staff_user)
  const isTrainer = role === 'trainer' || !!me?.is_trainer
  const isMember =
    role === 'member' ||
    !!me?.is_member ||
    (Array.isArray(me?.memberships) && me.memberships.length > 0)

  if (isMember || canManage) {
    links.push({
      href: gymProfileHref('orders'),
      icon: Package,
      label: 'سفارش‌ها',
      key: 'orders',
    })
  }

  if (canManage) {
    links.push(
      {
        href: gymManageHref('overview'),
        icon: LayoutDashboard,
        label: 'مدیریت باشگاه',
        key: 'manage',
      },
      {
        href: gymManageHref('users'),
        icon: Users,
        label: 'اعضا',
        key: 'members',
      },
      {
        href: gymManageHref('packages'),
        icon: Package,
        label: 'بسته‌ها',
        key: 'packages',
      },
      {
        href: gymManageHref('sessions'),
        icon: Clock3,
        label: 'سانس‌ها',
        key: 'sessions',
      },
      {
        href: gymManageHref('trainers'),
        icon: UserCog,
        label: 'مربیان',
        key: 'trainers',
      },
      {
        href: gymManageHref('products'),
        icon: Package,
        label: 'محصولات',
        key: 'products',
      },
      {
        href: gymManageHref('library'),
        icon: Salad,
        label: 'کتابخانه',
        key: 'library',
      },
      {
        href: gymManageHref('alerts'),
        icon: Bell,
        label: 'هشدار و پیامک',
        key: 'alerts',
      },
      {
        href: '/dashboard',
        icon: LayoutDashboard,
        label: 'مدیریت سایت',
        key: 'site_admin',
      },
    )
  }

  if (isTrainer && !canManage) {
    links.push({
      href: gymProfileHref('trainer'),
      icon: UserCog,
      label: 'پنل مربی',
      key: 'trainer',
    })
  }

  if (isMember) {
    links.push({
      href: gymProfileHref('membership'),
      icon: Users,
      label: 'ورزشکار',
      key: 'membership',
    })
  }

  return links
}
