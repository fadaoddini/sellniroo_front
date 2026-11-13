// modules/inventory/components/transactions/TransactionList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '@/modules/inventory/context/InventoryContext';

import Modal from '../common/Modal';
import TransactionDetail from './TransactionDetail';
import { 
  Home, Building2, Package, Box, ArrowDownToLine, ArrowUpFromLine, 
  Users, AlertTriangle, RefreshCw, List, Grid,
  CheckCircle, Circle, AlertCircle, Search, Filter, 
  Eye, X, Clock, Calendar, FileText, Hash,
  TrendingDown, TrendingUp, Layers, GitBranch,
  ChevronDown, ChevronRight
} from 'lucide-react';
import styles from './transaction.module.css';

const TransactionList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadTransactions,
    loadProducts,
    loadWarehouses,
    loadUnits,
    loadUnitTree,
    confirmTransaction,
    cancelTransaction,
    loadDashboardStats,
  } = useInventory();

  // ============================================
  // State Management
  // ============================================
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [transactionData, setTransactionData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    in: 0,
    out: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });

  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(() => ({
    title: language === 'fa' ? 'تراکنش‌های انبار' : 'Transactions',
    subtitle: language === 'fa' ? 'مدیریت تراکنش‌های ورود و خروج کالا' : 'Manage stock in/out transactions',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    manageUnits: language === 'fa' ? 'مدیریت واحدها' : 'Manage Units',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    transactions: language === 'fa' ? 'تراکنش‌ها' : 'Transactions',
    
    totalTransactions: language === 'fa' ? 'کل تراکنش‌ها' : 'Total Transactions',
    inTransactions: language === 'fa' ? 'ورودی‌ها' : 'In',
    outTransactions: language === 'fa' ? 'خروجی‌ها' : 'Out',
    pending: language === 'fa' ? 'در انتظار' : 'Pending',
    confirmed: language === 'fa' ? 'تایید شده' : 'Confirmed',
    cancelled: language === 'fa' ? 'لغو شده' : 'Cancelled',
    
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    confirm: language === 'fa' ? 'تایید' : 'Confirm',
    cancel: language === 'fa' ? 'لغو' : 'Cancel',
    
    reference: language === 'fa' ? 'شماره مرجع' : 'Reference',
    product: language === 'fa' ? 'کالا' : 'Product',
    warehouse: language === 'fa' ? 'انبار' : 'Warehouse',
    type: language === 'fa' ? 'نوع' : 'Type',
    status: language === 'fa' ? 'وضعیت' : 'Status',
    quantity: language === 'fa' ? 'تعداد' : 'Quantity',
    unit: language === 'fa' ? 'واحد' : 'Unit',
    totalUnits: language === 'fa' ? 'تعداد کل (واحد اصلی)' : 'Total Units',
    date: language === 'fa' ? 'تاریخ' : 'Date',
    createdBy: language === 'fa' ? 'ایجاد کننده' : 'Created By',
    
    noTransactions: language === 'fa' ? 'هیچ تراکنشی یافت نشد' : 'No transactions found',
    listView: language === 'fa' ? 'نمایش لیستی' : 'List View',
    gridView: language === 'fa' ? 'نمایش شبکه‌ای' : 'Grid View',
    allTypes: language === 'fa' ? 'همه انواع' : 'All Types',
    allStatus: language === 'fa' ? 'همه وضعیت‌ها' : 'All Status',
    allWarehouses: language === 'fa' ? 'همه انبارها' : 'All Warehouses',
    allProducts: language === 'fa' ? 'همه کالاها' : 'All Products',
    searchPlaceholder: language === 'fa' ? 'جستجوی تراکنش‌ها (شماره مرجع یا کالا)...' : 'Search transactions (reference or product)...',
    close: language === 'fa' ? 'بستن' : 'Close',
    dateFrom: language === 'fa' ? 'از تاریخ' : 'From Date',
    dateTo: language === 'fa' ? 'تا تاریخ' : 'To Date',
    breakdownTitle: language === 'fa' ? 'تفکیک به واحدهای مختلف' : 'Breakdown to different units',
    rootUnit: language === 'fa' ? 'واحد ریشه' : 'Root Unit',
    subUnits: language === 'fa' ? 'زیرمجموعه‌ها' : 'Sub-units',
    totalInRoot: language === 'fa' ? 'تعداد در واحد ریشه' : 'Total in root unit',
    level: language === 'fa' ? 'سطح' : 'Level',
  }), [language]);

  // ============================================
  // Fetch Transactions
  // ============================================
  const fetchTransactions = useCallback(async (forceRefresh = false) => {
    if (fetchInProgress.current && !forceRefresh) return;
    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const trimmedSearch = searchTerm?.trim() || '';
      const params = {};
      
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
      if (dateFrom) {
        params.start_date = dateFrom;
      }
      if (dateTo) {
        params.end_date = dateTo;
      }
      
      const transactionsData = await loadTransactions(params);
      
      let transactions = [];
      if (Array.isArray(transactionsData)) transactions = transactionsData;
      else if (transactionsData?.results) transactions = transactionsData.results;
      else if (transactionsData?.data) transactions = transactionsData.data;
      
      setTransactionData(transactions);
      
      // محاسبه آمار
      const inCount = transactions.filter(t => t.transaction_type === 'IN').length;
      const outCount = transactions.filter(t => t.transaction_type === 'OUT').length;
      const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
      const confirmedCount = transactions.filter(t => t.status === 'CONFIRMED').length;
      const cancelledCount = transactions.filter(t => t.status === 'CANCELLED').length;
      
      setStats({
        total: transactions.length,
        in: inCount,
        out: outCount,
        pending: pendingCount,
        confirmed: confirmedCount,
        cancelled: cancelledCount,
      });
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError(err.message || 'خطا در بارگذاری تراکنش‌ها');
      setTransactionData([]);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [searchTerm, filterType, filterStatus, filterWarehouse, filterProduct, dateFrom, dateTo, loadTransactions]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      Promise.all([
        loadProducts(),
        loadWarehouses(),
        loadUnits(),
        loadUnitTree(),
        loadDashboardStats(),
      ]).then(() => fetchTransactions(true));
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        const trimmed = searchTerm?.trim() || '';
        if (trimmed.length === 0 || trimmed.length >= 3) {
          fetchTransactions(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterType, filterStatus, filterWarehouse, filterProduct, dateFrom, dateTo]);

  // ============================================
  // Handlers
  // ============================================
  
  const handleViewDetail = useCallback((row) => {
    setSelectedTransaction(row);
    setShowDetail(true);
  }, []);

  const handleRefresh = useCallback(() => fetchTransactions(true), [fetchTransactions]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const handleConfirm = useCallback(async (id) => {
    if (!window.confirm('آیا از تایید این تراکنش اطمینان دارید؟')) return;
    try {
      await confirmTransaction(id);
      await fetchTransactions(true);
      await loadDashboardStats();
    } catch (err) {
      setError(err.message || 'خطا در تایید تراکنش');
    }
  }, [confirmTransaction, fetchTransactions, loadDashboardStats]);

  const handleCancel = useCallback(async (id) => {
    if (!window.confirm('آیا از لغو این تراکنش اطمینان دارید؟')) return;
    try {
      await cancelTransaction(id);
      await fetchTransactions(true);
      await loadDashboardStats();
    } catch (err) {
      setError(err.message || 'خطا در لغو تراکنش');
    }
  }, [cancelTransaction, fetchTransactions, loadDashboardStats]);

  const isLoading_state = state.loading.transactions || isLoading;

  // ============================================
  // Render Helpers
  // ============================================
  
  const getTypeBadge = useCallback((type) => {
    if (type === 'IN') {
      return <span className={`${styles.typeBadge} ${styles.typeIn}`}><TrendingDown size={12} /> ورود</span>;
    }
    return <span className={`${styles.typeBadge} ${styles.typeOut}`}><TrendingUp size={12} /> خروج</span>;
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statuses = {
      'PENDING': { label: 'در انتظار', className: 'statusPending', icon: <Clock size={12} /> },
      'CONFIRMED': { label: 'تایید شده', className: 'statusConfirmed', icon: <CheckCircle size={12} /> },
      'CANCELLED': { label: 'لغو شده', className: 'statusCancelled', icon: <Circle size={12} /> },
    };
    const result = statuses[status] || { label: status, className: '', icon: null };
    return (
      <span className={`${styles.statusBadge} ${styles[result.className]}`}>
        {result.icon}
        {result.label}
      </span>
    );
  }, []);

  const getProductName = useCallback((productId) => {
    const product = state.products?.find(p => p.id === productId);
    return product?.title || product?.code || '-';
  }, [state.products]);

  const getWarehouseName = useCallback((warehouseId) => {
    const warehouse = state.warehouses?.find(w => w.id === warehouseId);
    return warehouse?.title || '-';
  }, [state.warehouses]);

  const getUnitName = useCallback((unitId) => {
    const unit = state.units?.find(u => u.id === unitId);
    return unit?.title || '-';
  }, [state.units]);

  const getUnitAbbreviation = useCallback((unitId) => {
    const unit = state.units?.find(u => u.id === unitId);
    return unit?.abbreviation || '';
  }, [state.units]);

  const formatDate = useCallback((date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('fa-IR');
  }, []);

  // ============================================
  // Render
  // ============================================
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        
        {/* Navigation */}
        {/* Header */}
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
              className={styles.secondaryBtn}
              onClick={toggleViewMode}
              disabled={isLoading_state}
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              <span>{viewMode === 'grid' ? t.listView : t.gridView}</span>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {/* Stats */}
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
              <TrendingDown className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.in}</span>
              <span className={styles.statLabel}>{t.inTransactions}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <TrendingUp className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.out}</span>
              <span className={styles.statLabel}>{t.outTransactions}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <Clock className={styles.statIcon} style={{ color: '#e65100' }} />
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
              <Circle className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.cancelled}</span>
              <span className={styles.statLabel}>{t.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              disabled={isLoading_state}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={() => setSearchTerm('')}
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
              {(filterType || filterStatus || filterWarehouse || filterProduct || dateFrom || dateTo) && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {(filterType || filterStatus || filterWarehouse || filterProduct || dateFrom || dateTo) && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={() => { 
                  setFilterType(''); 
                  setFilterStatus('');
                  setFilterWarehouse('');
                  setFilterProduct('');
                  setDateFrom('');
                  setDateTo('');
                  setSearchTerm('');
                }}
              >
                پاک کردن
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${stats.total} تراکنش`}
          </span>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>نوع تراکنش</label>
              <select
                className={styles.filterSelect}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allTypes}</option>
                <option value="IN">{t.stockIn}</option>
                <option value="OUT">{t.stockOut}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>وضعیت</label>
              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allStatus}</option>
                <option value="PENDING">{t.pending}</option>
                <option value="CONFIRMED">{t.confirmed}</option>
                <option value="CANCELLED">{t.cancelled}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>انبار</label>
              <select
                className={styles.filterSelect}
                value={filterWarehouse}
                onChange={(e) => setFilterWarehouse(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allWarehouses}</option>
                {state.warehouses?.map(w => (
                  <option key={w.id} value={w.id}>{w.title}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>از تاریخ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={styles.filterDateInput}
                disabled={isLoading_state}
              />
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>تا تاریخ</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={styles.filterDateInput}
                disabled={isLoading_state}
              />
            </div>
            <button 
              className={styles.filterApplyBtn}
              onClick={() => setShowFilterPanel(false)}
            >
              اعمال
            </button>
          </div>
        )}

        {/* Search Hint */}
        {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className={styles.searchHint}>
            <span>🔍 برای جستجو حداقل ۳ حرف وارد کنید</span>
          </div>
        )}

        {/* Transaction Grid/List */}
        {isLoading_state ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : transactionData.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} className={styles.emptyIcon} />
            <p>{t.noTransactions}</p>
            <button className={styles.secondaryBtn} onClick={handleRefresh}>
              <RefreshCw size={16} />
              {t.refresh}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.transactionsGrid}>
            {transactionData.map(transaction => (
              <div 
                key={transaction.id} 
                className={`${styles.transactionCard} ${transaction.status === 'CANCELLED' ? styles.cancelledCard : ''}`}
                onClick={() => handleViewDetail(transaction)}
              >
                <div className={styles.transactionCardHeader}>
                  <div className={styles.transactionCardType}>
                    {getTypeBadge(transaction.transaction_type)}
                    {getStatusBadge(transaction.status)}
                  </div>
                  <span className={styles.transactionRef}>
                    <Hash size={12} />
                    {transaction.reference_number}
                  </span>
                </div>
                
                <div className={styles.transactionCardBody}>
                  <div className={styles.transactionProduct}>
                    <Package size={16} />
                    <span>{getProductName(transaction.product)}</span>
                  </div>
                  <div className={styles.transactionWarehouse}>
                    <Building2 size={16} />
                    <span>{getWarehouseName(transaction.warehouse)}</span>
                  </div>
                  
                  <div className={styles.transactionQuantities}>
                    <div className={styles.transactionQuantity}>
                      <span className={styles.qtyLabel}>تعداد:</span>
                      <span className={styles.qtyValue}>{transaction.quantity}</span>
                      <span className={styles.qtyUnit}>{getUnitAbbreviation(transaction.unit) || getUnitName(transaction.unit)}</span>
                    </div>
                    <div className={styles.transactionTotalUnits}>
                      <span className={styles.qtyLabel}>از ریشه:</span>
                      <span className={styles.qtyValue}>
                        {transaction.root_quantity ?? transaction.total_units ?? 0}
                      </span>
                      <span className={styles.qtyUnit}>
                        {getUnitAbbreviation(transaction.product?.root_unit) || ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className={styles.transactionMeta}>
                    <span className={styles.transactionDate}>
                      <Calendar size={12} />
                      {formatDate(transaction.created_at)}
                    </span>
                    <span className={styles.transactionUser}>
                      <Users size={12} />
                      {transaction.created_by_name || '-'}
                    </span>
                  </div>
                </div>
                
                <div className={styles.transactionCardActions}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(transaction); }}
                    className={styles.actionBtn}
                    title={t.viewDetail}
                  >
                    <Eye size={16} />
                  </button>
                  {transaction.status === 'PENDING' ? (
                    <>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleConfirm(transaction.id);
                        }}
                        className={`${styles.actionBtn} ${styles.confirmBtn}`}
                        title={t.confirm}
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleCancel(transaction.id);
                        }}
                        className={`${styles.actionBtn} ${styles.cancelBtn}`}
                        title={t.cancel}
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : null}
                  {transaction.status === 'CONFIRMED' ? (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleCancel(transaction.id);
                      }}
                      className={`${styles.actionBtn} ${styles.cancelBtn}`}
                      title="برگشت موجودی و لغو"
                    >
                      <X size={16} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.transactionsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colRef}>شماره مرجع</th>
                  <th className={styles.colProduct}>کالا</th>
                  <th className={styles.colWarehouse}>انبار</th>
                  <th className={styles.colType}>نوع</th>
                  <th className={styles.colQuantity}>تعداد</th>
                  <th className={styles.colTotalUnits}>کل (واحد اصلی)</th>
                  <th className={styles.colStatus}>وضعیت</th>
                  <th className={styles.colDate}>تاریخ</th>
                  <th className={styles.actionsHeader}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {transactionData.map(transaction => (
                  <tr 
                    key={transaction.id}
                    onClick={() => handleViewDetail(transaction)}
                    className={`${styles.clickable} ${transaction.status === 'CANCELLED' ? styles.cancelledRow : ''}`}
                  >
                    <td className={styles.colRef}>
                      <span className={styles.refBadge}>{transaction.reference_number}</span>
                    </td>
                    <td className={styles.colProduct}>
                      <span className={styles.productName}>{getProductName(transaction.product)}</span>
                    </td>
                    <td className={styles.colWarehouse}>
                      <span className={styles.warehouseName}>{getWarehouseName(transaction.warehouse)}</span>
                    </td>
                    <td className={styles.colType}>
                      {getTypeBadge(transaction.transaction_type)}
                    </td>
                    <td className={styles.colQuantity}>
                      <span className={styles.quantityBadge}>
                        {transaction.quantity}
                        <span className={styles.quantityUnit}>{getUnitAbbreviation(transaction.unit) || getUnitName(transaction.unit)}</span>
                      </span>
                    </td>
                    <td className={styles.colTotalUnits}>
                      <span className={styles.totalUnitsBadge}>
                        {transaction.root_quantity ?? transaction.total_units ?? 0}
                        <span className={styles.totalUnitsUnit}>
                          {getUnitAbbreviation(transaction.product?.root_unit) || ''}
                        </span>
                      </span>
                    </td>
                    <td className={styles.colStatus}>
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className={styles.colDate}>
                      <span className={styles.dateText}>{formatDate(transaction.created_at)}</span>
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetail(transaction); }}
                        className={styles.actionBtn}
                        title={t.viewDetail}
                      >
                        <Eye size={16} />
                      </button>
                      {transaction.status === 'PENDING' ? (
                        <>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleConfirm(transaction.id);
                            }}
                            className={`${styles.actionBtn} ${styles.confirmBtn}`}
                            title={t.confirm}
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleCancel(transaction.id);
                            }}
                            className={`${styles.actionBtn} ${styles.cancelBtn}`}
                            title={t.cancel}
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : null}
                      {transaction.status === 'CONFIRMED' ? (
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleCancel(transaction.id);
                          }}
                          className={`${styles.actionBtn} ${styles.cancelBtn}`}
                          title="برگشت موجودی و لغو"
                        >
                          <X size={16} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================
            TRANSACTION DETAIL MODAL
        ============================================ */}
        <Modal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedTransaction(null);
          }}
          title="جزئیات تراکنش"
          size="xl"
        >
          {selectedTransaction && (
            <TransactionDetail 
              transaction={selectedTransaction}
              onConfirm={() => {
                handleConfirm(selectedTransaction.id);
                setShowDetail(false);
              }}
              onCancel={() => {
                handleCancel(selectedTransaction.id);
                setShowDetail(false);
              }}
              onClose={() => {
                setShowDetail(false);
                setSelectedTransaction(null);
              }}
              getTypeBadge={getTypeBadge}
              getStatusBadge={getStatusBadge}
              getProductName={getProductName}
              getWarehouseName={getWarehouseName}
              getUnitName={getUnitName}
              getUnitAbbreviation={getUnitAbbreviation}
              formatDate={formatDate}
              t={t}
              state={state}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TransactionList;