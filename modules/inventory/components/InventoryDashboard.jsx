// modules/inventory/components/InventoryDashboard.jsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useInventory } from '../components/context/InventoryContext';
import styles from '@/styles/modules/Inventory.module.css';
import {
  Warehouse,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  AlertCircle,
  Building2,
  Users,
  Box,
  ShoppingBag,
  Printer,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import Modal from './common/Modal';
import ConfirmDialog from './common/ConfirmDialog';
import StockInForm from './Transactions/StockInForm';
import StockOutForm from './Transactions/StockOutForm';

const InventoryDashboard = () => {
  const { language } = useLanguage();
  const { getAuthHeaders } = useAuth();
  const {
    state,
    loadWarehouses,
    loadProducts,
    loadTransactions,
    loadAlerts,
    loadUnits,
    loadCategories,
    loadPersons,
    addStock,
    removeStock,
    resolveAlert,
    loadPackagingLevels,
  } = useInventory();

  // ============================================
  // State Management
  // ============================================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showStockIn, setShowStockIn] = useState(false);
  const [showStockOut, setShowStockOut] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  
  // ✅ آمارها را در state جداگانه نگهداری کنید
  const [stats, setStats] = useState({
    totalWarehouses: 0,
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalTransactions: 0,
    todayTransactions: 0,
    pendingTransactions: 0,
  });

  // ============================================
  // Translations
  // ============================================
  const t = {
    title: language === 'fa' ? 'مدیریت انبار' : 'Inventory Management',
    subtitle: language === 'fa' ? 'نمای کلی وضعیت انبارها و موجودی کالا' : 'Overview of warehouses and stock status',
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
  // Data Fetching - اصلاح شده
  // ============================================
  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      // ✅ دریافت همه داده‌ها به صورت موازی
      const [
        warehousesData,
        productsData,
        transactionsData,
        alertsData,
        unitsData,
        categoriesData,
        personsData,
        packagingLevelsData,
      ] = await Promise.all([
        loadWarehouses({ limit: 100 }),
        loadProducts({ limit: 100 }),
        loadTransactions({ limit: 50 }),
        loadAlerts({ limit: 50 }),
        loadUnits(),
        loadCategories(),
        loadPersons({ limit: 50 }),
        loadPackagingLevels(),
      ]);

      // ✅ استفاده از داده‌های دریافتی برای محاسبه آمار
      const warehouses = warehousesData || [];
      const products = productsData || [];
      const transactions = transactionsData || [];
      const alerts = alertsData || [];

      // محاسبه کل موجودی از انبارها
      const totalStock = warehouses.reduce((sum, w) => sum + (w.total_items || 0), 0);

      // موجودی کم و تمام شده از هشدارها
      const lowStockCount = alerts.filter(
        a => a.alert_type === 'LOW_STOCK' && !a.is_resolved
      ).length;
      const outOfStockCount = alerts.filter(
        a => a.alert_type === 'NO_STOCK' && !a.is_resolved
      ).length;

      // تراکنش‌های امروز
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTransactions = transactions.filter(t => {
        const date = new Date(t.created_at);
        return date >= today;
      });

      // تراکنش‌های در انتظار
      const pendingTransactions = transactions.filter(t => t.status === 'PENDING');

      // ✅ به‌روزرسانی آمار
      setStats({
        totalWarehouses: warehouses.length,
        totalProducts: products.length,
        totalStock: totalStock,
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalTransactions: transactions.length,
        todayTransactions: todayTransactions.length,
        pendingTransactions: pendingTransactions.length,
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    loadWarehouses,
    loadProducts,
    loadTransactions,
    loadAlerts,
    loadUnits,
    loadCategories,
    loadPersons,
    loadPackagingLevels,
  ]);

  // ✅ بارگذاری اولیه
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ============================================
  // Handlers
  // ============================================
  const handleRefresh = () => fetchDashboardData(false);

  const handleStockIn = async (data) => {
    try {
      await addStock(data);
      setShowStockIn(false);
      fetchDashboardData(false);
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  };

  const handleStockOut = async (data) => {
    try {
      await removeStock(data);
      setShowStockOut(false);
      fetchDashboardData(false);
    } catch (error) {
      console.error('Error removing stock:', error);
    }
  };

  const handleResolveAlert = async () => {
    if (resolvingAlert) {
      try {
        await resolveAlert(resolvingAlert.id);
        setResolvingAlert(null);
        fetchDashboardData(false);
      } catch (error) {
        console.error('Error resolving alert:', error);
      }
    }
  };

  // ============================================
  // Helper Functions
  // ============================================
  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '-';
      if (language === 'fa') {
        return d.toLocaleDateString('fa-IR') + ' ' + 
               d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString('en-US') + ' ' + 
             d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  };

  const getStatusClass = (status) => {
    const map = {
      CONFIRMED: styles.statusConfirmed,
      PENDING: styles.statusPending,
      CANCELLED: styles.statusCancelled,
    };
    return map[status] || '';
  };

  const getStatusLabel = (status) => {
    const map = {
      CONFIRMED: t.status.confirmed,
      PENDING: t.status.pending,
      CANCELLED: t.status.cancelled,
    };
    return map[status] || status;
  };

  const getAlertLevelClass = (level) => {
    const map = {
      CRITICAL: styles.levelCritical,
      WARNING: styles.levelWarning,
      INFO: styles.levelInfo,
    };
    return map[level] || '';
  };

  const getAlertLevelLabel = (level) => {
    const map = {
      CRITICAL: t.alertLevels.critical,
      WARNING: t.alertLevels.warning,
      INFO: t.alertLevels.info,
    };
    return map[level] || level;
  };

  const getAlertTypeLabel = (type) => {
    const map = {
      LOW_STOCK: 'موجودی کم',
      NO_STOCK: 'تمام شده',
      OVER_STOCK: 'موجودی بیش از حد',
    };
    return map[type] || type;
  };

  const getTopProducts = () => {
    return [...state.products]
      .sort((a, b) => (b.total_stock || 0) - (a.total_stock || 0))
      .slice(0, 5);
  };

  // ============================================
  // Render States
  // ============================================
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} style={{ color: '#c62828' }} />
        <h3>{t.errorLoading}</h3>
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={handleRefresh}>
          {t.retry}
        </button>
      </div>
    );
  }

  const topProducts = getTopProducts();

  // ============================================
  // Main Render
  // ============================================
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        {/* ===== Header ===== */}
        <div className={styles.inventoryHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              <Warehouse className={styles.titleIcon} size={28} />
              {t.title}
            </h1>
            <p className={styles.pageDesc}>{t.subtitle}</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.refreshBtn}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
              <span>{t.refresh}</span>
            </button>
            <button 
              className={styles.successBtn} 
              onClick={() => setShowStockIn(true)}
            >
              <ArrowUp size={18} />
              {t.stockIn}
            </button>
            <button 
              className={styles.dangerBtn} 
              onClick={() => setShowStockOut(true)}
            >
              <ArrowDown size={18} />
              {t.stockOut}
            </button>
           
          </div>
        </div>


        {/* ===== Quick Actions ===== */}
        <div className={styles.quickActions}>
         
          <div className={styles.actionsGrid}>
            <Link href="/inventory/warehouses" className={styles.actionCard}>
              <Building2 size={24} style={{ color: '#1976d2' }} />
              <span>{t.manageWarehouses}</span>
            </Link>
            <Link href="/inventory/products" className={styles.actionCard}>
              <Package size={24} style={{ color: '#388e3c' }} />
              <span>{t.manageProducts}</span>
            </Link>
            <Link href="/inventory/transactions" className={styles.actionCard}>
              <FileText size={24} style={{ color: '#f57c00' }} />
              <span>{t.transactionHistory}</span>
            </Link>
            <Link href="/inventory/authorized-persons" className={styles.actionCard}>
              <Users size={24} style={{ color: '#6c5ce7' }} />
              <span>{t.managePersons}</span>
            </Link>
            <Link href="/inventory/alerts" className={styles.actionCard}>
              <AlertTriangle size={24} style={{ color: '#c62828' }} />
              <span>{t.manageAlerts}</span>
            </Link>
            <Link href="/inventory/units" className={styles.actionCard}>
              <Box size={24} style={{ color: '#e65100' }} />
              <span>{t.units}</span>
            </Link>
          </div>
        </div>

        {/* ===== Stats Grid ===== */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e3f2fd' }}>
              <Building2 className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalWarehouses}</span>
              <span className={styles.statLabel}>{t.totalWarehouses}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <Package className={styles.statIcon} style={{ color: '#388e3c' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalProducts}</span>
              <span className={styles.statLabel}>{t.totalProducts}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <ShoppingBag className={styles.statIcon} style={{ color: '#f57c00' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalStock.toLocaleString()}</span>
              <span className={styles.statLabel}>{t.totalStock}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <AlertTriangle className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.lowStock + stats.outOfStock}</span>
              <span className={styles.statLabel}>{t.lowStock}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <Clock className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.todayTransactions}</span>
              <span className={styles.statLabel}>{t.todayTransactions}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}>
              <Clock className={styles.statIcon} style={{ color: '#e65100' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.pendingTransactions}</span>
              <span className={styles.statLabel}>{t.pendingTransactions}</span>
            </div>
          </div>
        </div>

        {/* ===== Content Grid ===== */}
        <div className={styles.contentGrid}>
          {/* Recent Transactions */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>
                <Clock size={18} />
                {t.recentTransactions}
              </h3>
              <Link href="/inventory/transactions" className={styles.viewAll}>
                {t.viewAll}
              </Link>
            </div>
            <div className={styles.transactionList}>
              {state.transactions.length === 0 ? (
                <div className={styles.emptyState}>
                  <FileText size={32} />
                  <p>{t.noTransactions}</p>
                </div>
              ) : (
                state.transactions.slice(0, 10).map((tx) => (
                  <div 
                    key={tx.id} 
                    className={styles.transactionItem}
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setShowTransactionDetail(true);
                    }}
                  >
                    <div className={styles.txIcon}>
                      {tx.transaction_type === 'IN' ? (
                        <ArrowUp size={16} style={{ color: '#388e3c' }} />
                      ) : (
                        <ArrowDown size={16} style={{ color: '#c62828' }} />
                      )}
                    </div>
                    <div className={styles.txInfo}>
                      <span className={styles.txProduct}>
                        {tx.product_title || tx.product || 'نامشخص'}
                      </span>
                      <span className={styles.txMeta}>
                        {tx.reference_number}
                      </span>
                      <span className={styles.txMeta}>
                        {tx.quantity || 0} {tx.unit_title || tx.unit || ''}
                        {tx.warehouse_title && ` - ${tx.warehouse_title}`}
                      </span>
                    </div>
                    <div className={styles.txStatus}>
                      <span className={`${styles.statusBadge} ${getStatusClass(tx.status)}`}>
                        {getStatusLabel(tx.status)}
                      </span>
                      <span className={styles.txDate}>{formatDate(tx.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Alerts */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>
                <AlertTriangle size={18} />
                {t.alerts}
              </h3>
              <Link href="/inventory/alerts" className={styles.viewAll}>
                {t.viewAll}
              </Link>
            </div>
            <div className={styles.alertsList}>
              {state.alerts.filter(a => !a.is_resolved).length === 0 ? (
                <div className={styles.noAlerts}>
                  <CheckCircle size={48} style={{ color: '#388e3c' }} />
                  <p>{t.noAlerts}</p>
                </div>
              ) : (
                state.alerts
                  .filter(a => !a.is_resolved)
                  .slice(0, 10)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`${styles.alertItem} ${getAlertLevelClass(alert.level)}`}
                    >
                      <div className={styles.alertIcon}>
                        <AlertTriangle size={20} />
                      </div>
                      <div className={styles.alertInfo}>
                        <div className={styles.alertHeader}>
                          <span className={styles.alertProduct}>
                            {alert.product_title || alert.product || 'نامشخص'}
                          </span>
                          <span className={styles.alertType}>
                            {getAlertTypeLabel(alert.alert_type)}
                          </span>
                          <span className={styles.alertLevel}>
                            {getAlertLevelLabel(alert.level)}
                          </span>
                        </div>
                        <span className={styles.alertMessage}>{alert.message}</span>
                        <div className={styles.alertMeta}>
                          <span className={styles.alertQuantity}>
                            موجودی: {alert.current_quantity || 0}
                          </span>
                          <span className={styles.alertTime}>
                            {formatDate(alert.created_at)}
                          </span>
                          <button
                            className={styles.resolveBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              setResolvingAlert(alert);
                            }}
                          >
                            <CheckCircle size={14} />
                            {t.resolve}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* ===== Top Products ===== */}
        {topProducts.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>
                <TrendingUp size={18} />
                {t.topProducts}
              </h3>
            </div>
            <div className={styles.topProductsList}>
              {topProducts.map((product, index) => (
                <div key={product.id} className={styles.topProductItem}>
                  <span className={styles.topProductRank}>#{index + 1}</span>
                  <div className={styles.topProductInfo}>
                    <span className={styles.topProductName}>{product.title}</span>
                    <span className={styles.topProductCode}>{product.code}</span>
                  </div>
                  <span className={styles.topProductStock}>
                    {product.total_stock || 0} {product.base_unit_title || ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ===== Stock In Modal ===== */}
      <Modal
        isOpen={showStockIn}
        onClose={() => setShowStockIn(false)}
        title={t.stockIn}
        size="lg"
      >
        <StockInForm
          onSubmit={handleStockIn}
          onCancel={() => setShowStockIn(false)}
          loading={state.loading.transactions}
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
          onSubmit={handleStockOut}
          onCancel={() => setShowStockOut(false)}
          loading={state.loading.transactions}
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
        title={t.transactionDetail}
        size="lg"
      >
        {selectedTransaction && (
          <div className={styles.transactionDetail}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>شماره مرجع:</span>
              <span className={styles.detailValue}>{selectedTransaction.reference_number}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>نوع:</span>
              <span className={styles.detailValue}>
                {selectedTransaction.transaction_type === 'IN' ? t.type.in : t.type.out}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>کالا:</span>
              <span className={styles.detailValue}>
                {selectedTransaction.product_title || selectedTransaction.product}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>انبار:</span>
              <span className={styles.detailValue}>
                {selectedTransaction.warehouse_title || selectedTransaction.warehouse}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>تعداد:</span>
              <span className={styles.detailValue}>
                {selectedTransaction.quantity} {selectedTransaction.unit_title || ''}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>وضعیت:</span>
              <span className={`${styles.statusBadge} ${getStatusClass(selectedTransaction.status)}`}>
                {getStatusLabel(selectedTransaction.status)}
              </span>
            </div>
            {selectedTransaction.authorized_by_name && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>فرد مجاز:</span>
                <span className={styles.detailValue}>{selectedTransaction.authorized_by_name}</span>
              </div>
            )}
            {selectedTransaction.confirmed_by_name && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>تایید کننده:</span>
                <span className={styles.detailValue}>{selectedTransaction.confirmed_by_name}</span>
              </div>
            )}
            {selectedTransaction.description && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>توضیحات:</span>
                <span className={styles.detailValue}>{selectedTransaction.description}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>تاریخ:</span>
              <span className={styles.detailValue}>{formatDate(selectedTransaction.created_at)}</span>
            </div>
            {selectedTransaction.transaction_date && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>تاریخ تراکنش:</span>
                <span className={styles.detailValue}>{formatDate(selectedTransaction.transaction_date)}</span>
              </div>
            )}
            <div className={styles.detailActions}>
              <button 
                className={styles.secondaryBtn}
                onClick={() => {
                  console.log('Print receipt for:', selectedTransaction.reference_number);
                }}
              >
                <Printer size={18} />
                {t.printReceipt}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===== Resolve Alert Confirmation ===== */}
      <ConfirmDialog
        isOpen={!!resolvingAlert}
        onClose={() => setResolvingAlert(null)}
        onConfirm={handleResolveAlert}
        title={t.resolve + ' ' + t.alerts}
        message={`آیا از برطرف کردن هشدار "${resolvingAlert?.product_title || ''}" اطمینان دارید؟`}
        confirmText={t.resolve}
        confirmColor="success"
        loading={state.loading.alerts}
      />
    </div>
  );
};

export default InventoryDashboard;