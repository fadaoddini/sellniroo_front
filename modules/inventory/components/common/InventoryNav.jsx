// modules/inventory/components/common/InventoryNav.jsx

'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Home,
  Building2,
  Package,
  Box,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  AlertTriangle,
  FileText,
  ScrollText,
} from 'lucide-react';
import styles from './inventoryNav.module.css';

const InventoryNav = () => {
  const { language } = useLanguage();
  const pathname = usePathname();
  const fa = language === 'fa';

  const t = useMemo(
    () => ({
      dashboard: fa ? 'داشبورد' : 'Dashboard',
      warehouses: fa ? 'انبارها' : 'Warehouses',
      products: fa ? 'کالاها' : 'Products',
      units: fa ? 'واحدها' : 'Units',
      stockIn: fa ? 'ورود' : 'In',
      stockOut: fa ? 'خروج' : 'Out',
      authorizedPersons: fa ? 'مجازها' : 'Persons',
      alerts: fa ? 'هشدارها' : 'Alerts',
      transactions: fa ? 'تراکنش‌ها' : 'Txns',
      vouchers: fa ? 'حواله‌ها' : 'Vouchers',
    }),
    [fa]
  );

  const starts = (base) =>
    pathname === base || (pathname && pathname.startsWith(`${base}/`));

  const groups = [
    {
      id: 'main',
      items: [
        {
          id: 'dashboard',
          href: '/inventory',
          icon: Home,
          label: t.dashboard,
          active: pathname === '/inventory',
        },
        {
          id: 'stockIn',
          href: '/inventory/in',
          icon: ArrowDownToLine,
          label: t.stockIn,
          active: starts('/inventory/in'),
          variant: 'success',
        },
        {
          id: 'stockOut',
          href: '/inventory/out',
          icon: ArrowUpFromLine,
          label: t.stockOut,
          active: starts('/inventory/out'),
          variant: 'danger',
        },
        {
          id: 'vouchers',
          href: '/inventory/vouchers',
          icon: ScrollText,
          label: t.vouchers,
          active: starts('/inventory/vouchers'),
          variant: 'accent',
        },
      ],
    },
    {
      id: 'catalog',
      items: [
        {
          id: 'products',
          href: '/inventory/products',
          icon: Package,
          label: t.products,
          active: starts('/inventory/products'),
        },
        {
          id: 'warehouses',
          href: '/inventory/warehouses',
          icon: Building2,
          label: t.warehouses,
          active: starts('/inventory/warehouses'),
        },
        {
          id: 'units',
          href: '/inventory/units',
          icon: Box,
          label: t.units,
          active: starts('/inventory/units'),
        },
      ],
    },
    {
      id: 'ops',
      items: [
        {
          id: 'transactions',
          href: '/inventory/transactions',
          icon: FileText,
          label: t.transactions,
          active: starts('/inventory/transactions'),
        },
        {
          id: 'authorizedPersons',
          href: '/inventory/authorized-persons',
          icon: Users,
          label: t.authorizedPersons,
          active: starts('/inventory/authorized-persons'),
        },
        {
          id: 'alerts',
          href: '/inventory/alerts',
          icon: AlertTriangle,
          label: t.alerts,
          active: starts('/inventory/alerts'),
        },
      ],
    },
  ];

  return (
    <nav className={styles.navBar} aria-label={fa ? 'منوی انبار' : 'Inventory menu'}>
      <div className={styles.rail}>
        {groups.map((group, index) => (
          <React.Fragment key={group.id}>
            {index > 0 ? <span className={styles.divider} aria-hidden /> : null}
            <div className={styles.group}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={[
                      styles.item,
                      item.active ? styles.itemActive : '',
                      item.variant === 'success' ? styles.itemSuccess : '',
                      item.variant === 'danger' ? styles.itemDanger : '',
                      item.variant === 'accent' ? styles.itemAccent : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    title={item.label}
                  >
                    <Icon size={15} strokeWidth={item.active ? 2.4 : 2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default InventoryNav;
