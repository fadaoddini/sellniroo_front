import { Package, ShoppingCart, Store } from 'lucide-react'

/** لینک‌های زیرمجموعه طراحی فروشگاه */
export const SHOP_DESIGN_LINKS = [
  {
    id: 'shop',
    href: '/adminsettings?tab=shop',
    label: 'طراحی فروشگاه',
    desc: 'لیست و سینگل محصول',
    icon: Store,
  },
  {
    id: 'checkout',
    href: '/adminsettings?tab=checkout',
    label: 'سفارش و سبد',
    desc: 'مراحل خرید و چک‌اوت',
    icon: ShoppingCart,
  },
  {
    id: 'product-single',
    href: '/product-single',
    label: 'سینگل محصول',
    desc: 'اجزای صفحه محصول',
    icon: Package,
  },
]

export function getShopDesignPageNav(activeHref = '/shopdesign') {
  return [
    {
      id: 'hub',
      href: '/shopdesign',
      label: 'طراحی فروشگاه',
      icon: Store,
      active: activeHref === '/shopdesign',
    },
    ...SHOP_DESIGN_LINKS.map((item) => ({
      id: item.id,
      href: item.href,
      label: item.label,
      icon: item.icon,
      active: activeHref === item.href || activeHref === item.id,
    })),
  ]
}

export function isShopDesignTab(tab) {
  return tab === 'shop' || tab === 'checkout'
}
