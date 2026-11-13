// modules/inventory/components/out/StockOutList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../../context/InventoryContext';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import StockOutForm from './StockOutForm';
import {
  ArrowUpFromLine, Search, RefreshCw, CheckCircle, Circle,
  Eye, Clock,
} from 'lucide-react';
import styles from './out.module.css';

const StockOutList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadTransactions,
    loadProducts,
    loadWarehouses,
    loadUnits,
    loadAuthorizedPersons,
    removeWithUnit,
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
    title: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    subtitle: language === 'fa' ? 'مدیریت خروج کالا از انبار' : 'Manage stock exits',
    refresh: 'بروزرسانی',
    dashboard: 'داشبورد اصلی',
    manageWarehouses: 'مدیریت انبارها',
    manageProducts: 'مدیریت کالاها',
    stockIn: 'ورود کالا',
    managePersons: 'افراد مجاز',
    manageAlerts: 'هشدارها',
    units: 'واحدها',
    newEntry: 'خروج جدید',
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
        loadAuthorizedPersons(),
      ]);
      const txns = await loadTransactions({ transaction_type: 'OUT' });
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
  }, [loadProducts, loadWarehouses, loadUnits, loadAuthorizedPersons, loadTransactions]);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchData();
    }
  }, []);

  const handleSubmit = useCallback(async (data) => {
    try {
      await removeWithUnit({
        product_id: data.product_id,
        warehouse_id: data.warehouse_id,
        unit_id: data.unit_id,
        quantity: data.quantity,
        authorized_person_id: data.authorized_person_id || null,
        description: data.description || '',
      });
      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.message || 'خطا در ثبت خروج');
    }
  }, [removeWithUnit, fetchData]);

  const handleRefresh = useCallback(() => fetchData(), [fetchData]);

  const isLoading_state = state.loading.transactions || isLoading;

  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.inventoryHeader}>
          <div>
            <h1 className={styles.pageTitle}><ArrowUpFromLine className={styles.titleIcon} size={28} style={{ color: 'var(--macos-red)' }} />{t.title}</h1>
            <p className={styles.pageDesc}>{t.subtitle}</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.refreshBtn} onClick={handleRefresh} disabled={isLoading_state}>
              <RefreshCw size={18} className={isLoading_state ? styles.spinning : ''} /><span>{t.refresh}</span>
            </button>
            <button className={styles.primaryBtn} onClick={() => setShowForm(true)} disabled={isLoading_state} style={{ background: 'var(--macos-red)' }}>
              <ArrowUpFromLine size={18} />{t.newEntry}
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
                <th>فرد مجاز</th>
                <th>تاریخ</th>
                <th>وضعیت</th>
                <th className={styles.actionsHeader}>عملیات</th>
              </tr></thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="9" className={styles.emptyCell}>هیچ تراکنشی یافت نشد</td></tr>
                ) : (
                  transactions.map(t => (
                    <tr key={t.id}>
                      <td><span className={styles.referenceCode}>{t.reference_number}</span></td>
                      <td>{t.product_title}</td>
                      <td>{t.warehouse_title}</td>
                      <td><span className={styles.quantityBadge}>{t.quantity}</span></td>
                      <td>{t.unit_title}</td>
                      <td>{t.authorized_by_name || '-'}</td>
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
        <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="📤 خروج کالا" size="md">
          <StockOutForm
            products={state.products || []}
            warehouses={state.warehouses || []}
            units={state.units || []}
            authorizedPersons={state.authorizedPersons || []}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
            loading={isLoading_state}
          />
        </Modal>
      </div>
    </div>
  );
};

export default StockOutList;