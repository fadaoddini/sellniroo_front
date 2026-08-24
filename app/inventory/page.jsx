// app/inventory/page.jsx
import { InventoryProvider } from '@/modules/inventory/components/context/InventoryContext';
import InventoryDashboard from '@/modules/inventory/components/InventoryDashboard';

export const metadata = {
  title: 'داشبورد انبار | آریا استاد هلدینگ',
  description: 'مدیریت کامل انبار، کالاها، ورود و خروج',
};

export default function Page() {
  return (
    <InventoryProvider>
      <InventoryDashboard />
    </InventoryProvider>
  );
}