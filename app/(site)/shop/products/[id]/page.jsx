import ProductDetail from '@/components/Shop/ProductDetail'
import ShopProductSlot from '@/components/modules/ShopProductSlot'

export default async function ShopProductPage({ params }) {
  const resolved = await params
  const id = resolved?.id
  return (
    <ShopProductSlot>
      <ProductDetail productId={id} />
    </ShopProductSlot>
  )
}
