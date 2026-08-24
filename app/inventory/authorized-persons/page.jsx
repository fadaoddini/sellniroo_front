// app/inventory/authorized-persons/page.jsx
import { InventoryProvider } from '@/modules/inventory/components/context/InventoryContext';
import PersonList from '@/modules/inventory/components/AuthorizedPersons/PersonList';

export const metadata = {
  title: 'افراد مجاز | آریا استاد هلدینگ',
  description: 'مدیریت افراد مجاز برای خروج کالا از انبار',
};

export default function Page() {
  return (
    <InventoryProvider>
      <PersonList />
    </InventoryProvider>
  );
}