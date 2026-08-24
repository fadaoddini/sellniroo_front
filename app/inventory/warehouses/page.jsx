import { InventoryProvider } from '@/modules/inventory/components/context/InventoryContext';
import WarehousesList from '@/modules/inventory/components/warehouses/WarehousesList';

export const metadata = {
  title: 'مدیریت انبارها | آریا استاد هلدینگ',
};

export default function Page() {
  return (
    <InventoryProvider>
      <WarehousesList /> 
    </InventoryProvider>
  );
}