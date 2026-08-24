// modules/setad/components/SetadPage.jsx

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import Config from '@/config/config';
import styles from '@/styles/modules/Setad.module.css';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  MapPin,
  Building,
  Calendar,
  AlertCircle,
  CheckCircle,
  Eye,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const SetadPage = () => {
  const { language } = useLanguage();
  const { getAuthHeaders } = useAuth();
  
  // State
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    province: 'all',
    organization: 'all',
    type: 'all',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newItemsCount, setNewItemsCount] = useState(0);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(20);
  const [pageSizeOptions] = useState([10, 20, 50, 100]);

  // Refs
  const intervalRef = useRef(null);
  const lastFetchRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // ترجمه‌ها
  const t = {
    title: language === 'fa' ? 'مزایده و مناقصات' : 'Tenders & Auctions',
    subtitle: language === 'fa' 
      ? 'آخرین فراخوان‌های سامانه ستاد' 
      : 'Latest announcements from SETAD system',
    searchPlaceholder: language === 'fa' ? 'جستجو در مناقصات...' : 'Search tenders...',
    noResults: language === 'fa' ? 'هیچ مناقصه‌ای یافت نشد' : 'No tenders found',
    loading: language === 'fa' ? 'در حال بارگذاری...' : 'Loading...',
    error: language === 'fa' ? 'خطا در بارگذاری' : 'Error loading',
    retry: language === 'fa' ? 'تلاش مجدد' : 'Retry',
    filters: language === 'fa' ? 'فیلترها' : 'Filters',
    clearFilters: language === 'fa' ? 'حذف فیلترها' : 'Clear filters',
    lastUpdate: language === 'fa' ? 'آخرین بروزرسانی' : 'Last update',
    newItems: language === 'fa' ? 'مناقصه جدید' : 'new tenders',
    autoUpdate: language === 'fa' ? 'بروزرسانی خودکار هر ۱۰ دقیقه' : 'Auto-updates every 10 minutes',
    pagination: {
      showing: language === 'fa' ? 'نمایش' : 'Showing',
      of: language === 'fa' ? 'از' : 'of',
      items: language === 'fa' ? 'مورد' : 'items',
      perPage: language === 'fa' ? 'در هر صفحه' : 'per page',
      first: language === 'fa' ? 'اولین' : 'First',
      last: language === 'fa' ? 'آخرین' : 'Last',
      previous: language === 'fa' ? 'قبلی' : 'Previous',
      next: language === 'fa' ? 'بعدی' : 'Next',
    },
    status: {
      active: language === 'fa' ? 'فعال' : 'Active',
      inactive: language === 'fa' ? 'غیرفعال' : 'Inactive',
      all: language === 'fa' ? 'همه' : 'All',
    },
    details: {
      title: language === 'fa' ? 'عنوان' : 'Title',
      number: language === 'fa' ? 'شماره فراخوان' : 'Tender No',
      organization: language === 'fa' ? 'دستگاه اجرایی' : 'Organization',
      province: language === 'fa' ? 'استان' : 'Province',
      city: language === 'fa' ? 'شهر' : 'City',
      date: language === 'fa' ? 'تاریخ انتشار' : 'Publication Date',
      deadline: language === 'fa' ? 'مهلت اسناد' : 'Documents Deadline',
      proposalDeadline: language === 'fa' ? 'مهلت پیشنهاد' : 'Proposal Deadline',
      description: language === 'fa' ? 'شرح' : 'Description',
      financial: language === 'fa' ? 'برآورد مالی' : 'Financial Estimate',
      credit: language === 'fa' ? 'سقف اعتبار' : 'Credit Limit',
      type: language === 'fa' ? 'نوع مناقصه' : 'Tender Type',
      status: language === 'fa' ? 'وضعیت' : 'Status',
      viewDetails: language === 'fa' ? 'مشاهده جزئیات' : 'View Details',
    },
  };

  // دریافت مناقصات با صفحه‌بندی
  const fetchTenders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.province && filters.province !== 'all') {
        params.append('province', filters.province);
      }
      if (filters.organization && filters.organization !== 'all') {
        params.append('organization', filters.organization);
      }
      if (filters.type && filters.type !== 'all') {
        params.append('type', filters.type);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      // پارامترهای صفحه‌بندی
      params.append('page', currentPage);
      params.append('page_size', itemsPerPage);

      const url = Config.endpoints.setad.list(Object.fromEntries(params));
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });

      if (response.data.status === 'success') {
        const results = response.data.results || [];
        const count = response.data.count || results.length;
        
        setTenders(results);
        setTotalItems(count);
        setTotalPages(Math.ceil(count / itemsPerPage) || 1);
        setLastUpdate(new Date());
        lastFetchRef.current = new Date();
        setNewItemsCount(0);
      }
    } catch (err) {
      console.error('Error fetching tenders:', err);
      setError(err.response?.data?.message || 'خطا در دریافت مناقصات');
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, currentPage, itemsPerPage, getAuthHeaders]);

  // دریافت آمار
  const fetchStats = useCallback(async () => {
    try {
      const url = Config.endpoints.setad.stats();
      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });
      if (response.data.status === 'success') {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [getAuthHeaders]);

  // تابع بروزرسانی خودکار (فقط موارد جدید)
  const checkForUpdates = useCallback(async () => {
    try {
      const url = Config.endpoints.setad.latest({
        since: lastFetchRef.current?.toISOString(),
      });

      const response = await axios.get(url, {
        headers: getAuthHeaders(),
      });

      if (response.data.status === 'success' && response.data.results?.length > 0) {
        const newTenders = response.data.results;
        
        setTenders(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNew = newTenders.filter(t => !existingIds.has(t.id));
          const combined = [...uniqueNew, ...prev];
          return combined.slice(0, itemsPerPage);
        });

        setNewItemsCount(newTenders.length);
        setLastUpdate(new Date());
        lastFetchRef.current = new Date();
        fetchStats();
      }
    } catch (err) {
      console.error('Error checking for updates:', err);
    }
  }, [getAuthHeaders, fetchStats, itemsPerPage]);

  // تغییر صفحه
  const goToPage = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    setCurrentPage(page);
  };

  // تغییر تعداد آیتم‌ها در هر صفحه
  const changeItemsPerPage = (newSize) => {
    setItemsPerPage(newSize);
    setCurrentPage(1);
  };

  // جستجو با دیبونس (تاخیر)
  const handleSearch = (value) => {
    setSearchTerm(value);
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      fetchTenders();
    }, 500);
  };

  // بارگذاری اولیه
  useEffect(() => {
    fetchTenders();
    fetchStats();

    intervalRef.current = setInterval(() => {
      checkForUpdates();
    }, 10 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchTenders, fetchStats, checkForUpdates]);

  // وقتی فیلترها تغییر می‌کنند، به صفحه اول برو
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  // وقتی صفحه یا تعداد آیتم‌ها تغییر می‌کند، دوباره دریافت کن
  useEffect(() => {
    if (currentPage > 0) {
      fetchTenders();
    }
  }, [currentPage, itemsPerPage]);

  // اعمال فیلترها
  const applyFilters = () => {
    setCurrentPage(1);
    fetchTenders();
  };

  // ریست فیلترها
  const resetFilters = () => {
    setFilters({
      status: 'all',
      province: 'all',
      organization: 'all',
      type: 'all',
    });
    setSearchTerm('');
    setCurrentPage(1);
    fetchTenders();
  };

  // فرمت تاریخ
  const formatDate = (date) => {
    if (!date) return '-';
    const d = new Date(date);
    if (language === 'fa') {
      return d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('en-US') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // لیست گزینه‌های منحصربه‌فرد
  const uniqueOptions = (key) => {
    const values = tenders
      .map(t => t[key])
      .filter(v => v && v !== '');
    return [...new Set(values)];
  };

  // تولید اعداد صفحات
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  // محاسبه محدوده نمایش
  const getDisplayRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  const { start, end } = getDisplayRange();

  return (
    <div className={styles.setadPage}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>
              <Award className={styles.titleIcon} size={28} />
              {t.title}
            </h1>
            <p className={styles.subtitle}>{t.subtitle}</p>
          </div>
          <div className={styles.headerRight}>
            <button 
              className={styles.filterBtn}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              <span>{t.filters}</span>
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <FileText className={styles.statIcon} size={20} />
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.total || 0}</span>
                <span className={styles.statLabel}>کل مناقصات</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <CheckCircle className={styles.statIcon} size={20} style={{ color: '#34c759' }} />
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.active || 0}</span>
                <span className={styles.statLabel}>فعال</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <Building className={styles.statIcon} size={20} style={{ color: '#007aff' }} />
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.organizations || 0}</span>
                <span className={styles.statLabel}>دستگاه‌ها</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <MapPin className={styles.statIcon} size={20} style={{ color: '#ff9500' }} />
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stats.provinces || 0}</span>
                <span className={styles.statLabel}>استان‌ها</span>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className={styles.searchSection}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button 
                className={styles.clearSearch}
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                  fetchTenders();
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button className={styles.searchSubmit} onClick={applyFilters}>
            جستجو
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filtersGrid}>
              <div className={styles.filterGroup}>
                <label>وضعیت</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="all">همه</option>
                  <option value="active">فعال</option>
                  <option value="inactive">غیرفعال</option>
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>استان</label>
                <select 
                  value={filters.province}
                  onChange={(e) => setFilters({ ...filters, province: e.target.value })}
                >
                  <option value="all">همه</option>
                  {uniqueOptions('province').map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>دستگاه اجرایی</label>
                <select 
                  value={filters.organization}
                  onChange={(e) => setFilters({ ...filters, organization: e.target.value })}
                >
                  <option value="all">همه</option>
                  {uniqueOptions('organization').slice(0, 50).map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>
              <div className={styles.filterGroup}>
                <label>نوع مناقصه</label>
                <select 
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                >
                  <option value="all">همه</option>
                  {uniqueOptions('tender_type').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.filterActions}>
              <button className={styles.applyFilters} onClick={applyFilters}>
                اعمال فیلترها
              </button>
              <button className={styles.resetFilters} onClick={resetFilters}>
                {t.clearFilters}
              </button>
            </div>
          </div>
        )}

        {/* Update Info */}
        <div className={styles.updateInfo}>
          <Clock size={14} />
          <span>
            {t.lastUpdate}: {lastUpdate ? formatDate(lastUpdate) : '...'}
          </span>
          {newItemsCount > 0 && (
            <span className={styles.newBadge}>
              +{newItemsCount} {t.newItems}
            </span>
          )}
          <span className={styles.autoUpdateBadge}>
            🔄 {t.autoUpdate}
          </span>
        </div>

        {/* Tenders List */}
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>{t.loading}</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertCircle size={48} />
            <h3>{t.error}</h3>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={() => fetchTenders()}>
              {t.retry}
            </button>
          </div>
        ) : tenders.length === 0 ? (
          <div className={styles.emptyState}>
            <FileText size={48} />
            <h3>{t.noResults}</h3>
          </div>
        ) : (
          <>
            <div className={styles.tendersGrid}>
              {tenders.map((tender) => (
                <div key={tender.id} className={styles.tenderCard}>
                  <div className={styles.tenderHeader}>
                    <div className={styles.tenderNumber}>
                      <span className={styles.numberLabel}>شماره:</span>
                      <span className={styles.numberValue}>{tender.tender_no}</span>
                    </div>
                    <span className={`${styles.statusBadge} ${tender.is_active ? styles.active : styles.inactive}`}>
                      {tender.is_active ? t.status.active : t.status.inactive}
                    </span>
                  </div>

                  <h3 className={styles.tenderTitle}>
                    {tender.title}
                  </h3>

                  {tender.description && (
                    <p className={styles.tenderDescription}>
                      {tender.description.length > 150 
                        ? tender.description.substring(0, 150) + '...' 
                        : tender.description}
                    </p>
                  )}

                  <div className={styles.tenderMeta}>
                    {tender.organization && (
                      <span className={styles.metaItem}>
                        <Building size={14} />
                        {tender.organization}
                      </span>
                    )}
                    {tender.province && (
                      <span className={styles.metaItem}>
                        <MapPin size={14} />
                        {tender.province}{tender.city ? `، ${tender.city}` : ''}
                      </span>
                    )}
                    {tender.public_notification_date && (
                      <span className={styles.metaItem}>
                        <Calendar size={14} />
                        {formatDate(tender.public_notification_date)}
                      </span>
                    )}
                  </div>

                  <div className={styles.tenderFooter}>
                    <button 
                      className={styles.detailBtn}
                      onClick={() => setSelectedTender(tender)}
                    >
                      <Eye size={16} />
                      {t.details.viewDetails}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.paginationContainer}>
                <div className={styles.paginationInfo}>
                  {t.pagination.showing} {start} - {end} {t.pagination.of} {totalItems} {t.pagination.items}
                </div>

                <div className={styles.paginationControls}>
                  <select 
                    className={styles.pageSizeSelect}
                    value={itemsPerPage}
                    onChange={(e) => changeItemsPerPage(Number(e.target.value))}
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>
                        {size} {t.pagination.perPage}
                      </option>
                    ))}
                  </select>

                  <div className={styles.paginationButtons}>
                    <button
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className={styles.paginationButton}
                      title={t.pagination.first}
                    >
                      <ChevronsLeft size={18} />
                    </button>
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={styles.paginationButton}
                      title={t.pagination.previous}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && goToPage(page)}
                        className={`${styles.paginationButton} ${page === currentPage ? styles.activePage : ''} ${page === '...' ? styles.dots : ''}`}
                        disabled={page === '...'}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={styles.paginationButton}
                      title={t.pagination.next}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <button
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className={styles.paginationButton}
                      title={t.pagination.last}
                    >
                      <ChevronsRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal - بدون تغییر */}
        {selectedTender && (
          <div className={styles.modalOverlay} onClick={() => setSelectedTender(null)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{selectedTender.title}</h2>
                <button 
                  className={styles.modalClose}
                  onClick={() => setSelectedTender(null)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalGrid}>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.number}</span>
                    <span className={styles.fieldValue}>{selectedTender.tender_no}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.type}</span>
                    <span className={styles.fieldValue}>{selectedTender.tender_type || '-'}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.organization}</span>
                    <span className={styles.fieldValue}>{selectedTender.organization || '-'}</span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.province}</span>
                    <span className={styles.fieldValue}>
                      {selectedTender.province || '-'}
                      {selectedTender.city && ` - ${selectedTender.city}`}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.date}</span>
                    <span className={styles.fieldValue}>
                      {formatDate(selectedTender.public_notification_date)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.deadline}</span>
                    <span className={styles.fieldValue}>
                      {formatDate(selectedTender.documents_deadline_date)}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.financial}</span>
                    <span className={styles.fieldValue}>
                      {selectedTender.financial_estimate_price 
                        ? new Intl.NumberFormat('fa-IR').format(selectedTender.financial_estimate_price) 
                        : '-'}
                    </span>
                  </div>
                  <div className={styles.modalField}>
                    <span className={styles.fieldLabel}>{t.details.credit}</span>
                    <span className={styles.fieldValue}>
                      {selectedTender.credit_limit 
                        ? new Intl.NumberFormat('fa-IR').format(selectedTender.credit_limit) 
                        : '-'}
                    </span>
                  </div>
                  <div className={styles.modalFieldFull}>
                    <span className={styles.fieldLabel}>{t.details.description}</span>
                    <span className={styles.fieldValue}>
                      {selectedTender.description || selectedTender.domains_description || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetadPage;