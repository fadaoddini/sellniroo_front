// components/News/NewsList.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faSync, 
  faNewspaper,
  faClock,
  faCheck,
  faSpinner,
  faExclamationTriangle,
  faTags,
  faBriefcase
} from '@fortawesome/free-solid-svg-icons';
import newsService from '@/services/newsService';
import NewsCard from './NewsCard';
import NewsSkeleton from './NewsSkeleton';
import Pagination from './Pagination';
import { useAuth } from '@/contexts/AuthContext';
import styles from './News.module.css';

const NewsList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshStatus, setRefreshStatus] = useState('idle');
  const [refreshMessage, setRefreshMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const limit = 12;
  const isAdmin = user?.is_staff === true || user?.is_superuser === true;

  // 🔹 دریافت دسته‌بندی‌ها از سرور
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const result = await newsService.getCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchNews = useCallback(async (page = 1, search = '', category = 'all') => {
    setLoading(true);
    setError(null);

    try {
      const result = await newsService.getNews(page, limit, search, category);

      if (result.success) {
        setNews(result.data || []);
        setTotalCount(result.total || 0);
        setTotalPages(result.totalPages || 0);
        setError(null);
      } else {
        setError(result.error || 'خطا در دریافت محتوا');
        setNews([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('خطا در ارتباط با سرور');
      setNews([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    const page = parseInt(searchParams?.get('page') || '1', 10);
    const search = searchParams?.get('search') || '';
    const category = searchParams?.get('category') || 'all';
    const validPage = Math.max(1, isNaN(page) ? 1 : page);
    
    setCurrentPage(validPage);
    setSearchTerm(search);
    setSelectedCategory(category);
    fetchNews(validPage, search, category);
  }, [searchParams, fetchNews]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams || '');
    params.set('page', page);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    router.push(`/news?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router, searchParams, searchTerm, selectedCategory]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams || '');
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    params.set('page', '1');
    router.push(`/news?${params.toString()}`);
  }, [router, searchParams, searchTerm, selectedCategory]);

  const handleCategoryChange = useCallback((categorySlug) => {
    setSelectedCategory(categorySlug);
    const params = new URLSearchParams(searchParams || '');
    if (categorySlug !== 'all') {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    params.set('page', '1');
    router.push(`/news?${params.toString()}`);
  }, [router, searchParams, searchTerm]);

  // 🔹 بروزرسانی با تایم‌اوت ۵ دقیقه‌ای
  const handleRefresh = useCallback(async () => {
    if (refreshing || refreshStatus === 'running') return;
    
    setRefreshStatus('running');
    setRefreshing(true);
    setRefreshMessage('🔄 در حال اجرای اسکرپینگ...');
    setError(null);
    
    const TIMEOUT_MS = 300000;
    let timeoutId = null;
    let isTimeout = false;

    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          isTimeout = true;
          reject(new Error('TIMEOUT'));
        }, TIMEOUT_MS);
      });

      const scrapePromise = newsService.triggerScrape();
      const scrapeResult = await Promise.race([scrapePromise, timeoutPromise]);
      
      if (timeoutId) clearTimeout(timeoutId);

      if (isTimeout) {
        setRefreshStatus('error');
        setRefreshMessage('⏰ زمان بروزرسانی بیش از حد مجاز بود');
        setRefreshing(false);
        return;
      }

      if (!scrapeResult.success) {
        setRefreshStatus('error');
        setRefreshMessage('❌ ' + (scrapeResult.error || 'خطا در اجرای اسکرپینگ'));
        setError(scrapeResult.error || 'خطا در اجرای اسکرپینگ');
        setRefreshing(false);
        return;
      }

      setRefreshMessage('⏳ در حال پردازش محتوا جدید...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      setRefreshMessage('📰 در حال بارگذاری محتوا جدید...');
      
      const refreshPromise = newsService.refreshNews();
      const refreshResult = await Promise.race([refreshPromise, timeoutPromise]);
      
      if (timeoutId) clearTimeout(timeoutId);

      if (isTimeout) {
        setRefreshStatus('error');
        setRefreshMessage('⏰ زمان بروزرسانی بیش از حد مجاز بود');
        setRefreshing(false);
        return;
      }

      if (refreshResult.success) {
        await fetchCategories();
        await fetchNews(currentPage, searchTerm, selectedCategory);
        setRefreshStatus('success');
        const count = refreshResult.data?.count || refreshResult.data?.data?.length || 0;
        setRefreshMessage(`✅ بروزرسانی با موفقیت انجام شد (${count} محتوا جدید)`);
        
        setTimeout(() => {
          setRefreshStatus('idle');
          setRefreshMessage('');
        }, 4000);
      } else {
        setRefreshStatus('error');
        setRefreshMessage('❌ ' + (refreshResult.error || 'خطا در دریافت محتوا جدید'));
        setError(refreshResult.error || 'خطا در دریافت محتوا جدید');
      }
    } catch (err) {
      console.error('❌ خطا در بروزرسانی:', err);
      if (err.message === 'TIMEOUT') {
        setRefreshStatus('error');
        setRefreshMessage('⏰ زمان بروزرسانی بیش از حد مجاز بود');
      } else {
        setRefreshStatus('error');
        setRefreshMessage('❌ خطا در بروزرسانی محتوا');
        setError('خطا در بروزرسانی محتوا');
      }
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
      setRefreshing(false);
    }
  }, [currentPage, searchTerm, selectedCategory, fetchNews, fetchCategories]);

  const renderRefreshButton = () => {
    if (!isAdmin) return null;

    const statusConfigs = {
      idle: {
        icon: <FontAwesomeIcon icon={faSync} />,
        text: 'بروزرسانی',
        className: ''
      },
      running: {
        icon: <FontAwesomeIcon icon={faSpinner} spin />,
        text: 'در حال بروزرسانی...',
        className: styles.refreshBtnRunning
      },
      success: {
        icon: <FontAwesomeIcon icon={faCheck} />,
        text: 'بروزرسانی شد ✓',
        className: styles.refreshBtnSuccess
      },
      error: {
        icon: <FontAwesomeIcon icon={faExclamationTriangle} />,
        text: 'خطا!',
        className: styles.refreshBtnError
      }
    };

    const config = statusConfigs[refreshStatus] || statusConfigs.idle;
    
    return (
      <button 
        className={`${styles.refreshBtn} ${config.className}`}
        onClick={handleRefresh}
        disabled={refreshing || refreshStatus === 'running'}
      >
        {config.icon}
        {config.text}
      </button>
    );
  };

  const renderRefreshStatus = () => {
    if (!refreshMessage && refreshStatus === 'idle') return null;
    
    const statusClass = {
      running: styles.statusRunning,
      success: styles.statusSuccess,
      error: styles.statusError
    }[refreshStatus] || '';

    return (
      <div className={`${styles.refreshStatus} ${statusClass}`}>
        {refreshStatus === 'running' && <FontAwesomeIcon icon={faSpinner} spin />}
        {refreshStatus === 'success' && <FontAwesomeIcon icon={faCheck} />}
        {refreshStatus === 'error' && <FontAwesomeIcon icon={faExclamationTriangle} />}
        <span>{refreshMessage}</span>
      </div>
    );
  };

  // 🔹 نمایش دسته‌بندی‌های داینامیک
  const renderCategories = () => {
    if (loadingCategories) {
      return (
        <div className={styles.categoriesWrapper}>
          <div className={styles.categoriesLabel}>
            <FontAwesomeIcon icon={faTags} />
            <span>دسته‌بندی:</span>
          </div>
          <div className={styles.categoriesList}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.categorySkeleton} />
            ))}
          </div>
        </div>
      );
    }

    const allCategories = [
      { slug: 'all', name: 'همه' },
      ...categories
    ];

    if (allCategories.length <= 1) return null;

    return (
      <div className={styles.categoriesWrapper}>
        <div className={styles.categoriesLabel}>
          <FontAwesomeIcon icon={faTags} />
          <span>دسته‌بندی:</span>
        </div>
        <div className={styles.categoriesList}>
          {allCategories.map((cat) => (
            <button
              key={cat.slug}
              className={`${styles.categoryBtn} ${selectedCategory === cat.slug ? styles.categoryActive : ''}`}
              onClick={() => handleCategoryChange(cat.slug)}
            >
              {cat.name}
              {cat.slug !== 'all' && (
                <span className={styles.categoryCount}>
                  {news.filter(n => n.category_detail?.slug === cat.slug).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // ✅ حالت خالی
  if (!loading && !error && news.length === 0) {
    return (
      <div className={styles.newsContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faBriefcase} className={styles.headerIcon} />
           مجله
          </h1>
          {renderRefreshButton()}
        </div>
        {renderRefreshStatus()}
        {renderCategories()}
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faNewspaper} className={styles.emptyIcon} />
          <h3>هیچ محتوایی یافت نشد</h3>
          <p>با بروزرسانی صفحه، محتوا جدید دریافت کنید</p>
          {isAdmin && (
            <button className={styles.emptyBtn} onClick={handleRefresh}>
              <FontAwesomeIcon icon={faSync} />
              بروزرسانی
            </button>
          )}
        </div>
      </div>
    );
  }

  // ✅ حالت خطا
  if (error && !loading) {
    return (
      <div className={styles.newsContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faBriefcase} className={styles.headerIcon} />
مجله 
          </h1>
          {renderRefreshButton()}
        </div>
        {renderRefreshStatus()}
        {renderCategories()}
        <div className={styles.errorState}>
          <FontAwesomeIcon icon={faExclamationTriangle} className={styles.errorIcon} />
          <h3>خطا در دریافت محتوا</h3>
          <p>{error}</p>
          <button className={styles.errorBtn} onClick={() => fetchNews(currentPage, searchTerm, selectedCategory)}>
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.newsContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faBriefcase} className={styles.headerIcon} />

مجله
          </h1>
          <span className={styles.totalCount}>
            {totalCount} محتوا
          </span>
        </div>
        <div className={styles.headerRight}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="جستجو در محتوا..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn}>
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </form>
          {renderRefreshButton()}
        </div>
      </div>

      {renderRefreshStatus()}
      {renderCategories()}

      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <FontAwesomeIcon icon={faNewspaper} />
          <span>{totalCount}</span>
          <span>محتوا</span>
        </div>
        <div className={styles.statItem}>
          <FontAwesomeIcon icon={faClock} />
          <span>صفحه {currentPage} از {totalPages}</span>
        </div>
        {refreshStatus === 'success' && (
          <div className={`${styles.statItem} ${styles.statSuccess}`}>
            <FontAwesomeIcon icon={faCheck} />
            <span>بروزرسانی موفق</span>
          </div>
        )}
        {refreshStatus === 'running' && (
          <div className={`${styles.statItem} ${styles.statRunning}`}>
            <FontAwesomeIcon icon={faSpinner} spin />
            <span>در حال بروزرسانی...</span>
          </div>
        )}
      </div>

      {loading ? (
        <NewsSkeleton count={limit} />
      ) : (
        <>
          <div className={styles.newsGrid}>
            {news.map((item, index) => (
              <NewsCard 
                key={item.slug || item.id || index}
                news={item} 
                index={index} 
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default NewsList;