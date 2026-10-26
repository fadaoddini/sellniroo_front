import CartCheckout from '@/components/Shop/CartCheckout'
import ShopPageSlot from '@/components/modules/ShopPageSlot'

export const metadata = {
  title: 'سبد خرید',
  description: 'سبد خرید، آدرس و تکمیل سفارش',
  robots: { index: false, follow: false },
}

export default function CartPage() {
  return (
    <ShopPageSlot>
      <CartCheckout />
    </ShopPageSlot>
  )
}
