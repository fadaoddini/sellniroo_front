// app/inventory/transactions/page.jsx
import { InventoryProvider } from '@/modules/inventory/components/context/InventoryContext';
import TransactionList from '@/modules/inventory/components/Transactions/TransactionList';

export const metadata = {
  title: 'تاریخچه تراکنش‌ها | آریا استاد هلدینگ',
  description: 'مدیریت و نظارت بر تراکنش‌های انبار',
};

export default function Page() {
  return (
    <InventoryProvider>
      <TransactionList />
    </InventoryProvider>
  );
}