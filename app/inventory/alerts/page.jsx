import { InventoryProvider } from '@/modules/inventory/components/context/InventoryContext';
import AlertList from '@/modules/inventory/components/Alerts/AlertList';

export const metadata = {
  title: 'هشدارهای موجودی | آریا استاد هلدینگ',
};

export default function Page() {
  return (
    <InventoryProvider>
      <AlertList />
    </InventoryProvider>
  );
}