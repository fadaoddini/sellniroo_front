// app/inventory/units/page.jsx
import { InventoryProvider } from '@/modules/inventory/components/context/InventoryContext';
import UnitList from '@/modules/inventory/components/Units/UnitList';

export const metadata = {
  title: 'مدیریت واحدها | آریا استاد هلدینگ',
  description: 'مدیریت واحدهای اندازه‌گیری کالاها',
};

export default function Page() {
  return (
    <InventoryProvider>
      <UnitList />
    </InventoryProvider>
  );
}