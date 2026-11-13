// modules/gym/components/BodybuildingDashboard.jsx
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Users, Dumbbell, Clock, Activity,
  UserCog, Bell, ShoppingBag, Loader2, RefreshCw, BookOpen,
} from 'lucide-react';
import styles from './BodybuildingDashboard.module.css';

import axios from 'axios';
import Config from '@/config/config';
import { useBodybuildingApi } from '@/hooks/useBodybuildingApi';
import { useAuth } from '@/contexts/AuthContext';
import { formatJalaliDate } from '@/utils/dateUtils';

import WorkoutManager from './WorkoutManager';
import DietManager from './DietManager';

import OverviewTab from './tabs/OverviewTab';
import UsersTab from './tabs/UsersTab';
import PackagesTab from './tabs/PackagesTab';
import SessionsTab from './tabs/SessionsTab';
import TrainersTab from './tabs/TrainersTab';
import AlertsTab from './tabs/AlertsTab';
import ProductsTab from './tabs/ProductsTab';
import LibraryTab from './tabs/LibraryTab';

import AddUserModal from './modals/AddUserModal';
import EditUserModal from './modals/EditUserModal';
import UserDetailModal from './modals/UserDetailModal';
import AddPackageModal from './modals/AddPackageModal';
import EditPackageModal from './modals/EditPackageModal';
import AddSessionModal from './modals/AddSessionModal';
import AddTrainerModal from './modals/AddTrainerModal';
import AddProductModal from './modals/AddProductModal';
import EditProductModal from './modals/EditProductModal';
import ChargeSmsModal from './modals/ChargeSmsModal';

const VALID_SECTIONS = new Set([
  'overview',
  'users',
  'packages',
  'sessions',
  'trainers',
  'products',
  'library',
  'alerts',
]);

export default function BodybuildingDashboard({
  businessSlug: propSlug,
  embedded = false,
  initialSection = 'overview',
  onSectionChange = null,
}) {
  const { isAuthenticated, loading: authLoading, getAuthHeaders, user } = useAuth();
  const [resolvedSlug, setResolvedSlug] = useState(propSlug || null);
  const [resolvingSite, setResolvingSite] = useState(!propSlug);
  const api = useBodybuildingApi(resolvedSlug);

  // ✅ نگه‌داشتن آخرین api در ref برای جلوگیری از loop
  const apiRef = useRef(api);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  // ===== State =====
  const startSection = VALID_SECTIONS.has(initialSection)
    ? initialSection
    : 'overview';
  const [activeTab, setActiveTab] = useState(startSection);

  useEffect(() => {
    if (VALID_SECTIONS.has(initialSection) && initialSection !== activeTab) {
      setActiveTab(initialSection);
    }
    // فقط وقتی section از بیرون عوض می‌شود
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSection]);

  const changeSection = useCallback(
    (id) => {
      if (!VALID_SECTIONS.has(id)) return;
      setActiveTab(id);
      if (typeof onSectionChange === 'function') onSectionChange(id);
    },
    [onSectionChange],
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Data
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [products, setProducts] = useState([]);
  const [smsPanelInfo, setSmsPanelInfo] = useState(null);
  const [alerts, setAlerts] = useState({ expiring_soon: [], expired: [] });
  const [businessInfo, setBusinessInfo] = useState(null);  // ✅ اضافه شد

  // Loading
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Modals
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [showEditPackageModal, setShowEditPackageModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showChargeSmsModal, setShowChargeSmsModal] = useState(false);

  // Workout / Diet
  const [showWorkoutManager, setShowWorkoutManager] = useState(false);
  const [selectedUserForWorkout, setSelectedUserForWorkout] = useState(null);
  const [showDietManager, setShowDietManager] = useState(false);
  const [selectedUserForDiet, setSelectedUserForDiet] = useState(null);

  // Filters
  const [genderFilter, setGenderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // ============================================================
  // Load All Data
  // ============================================================
  const loadAll = useCallback(async (silent = false) => {
    const api = apiRef.current;
    if (!api) return;

    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      console.log('🚀 Loading dashboard for:', resolvedSlug);

      const results = await Promise.allSettled([
        api.getStats(),
        api.members.list(),
        api.packages.list(),
        api.sessions.list(),
        api.trainers.list(),
        api.products.list(),
        api.sms.panel(),
        api.members.alerts(),
        api.getBusinessInfo(),  // ✅ اضافه شد
      ]);

      const [
        statsRes, usersRes, packagesRes, sessionsRes,
        trainersRes, productsRes, smsRes, alertsRes,
        businessInfoRes,  // ✅ اضافه شد
      ] = results;

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value);
      } else {
        console.error('❌ Stats failed:', statsRes.reason?.response?.data || statsRes.reason?.message);
      }

      if (usersRes.status === 'fulfilled') {
        const d = usersRes.value;
        setUsers(Array.isArray(d) ? d : d.results || []);
      } else {
        console.error('❌ Users failed:', usersRes.reason?.response?.data || usersRes.reason?.message);
      }

      if (packagesRes.status === 'fulfilled') {
        const d = packagesRes.value;
        setPackages(Array.isArray(d) ? d : d.results || []);
      } else {
        console.error('❌ Packages failed:', packagesRes.reason?.response?.data || packagesRes.reason?.message);
      }

      if (sessionsRes.status === 'fulfilled') {
        const d = sessionsRes.value;
        setSessions(Array.isArray(d) ? d : d.results || []);
      } else {
        console.error('❌ Sessions failed:', sessionsRes.reason?.response?.data || sessionsRes.reason?.message);
      }

      if (trainersRes.status === 'fulfilled') {
        const d = trainersRes.value;
        setTrainers(Array.isArray(d) ? d : d.results || []);
      } else {
        console.error('❌ Trainers failed:', trainersRes.reason?.response?.data || trainersRes.reason?.message);
      }

      if (productsRes.status === 'fulfilled') {
        const d = productsRes.value;
        setProducts(Array.isArray(d) ? d : d.results || []);
      } else {
        console.error('❌ Products failed:', productsRes.reason?.response?.data || productsRes.reason?.message);
      }

      if (smsRes.status === 'fulfilled') {
        setSmsPanelInfo(smsRes.value);
      } else {
        console.error('❌ SMS failed:', smsRes.reason?.response?.data || smsRes.reason?.message);
      }

      if (alertsRes.status === 'fulfilled') {
        setAlerts(alertsRes.value);
      } else {
        console.error('❌ Alerts failed:', alertsRes.reason?.response?.data || alertsRes.reason?.message);
      }

      // ✅ BusinessInfo
      if (businessInfoRes.status === 'fulfilled') {
        setBusinessInfo(businessInfoRes.value);
        console.log('✅ BusinessInfo loaded:', businessInfoRes.value);
      } else {
        console.error('❌ BusinessInfo failed:', businessInfoRes.reason?.response?.data || businessInfoRes.reason?.message);
      }

      const allFailed = results.every((r) => r.status === 'rejected');
      if (allFailed) {
        setError('خطا در دریافت اطلاعات. لطفاً دوباره تلاش کنید.');
      }
    } catch (err) {
      console.error('❌ Load error:', err);
      setError('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [resolvedSlug]);

  // بدون slug → باشگاه سطح‌سایت را برای مدیر/سوپریوزر بساز/بگیر (بدون اشتراک)
  useEffect(() => {
    let cancelled = false;

    const resolve = async () => {
      if (propSlug) {
        setResolvedSlug(propSlug);
        setResolvingSite(false);
        return;
      }
      if (authLoading) return;

      if (!isAuthenticated) {
        setResolvedSlug(null);
        setResolvingSite(false);
        setLoading(false);
        setError('برای ورود به داشبورد باشگاه ابتدا وارد حساب شوید.');
        return;
      }

      const canManage =
        !!user?.is_superuser || !!user?.is_staff || !!user?.is_staff_user;
      if (!canManage) {
        setResolvedSlug(null);
        setResolvingSite(false);
        setLoading(false);
        setError('فقط مدیر یا سوپریوزر سایت به مدیریت باشگاه دسترسی دارد.');
        return;
      }

      try {
        setResolvingSite(true);
        const res = await axios.get(
          Config.endpoints.bodybuilding.siteBusiness(),
          { headers: getAuthHeaders() },
        );
        if (cancelled) return;
        const slug = res.data?.slug;
        if (!slug) throw new Error('slug missing');
        setResolvedSlug(slug);
      } catch (err) {
        if (cancelled) return;
        setResolvedSlug(null);
        setLoading(false);
        setError(
          err.response?.data?.detail ||
            'خطا در آماده‌سازی باشگاه سایت. اشتراک لازم نیست؛ با حساب مدیر وارد شوید.',
        );
      } finally {
        if (!cancelled) setResolvingSite(false);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [
    propSlug,
    authLoading,
    isAuthenticated,
    user,
    getAuthHeaders,
    embedded,
  ]);

  useEffect(() => {
    if (resolvedSlug) {
      loadAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSlug]);

  // ============================================================
  // Stats
  // ============================================================
  const computedStats = useMemo(() => {
    if (!stats) {
      return {
        totalUsers: 0, activeUsers: 0, totalPackages: 0, totalSessions: 0,
        totalTrainers: 0, totalProducts: 0, expiringSoon: 0, expired: 0,
        goldMembers: 0, silverMembers: 0, bronzeMembers: 0,
      };
    }
    return {
      totalUsers: stats.total_users,
      activeUsers: stats.active_users,
      totalPackages: stats.total_packages,
      totalSessions: stats.total_sessions,
      totalTrainers: stats.total_trainers,
      totalProducts: stats.total_products,
      expiringSoon: stats.expiring_soon,
      expired: stats.expired,
      goldMembers: stats.gold_members,
      silverMembers: stats.silver_members,
      bronzeMembers: stats.bronze_members,
    };
  }, [stats]);

  // ============================================================
  // ✅ planInfo (از businessInfo ساخته می‌شه)
  // ============================================================
  // ============================================================
  // ✅ planInfo (از businessInfo ساخته می‌شه)
  // ============================================================
  const planInfo = useMemo(() => {
    // حالت سایت: بدون اشتراک — دسترسی کامل مدیر
    if (businessInfo?.full_access || businessInfo?.subscription_required === false) {
      return {
        level: 'gold',
        name: 'دسترسی کامل سایت',
        icon: 'Gold',
        startDate: '—',
        expirationDate: 'بدون انقضا',
        daysRemaining: 3650,
        totalDays: 3650,
        currentUsers: businessInfo.business_users_count || 0,
        maxUsers: 0,
        features: [
          { title: 'اعضا، بسته، سانس و مربی', active: true },
          { title: 'برنامه تمرینی و غذایی', active: true },
          { title: 'هشدار و پنل پیامکی', active: true },
          { title: 'بدون خرید اشتراک', active: true },
        ],
      };
    }

    if (!businessInfo?.current_subscription) return null;

    const sub = businessInfo.current_subscription;
    const plan = sub.plan_detail || {};
    const planName = plan.name || sub.plan_name || 'پلن نامشخص';
    const planSlug = plan.slug || sub.plan_slug || '';

    const endDate = new Date(sub.end_date);
    const startDate = new Date(sub.start_date);
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    const totalDays = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));

    let level = 'silver';
    const slugLower = planSlug.toLowerCase();
    const nameLower = planName.toLowerCase();

    if (slugLower === 'gold' || nameLower.includes('طلای')) level = 'gold';
    else if (slugLower === 'silver' || nameLower.includes('نقره')) level = 'silver';
    else if (slugLower === 'bronze' || nameLower.includes('برنز')) level = 'bronze';
    else if (plan.color === '#ffd700') level = 'gold';
    else if (plan.color === '#c0c0c0') level = 'silver';
    else if (plan.color === '#cd7f32') level = 'bronze';

    let features = [];
    if (Array.isArray(plan.features) && plan.features.length > 0) {
      features = plan.features.map((f) => ({
        title: typeof f === 'string' ? f : (f.title || String(f)),
        active: typeof f === 'object' ? (f.active !== false) : true,
      }));
    } else {
      features = [
        { title: `تا ${sub.max_users_snapshot || plan.max_users || 'نامحدود'} کاربر`, active: true },
        { title: `فضای ${sub.max_storage_mb_snapshot || plan.max_storage_mb || 'نامحدود'} مگابایت`, active: true },
        { title: 'مدیریت کاربران', active: true },
        { title: 'برنامه تمرینی و غذایی', active: true },
        { title: 'پشتیبانی', active: true },
      ];
    }

    return {
      level,
      name: planName,
      icon: level === 'gold' ? 'Gold' : level === 'silver' ? 'Silver' : 'Bronze',
      startDate: formatJalaliDate(sub.start_date),
      expirationDate: formatJalaliDate(sub.end_date),
      daysRemaining,
      totalDays,
      currentUsers: businessInfo.business_users_count || 0,
      maxUsers: sub.max_users_snapshot || plan.max_users || 0,
      features,
    };
  }, [businessInfo]);

  // ============================================================
  // Filtered Users
  // ============================================================
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        !searchQuery ||
        user.full_name?.includes(searchQuery) ||
        user.phone?.includes(searchQuery);
      const matchGender = genderFilter === 'all' || user.gender === genderFilter;
      const matchStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchSearch && matchGender && matchStatus;
    });
  }, [users, searchQuery, genderFilter, statusFilter]);

  // ============================================================
  // Handlers
  // ============================================================
  const handleToggleMemberStatus = async (id) => {
    try {
      const updated = await api.members.toggleStatus(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert('خطا در تغییر وضعیت');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('آیا از حذف این کاربر مطمئن هستید؟')) return;
    try {
      await api.members.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      alert('خطا در حذف کاربر');
    }
  };

  const handleAddMember = async (form) => {
    try {
      const created = await api.members.create(form);
      setUsers((prev) => [created, ...prev]);
      setShowAddUserModal(false);
      loadAll(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن کاربر');
    }
  };

  const handleUpdateMember = async (form) => {
    try {
      const updated = await api.members.update(form.id, form);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در ویرایش');
    }
  };

  const handleAddPackage = async (form) => {
    try {
      const created = await api.packages.create(form);
      setPackages((prev) => [created, ...prev]);
      setShowAddPackageModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن بسته');
    }
  };

  const handleUpdatePackage = async (form) => {
    try {
      const updated = await api.packages.update(form.id, form);
      setPackages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setShowEditPackageModal(false);
      setSelectedPackage(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در ویرایش');
    }
  };

  const handleDeletePackage = async (id) => {
    if (!confirm('آیا از حذف این بسته مطمئن هستید؟')) return;
    try {
      await api.packages.delete(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('خطا در حذف');
    }
  };

  const handleAddSession = async (form) => {
    try {
      const created = await api.sessions.create(form);
      setSessions((prev) => [...prev, created]);
      setShowAddSessionModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن سانس');
    }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('حذف سانس؟')) return;
    try {
      await api.sessions.delete(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('خطا در حذف');
    }
  };

  const handleAddTrainer = async (form) => {
    try {
      const created = await api.trainers.create(form);
      setTrainers((prev) => [created, ...prev]);
      setShowAddTrainerModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن مربی');
    }
  };

  const handleToggleTrainerStatus = async (id) => {
    try {
      const updated = await api.trainers.toggleStatus(id);
      setTrainers((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      alert('خطا در تغییر وضعیت');
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (!confirm('حذف مربی؟')) return;
    try {
      await api.trainers.delete(id);
      setTrainers((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert('خطا در حذف');
    }
  };

  const handleAddProduct = async (form) => {
    try {
      const created = await api.products.create(form);
      setProducts((prev) => [created, ...prev]);
      setShowAddProductModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن محصول');
    }
  };

  const handleUpdateProduct = async (form) => {
    try {
      const updated = await api.products.update(form.id, form);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setShowEditProductModal(false);
      setSelectedProduct(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در ویرایش');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('حذف محصول؟')) return;
    try {
      await api.products.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('خطا در حذف');
    }
  };

  const handleChargeSms = async (amount) => {
    try {
      const result = await api.sms.charge(amount);
      setSmsPanelInfo(result.panel);
      setShowChargeSmsModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در شارژ');
    }
  };

  // ============================================================
  // Tabs
  // ============================================================
  const tabs = [
    { id: 'overview', label: 'نمای کلی', icon: Activity },
    { id: 'users', label: 'کاربران', icon: Users },
    { id: 'packages', label: 'بسته‌ها', icon: Dumbbell },
    { id: 'sessions', label: 'سانس‌ها', icon: Clock },
    { id: 'trainers', label: 'مربیان', icon: UserCog },
    { id: 'products', label: 'محصولات', icon: ShoppingBag },
    { id: 'library', label: 'کتابخانه', icon: BookOpen },
    {
      id: 'alerts',
      label: 'هشدارها',
      icon: Bell,
      badge: computedStats.expiringSoon + computedStats.expired,
    },
  ];

  // ============================================================
  // Render Tab
  // ============================================================
  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            stats={computedStats}
            setActiveTab={changeSection}
            planInfo={planInfo}
            smsPanelInfo={smsPanelInfo}
            onChargeSms={() => setShowChargeSmsModal(true)}
          />
        );
      case 'users':
        return (
          <UsersTab
            users={users}
            filteredUsers={filteredUsers}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            genderFilter={genderFilter}
            setGenderFilter={setGenderFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            onToggleStatus={handleToggleMemberStatus}
            onDelete={handleDeleteMember}
            onView={(u) => {
              setSelectedUser(u);
              setShowUserDetailModal(true);
            }}
            onEdit={(u) => {
              setSelectedUser(u);
              setShowEditUserModal(true);
            }}
            onAdd={() => setShowAddUserModal(true)}
          />
        );
      case 'packages':
        return (
          <PackagesTab
            packages={packages}
            sessions={sessions}
            onAdd={() => setShowAddPackageModal(true)}
            onEdit={(pkg) => {
              setSelectedPackage(pkg);
              setShowEditPackageModal(true);
            }}
            onDelete={handleDeletePackage}
          />
        );
      case 'sessions':
        return (
          <SessionsTab
            sessions={sessions}
            onAdd={() => setShowAddSessionModal(true)}
            onDelete={handleDeleteSession}
          />
        );
      case 'trainers':
        return (
          <TrainersTab
            trainers={trainers}
            onAdd={() => setShowAddTrainerModal(true)}
            onToggleStatus={handleToggleTrainerStatus}
            onDelete={handleDeleteTrainer}
          />
        );
      case 'products':
        return (
          <ProductsTab
            products={products}
            onAdd={() => setShowAddProductModal(true)}
            onEdit={(product) => {
              setSelectedProduct(product);
              setShowEditProductModal(true);
            }}
            onDelete={handleDeleteProduct}
          />
        );
      case 'library':
        return <LibraryTab api={api} />;
      case 'alerts':
        return (
          <AlertsTab
            alerts={alerts}
            onView={(user) => {
              setSelectedUser(user);
              setShowUserDetailModal(true);
            }}
            onRefresh={() => loadAll(true)}
          />
        );
      default:
        return null;
    }
  };

  // ============================================================
  // Loading / Error
  // ============================================================
  if (loading || authLoading || resolvingSite) {
    return (
      <div className={`gymBbTheme ${styles.dashboard}`}>
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={48} />
          <p>در حال دریافت اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const loginHref = `/login?next=${encodeURIComponent('/gym/profile?tab=manage')}`;
    return (
      <div className={`gymBbTheme ${styles.dashboard} ${embedded ? styles.dashboardEmbedded : ''}`}>
        <div className={styles.errorState}>
          <p>{error}</p>
          {resolvedSlug ? (
            <button type="button" onClick={() => loadAll()}>
              تلاش مجدد
            </button>
          ) : !isAuthenticated ? (
            <Link href={loginHref} className={styles.backLink}>
              ورود به حساب
            </Link>
          ) : (
            <Link href="/gym/profile" className={styles.backLink}>
              <ArrowLeft size={18} />
              رفتن به صفحه باشگاه
            </Link>
          )}
        </div>
      </div>
    );
  }

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className={`gymBbTheme ${styles.dashboard} ${embedded ? styles.dashboardEmbedded : ''}`}>
      {!embedded ? (
        <div className={styles.dashboardHeader}>
          <div className={styles.dashboardHeaderContent}>
            <Link href="/gym/profile" className={styles.backLink}>
              <ArrowLeft size={18} />
              رفتن به پروفایل باشگاه
            </Link>
            <div className={styles.dashboardHeaderMain}>
              <div>
                <h1 className={styles.dashboardTitle}>
                  مدیریت باشگاه بدنسازی
                </h1>
                <p className={styles.dashboardSubtitle}>
                  این مسیر به پروفایل منتقل شده است
                </p>
              </div>
              <div className={styles.dashboardHeaderStats}>
                <span className={styles.headerStat}>
                  <Users size={14} />
                  {computedStats.totalUsers}
                </span>
                <span className={styles.headerStat}>
                  <Dumbbell size={14} />
                  {computedStats.totalPackages}
                </span>
                <span className={styles.headerStat}>
                  <Clock size={14} />
                  {computedStats.totalSessions}
                </span>
                <span className={styles.headerStat}>
                  <ShoppingBag size={14} />
                  {computedStats.totalProducts}
                </span>
                <button
                  className={styles.refreshBtn}
                  onClick={() => loadAll(true)}
                  disabled={refreshing}
                  title="بروزرسانی"
                >
                  <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.embeddedToolbar}>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={() => loadAll(true)}
            disabled={refreshing}
            title="بروزرسانی"
          >
            <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
            بروزرسانی
          </button>
          <div className={styles.embeddedStats}>
            <span>{computedStats.totalUsers} عضو</span>
            <span>{computedStats.totalPackages} بسته</span>
            <span>{computedStats.totalSessions} سانس</span>
          </div>
        </div>
      )}

      {/* تب‌ها */}
      <div className={styles.dashboardTabs}>
        <div className={styles.tabsNav}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`${styles.tabNavItem} ${
                  isActive ? styles.tabNavItemActive : ''
                }`}
                onClick={() => changeSection(tab.id)}
              >
                <Icon size={18} />
                {tab.label}
                {tab.badge > 0 && (
                  <span className={styles.alertBadge}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className={styles.tabsContent}>{renderTab()}</div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        onAdd={handleAddMember}
        packages={packages}
        sessions={sessions}
        trainers={trainers}
      />

      <EditUserModal
        isOpen={showEditUserModal}
        onClose={() => {
          setShowEditUserModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleUpdateMember}
        packages={packages}
        sessions={sessions}
        trainers={trainers}
      />

      <UserDetailModal
        isOpen={showUserDetailModal}
        onClose={() => {
          setShowUserDetailModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        businessSlug={resolvedSlug}
        onOpenWorkout={(u) => {
          setSelectedUserForWorkout(u);
          setShowWorkoutManager(true);
        }}
        onOpenDiet={(u) => {
          setSelectedUserForDiet(u);
          setShowDietManager(true);
        }}
      />

      <AddPackageModal
        isOpen={showAddPackageModal}
        onClose={() => setShowAddPackageModal(false)}
        onAdd={handleAddPackage}
        sessions={sessions}
      />

      <EditPackageModal
        isOpen={showEditPackageModal}
        onClose={() => {
          setShowEditPackageModal(false);
          setSelectedPackage(null);
        }}
        pkg={selectedPackage}
        onSave={handleUpdatePackage}
        sessions={sessions}
      />

      <AddSessionModal
        isOpen={showAddSessionModal}
        onClose={() => setShowAddSessionModal(false)}
        onAdd={handleAddSession}
      />

      <AddTrainerModal
        isOpen={showAddTrainerModal}
        onClose={() => setShowAddTrainerModal(false)}
        onAdd={handleAddTrainer}
      />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAdd={handleAddProduct}
      />

      <EditProductModal
        isOpen={showEditProductModal}
        onClose={() => {
          setShowEditProductModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSave={handleUpdateProduct}
      />

      <ChargeSmsModal
        isOpen={showChargeSmsModal}
        onClose={() => setShowChargeSmsModal(false)}
        onCharge={handleChargeSms}
        smsPanelInfo={smsPanelInfo}
      />

      {/* Workout Manager */}
      {showWorkoutManager && (
        <div className={styles.workoutManagerOverlay}>
          <WorkoutManager
            businessSlug={resolvedSlug}
            userId={selectedUserForWorkout?.id}
            userName={selectedUserForWorkout?.full_name}
            onClose={() => {
              setShowWorkoutManager(false);
              setSelectedUserForWorkout(null);
            }}
            onSave={() => {
              setShowWorkoutManager(false);
              setSelectedUserForWorkout(null);
            }}
          />
        </div>
      )}

      {/* Diet Manager */}
      {showDietManager && (
        <div className={styles.workoutManagerOverlay}>
          <DietManager
            businessSlug={resolvedSlug}
            userId={selectedUserForDiet?.id}
            userName={selectedUserForDiet?.full_name}
            onClose={() => {
              setShowDietManager(false);
              setSelectedUserForDiet(null);
            }}
            onSave={() => {
              setShowDietManager(false);
              setSelectedUserForDiet(null);
            }}
          />
        </div>
      )}
    </div>
  );
}