// modules/inventory/components/in/StockInList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../../context/InventoryContext';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import StockInForm from './StockInForm';
import {
  ArrowDownToLine, Search, X, RefreshCw, Filter, Package, Warehouse,
  Layers, Calendar, User, CheckCircle, Circle, Building2, FileText,
  Users, AlertTriangle, Box, Home, GitBranch, Eye, Trash2, Clock,
} from 'lucide-react';
import styles from './in.module.css';

const StockInList = () => {
  const { language } = useLanguage();
  const { 
    state, 
    loadTransactions, 
    loadProducts, 
    loadWarehouses, 
    loadUnits, 
    receiveWithUnit  // ✅ تغییر: استفاده از receiveWithUnit به جای createTransaction
  } = useInventory();

  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, cancelled: 0 });

  const initialLoadDone = useRef(false);

  const t = useMemo(() => ({
    title: language === 'fa' ? 'ورود کالا' : 'Stock In',
    subtitle: language === 'fa' ? 'مدیریت ورود کالا به انبار' : 'Manage stock entries',
    refresh: 'بروزرسانی',
    dashboard: 'داشبورد اصلی',
    manageWarehouses: 'مدیریت انبارها',
    manageProducts: 'مدیریت کالاها',
    stockOut: 'خروج کالا',
    managePersons: 'افراد مجاز',
    manageAlerts: 'هشدارها',
    units: 'واحدها',
    newEntry: 'ورود جدید',
    total: 'کل',
    pending: 'در انتظار',
    confirmed: 'تایید شده',
    cancelled: 'لغو شده',
    viewDetail: 'مشاهده',
    delete: 'حذف',
  }), [language]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadProducts(),
        loadWarehouses(),
        loadUnits(),
      ]);
      const txns = await loadTransactions({ transaction_type: 'IN' });
      setTransactions(txns?.results || txns || []);
      const data = txns?.results || txns || [];
      setStats({
        total: data.length,
        pending: data.filter(t => t.status === 'PENDING').length,
        confirmed: data.filter(t => t.status === 'CONFIRMED').length,
        cancelled: data.filter(t => t.status === 'CANCELLED').length,
      });
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری');
    } finally {
      setIsLoading(false);
    }
  }, [loadProducts, loadWarehouses, loadUnits, loadTransactions]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchData();
    }
  }, []);

  // ✅ استفاده از receiveWithUnit به جای createTransaction
  const handleSubmit = useCallback(async (data) => {
    try {
      await receiveWithUnit({
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        unit_id: data.unit_id,
        quantity: data.quantity,
        description: data.description || '',
      });
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.message || 'خطا در ثبت ورود');
    }
  }, [receiveWithUnit, fetchData]);

  const handleRefresh = useCallback(() => fetchData(), [fetchData]);

  const isLoading_state = state.loading.transactions || isLoading;

  // ============================================
  // Render
  // ============================================
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        {/* Navigation */}
        <div className={styles.navBar}>
          <div className={styles.actionsGrid}>
            <Link href="/inventory" className={styles.actionCard}><Home size={20} /><span>{t.dashboard}</span></Link>
            <Link href="/inventory/warehouses" className={styles.actionCard}><Building2 size={20} /><span>{t.manageWarehouses}</span></Link>
            <Link href="/inventory/products" className={styles.actionCard}><Package size={20} /><span>{t.manageProducts}</span></Link>
            <Link href="/inventory/in" className={`${styles.actionCard} ${styles.actionCardSuccess}`}><ArrowDownToLine size={20} /><span>{t.title}</span></Link>
            <Link href="/inventory/out" className={styles.actionCard}><ArrowDownToLine size={20} style={{ transform: 'rotate(180deg)' }} /><span>{t.stockOut}</span></Link>
            <Link href="/inventory/authorized-persons" className={styles.actionCard}><Users size={20} /><span>{t.managePersons}</span></Link>
            <Link href="/inventory/alerts" className={styles.actionCard}><AlertTriangle size={20} /><span>{t.manageAlerts}</span></Link>
            <Link href="/inventory/units" className={styles.actionCard}><Box size={20} /><span>{t.units}</span></Link>
          </div>
        </div>

        {/* Header */}
        <div className={styles.inventoryHeader}>
          <div>
            <h1 className={styles.pageTitle}><ArrowDownToLine className={styles.titleIcon} size={28} style={{ color: 'var(--secondary)' }} />{t.title}</h1>
            <p className={styles.pageDesc}>{t.subtitle}</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.refreshBtn} onClick={handleRefresh} disabled={isLoading_state}>
              <RefreshCw size={18} className={isLoading_state ? styles.spinning : ''} /><span>{t.refresh}</span>
            </button>
            <button className={styles.primaryBtn} onClick={() => setShowForm(true)} disabled={isLoading_state}>
              <ArrowDownToLine size={18} />{t.newEntry}
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}><span>⚠️ {error}</span><button onClick={() => setError(null)}>✕</button></div>
        )}

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}><div className={styles.statIconWrapper} style={{ background: '#e3f2fd' }}><Package className={styles.statIcon} style={{ color: '#1976d2' }} /></div><div className={styles.statInfo}><span className={styles.statValue}>{stats.total}</span><span className={styles.statLabel}>{t.total}</span></div></div>
          <div className={styles.statCard}><div className={styles.statIconWrapper} style={{ background: '#fff3e0' }}><Clock className={styles.statIcon} style={{ color: '#f57c00' }} /></div><div className={styles.statInfo}><span className={styles.statValue}>{stats.pending}</span><span className={styles.statLabel}>{t.pending}</span></div></div>
          <div className={styles.statCard}><div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}><CheckCircle className={styles.statIcon} style={{ color: '#2e7d32' }} /></div><div className={styles.statInfo}><span className={styles.statValue}>{stats.confirmed}</span><span className={styles.statLabel}>{t.confirmed}</span></div></div>
          <div className={styles.statCard}><div className={styles.statIconWrapper} style={{ background: '#ffebee' }}><Circle className={styles.statIcon} style={{ color: '#c62828' }} /></div><div className={styles.statInfo}><span className={styles.statValue}>{stats.cancelled}</span><span className={styles.statLabel}>{t.cancelled}</span></div></div>
        </div>

        {/* Search */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="جستجوی تراکنش‌ها..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput} disabled={isLoading_state} />
          </div>
          <span className={styles.totalCount}>{isLoading_state ? 'در حال بارگذاری...' : `${stats.total} تراکنش`}</span>
        </div>

        {/* Table */}
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper}>
            <table className={styles.stockTable}>
              <thead><tr>
                <th>شماره مرجع</th>
                <th>کالا</th>
                <th>انبار</th>
                <th>تعداد</th>
                <th>واحد</th>
                <th>تاریخ</th>
                <th>وضعیت</th>
                <th className={styles.actionsHeader}>عملیات</th>
              </tr></thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="8" className={styles.emptyCell}>هیچ تراکنشی یافت نشد</td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id}>
                      <td><span className={styles.referenceCode}>{t.reference_number}</span></td>
                      <td>{t.product_title}</td>
                      <td>{t.warehouse_title}</td>
                      <td><span className={styles.quantityBadge}>{t.quantity}</span></td>
                      <td>{t.unit_title}</td>
                      <td>{new Date(t.created_at).toLocaleDateString('fa-IR')}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${
                          t.status === 'CONFIRMED' ? styles.statusConfirmed :
                          t.status === 'PENDING' ? styles.statusPending :
                          styles.statusCancelled
                        }`}>
                          {t.status_display || t.status}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <button className={styles.actionBtn} title={t.viewDetail}><Eye size={16} /></button>
                        <button className={styles.actionBtn} title={t.delete} style={{ color: 'var(--macos-red)' }}><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="📥 ورود کالا" size="md">
          <StockInForm
            products={state.products || []}
            warehouses={state.warehouses || []}
            units={state.units || []}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            loading={isLoading_state}
          />
        </Modal>
      </div>
    </div>
  );
};

export default StockInList;