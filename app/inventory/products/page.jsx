// app/inventory/products/page.jsx
import { InventoryProvider } from '@/modules/inventory/components/context/InventoryContext';
import ProductList from '@/modules/inventory/components/products/ProductsList';

export const metadata = {
  title: 'مدیریت کالاها | آریا استاد هلدینگ',
  description: 'مدیریت کالاها، موجودی و وضعیت انبار',
};

export default function Page() {
  return (
    <InventoryProvider>
      <ProductList /> 
    </InventoryProvider>
  );
}