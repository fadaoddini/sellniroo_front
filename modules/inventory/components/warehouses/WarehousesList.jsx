// modules/inventory/components/Warehouses/WarehousesList.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../context/InventoryContext';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import WarehouseForm from './WarehouseForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Building2, 
  Search,
  X, 
  RefreshCw,
  Package,
  FileText,
  Users,
  AlertTriangle,
  Box,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Home,
  LayoutDashboard
} from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';


const WarehousesList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadWarehouses,
    deleteWarehouse,
    createWarehouse,
    updateWarehouse,
  } = useInventory();

  // ============================================
  // State Management
  // ============================================
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // Translations
  // ============================================
  const t = {
    title: language === 'fa' ? 'مدیریت انبارها' : 'Warehouses Management',
    subtitle: language === 'fa' ? 'مدیریت و نظارت بر انبارهای سازمان' : 'Manage and monitor organization warehouses',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    totalWarehouses: language === 'fa' ? 'انبارها' : 'Warehouses',
    totalProducts: language === 'fa' ? 'کالاها' : 'Products',
    totalStock: language === 'fa' ? 'کل موجودی' : 'Total Stock',
    lowStock: language === 'fa' ? 'موجودی کم' : 'Low Stock',
    outOfStock: language === 'fa' ? 'تمام شده' : 'Out of Stock',
    recentTransactions: language === 'fa' ? 'تراکنش‌های اخیر' : 'Recent Transactions',
    alerts: language === 'fa' ? 'هشدارهای موجودی' : 'Stock Alerts',
    topProducts: language === 'fa' ? 'پرموجودی‌ترین کالاها' : 'Top Products',
    viewAll: language === 'fa' ? 'مشاهده همه' : 'View All',
    noAlerts: language === 'fa' ? 'همه چیز عالی است! هیچ هشداری وجود ندارد.' : 'All good! No alerts.',
    noTransactions: language === 'fa' ? 'هیچ تراکنشی یافت نشد' : 'No transactions found',
    errorLoading: language === 'fa' ? 'خطا در بارگذاری داده‌ها' : 'Error loading data',
    retry: language === 'fa' ? 'تلاش مجدد' : 'Retry',
    loading: language === 'fa' ? 'در حال بارگذاری...' : 'Loading...',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    newProduct: language === 'fa' ? 'کالای جدید' : 'New Product',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    transactionHistory: language === 'fa' ? 'تاریخچه تراکنش‌ها' : 'Transaction History',
    units: language === 'fa' ? 'واحدها' : 'Units',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    todayTransactions: language === 'fa' ? 'تراکنش‌های امروز' : "Today's Transactions",
    pendingTransactions: language === 'fa' ? 'در انتظار تایید' : 'Pending Approval',
    transactionDetail: language === 'fa' ? 'جزئیات تراکنش' : 'Transaction Details',
    printReceipt: language === 'fa' ? 'چاپ رسید' : 'Print Receipt',
    resolve: language === 'fa' ? 'برطرف کردن' : 'Resolve',
    type: {
      in: language === 'fa' ? 'ورود' : 'In',
      out: language === 'fa' ? 'خروج' : 'Out',
    },
    status: {
      confirmed: language === 'fa' ? 'تایید شده' : 'Confirmed',
      pending: language === 'fa' ? 'در انتظار' : 'Pending',
      cancelled: language === 'fa' ? 'لغو شده' : 'Cancelled',
    },
    alertLevels: {
      critical: language === 'fa' ? 'بحرانی' : 'Critical',
      warning: language === 'fa' ? 'هشدار' : 'Warning',
      info: language === 'fa' ? 'اطلاعاتی' : 'Info',
    },
  };

  // ============================================
  // Refs
  // ============================================
  const isMounted = useRef(true);
  const fetchTimer = useRef(null);
  const isFetching = useRef(false);
  const initialLoadDone = useRef(false);

  // ============================================
  // Lifecycle
  // ============================================
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (fetchTimer.current) {
        clearTimeout(fetchTimer.current);
      }
    };
  }, []);

  // ============================================
  // Core Functions
  // ============================================
  const fetchWarehouses = useCallback(async () => {
    if (isFetching.current || !isMounted.current) return;
    
    isFetching.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const trimmedSearch = searchTerm?.trim() || '';
      const params = {
        page,
        limit: 20,
      };
      
      if (trimmedSearch.length === 0 || trimmedSearch.length >= 3) {
        params.search = trimmedSearch;
      }
      
      console.log('📦 Fetching warehouses:', params);
      await loadWarehouses(params);
      
    } catch (err) {
      console.error('❌ Error loading warehouses:', err);
      setError(err.message || 'خطا در بارگذاری انبارها');
    } finally {
      if (isMounted.current) {
        isFetching.current = false;
        setIsLoading(false);
      }
    }
  }, [page, searchTerm, loadWarehouses]);

  // ============================================
  // Debounced Fetch
  // ============================================
  const debouncedFetch = useCallback(() => {
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
    }
    fetchTimer.current = setTimeout(() => {
      fetchWarehouses();
    }, 500);
  }, [fetchWarehouses]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchWarehouses();
    }
    return () => {
      if (fetchTimer.current) {
        clearTimeout(fetchTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const trimmed = searchTerm?.trim() || '';
      if (trimmed.length === 0 || trimmed.length >= 3) {
        debouncedFetch();
      }
    }
  }, [page, searchTerm]);

  // ============================================
  // Handlers
  // ============================================
  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    
    try {
      await deleteWarehouse(deletingItem.id);
      setDeletingItem(null);
      await fetchWarehouses();
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      setError(err.message || 'خطا در حذف انبار');
    }
  }, [deletingItem, deleteWarehouse, fetchWarehouses]);

  const handleSubmit = useCallback(
    async (data) => {
      try {
        if (editingItem) {
          await updateWarehouse(editingItem.id, data);
        } else {
          await createWarehouse(data);
        }
        setShowForm(false);
        setEditingItem(null);
        await fetchWarehouses();
      } catch (err) {
        console.error('Error submitting warehouse:', err);
        setError(err.message || 'خطا در ذخیره انبار');
      }
    },
    [editingItem, createWarehouse, updateWarehouse, fetchWarehouses]
  );

  const handleRefresh = useCallback(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage !== page && newPage > 0) {
      setPage(newPage);
    }
  }, [page]);

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setPage(1);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setEditingItem(row);
    setShowForm(true);
  }, []);

  const handleDeleteClick = useCallback((row) => {
    setDeletingItem(row);
  }, []);

  // ============================================
  // Memoized Values
  // ============================================
  const totalItems = state.warehouses?.length || 0;
  const isLoading_state = state.loading.warehouses || isLoading;

  const getSearchPlaceholder = () => {
    return 'جستجوی انبار... (حداقل ۳ حرف)';
  };

  const columns = useMemo(() => [
    {
      header: 'عنوان',
      accessor: 'title',
      cellClassName: styles.unitTitle,
    },
    {
      header: 'مسئول',
      accessor: 'manager',
      cellClassName: styles.unitDesc,
    },
    {
      header: 'تلفن',
      accessor: 'phone',
    },
    {
      header: 'کل اقلام',
      render: (row) => (
        <span className={styles.productCount}>
          {row.total_items || 0}
        </span>
      ),
    },
    {
      header: 'وضعیت',
      render: (row) => (
        <span className={row.is_active ? styles.activeBadge : styles.inactiveBadge}>
          {row.is_active ? 'فعال' : 'غیرفعال'}
        </span>
      ),
    },
  ], []);

  const actions = useMemo(() => [
    {
      label: 'مشاهده',
      icon: <Eye size={16} />,
      onClick: (row) => {
        console.log('View warehouse:', row);
      },
    },
    {
      label: 'ویرایش',
      icon: <Edit size={16} />,
      onClick: handleEdit,
    },
    {
      label: 'حذف',
      icon: <Trash2 size={16} />,
      onClick: handleDeleteClick,
    },
  ], [handleEdit, handleDeleteClick]);

  // ============================================
  // Render
  // ============================================
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        {/* ===== Navigation Bar ===== */}
        <div className={styles.navBar}>
          
          <div className={styles.actionsGrid}>
            <Link href="/inventory" className={styles.actionCard}>
              <Home size={20} style={{ color: '#1976d2' }} />
              <span>{t.dashboard}</span>
            </Link>
            <Link href="/inventory/warehouses" className={`${styles.actionCard} ${styles.actionCardActive}`}>
              <Building2 size={20} style={{ color: '#1976d2' }} />
              <span>{t.manageWarehouses}</span>
            </Link>
            <Link href="/inventory/products" className={styles.actionCard}>
              <Package size={20} style={{ color: '#388e3c' }} />
              <span>{t.manageProducts}</span>
            </Link>
            <Link href="/inventory/transactions" className={styles.actionCard}>
              <FileText size={20} style={{ color: '#f57c00' }} />
              <span>{t.transactionHistory}</span>
            </Link>
            <Link href="/inventory/authorized-persons" className={styles.actionCard}>
              <Users size={20} style={{ color: '#6c5ce7' }} />
              <span>{t.managePersons}</span>
            </Link>
            <Link href="/inventory/alerts" className={styles.actionCard}>
              <AlertTriangle size={20} style={{ color: '#c62828' }} />
              <span>{t.manageAlerts}</span>
            </Link>
            <Link href="/inventory/units" className={styles.actionCard}>
              <Box size={20} style={{ color: '#e65100' }} />
              <span>{t.units}</span>
            </Link>
          </div>
        </div>

        {/* ===== Header ===== */}
        <div className={styles.inventoryHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              <Building2 className={styles.titleIcon} size={28} />
              {t.title}
            </h1>
            <p className={styles.pageDesc}>{t.subtitle}</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.refreshBtn}
              onClick={handleRefresh}
              disabled={isLoading_state}
            >
              <RefreshCw size={18} className={isLoading_state ? styles.spinning : ''} />
              <span>{t.refresh}</span>
            </button>
            <button 
              className={styles.primaryBtn} 
              onClick={handleAddNew}
              disabled={isLoading_state}
            >
              <Plus size={18} />
              انبار جدید
            </button>
          </div>
        </div>

        {/* ===== Error ===== */}
        {error && (
          <div className={styles.errorAlert}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* ===== Search ===== */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
              disabled={isLoading_state}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={clearSearch}
                disabled={isLoading_state}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${totalItems} انبار`}
          </span>
        </div>

        {/* ===== Search Hint ===== */}
        {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className={styles.searchHint}>
            <span>🔍 برای جستجو حداقل ۳ حرف وارد کنید</span>
          </div>
        )}

        {/* ===== Table ===== */}
        <DataTable
          columns={columns}
          data={state.warehouses || []}
          loading={isLoading_state}
          actions={actions}
          searchable={false}
          pagination={{
            page,
            total: totalItems,
            pageSize: 20,
          }}
          onPageChange={handlePageChange}
          emptyMessage={
            searchTerm && searchTerm.length >= 3 
              ? 'نتیجه‌ای یافت نشد' 
              : 'هیچ انباری یافت نشد'
          }
          onRowClick={(row) => {
            console.log('Warehouse clicked:', row);
          }}
        />

        {/* ===== Form Modal ===== */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          title={editingItem ? 'ویرایش انبار' : 'ایجاد انبار جدید'}
          size="lg"
        >
          <WarehouseForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            loading={isLoading_state}
          />
        </Modal>

        {/* ===== Delete Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title="حذف انبار"
          message={`آیا از حذف انبار "${deletingItem?.title}" اطمینان دارید؟`}
          confirmText="حذف"
          loading={isLoading_state}
        />
      </div>
    </div>
  );
};

export default WarehousesList;