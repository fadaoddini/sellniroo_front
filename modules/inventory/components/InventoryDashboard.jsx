// modules/inventory/components/InventoryDashboard.jsx
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../context/InventoryContext';
import styles from '@/styles/modules/Inventory.module.css';
import {
  Warehouse,
  Package,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Building2,
  ShoppingBag,
  Loader2,
  Layers,
  Box,
  CircleHelp,
  X,
} from 'lucide-react';
import Link from 'next/link';
import Modal from './common/Modal';
import ConfirmDialog from './common/ConfirmDialog';
import StockInForm from './Transactions/StockInForm';
import StockOutForm from './Transactions/StockOutForm';
import {
  getFactorToRoot,
  quantityInUnit,
} from '../utils/unitStock';

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR');

function collectDescendants(units, rootId) {
  const children = (units || []).filter(
    (u) => u.parent === rootId && u.is_active !== false
  );
  return children.flatMap((child) => [child, ...collectDescendants(units, child.id)]);
}

function buildProductUnitStock(product, units) {
  const list = Array.isArray(units) ? units : [];
  const rootId = product.root_unit;
  const rootUnit =
    list.find((u) => u.id === rootId) || {
      id: rootId,
      title: product.root_unit_title || 'واحد اصلی',
      abbreviation: product.root_unit_abbreviation || '',
      level: 0,
      parent: null,
      count_in_parent: 1,
    };

  const allUnits = [rootUnit, ...collectDescendants(list, rootUnit.id)];
  const stockItems = Array.isArray(product.stock_items) ? product.stock_items : [];

  let rootStock = 0;
  let rootReserved = 0;
  const packagingBuffer = {};
  const warehouses = [];

  for (const item of stockItems) {
    rootStock += Math.floor(item.quantity || 0);
    rootReserved += Math.floor(item.reserved_quantity || 0);
    if (item.warehouse_title || item.warehouse) {
      warehouses.push({
        id: item.warehouse,
        title: item.warehouse_title || `انبار ${item.warehouse}`,
        quantity: Math.floor(item.quantity || 0),
      });
    }
    if (item.packaging_buffer && typeof item.packaging_buffer === 'object') {
      for (const [key, value] of Object.entries(item.packaging_buffer)) {
        packagingBuffer[String(key)] =
          (packagingBuffer[String(key)] || 0) + Number(value || 0);
      }
    }
  }

  if (stockItems.length === 0) {
    rootStock = Math.floor(product.total_stock || 0);
    rootReserved = Math.floor(product.total_reserved || 0);
  }

  const factorsById = {};
  allUnits.forEach((unit) => {
    factorsById[unit.id] = getFactorToRoot(unit, list, rootUnit.id);
  });

  const levels = allUnits
    .map((unit) => {
      const factor = factorsById[unit.id] || 1;
      const parentUnit = unit.parent
        ? list.find((u) => u.id === unit.parent)
        : null;
      const buffer = packagingBuffer[String(unit.id)] || 0;
      const fromRoot = rootStock * factor;
      const quantity = quantityInUnit({
        targetUnit: unit,
        rootId: rootUnit.id,
        rootStock,
        packagingBuffer,
        unitsList: allUnits,
        factorsById,
      });
      const fromOtherBuffers = quantity - fromRoot - buffer;
      const reserved = rootReserved * factor;
      const isRoot = unit.id === rootUnit.id;
      const countInParent = unit.count_in_parent || 1;

      let explain = '';
      if (isRoot) {
        explain =
          `این عدد مستقیم در انبار ثبت شده: ${faNum(rootStock)} ${unit.title}.` +
          (buffer > 0
            ? ` به‌علاوه ${faNum(buffer)} باقیمانده تبدیل‌نشده.`
            : '');
      } else {
        const parts = [
          `${faNum(rootStock)} ${rootUnit.title} × ${faNum(factor)} = ${faNum(fromRoot)} ${unit.title}`,
        ];
        if (buffer > 0) {
          parts.push(`+ ${faNum(buffer)} باقیمانده همین سطح`);
        }
        if (fromOtherBuffers > 0) {
          parts.push(`+ ${faNum(fromOtherBuffers)} از باقیمانده سطوح دیگر`);
        }
        if (buffer > 0 || fromOtherBuffers > 0) {
          parts.push(`= ${faNum(quantity)} ${unit.title}`);
        }
        explain = parts.join(' ');
      }

      const relation = isRoot
        ? 'مبنای ذخیره موجودی در انبار'
        : `هر ۱ ${parentUnit?.title || 'واحد بالاتر'} شامل ${faNum(countInParent)} ${unit.title} است`;

      return {
        unitId: unit.id,
        title: unit.title,
        abbreviation: unit.abbreviation || '',
        level: unit.level ?? 0,
        quantity,
        fromRoot,
        reserved,
        available: Math.max(0, quantity - reserved),
        buffer,
        isRoot,
        countInParent,
        factor,
        parentTitle: parentUnit?.title || null,
        parentAbbreviation: parentUnit?.abbreviation || '',
        rootTitle: rootUnit.title,
        explain,
        relation,
      };
    })
    .sort((a, b) => a.level - b.level);

  const maxLevel = levels.length
    ? Math.max(...levels.map((level) => level.level))
    : 0;
  levels.forEach((level) => {
    level.isFinest = level.level === maxLevel;
  });

  // زنجیره کامل از ریشه تا ریزترین: هر ۱ ریشه = … = ریزترین
  const orderedAsc = [...levels].sort((a, b) => a.level - b.level);
  const chainParts = orderedAsc.map((level) =>
    level.isRoot ? `۱ ${level.title}` : `${faNum(level.factor)} ${level.title}`
  );
  const relationChain =
    orderedAsc.length <= 1
      ? `واحد ذخیره‌سازی: ${orderedAsc[0]?.title || rootUnit.title}`
      : `هر ${chainParts.join(' = ')}`;

  const relationSteps = [];
  for (let i = 1; i < orderedAsc.length; i += 1) {
    const child = orderedAsc[i];
    relationSteps.push(
      `هر ۱ ${child.parentTitle || 'واحد بالاتر'} = ${faNum(child.countInParent)} ${child.title}`
    );
  }
  if (orderedAsc.length > 2) {
    const finestLevel = orderedAsc[orderedAsc.length - 1];
    relationSteps.push(
      `پس هر ۱ ${rootUnit.title} = ${faNum(finestLevel.factor)} ${finestLevel.title}`
    );
  }

  levels.forEach((level) => {
    level.relationChain = relationChain;
    level.relationSteps = relationSteps;
  });

  const finest = levels.find((level) => level.isFinest) || levels[levels.length - 1];
  // نمایش از واحد ریز به واحدهای بالاتر
  const displayLevels = [...levels].sort((a, b) => b.level - a.level);

  return {
    levels: displayLevels,
    rootStock,
    warehouses,
    rootTitle: rootUnit.title,
    finest,
    relationChain,
    relationSteps,
  };
}

const InventoryDashboard = () => {
  const { language } = useLanguage();
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
  const [openTipKey, setOpenTipKey] = useState(null);
  const tipWrapRef = useRef(null);

  useEffect(() => {
    if (!openTipKey) return undefined;
    const onDocClick = (event) => {
      if (tipWrapRef.current && !tipWrapRef.current.contains(event.target)) {
        setOpenTipKey(null);
      }
    };
    const onEsc = (event) => {
      if (event.key === 'Escape') setOpenTipKey(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [openTipKey]);
  
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
    alerts: language === 'fa' ? 'هشدارهای موجودی' : 'Stock Alerts',
    viewAll: language === 'fa' ? 'مشاهده همه' : 'View All',
    noAlerts: language === 'fa' ? 'همه چیز عالی است! هیچ هشداری وجود ندارد.' : 'All good! No alerts.',
    noProducts: language === 'fa' ? 'هنوز کالایی ثبت نشده است' : 'No products yet',
    stockOverview: language === 'fa' ? 'موجودی کالاها بر اساس واحد' : 'Stock by unit',
    stockOverviewHint: language === 'fa'
      ? 'در هر طبقه ببینید چقدر دارید و چطور حساب شده'
      : 'See qty and calculation at every unit level',
    fineUnit: language === 'fa' ? 'واحد ریز' : 'Base unit',
    rootPack: language === 'fa' ? 'واحد اصلی انبار' : 'Storage unit',
    howCalculated: language === 'fa' ? 'چطور حساب شد؟' : 'How calculated?',
    tipTitle: language === 'fa' ? 'راهنمای محاسبه' : 'Calculation guide',
    tipRelation: language === 'fa' ? 'رابطه کامل واحدها (ریشه تا ریزترین)' : 'Full unit chain (root to finest)',
    tipSteps: language === 'fa' ? 'گام‌به‌گام' : 'Step by step',
    tipFormula: language === 'fa' ? 'فرمول محاسبه این طبقه' : 'Formula for this level',
    tipRemainder: language === 'fa' ? 'باقیمانده تبدیل‌نشده' : 'Unconverted remainder',
    remainderNote: language === 'fa'
      ? 'یعنی تعدادی که هنوز به اندازه یک بسته کامل واحد بالاتر نرسیده و جدا نگه داشته شده است.'
      : 'Qty kept aside until it completes a full parent pack.',
    tipClose: language === 'fa' ? 'بستن' : 'Close',
    warehouses: language === 'fa' ? 'انبار' : 'Warehouse',
    remainderPart: language === 'fa' ? 'باقیمانده تبدیل‌نشده' : 'Unconverted remainder',
    errorLoading: language === 'fa' ? 'خطا در بارگذاری داده‌ها' : 'Error loading data',
    retry: language === 'fa' ? 'تلاش مجدد' : 'Retry',
    loading: language === 'fa' ? 'در حال بارگذاری...' : 'Loading...',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    todayTransactions: language === 'fa' ? 'تراکنش‌های امروز' : "Today's Transactions",
    pendingTransactions: language === 'fa' ? 'در انتظار تایید' : 'Pending Approval',
    resolve: language === 'fa' ? 'برطرف کردن' : 'Resolve',
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

      // داده‌های اصلی موازی؛ APIهای اختیاری جدا و بدون fail کل داشبورد
      const [
        warehousesData,
        productsData,
        transactionsData,
        alertsData,
        unitsData,
      ] = await Promise.all([
        loadWarehouses({ limit: 100 }),
        loadProducts({ limit: 100 }),
        loadTransactions({ limit: 50 }),
        loadAlerts({ limit: 50 }),
        loadUnits(),
      ]);

      await Promise.allSettled([
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

  const productStockCards = useMemo(() => {
    const products = Array.isArray(state.products) ? state.products : [];
    const units = Array.isArray(state.units) ? state.units : [];
    return products
      .filter((p) => p.is_active !== false)
      .map((product) => ({
        product,
        stock: buildProductUnitStock(product, units),
      }))
      .sort(
        (a, b) =>
          (b.stock.finest?.quantity || 0) - (a.stock.finest?.quantity || 0)
      );
  }, [state.products, state.units]);

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
              <Warehouse className={styles.titleIcon} size={22} />
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
            <Link href="/inventory/in" className={styles.successBtn}>
              <ArrowUp size={18} />
              {t.stockIn}
            </Link>
            <Link href="/inventory/out" className={styles.dangerBtn}>
              <ArrowDown size={18} />
              {t.stockOut}
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
              <span className={styles.statValue}>{faNum(stats.totalStock)}</span>
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

        {/* ===== Product stock cards (3 columns) ===== */}
        <div className={styles.stockSection}>
          <div className={styles.stockSectionHeader}>
            <div>
              <h2 className={styles.stockSectionTitle}>
                <Layers size={18} />
                {t.stockOverview}
              </h2>
              <p className={styles.stockSectionHint}>{t.stockOverviewHint}</p>
            </div>
            <Link href="/inventory/products" className={styles.viewAll}>
              {t.viewAll}
            </Link>
          </div>

          {productStockCards.length === 0 ? (
            <div className={styles.emptyState}>
              <Package size={32} />
              <p>{t.noProducts}</p>
            </div>
          ) : (
            <div className={styles.stockCardsGrid}>
              {productStockCards.map(({ product, stock }) => {
                const finest = stock.finest;
                return (
                  <article
                    key={product.id}
                    className={`${styles.stockCard} ${product.is_low_stock ? styles.stockCardWarn : ''}`}
                  >
                    <div className={styles.stockCardTop}>
                      <div className={styles.stockCardIcon}>
                        <Package size={18} />
                      </div>
                      <div className={styles.stockCardIdentity}>
                        <h3 className={styles.stockCardTitle}>{product.title}</h3>
                        <span className={styles.stockCardCode}>{product.code || '—'}</span>
                      </div>
                      {product.is_low_stock ? (
                        <span className={styles.stockCardBadgeWarn}>کم</span>
                      ) : null}

                      {(() => {
                        const tipKey = `card-${product.id}`;
                        const tipOpen = openTipKey === tipKey;
                        return (
                          <div
                            className={styles.tipWrap}
                            ref={tipOpen ? tipWrapRef : null}
                          >
                            <button
                              type="button"
                              className={`${styles.tipBtnWarn} ${tipOpen ? styles.tipBtnWarnActive : ''}`}
                              aria-label={t.tipRelation}
                              aria-expanded={tipOpen}
                              title={t.tipRelation}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenTipKey(tipOpen ? null : tipKey);
                              }}
                            >
                              <AlertTriangle size={14} />
                            </button>

                            {tipOpen ? (
                              <div className={styles.tipPanel} role="dialog">
                                <div className={styles.tipPanelHead}>
                                  <span>{t.tipRelation}</span>
                                  <button
                                    type="button"
                                    className={styles.tipClose}
                                    onClick={() => setOpenTipKey(null)}
                                    aria-label={t.tipClose}
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                                <div className={styles.tipPanelBody}>
                                  <div className={styles.tipBlock}>
                                    <span className={styles.tipLabel}>{t.tipRelation}</span>
                                    <p className={styles.tipChain}>{stock.relationChain}</p>
                                  </div>
                                  {Array.isArray(stock.relationSteps) &&
                                  stock.relationSteps.length > 0 ? (
                                    <div className={styles.tipBlock}>
                                      <span className={styles.tipLabel}>{t.tipSteps}</span>
                                      <ul className={styles.tipSteps}>
                                        {stock.relationSteps.map((step) => (
                                          <li key={step}>{step}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })()}
                    </div>

                    {finest ? (
                      <div className={styles.stockHero}>
                        <span className={styles.stockHeroLabel}>
                          جمع کل ({t.fineUnit})
                        </span>
                        <div className={styles.stockHeroValue}>
                          <strong>{faNum(finest.quantity)}</strong>
                          <span>{finest.title}</span>
                        </div>
                      </div>
                    ) : null}

                    <ul className={styles.unitLevelList}>
                      {stock.levels.map((level) => {
                        const tipKey = `level-${product.id}-${level.unitId}`;
                        const tipOpen = openTipKey === tipKey;
                        return (
                          <li
                            key={level.unitId}
                            className={`${styles.unitLevelRow} ${level.isFinest ? styles.unitLevelFinest : ''} ${level.isRoot ? styles.unitLevelRoot : ''}`}
                          >
                            <div className={styles.unitLevelMain}>
                              <div className={styles.unitLevelHead}>
                                <div className={styles.unitLevelMeta}>
                                  <Box size={13} />
                                  <span className={styles.unitLevelName}>
                                    {level.title}
                                    {level.abbreviation ? (
                                      <em>({level.abbreviation})</em>
                                    ) : null}
                                  </span>
                                  {level.isRoot ? (
                                    <span className={styles.unitTag}>{t.rootPack}</span>
                                  ) : null}
                                  {level.isFinest ? (
                                    <span className={styles.unitTagFine}>{t.fineUnit}</span>
                                  ) : null}
                                </div>

                                <div
                                  className={styles.tipWrap}
                                  ref={tipOpen ? tipWrapRef : null}
                                >
                                  <button
                                    type="button"
                                    className={`${styles.tipBtn} ${tipOpen ? styles.tipBtnActive : ''}`}
                                    aria-label={t.howCalculated}
                                    aria-expanded={tipOpen}
                                    title={t.howCalculated}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenTipKey(tipOpen ? null : tipKey);
                                    }}
                                  >
                                    <CircleHelp size={15} />
                                  </button>

                                  {tipOpen ? (
                                    <div className={styles.tipPanel} role="dialog">
                                      <div className={styles.tipPanelHead}>
                                        <span>{t.howCalculated}</span>
                                        <button
                                          type="button"
                                          className={styles.tipClose}
                                          onClick={() => setOpenTipKey(null)}
                                          aria-label={t.tipClose}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                      <div className={styles.tipPanelBody}>
                                        <div className={styles.tipBlock}>
                                          <span className={styles.tipLabel}>{t.tipFormula}</span>
                                          <p>{level.explain}</p>
                                        </div>
                                        {level.buffer > 0 ? (
                                          <div className={styles.tipBlock}>
                                            <span className={styles.tipLabel}>{t.tipRemainder}</span>
                                            <p>
                                              {faNum(level.buffer)} {level.title}. {t.remainderNote}
                                            </p>
                                          </div>
                                        ) : null}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className={styles.unitMinimal}>
                                <strong className={styles.unitMinimalQty}>
                                  {faNum(level.quantity)}
                                </strong>
                                {level.buffer > 0 ? (
                                  <span className={styles.unitMinimalRemain}>
                                    {t.remainderPart}: {faNum(level.buffer)}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {stock.warehouses.length > 0 ? (
                      <div className={styles.stockWarehouses}>
                        {stock.warehouses.map((wh) => (
                          <span key={`${product.id}-${wh.id}`} className={styles.stockWarehouseChip}>
                            <Building2 size={11} />
                            {wh.title}
                            <b>{faNum(wh.quantity)}</b>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== Alerts ===== */}
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
            {state.alerts.filter((a) => !a.is_resolved).length === 0 ? (
              <div className={styles.noAlerts}>
                <CheckCircle size={36} style={{ color: '#388e3c' }} />
                <p>{t.noAlerts}</p>
              </div>
            ) : (
              state.alerts
                .filter((a) => !a.is_resolved)
                .slice(0, 8)
                .map((alert) => (
                  <div
                    key={alert.id}
                    className={`${styles.alertItem} ${getAlertLevelClass(alert.level)}`}
                  >
                    <div className={styles.alertIcon}>
                      <AlertTriangle size={18} />
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
                          موجودی: {faNum(alert.current_quantity || 0)}
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