// modules/inventory/components/AuthorizedPersons/PersonList.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '../../components/context/InventoryContext';
import DataTable from '../common/DataTable';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import PersonForm from './PersonForm';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users, 
  User, 
  Phone, 
  Mail, 
  Building2,
  Search,
  X,
  RefreshCw,
  AlertCircle,
  Filter,
  CheckCircle,
  Shield,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Package,
  FileText,
  AlertTriangle,
  Box,
  Home,
  LayoutDashboard
} from 'lucide-react';
import styles from '@/styles/modules/InventoryCommon.module.css';

const PersonList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadPersons,
    deletePerson,
    createPerson,
    updatePerson,
    loadWarehouses,
  } = useInventory();

  // ============================================
  // Translations
  // ============================================
  const t = {
    title: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    subtitle: language === 'fa' ? 'مدیریت افراد مجاز برای خروج کالا از انبار' : 'Manage persons authorized for stock out',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    transactionHistory: language === 'fa' ? 'تاریخچه تراکنش‌ها' : 'Transaction History',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    units: language === 'fa' ? 'واحدها' : 'Units',
    newPerson: language === 'fa' ? 'فرد مجاز جدید' : 'New Authorized Person',
    totalPersons: language === 'fa' ? 'کل افراد' : 'Total Persons',
    active: language === 'fa' ? 'فعال' : 'Active',
    inactive: language === 'fa' ? 'غیرفعال' : 'Inactive',
    canConfirm: language === 'fa' ? 'دارای تایید' : 'Can Confirm',
    cannotConfirm: language === 'fa' ? 'بدون تایید' : 'Cannot Confirm',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
  };

  // ============================================
  // State Management
  // ============================================
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterConfirm, setFilterConfirm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonDetail, setShowPersonDetail] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    canConfirm: 0,
    cannotConfirm: 0,
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
      await loadWarehouses();
    } catch (error) {
      console.error('Error loading warehouses:', error);
    }
  }, [loadWarehouses]);

  const fetchPersons = useCallback(async () => {
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
      
      if (filterStatus) {
        params.is_active = filterStatus === 'active';
      }
      
      if (filterConfirm) {
        params.can_confirm = filterConfirm === 'yes';
      }
      
      if (filterWarehouse) {
        params.warehouse = filterWarehouse;
      }
      
      console.log('📦 Fetching persons:', params);
      const data = await loadPersons(params);
      
      // محاسبه آمار
      const persons = data || [];
      setStats({
        total: persons.length,
        active: persons.filter(p => p.is_active).length,
        inactive: persons.filter(p => !p.is_active).length,
        canConfirm: persons.filter(p => p.can_confirm).length,
        cannotConfirm: persons.filter(p => !p.can_confirm).length,
      });
      
    } catch (err) {
      console.error('❌ Error loading persons:', err);
      setError(err.message || 'خطا در بارگذاری افراد مجاز');
    } finally {
      if (isMounted.current) {
        isFetching.current = false;
        setIsLoading(false);
      }
    }
  }, [page, searchTerm, filterStatus, filterConfirm, filterWarehouse, loadPersons]);

  // ============================================
  // Debounced Fetch
  // ============================================
  const debouncedFetch = useCallback(() => {
    if (fetchTimer.current) {
      clearTimeout(fetchTimer.current);
    }
    fetchTimer.current = setTimeout(() => {
      fetchPersons();
    }, 500);
  }, [fetchPersons]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      fetchInitialData();
      fetchPersons();
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
  }, [page, searchTerm, filterStatus, filterConfirm, filterWarehouse]);

  // ============================================
  // Handlers
  // ============================================
  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    
    try {
      await deletePerson(deletingItem.id);
      setDeletingItem(null);
      await fetchPersons();
    } catch (err) {
      console.error('Error deleting person:', err);
      setError(err.message || 'خطا در حذف فرد مجاز');
    }
  }, [deletingItem, deletePerson, fetchPersons]);

const handleSubmit = useCallback(
  async (data) => {
    try {
      // ✅ اضافه کردن user_id
      const submitData = {
        full_name: data.full_name,
        position: data.position,
        phone: data.phone,
        email: data.email || '',
        warehouses: data.warehouses || [],
        can_confirm: data.can_confirm,
        is_active: data.is_active,
        user_id: 1, // از AuthContext بگیرید
      };
      
      if (editingItem) {
        await updatePerson(editingItem.id, submitData);
      } else {
        await createPerson(submitData);
      }
      setShowForm(false);
      setEditingItem(null);
      await fetchPersons();
    } catch (err) {
      console.error('Error submitting person:', err);
      setError(err.message || 'خطا در ذخیره فرد مجاز');
    }
  },
  [editingItem, createPerson, updatePerson, fetchPersons]
);

  const handleRefresh = useCallback(() => {
    fetchPersons();
  }, [fetchPersons]);

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

  const handleFilterStatus = useCallback((value) => {
    setFilterStatus(value);
    setPage(1);
  }, []);

  const handleFilterConfirm = useCallback((value) => {
    setFilterConfirm(value);
    setPage(1);
  }, []);

  const handleFilterWarehouse = useCallback((value) => {
    setFilterWarehouse(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterStatus('');
    setFilterConfirm('');
    setFilterWarehouse('');
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

  const handleViewDetail = useCallback((row) => {
    setSelectedPerson(row);
    setShowPersonDetail(true);
  }, []);

  // ============================================
  // Helper Functions
  // ============================================
  const getStatusLabel = useCallback((isActive) => {
    if (isActive) {
      return { label: t.active, className: styles.statusActive, icon: <UserCheck size={12} /> };
    }
    return { label: t.inactive, className: styles.statusInactive, icon: <UserX size={12} /> };
  }, [t]);

  const getConfirmLabel = useCallback((canConfirm) => {
    if (canConfirm) {
      return { label: t.canConfirm, className: styles.confirmYes, icon: <ShieldCheck size={12} /> };
    }
    return { label: t.cannotConfirm, className: styles.confirmNo, icon: <ShieldOff size={12} /> };
  }, [t]);

  const getSearchPlaceholder = () => {
    return 'جستجوی افراد مجاز... (نام یا تلفن - حداقل ۳ حرف)';
  };

  // ============================================
  // Memoized Values
  // ============================================
  const totalItems = state.authorizedPersons?.length || 0;
  const isLoading_state = state.loading.persons || isLoading;

  const columns = useMemo(() => [
    {
      header: 'نام کامل',
      render: (row) => (
        <div className={styles.personNameCell}>
          <div className={styles.personAvatar}>
            {row.image ? (
              <img src={row.image} alt={row.full_name} className={styles.avatar} />
            ) : (
              <User size={20} className={styles.avatarPlaceholder} />
            )}
          </div>
          <div className={styles.personNameInfo}>
            <span className={styles.personName}>{row.full_name}</span>
            <span className={styles.personPosition}>{row.position}</span>
          </div>
        </div>
      ),
      cellClassName: styles.colName,
    },
    {
      header: 'تلفن',
      render: (row) => (
        <div className={styles.phoneCell}>
          <Phone size={14} className={styles.phoneIcon} />
          <span>{row.phone}</span>
        </div>
      ),
      cellClassName: styles.colPhone,
    },
    {
      header: 'ایمیل',
      render: (row) => (
        <div className={styles.emailCell}>
          <Mail size={14} className={styles.emailIcon} />
          <span>{row.email || '—'}</span>
        </div>
      ),
      cellClassName: styles.colEmail,
    },
    {
      header: 'انبارها',
      render: (row) => {
        const warehouses = row.warehouse_titles || [];
        const display = warehouses.slice(0, 2);
        const remaining = warehouses.length - 2;
        return (
          <div className={styles.warehousesCell}>
            {display.map((w, i) => (
              <span key={i} className={styles.warehouseTag}>
                <Building2 size={10} />
                {w}
              </span>
            ))}
            {remaining > 0 && (
              <span className={styles.warehouseMore}>+{remaining}</span>
            )}
            {warehouses.length === 0 && '—'}
          </div>
        );
      },
      cellClassName: styles.colWarehouses,
    },
    {
      header: 'وضعیت',
      render: (row) => {
        const status = getStatusLabel(row.is_active);
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
      header: 'تایید خروج',
      render: (row) => {
        const confirm = getConfirmLabel(row.can_confirm);
        return (
          <span className={`${styles.confirmBadge} ${confirm.className}`}>
            {confirm.icon}
            {confirm.label}
          </span>
        );
      },
      cellClassName: styles.colConfirm,
    },
  ], [getStatusLabel, getConfirmLabel]);

  const actions = useMemo(() => [
    {
      label: 'مشاهده',
      icon: <Eye size={16} />,
      onClick: handleViewDetail,
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
  ], [handleViewDetail, handleEdit, handleDeleteClick]);

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
            <Link href="/inventory/transactions" className={styles.actionCard}>
              <FileText size={20} style={{ color: '#f57c00' }} />
              <span>{t.transactionHistory}</span>
            </Link>
            <Link href="/inventory/authorized-persons" className={`${styles.actionCard} ${styles.actionCardActive}`}>
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
              <Users className={styles.titleIcon} size={28} />
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
              {t.newPerson}
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
              <Users className={styles.statIcon} style={{ color: '#1976d2' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>{t.totalPersons}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <UserCheck className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>{t.active}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <UserX className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.inactive}</span>
              <span className={styles.statLabel}>{t.inactive}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <ShieldCheck className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.canConfirm}</span>
              <span className={styles.statLabel}>{t.canConfirm}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <ShieldOff className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.cannotConfirm}</span>
              <span className={styles.statLabel}>{t.cannotConfirm}</span>
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
              {(filterStatus || filterConfirm || filterWarehouse) && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {(filterStatus || filterConfirm || filterWarehouse) && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={clearFilters}
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${totalItems} نفر`}
          </span>
        </div>

        {/* ===== Filter Panel ===== */}
        {showFilterPanel && (
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>وضعیت</label>
              <select
                className={styles.filterSelect}
                value={filterStatus}
                onChange={(e) => handleFilterStatus(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه</option>
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>تایید خروج</label>
              <select
                className={styles.filterSelect}
                value={filterConfirm}
                onChange={(e) => handleFilterConfirm(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">همه</option>
                <option value="yes">{t.canConfirm}</option>
                <option value="no">{t.cannotConfirm}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>انبار مجاز</label>
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
          data={state.authorizedPersons || []}
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
              : 'هیچ فرد مجازی یافت نشد'
          }
          onRowClick={handleViewDetail}
        />

        {/* ===== Form Modal ===== */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          title={editingItem ? 'ویرایش فرد مجاز' : 'ایجاد فرد مجاز جدید'}
          size="lg"
        >
          <PersonForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            loading={isLoading_state}
            warehouses={state.warehouses}
          />
        </Modal>

        {/* ===== Delete Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title="حذف فرد مجاز"
          message={`آیا از حذف فرد مجاز "${deletingItem?.full_name}" اطمینان دارید؟`}
          confirmText="حذف"
          loading={isLoading_state}
        />

        {/* ===== Person Detail Modal ===== */}
        <Modal
          isOpen={showPersonDetail}
          onClose={() => {
            setShowPersonDetail(false);
            setSelectedPerson(null);
          }}
          title={t.viewDetail}
          size="md"
        >
          {selectedPerson && (
            <div className={styles.personDetail}>
              <div className={styles.detailHeader}>
                <div className={styles.detailAvatar}>
                  {selectedPerson.image ? (
                    <img src={selectedPerson.image} alt={selectedPerson.full_name} />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <div className={styles.detailTitle}>
                  <h3>{selectedPerson.full_name}</h3>
                  <span className={styles.detailPosition}>{selectedPerson.position}</span>
                </div>
                <div className={styles.detailStatuses}>
                  <span className={`${styles.statusBadge} ${getStatusLabel(selectedPerson.is_active).className}`}>
                    {getStatusLabel(selectedPerson.is_active).icon}
                    {getStatusLabel(selectedPerson.is_active).label}
                  </span>
                  <span className={`${styles.confirmBadge} ${getConfirmLabel(selectedPerson.can_confirm).className}`}>
                    {getConfirmLabel(selectedPerson.can_confirm).icon}
                    تایید خروج: {getConfirmLabel(selectedPerson.can_confirm).label}
                  </span>
                </div>
              </div>

              <div className={styles.detailGrid}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>تلفن:</span>
                  <span className={styles.detailValue}>
                    <Phone size={14} />
                    {selectedPerson.phone}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>ایمیل:</span>
                  <span className={styles.detailValue}>
                    <Mail size={14} />
                    {selectedPerson.email || '—'}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>انبارهای مجاز:</span>
                  <span className={styles.detailValue}>
                    <div className={styles.detailWarehouses}>
                      {(selectedPerson.warehouse_titles || []).map((w, i) => (
                        <span key={i} className={styles.warehouseTag}>
                          <Building2 size={12} />
                          {w}
                        </span>
                      ))}
                      {(selectedPerson.warehouse_titles || []).length === 0 && '—'}
                    </div>
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>تاریخ ایجاد:</span>
                  <span className={styles.detailValue}>
                    {new Date(selectedPerson.created_at).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PersonList;