// modules/inventory/components/authorized-persons/AuthorizedPersonList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { useInventory } from '@/modules/inventory/context/InventoryContext';

import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import AuthorizedPersonForm from './AuthorizedPersonForm';
import AuthorizedPersonDetail from './AuthorizedPersonDetail';
import { 
  Plus, Home, Building2, Package, Box, ArrowDownToLine, ArrowUpFromLine, 
  Users, AlertTriangle, RefreshCw, List, Grid,
  CheckCircle, Circle, AlertCircle, Search, Filter, 
  Eye, Edit, Trash2, X, User, Shield, Phone, Mail,
} from 'lucide-react';
import styles from './authorizedPerson.module.css';

const AuthorizedPersonList = () => {
  const { language } = useLanguage();
  const {
    state,
    loadAuthorizedPersons,
    loadWarehouses,
    deleteAuthorizedPerson,
    createAuthorizedPerson,
    updateAuthorizedPerson,
  } = useInventory();

  // ============================================
  // State Management
  // ============================================
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCanConfirm, setFilterCanConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [personData, setPersonData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    canConfirm: 0,
  });

  const initialLoadDone = useRef(false);
  const fetchInProgress = useRef(false);

  // ============================================
  // Translations
  // ============================================
  const t = useMemo(() => ({
    title: language === 'fa' ? 'مدیریت افراد مجاز' : 'Authorized Persons Management',
    subtitle: language === 'fa' ? 'مدیریت افراد مجاز برای خروج کالا' : 'Manage authorized persons for stock out',
    refresh: language === 'fa' ? 'بروزرسانی' : 'Refresh',
    dashboard: language === 'fa' ? 'داشبورد اصلی' : 'Dashboard',
    manageWarehouses: language === 'fa' ? 'مدیریت انبارها' : 'Manage Warehouses',
    manageProducts: language === 'fa' ? 'مدیریت کالاها' : 'Manage Products',
    manageUnits: language === 'fa' ? 'مدیریت واحدها' : 'Manage Units',
    stockIn: language === 'fa' ? 'ورود کالا' : 'Stock In',
    stockOut: language === 'fa' ? 'خروج کالا' : 'Stock Out',
    managePersons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    manageAlerts: language === 'fa' ? 'هشدارها' : 'Alerts',
    persons: language === 'fa' ? 'افراد مجاز' : 'Authorized Persons',
    newPerson: language === 'fa' ? 'فرد مجاز جدید' : 'New Authorized Person',
    editPerson: language === 'fa' ? 'ویرایش فرد مجاز' : 'Edit Authorized Person',
    totalPersons: language === 'fa' ? 'کل افراد' : 'Total Persons',
    active: language === 'fa' ? 'فعال' : 'Active',
    inactive: language === 'fa' ? 'غیرفعال' : 'Inactive',
    canConfirm: language === 'fa' ? 'قابل تایید' : 'Can Confirm',
    viewDetail: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    edit: language === 'fa' ? 'ویرایش' : 'Edit',
    delete: language === 'fa' ? 'حذف' : 'Delete',
    fullName: language === 'fa' ? 'نام کامل' : 'Full Name',
    position: language === 'fa' ? 'سمت' : 'Position',
    phone: language === 'fa' ? 'تلفن' : 'Phone',
    email: language === 'fa' ? 'ایمیل' : 'Email',
    warehouses: language === 'fa' ? 'انبارها' : 'Warehouses',
    status: language === 'fa' ? 'وضعیت' : 'Status',
    noPersons: language === 'fa' ? 'هیچ فرد مجازی یافت نشد' : 'No authorized persons found',
    gridView: language === 'fa' ? 'نمایش شبکه‌ای' : 'Grid View',
    listView: language === 'fa' ? 'نمایش لیستی' : 'List View',
    allStatus: language === 'fa' ? 'همه وضعیت‌ها' : 'All Status',
    allConfirm: language === 'fa' ? 'همه' : 'All',
    canConfirmTrue: language === 'fa' ? 'قابل تایید' : 'Can Confirm',
    canConfirmFalse: language === 'fa' ? 'غیر قابل تایید' : 'Cannot Confirm',
    searchPlaceholder: language === 'fa' ? 'جستجوی افراد (نام یا سمت)...' : 'Search persons (name or position)...',
    close: language === 'fa' ? 'بستن' : 'Close',
    userMobile: language === 'fa' ? 'شماره موبایل کاربر' : 'User Mobile',
  }), [language]);

  // ============================================
  // Fetch Authorized Persons
  // ============================================
  const fetchPersons = useCallback(async (forceRefresh = false) => {
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
      if (filterStatus) {
        params.is_active = filterStatus === 'active';
      }
      if (filterCanConfirm) {
        params.can_confirm = filterCanConfirm === 'true';
      }
      
      const personsData = await loadAuthorizedPersons(params);
      
      let persons = [];
      if (Array.isArray(personsData)) persons = personsData;
      else if (personsData?.results) persons = personsData.results;
      else if (personsData?.data) persons = personsData.data;
      
      setPersonData(persons);
      
      setStats({
        total: persons.length,
        active: persons.filter(p => p.is_active).length,
        inactive: persons.filter(p => !p.is_active).length,
        canConfirm: persons.filter(p => p.can_confirm).length,
      });
    } catch (err) {
      console.error('Error loading authorized persons:', err);
      setError(err.message || 'خطا در بارگذاری افراد مجاز');
      setPersonData([]);
    } finally {
      setIsLoading(false);
      fetchInProgress.current = false;
    }
  }, [searchTerm, filterStatus, filterCanConfirm, loadAuthorizedPersons]);

  // ============================================
  // Effects
  // ============================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      Promise.all([
        loadWarehouses(),
      ]).then(() => fetchPersons(true));
    }
  }, []);

  useEffect(() => {
    if (initialLoadDone.current) {
      const timer = setTimeout(() => {
        const trimmed = searchTerm?.trim() || '';
        if (trimmed.length === 0 || trimmed.length >= 3) {
          fetchPersons(true);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, filterStatus, filterCanConfirm]);

  // ============================================
  // Handlers - CRUD Operations
  // ============================================
  
  const handleSubmit = useCallback(async (data) => {
    try {
      let result;
      if (editingItem) {
        result = await updateAuthorizedPerson(editingItem.id, data);
      } else {
        result = await createAuthorizedPerson(data);
      }
      
      setShowForm(false);
      setEditingItem(null);
      await fetchPersons(true);
      
    } catch (err) {
      console.error('Error submitting authorized person:', err);
      if (err.response?.data) {
        const errorMessages = Object.values(err.response.data).flat().join(' ');
        setError(errorMessages || err.message || 'خطا در ذخیره فرد مجاز');
      } else {
        setError(err.message || 'خطا در ذخیره فرد مجاز');
      }
    }
  }, [editingItem, createAuthorizedPerson, updateAuthorizedPerson, fetchPersons]);

  const handleDelete = useCallback(async () => {
    if (!deletingItem) return;
    try {
      await deleteAuthorizedPerson(deletingItem.id);
      setDeletingItem(null);
      await fetchPersons(true);
    } catch (err) {
      setError(err.message || 'خطا در حذف فرد مجاز');
    }
  }, [deletingItem, deleteAuthorizedPerson, fetchPersons]);

  const handleAdd = useCallback(() => {
    setEditingItem(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((row) => {
    setEditingItem(row);
    setShowForm(true);
  }, []);

  const handleViewDetail = useCallback((row) => {
    setSelectedPerson(row);
    setShowDetail(true);
  }, []);

  const handleRefresh = useCallback(() => fetchPersons(true), [fetchPersons]);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  }, []);

  const isLoading_state = state.loading.authorizedPersons || isLoading;

  // ============================================
  // Render Helpers
  // ============================================
  
  const getStatusBadge = useCallback((isActive) => {
    if (isActive) {
      return <span className={`${styles.statusBadge} ${styles.activeBadge}`}><CheckCircle size={12} /> {t.active}</span>;
    }
    return <span className={`${styles.statusBadge} ${styles.inactiveBadge}`}><Circle size={12} /> {t.inactive}</span>;
  }, [t]);

  const getConfirmBadge = useCallback((canConfirm) => {
    if (canConfirm) {
      return <span className={`${styles.confirmBadge} ${styles.canConfirmBadge}`}>✅ {t.canConfirmTrue}</span>;
    }
    return <span className={`${styles.confirmBadge} ${styles.cannotConfirmBadge}`}>❌ {t.canConfirmFalse}</span>;
  }, [t]);

  const getWarehouseNames = useCallback((warehouses) => {
    if (!warehouses || warehouses.length === 0) return '-';
    if (Array.isArray(warehouses)) {
      return warehouses.map(w => w.title || w).join('، ');
    }
    return '-';
  }, []);

  // ============================================
  // Render
  // ============================================
  return (
    <div className={styles.inventoryContainer}>
      <div className={styles.container}>
        
        {/* ===== Navigation Bar ===== */}
        {/* ===== Header ===== */}
        <div className={styles.inventoryHeader}>
          <div>
            <h1 className={styles.pageTitle}>
              <Shield className={styles.titleIcon} size={28} />
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
            <button 
              className={styles.primaryBtn} 
              onClick={handleAdd}
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

        {/* ===== Stats ===== */}
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
              <CheckCircle className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>{t.active}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#ffebee' }}>
              <Circle className={styles.statIcon} style={{ color: '#c62828' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.inactive}</span>
              <span className={styles.statLabel}>{t.inactive}</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper} style={{ background: '#e8f5e9' }}>
              <Shield className={styles.statIcon} style={{ color: '#2e7d32' }} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.canConfirm}</span>
              <span className={styles.statLabel}>{t.canConfirm}</span>
            </div>
          </div>
        </div>

        {/* ===== Search & Filter ===== */}
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
              {(filterStatus || filterCanConfirm) && (
                <span className={styles.filterBadge}>●</span>
              )}
            </button>
            {(filterStatus || filterCanConfirm) && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={() => { 
                  setFilterStatus(''); 
                  setFilterCanConfirm('');
                  setSearchTerm('');
                }}
              >
                پاک کردن
              </button>
            )}
          </div>
          <span className={styles.totalCount}>
            {isLoading_state ? 'در حال بارگذاری...' : `${stats.total} نفر`}
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
                onChange={(e) => setFilterStatus(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allStatus}</option>
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>امکان تایید</label>
              <select
                className={styles.filterSelect}
                value={filterCanConfirm}
                onChange={(e) => setFilterCanConfirm(e.target.value)}
                disabled={isLoading_state}
              >
                <option value="">{t.allConfirm}</option>
                <option value="true">{t.canConfirmTrue}</option>
                <option value="false">{t.canConfirmFalse}</option>
              </select>
            </div>
            <button 
              className={styles.filterApplyBtn}
              onClick={() => setShowFilterPanel(false)}
            >
              اعمال
            </button>
          </div>
        )}

        {/* ===== Search Hint ===== */}
        {searchTerm && searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className={styles.searchHint}>
            <span>🔍 برای جستجو حداقل ۳ حرف وارد کنید</span>
          </div>
        )}

        {/* ===== Person Grid/List ===== */}
        {isLoading_state ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>در حال بارگذاری...</p>
          </div>
        ) : personData.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield size={48} className={styles.emptyIcon} />
            <p>{t.noPersons}</p>
            <button className={styles.primaryBtn} onClick={handleAdd}>
              <Plus size={16} />
              {t.newPerson}
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className={styles.personsGrid}>
            {personData.map(person => (
              <div 
                key={person.id} 
                className={styles.personCard}
                onClick={() => handleViewDetail(person)}
              >
                <div className={styles.personCardHeader}>
                  <div className={styles.personAvatar}>
                    <User size={32} />
                  </div>
                  <div className={styles.personCardTitle}>
                    <h3 className={styles.personName}>{person.full_name}</h3>
                    <span className={styles.personPosition}>{person.position}</span>
                  </div>
                  <div className={styles.personCardStatus}>
                    {getStatusBadge(person.is_active)}
                  </div>
                </div>
                
                <div className={styles.personInfo}>
                  <div className={styles.personMeta}>
                    <span className={styles.personPhone}>
                      <Phone size={14} />
                      {person.phone}
                    </span>
                    {person.email && (
                      <span className={styles.personEmail}>
                        <Mail size={14} />
                        {person.email}
                      </span>
                    )}
                  </div>
                  
                  <div className={styles.personWarehouses}>
                    <span className={styles.warehousesLabel}>انبارهای مجاز:</span>
                    <span className={styles.warehousesList}>
                      {getWarehouseNames(person.warehouse_titles || person.warehouses)}
                    </span>
                  </div>
                  
                  <div className={styles.personConfirm}>
                    {getConfirmBadge(person.can_confirm)}
                  </div>
                </div>
                
                <div className={styles.personActions}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleViewDetail(person); }}
                    className={styles.actionBtn}
                    title={t.viewDetail}
                  >
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEdit(person); }}
                    className={styles.actionBtn}
                    title={t.edit}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setDeletingItem(person);
                    }}
                    className={styles.actionBtn}
                    title={t.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.personsTable}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.colName}>نام</th>
                  <th className={styles.colPosition}>سمت</th>
                  <th className={styles.colPhone}>تلفن</th>
                  <th className={styles.colWarehouses}>انبارها</th>
                  <th className={styles.colConfirm}>تایید</th>
                  <th className={styles.colStatus}>وضعیت</th>
                  <th className={styles.actionsHeader}>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {personData.map(person => (
                  <tr 
                    key={person.id}
                    onClick={() => handleViewDetail(person)}
                    className={styles.clickable}
                  >
                    <td className={styles.colName}>
                      <div className={styles.personCell}>
                        <div className={styles.personAvatarSmall}>
                          <User size={16} />
                        </div>
                        <span className={styles.personNameText}>{person.full_name}</span>
                      </div>
                    </td>
                    <td className={styles.colPosition}>
                      <span className={styles.positionBadge}>{person.position}</span>
                    </td>
                    <td className={styles.colPhone}>
                      <span className={styles.phoneText}>{person.phone}</span>
                    </td>
                    <td className={styles.colWarehouses}>
                      <span className={styles.warehousesText}>
                        {getWarehouseNames(person.warehouse_titles || person.warehouses)}
                      </span>
                    </td>
                    <td className={styles.colConfirm}>
                      {getConfirmBadge(person.can_confirm)}
                    </td>
                    <td className={styles.colStatus}>
                      {getStatusBadge(person.is_active)}
                    </td>
                    <td className={styles.actionsCell}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleViewDetail(person); }}
                        className={styles.actionBtn}
                        title={t.viewDetail}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(person); }}
                        className={styles.actionBtn}
                        title={t.edit}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setDeletingItem(person);
                        }}
                        className={styles.actionBtn}
                        title={t.delete}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================
            MODALS
        ============================================ */}

        {/* ===== Modal ایجاد/ویرایش ===== */}
        <Modal
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          title={editingItem ? `✏️ ${t.editPerson}` : `➕ ${t.newPerson}`}
          size="lg"
        >
          <AuthorizedPersonForm
            initialData={editingItem}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
            loading={isLoading_state}
            warehouses={state.warehouses || []}
          />
        </Modal>

        {/* ===== Delete Confirmation ===== */}
        <ConfirmDialog
          isOpen={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onConfirm={handleDelete}
          title="حذف فرد مجاز"
          message={`آیا از حذف "${deletingItem?.full_name}" اطمینان دارید؟`}
          confirmText="حذف"
          loading={isLoading_state}
        />

        {/* ===== Person Detail Modal ===== */}
        <Modal
          isOpen={showDetail}
          onClose={() => {
            setShowDetail(false);
            setSelectedPerson(null);
          }}
          title="جزئیات فرد مجاز"
          size="lg"
        >
          {selectedPerson && (
            <AuthorizedPersonDetail 
              person={selectedPerson}
              onEdit={() => {
                setShowDetail(false);
                handleEdit(selectedPerson);
              }}
              onClose={() => {
                setShowDetail(false);
                setSelectedPerson(null);
              }}
              getStatusBadge={getStatusBadge}
              getConfirmBadge={getConfirmBadge}
              getWarehouseNames={getWarehouseNames}
              t={t}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AuthorizedPersonList;