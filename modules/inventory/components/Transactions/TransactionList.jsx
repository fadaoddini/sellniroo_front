// modules/inventory/components/Transactions/TransactionList.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../../components/context/InventoryContext';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import StockInForm from './StockInForm';
import StockOutForm from './StockOutForm';
import { 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  Printer,
  Eye,
  RefreshCw,
  Search,
  X,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Package,
  Building2,
  User,
  FileCheck,
  Home,
  LayoutDashboard,
  Box,
  Users,
  AlertTriangle
} from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';

const TransactionList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadTransactions,
    addStock,
    removeStock,
    loadProducts,
    loadWarehouses,
    loadUnits,
    loadPersons,
  } = useInventory();

  // ============================================
  // Translations
  // ============================================
  const t = {
    title: language === 'fa' ? 'تاریخچه تراکنش‌ها' : 'Transaction History',
    subtitle: language === 'fa' ? 'مدیریت و نظارت بر تراکنش‌های انبار' : 'Manage and monitor warehouse transactions',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    transactionHistory: language === 'fa' ? 'تاریخچه تراکنش‌ها' : 'Transaction History',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    units: language === 'fa' ? 'واحدها' : 'Units',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    totalTransactions: language === 'fa' ? 'کل تراکنش‌ها' : 'Total Transactions',
    today: language === 'fa' ? 'امروز' : 'Today',
    pending: language === 'fa' ? 'در انتظار' : 'Pending',
    confirmed: language === 'fa' ? 'تایید شده' : 'Confirmed',
    cancelled: language === 'fa' ? 'لغو شده' : 'Cancelled',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    printReceipt: language === 'fa' ? 'چاپ رسید' : 'Print Receipt',
  };

  // ============================================
  // State Management
  // ============================================
  const [showStockIn, setShowStockIn] = useState(false);
  const [showStockOut, setShowStockOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });

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
  const fetchInitialData = useCallback(async () => {
    try {
      await Promise.all([
        loadProducts(),
        loadWarehouses(),
        loadUnits(),
        loadPersons(),
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, [loadProducts, loadWarehouses, loadUnits, loadPersons]);

  const fetchTransactions = useCallback(async () => {
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
      
      if (filterType) {
        params.transaction_type = filterType;
      }
      
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      if (filterWarehouse) {
        params.warehouse = filterWarehouse;
      }
      
      if (filterProduct) {
        params.product = filterProduct;
      }
      
      console.log('📦 Fetching transactions:', params);
      const data = await loadTransactions(params);
      
      // محاسبه آمار
      const transactions = data || [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTransactions = transactions.filter(t => {
        const date = new Date(t.created_at);
        return date >= today;
      });

      setStats({
        total: transactions.length,
        today: todayTransactions.length,
        pending: transactions.filter(t => t.status === 'PENDING').length,
        confirmed: transactions.filter(t => t.status === 'CONFIRMED').length,
        cancelled: transactions.filter(t => t.status === 'CANCELLED').length,
      });
      
    } catch (err) {
      console.error('❌ Error loading transactions:', err);
      setError(err.message || 'خطا در بارگذاری تراکنش‌ها');
    } finally {
      if (isMounted.current) {
        isFetching.current = false;
        setIsLoading(false);
      }
    }
  }, [page, searchTerm, filterType, filterStatus, filterWarehouse, filterProduct, loadTransactions]);

  // ============================================
  // Debounced Fetch
  // ============================================
  const debouncedFetch = useCallback(() => {
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
    }
    fetchTimer.current = setTimeout(() => {
      fetchTransactions();
    }, 500);
  }, [fetchTransactions]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchInitialData();
      fetchTransactions();
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
  }, [page, searchTerm, filterType, filterStatus, filterWarehouse, filterProduct]);

  // ============================================
  // Handlers
  // ============================================
  const handleRefresh = useCallback(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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

  const handleFilterType = useCallback((value) => {
    setFilterType(value);
    setPage(1);
  }, []);

  const handleFilterStatus = useCallback((value) => {
    setFilterStatus(value);
    setPage(1);
  }, []);

  const handleFilterWarehouse = useCallback((value) => {
    setFilterWarehouse(value);
    setPage(1);
  }, []);

  const handleFilterProduct = useCallback((value) => {
    setFilterProduct(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterType('');
    setFilterStatus('');
    setFilterWarehouse('');
    setFilterProduct('');
    setSearchTerm('');
    setPage(1);
  }, []);

  const handleStockInSubmit = useCallback(async (data) => {
    try {
      await addStock(data);
      setShowStockIn(false);
      await fetchTransactions();
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  }, [addStock, fetchTransactions]);

  const handleStockOutSubmit = useCallback(async (data) => {
    try {
      await removeStock(data);
      setShowStockOut(false);
      await fetchTransactions();
    } catch (error) {
      console.error('Error removing stock:', error);
    }
  }, [removeStock, fetchTransactions]);

  const handleViewDetail = useCallback((row) => {
    setSelectedTransaction(row);
    setShowTransactionDetail(true);
  }, []);

  const handlePrintReceipt = useCallback((row) => {
    console.log('Print receipt for:', row.reference_number);
  }, []);

  // ============================================
  // Helper Functions
  // ============================================
  const getStatusLabel = useCallback((status) => {
    const map = {
      CONFIRMED: { label: 'تایید شده', className: styles.statusConfirmed, icon: <CheckCircle size={12} /> },
      PENDING: { label: 'در انتظار', className: styles.statusPending, icon: <Clock size={12} /> },
      CANCELLED: { label: 'لغو شده', className: styles.statusCancelled, icon: <AlertCircle size={12} /> },
    };
    return map[status] || { label: status, className: '', icon: null };
  }, []);

  const getTypeLabel = useCallback((type) => {
    const map = {
      IN: { label: 'ورود', className: styles.typeIn, icon: <ArrowUp size={14} /> },
      OUT: { label: 'خروج', className: styles.typeOut, icon: <ArrowDown size={14} /> },
    };
    return map[type] || { label: type, className: '', icon: null };
  }, []);

  const formatDate = useCallback((date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('fa-IR') + ' ' + 
             d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  }, []);

  const getSearchPlaceholder = () => {
    return 'جستجوی شماره مرجع... (حداقل ۳ حرف)';
  };

  // ============================================
  // Memoized Values
  // ============================================
  const totalItems = state.transactions?.length || 0;
  const isLoading_state = state.loading.transactions || isLoading;

  const columns = useMemo(() => [
    { 
      header: 'شماره مرجع', 
      render: (row) => (
        <span className={styles.refNumber}>{row.reference_number}</span>
      ),
      cellClassName: styles.colRef,
    },
    { 
      header: 'نوع', 
      render: (row) => {
        const type = getTypeLabel(row.transaction_type);
        return (
          <span className={`${styles.typeCell} ${type.className}`}>
            {type.icon}
            {type.label}
          </span>
        );
      },
      cellClassName: styles.colType,
    },
    { 
      header: 'کالا', 
      render: (row) => (
        <div className={styles.productCell}>
          <Package size={14} className={styles.productIcon} />
          <span>{row.product_title || row.product || '—'}</span>
        </div>
      ),
      cellClassName: styles.colProduct,
    },
    { 
      header: 'انبار', 
      render: (row) => (
        <div className={styles.warehouseCell}>
          <Building2 size={14} className={styles.warehouseIcon} />
          <span>{row.warehouse_title || row.warehouse || '—'}</span>
        </div>
      ),
      cellClassName: styles.colWarehouse,
    },
    { 
      header: 'تعداد', 
      render: (row) => (
        <span className={styles.quantityCell}>
          <span className={styles.quantityValue}>{row.quantity || 0}</span>
          <span className={styles.unitLabel}>{row.unit_title || ''}</span>
        </span>
      ),
      cellClassName: styles.colQuantity,
    },
    { 
      header: 'وضعیت', 
      render: (row) => {
        const status = getStatusLabel(row.status);
        return (
          <span className={`${styles.statusBadge} ${status.className}`}>
            {status.icon}
            {status.label}
          </span>
        );
      },
      cellClassName: styles.colStatus,
    },
    { 
      header: 'تاریخ', 
      render: (row) => (
        <span className={styles.dateCell}>
          <Clock size={12} className={styles.dateIcon} />
          {formatDate(row.created_at)}
        </span>
      ),
      cellClassName: styles.colDate,
    },
  ], [getTypeLabel, getStatusLabel, formatDate]);

  const actions = useMemo(() => [
    {
      label: 'مشاهده',
      icon: <Eye size={16} />,
      onClick: handleViewDetail,
    },
    {
      label: 'چاپ رسید',
      icon: <Printer size={16} />,
      onClick: handlePrintReceipt,
    },
  ], [handleViewDetail, handlePrintReceipt]);

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
            <Link href="/inventory/warehouses" className={styles.actionCard}>
              <Building2 size={20} style={{ color: '#1976d2' }} />
              <span>{t.manageWarehouses}</span>
            </Link>
            <Link href="/inventory/products" className={styles.actionCard}>
              <Package size={20} style={{ color: '#388e3c' }} />
              <span>{t.manageProducts}</span>
            </Link>
            <Link href="/inventory/transactions" className={`${styles.actionCard} ${styles.actionCardActive}`}>
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
              <FileText className={styles.titleIcon} size={28} />
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
              className={styles.successBtn} 
              onClick={() => setShowStockIn(true)}
              disabled={isLoading_state}
            >
              <ArrowUp size={18} />
              {t.stockIn}
            </button>
            <button 
              className={styles.dangerBtn} 
              onClick={() => setShowStockOut(true)}
              disabled={isLoading_state}
            >
              <ArrowDown size={18} />
              {t.stockOut}
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

        {/* ===== Stats Grid ===== */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e3f2fd' }}>
              <FileText className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>{t.totalTransactions}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <Clock className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.today}</span>
              <span className={styles.statLabel}>{t.today}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <Clock className={styles.statIcon} style={{ color: '#f57c00' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.pending}</span>
              <span className={styles.statLabel}>{t.pending}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <CheckCircle className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.confirmed}</span>
              <span className={styles.statLabel}>{t.confirmed}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <AlertCircle className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.cancelled}</span>
              <span className={styles.statLabel}>{t.cancelled}</span>
            </div>
          </div>
        </div>

        {/* ===== Search & Filter ===== */}
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
          <div className={styles.filterActions}>
            <button 
              className={`${styles.filterToggle} ${showFilterPanel ? styles.filterActive : ''}`}
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter size={18} />
              <span>فیلترها</span>
              {(filterType || filterStatus || filterWarehouse || filterProduct) && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {(filterType || filterStatus || filterWarehouse || filterProduct) && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={clearFilters}
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${totalItems} تراکنش`}
          </span>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilterPanel && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>نوع تراکنش</label>
              <select
                className={styles.filterSelect}
                value={filterType}
                onChange={(e) => handleFilterType(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه</option>
                <option value="IN">ورود</option>
                <option value="OUT">خروج</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>وضعیت</label>
              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => handleFilterStatus(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه</option>
                <option value="CONFIRMED">تایید شده</option>
                <option value="PENDING">در انتظار</option>
                <option value="CANCELLED">لغو شده</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>انبار</label>
              <select
                className={styles.filterSelect}
                value={filterWarehouse}
                onChange={(e) => handleFilterWarehouse(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه انبارها</option>
                {state.warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>کالا</label>
              <select
                className={styles.filterSelect}
                value={filterProduct}
                onChange={(e) => handleFilterProduct(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه کالاها</option>
                {state.products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <button 
              className={styles.filterApplyBtn}
              onClick={() => setShowFilterPanel(false)}
            >
              اعمال فیلترها
            </button>
          </div>
        )}

        {/* ===== Search Hint ===== */}
        {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className={styles.searchHint}>
            <span>🔍 برای جستجو حداقل ۳ حرف وارد کنید</span>
          </div>
        )}

        {/* ===== Table ===== */}
        <DataTable
          columns={columns}
          data={state.transactions || []}
          loading={isLoading_state}
          actions={actions}
          pagination={{
            page,
            total: totalItems,
            pageSize: 20,
          }}
          onPageChange={handlePageChange}
          emptyMessage={
            searchTerm && searchTerm.length >= 3 
              ? 'نتیجه‌ای یافت نشد' 
              : 'هیچ تراکنشی یافت نشد'
          }
          onRowClick={handleViewDetail}
        />

        {/* ===== Stock In Modal ===== */}
        <Modal
          isOpen={showStockIn}
          onClose={() => setShowStockIn(false)}
          title={t.stockIn}
          size="lg"
        >
          <StockInForm
            onSubmit={handleStockInSubmit}
            onCancel={() => setShowStockIn(false)}
            loading={isLoading_state}
            products={state.products}
            warehouses={state.warehouses}
            units={state.units}
          />
        </Modal>

        {/* ===== Stock Out Modal ===== */}
        <Modal
          isOpen={showStockOut}
          onClose={() => setShowStockOut(false)}
          title={t.stockOut}
          size="lg"
        >
          <StockOutForm
            onSubmit={handleStockOutSubmit}
            onCancel={() => setShowStockOut(false)}
            loading={isLoading_state}
            products={state.products}
            warehouses={state.warehouses}
            units={state.units}
            persons={state.authorizedPersons}
          />
        </Modal>

        {/* ===== Transaction Detail Modal ===== */}
        <Modal
          isOpen={showTransactionDetail}
          onClose={() => {
            setShowTransactionDetail(false);
            setSelectedTransaction(null);
          }}
          title={t.viewDetail}
          size="lg"
        >
          {selectedTransaction && (
            <div className={styles.transactionDetail}>
              <div className={styles.detailHeader}>
                <span className={styles.detailRef}>
                  <FileCheck size={16} />
                  {selectedTransaction.reference_number}
                </span>
                <span className={`${styles.detailStatus} ${getStatusLabel(selectedTransaction.status).className}`}>
                  {getStatusLabel(selectedTransaction.status).icon}
                  {getStatusLabel(selectedTransaction.status).label}
                </span>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>نوع:</span>
                  <span className={styles.detailValue}>
                    {selectedTransaction.transaction_type === 'IN' ? 'ورود' : 'خروج'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>کالا:</span>
                  <span className={styles.detailValue}>
                    <Package size={14} />
                    {selectedTransaction.product_title || selectedTransaction.product}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>انبار:</span>
                  <span className={styles.detailValue}>
                    <Building2 size={14} />
                    {selectedTransaction.warehouse_title || selectedTransaction.warehouse}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>تعداد:</span>
                  <span className={styles.detailValue}>
                    <span className={styles.detailQuantity}>
                      {selectedTransaction.quantity} {selectedTransaction.unit_title || ''}
                    </span>
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>تعداد کل (واحد پایه):</span>
                  <span className={styles.detailValue}>
                    {selectedTransaction.total_units || 0}
                  </span>
                </div>
                {selectedTransaction.authorized_by_name && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>فرد مجاز:</span>
                    <span className={styles.detailValue}>
                      <User size={14} />
                      {selectedTransaction.authorized_by_name}
                    </span>
                  </div>
                )}
                {selectedTransaction.confirmed_by_name && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>تایید کننده:</span>
                    <span className={styles.detailValue}>
                      <User size={14} />
                      {selectedTransaction.confirmed_by_name}
                    </span>
                  </div>
                )}
                {selectedTransaction.description && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>توضیحات:</span>
                    <span className={styles.detailValue}>{selectedTransaction.description}</span>
                  </div>
                )}
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>تاریخ ثبت:</span>
                  <span className={styles.detailValue}>
                    <Clock size={14} />
                    {formatDate(selectedTransaction.created_at)}
                  </span>
                </div>
                {selectedTransaction.transaction_date && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>تاریخ تراکنش:</span>
                    <span className={styles.detailValue}>
                      <Calendar size={14} />
                      {formatDate(selectedTransaction.transaction_date)}
                    </span>
                  </div>
                )}
                {selectedTransaction.confirmed_at && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>تاریخ تایید:</span>
                    <span className={styles.detailValue}>
                      <Calendar size={14} />
                      {formatDate(selectedTransaction.confirmed_at)}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.detailActions}>
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => handlePrintReceipt(selectedTransaction)}
                >
                  <Printer size={18} />
                  {t.printReceipt}
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TransactionList;