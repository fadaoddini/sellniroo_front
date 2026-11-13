// modules/gym/components/BilliardDashboard.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  UserCog,
  Table,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  DollarSign,
  UserPlus,
  Shield,
  Send,
  Clock,
  Play,
  Square,
  User,
  Calendar,
  Timer,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Crown,
  Star,
} from 'lucide-react';
import styles from './BilliardDashboard.module.css';

// ============================================
// کامپوننت مودال
// ============================================
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${styles[`modal${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================
// کامپوننت اصلی داشبورد
// ============================================
export default function BilliardDashboard() {
  // ===== State Management =====
  const [activeTab, setActiveTab] = useState('tables');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showAssignTableModal, setShowAssignTableModal] = useState(false);
  const [showTableDetailModal, setShowTableDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [smsText, setSmsText] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [timerInterval, setTimerInterval] = useState(null);

  // ===== داده‌های نمونه =====
  const [users, setUsers] = useState([
    { id: 1, name: 'احمد رضایی', phone: '09123456789', email: 'ahmad@email.com', status: 'active', joinDate: '1403/01/15', membership: 'طلایی' },
    { id: 2, name: 'سارا محمدی', phone: '09123456788', email: 'sara@email.com', status: 'active', joinDate: '1403/02/20', membership: 'نقره‌ای' },
    { id: 3, name: 'علی کریمی', phone: '09123456787', email: 'ali@email.com', status: 'inactive', joinDate: '1403/03/10', membership: 'برنزی' },
    { id: 4, name: 'مریم حسینی', phone: '09123456786', email: 'maryam@email.com', status: 'active', joinDate: '1403/04/05', membership: 'نقره‌ای' },
    { id: 5, name: 'رضا نوری', phone: '09123456785', email: 'reza@email.com', status: 'active', joinDate: '1403/04/12', membership: 'طلایی' },
  ]);

  const [admins, setAdmins] = useState([
    { id: 1, name: 'مدیر اصلی', phone: '09123456780', email: 'admin@email.com', role: 'full', level: 'مدیر کل' },
    { id: 2, name: 'مدیر مالی', phone: '09123456781', email: 'finance@email.com', role: 'finance', level: 'مدیر مالی' },
    { id: 3, name: 'مدیر میزها', phone: '09123456782', email: 'tables@email.com', role: 'tables', level: 'مدیر میز' },
  ]);

  const [tables, setTables] = useState([
    { 
      id: 1, 
      name: 'میز شماره ۱', 
      costPerMinute: 2000, 
      status: 'available', 
      totalEarnings: 1250000, 
      todayEarnings: 45000,
      currentUser: null,
      startTime: null,
      elapsedMinutes: 0,
    },
    { 
      id: 2, 
      name: 'میز شماره ۲', 
      costPerMinute: 2500, 
      status: 'occupied', 
      totalEarnings: 980000, 
      todayEarnings: 32000,
      currentUser: { id: 2, name: 'سارا محمدی', phone: '09123456788' },
      startTime: new Date(Date.now() - 45 * 60000),
      elapsedMinutes: 45,
    },
    { 
      id: 3, 
      name: 'میز شماره ۳', 
      costPerMinute: 3000, 
      status: 'reserved', 
      totalEarnings: 1500000, 
      todayEarnings: 0,
      currentUser: { id: 4, name: 'مریم حسینی', phone: '09123456786' },
      startTime: new Date(Date.now() - 120 * 60000),
      elapsedMinutes: 120,
    },
    { 
      id: 4, 
      name: 'میز شماره ۴', 
      costPerMinute: 2000, 
      status: 'available', 
      totalEarnings: 750000, 
      todayEarnings: 28000,
      currentUser: null,
      startTime: null,
      elapsedMinutes: 0,
    },
    { 
      id: 5, 
      name: 'میز شماره ۵', 
      costPerMinute: 1500, 
      status: 'available', 
      totalEarnings: 450000, 
      todayEarnings: 15000,
      currentUser: null,
      startTime: null,
      elapsedMinutes: 0,
    },
  ]);

  // ===== آمار کلی =====
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalTables: tables.length,
    availableTables: tables.filter(t => t.status === 'available').length,
    occupiedTables: tables.filter(t => t.status === 'occupied').length,
    reservedTables: tables.filter(t => t.status === 'reserved').length,
    totalEarnings: tables.reduce((sum, t) => sum + t.totalEarnings, 0),
    todayEarnings: tables.reduce((sum, t) => sum + t.todayEarnings, 0),
  };

  // ===== تایمر برای به‌روزرسانی لحظه‌ای =====
  useEffect(() => {
    const interval = setInterval(() => {
      setTables(prevTables => 
        prevTables.map(table => {
          if (table.status === 'occupied' && table.startTime) {
            const elapsed = Math.floor((Date.now() - new Date(table.startTime).getTime()) / 60000);
            return { ...table, elapsedMinutes: elapsed };
          }
          return table;
        })
      );
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // ===== توابع مدیریت کاربران =====
  const toggleUserStatus = (id) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } : user
    ));
  };

  const deleteUser = (id) => {
    if (confirm('آیا از حذف این کاربر مطمئن هستید؟')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const addUser = () => {
    if (!newUserName.trim() || !newUserPhone.trim()) {
      alert('لطفاً نام و شماره تماس را وارد کنید.');
      return;
    }
    setUsers([...users, {
      id: users.length + 1,
      name: newUserName,
      phone: newUserPhone,
      email: newUserEmail || '-',
      status: 'active',
      joinDate: new Date().toLocaleDateString('fa-IR'),
      membership: 'برنزی',
    }]);
    setNewUserName('');
    setNewUserPhone('');
    setNewUserEmail('');
    setShowAddUserModal(false);
  };

  // ===== توابع مدیریت میزها =====
  const toggleTableStatus = (id) => {
    setTables(tables.map(table => 
      table.id === id ? { 
        ...table, 
        status: table.status === 'available' ? 'available' : 'available',
        currentUser: null,
        startTime: null,
        elapsedMinutes: 0,
      } : table
    ));
  };

  const deleteTable = (id) => {
    if (confirm('آیا از حذف این میز مطمئن هستید؟')) {
      setTables(tables.filter(table => table.id !== id));
    }
  };

  const calculatePerMinute = (hourlyCost) => {
    if (!hourlyCost || hourlyCost === 0) return 0;
    return Math.round(hourlyCost / 60);
  };

  const handleAddTable = () => {
    const name = prompt('نام میز جدید:');
    if (!name) return;
    const cost = prompt('هزینه هر ساعت (تومان):');
    if (!cost) return;
    const perMinute = calculatePerMinute(parseInt(cost));
    setTables([...tables, {
      id: tables.length + 1,
      name,
      costPerMinute: perMinute,
      status: 'available',
      totalEarnings: 0,
      todayEarnings: 0,
      currentUser: null,
      startTime: null,
      elapsedMinutes: 0,
    }]);
  };

  // ===== تابع اختصاص میز به کاربر =====
  const assignTableToUser = (tableId, userId) => {
    const table = tables.find(t => t.id === tableId);
    const user = users.find(u => u.id === userId);
    
    if (!table || !user) return;
    
    if (table.status !== 'available') {
      alert('این میز در حال حاضر در دسترس نیست.');
      return;
    }

    setTables(tables.map(t => 
      t.id === tableId ? {
        ...t,
        status: 'occupied',
        currentUser: { id: user.id, name: user.name, phone: user.phone },
        startTime: new Date(),
        elapsedMinutes: 0,
      } : t
    ));
    
    setShowAssignTableModal(false);
    setSelectedTable(null);
    setSelectedUser(null);
  };

  // ===== تابع آزاد کردن میز =====
  const freeTable = (tableId) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || table.status === 'available') return;

    const earnings = table.costPerMinute * table.elapsedMinutes;
    
    if (confirm(`آیا از آزاد کردن میز "${table.name}" مطمئن هستید؟\nمدت زمان: ${table.elapsedMinutes} دقیقه\nهزینه: ${earnings.toLocaleString()} تومان`)) {
      setTables(tables.map(t => 
        t.id === tableId ? {
          ...t,
          status: 'available',
          currentUser: null,
          startTime: null,
          elapsedMinutes: 0,
          totalEarnings: t.totalEarnings + earnings,
          todayEarnings: t.todayEarnings + earnings,
        } : t
      ));
    }
  };

  // ===== تابع رزرو میز =====
  const reserveTable = (tableId, userId) => {
    const table = tables.find(t => t.id === tableId);
    const user = users.find(u => u.id === userId);
    
    if (!table || !user) return;
    
    if (table.status !== 'available') {
      alert('این میز در حال حاضر در دسترس نیست.');
      return;
    }

    setTables(tables.map(t => 
      t.id === tableId ? {
        ...t,
        status: 'reserved',
        currentUser: { id: user.id, name: user.name, phone: user.phone },
        startTime: null,
        elapsedMinutes: 0,
      } : t
    ));
    
    setShowAssignTableModal(false);
    setSelectedTable(null);
    setSelectedUser(null);
  };

  // ===== تابع محاسبه درآمد لحظه‌ای =====
  const getCurrentEarnings = (table) => {
    if (table.status === 'occupied' && table.startTime) {
      const elapsed = Math.floor((Date.now() - new Date(table.startTime).getTime()) / 60000);
      return table.costPerMinute * elapsed;
    }
    return 0;
  };

  // ===== تابع‌های مدیریت پیامک =====
  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSendSMS = () => {
    if (!smsText.trim() || selectedUsers.length === 0) {
      alert('لطفاً متن پیامک و حداقل یک گیرنده را انتخاب کنید.');
      return;
    }
    alert(`پیامک به ${selectedUsers.length} نفر ارسال شد:\n${smsText}`);
    setSmsText('');
    setSelectedUsers([]);
    setSelectAll(false);
  };

  // ===== وضعیت میزها =====
  const getTableStatusInfo = (status) => {
    const statusMap = {
      available: { label: 'آزاد', icon: Check, className: 'statusAvailable', color: '#4ecdc4' },
      occupied: { label: 'اشغال', icon: Play, className: 'statusOccupied', color: '#ff6b6b' },
      reserved: { label: 'رزرو', icon: Clock, className: 'statusReserved', color: '#ffd93d' },
    };
    return statusMap[status] || statusMap.available;
  };

  // ===== رندر محتوای تب‌ها =====
  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return renderUsersTab();
      case 'admins':
        return renderAdminsTab();
      case 'tables':
        return renderTablesTab();
      case 'sms':
        return renderSMSTab();
      default:
        return null;
    }
  };

  // ===== تب کاربران =====
  const renderUsersTab = () => {
    const filteredUsers = users.filter(user =>
      user.name.includes(searchQuery) || user.phone.includes(searchQuery)
    );

    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <div className={styles.tabHeaderLeft}>
            <h3 className={styles.tabTitle}>
              <Users size={20} />
              مدیریت کاربران
            </h3>
            <span className={styles.tabCount}>{users.length} کاربر</span>
          </div>
          <div className={styles.tabHeaderRight}>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                type="text"
                placeholder="جستجوی کاربر..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className={styles.addButton}
              onClick={() => setShowAddUserModal(true)}
            >
              <UserPlus size={16} />
              کاربر جدید
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>نام</th>
                <th>شماره تماس</th>
                <th>ایمیل</th>
                <th>نوع عضویت</th>
                <th>تاریخ عضویت</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className={styles.userName}>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`${styles.membershipBadge} ${styles[user.membership]}`}>
                      {user.membership}
                    </span>
                  </td>
                  <td>{user.joinDate}</td>
                  <td>
                    <button
                      className={`${styles.statusToggle} ${styles[user.status]}`}
                      onClick={() => toggleUserStatus(user.id)}
                    >
                      {user.status === 'active' ? (
                        <><Check size={14} /> فعال</>
                      ) : (
                        <><X size={14} /> غیرفعال</>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => {
                          setSelectedItem(user);
                          setShowEditUserModal(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* مودال افزودن کاربر */}
        <Modal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          title="افزودن کاربر جدید"
        >
          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label>نام کامل</label>
              <input
                type="text"
                placeholder="نام کاربر را وارد کنید"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>شماره تماس</label>
              <input
                type="text"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={newUserPhone}
                onChange={(e) => setNewUserPhone(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>ایمیل (اختیاری)</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setShowAddUserModal(false)}>
                انصراف
              </button>
              <button className={styles.modalConfirm} onClick={addUser}>
                افزودن کاربر
              </button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  // ===== تب مدیران =====
  const renderAdminsTab = () => {
    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <div className={styles.tabHeaderLeft}>
            <h3 className={styles.tabTitle}>
              <UserCog size={20} />
              مدیریت مدیران
            </h3>
            <span className={styles.tabCount}>{admins.length} مدیر</span>
          </div>
          <button className={styles.addButton}>
            <UserPlus size={16} />
            مدیر جدید
          </button>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>نام</th>
                <th>شماره تماس</th>
                <th>ایمیل</th>
                <th>سطح دسترسی</th>
                <th>نقش</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className={styles.userName}>{admin.name}</td>
                  <td>{admin.phone}</td>
                  <td>{admin.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${styles[admin.role]}`}>
                      <Shield size={12} />
                      {admin.level}
                    </span>
                  </td>
                  <td>
                    <span className={styles.adminRole}>
                      {admin.role === 'full' ? 'مدیر کل' :
                       admin.role === 'finance' ? 'مدیر مالی' :
                       admin.role === 'tables' ? 'مدیر میز' : 'کاربر'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button className={styles.actionBtn}>
                        <Edit size={16} />
                      </button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ===== تب میزها =====
  const renderTablesTab = () => {
    const availableTables = tables.filter(t => t.status === 'available');
    const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'reserved');

    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <div className={styles.tabHeaderLeft}>
            <h3 className={styles.tabTitle}>
              <Table size={20} />
              مدیریت میزها
            </h3>
            <span className={styles.tabCount}>{tables.length} میز</span>
          </div>
          <button className={styles.addButton} onClick={handleAddTable}>
            <Plus size={16} />
            میز جدید
          </button>
        </div>

        {/* آمار سریع میزها */}
        <div className={styles.tablesStats}>
          <div className={styles.tableStat}>
            <span className={styles.tableStatLabel}>🟢 آزاد</span>
            <span className={styles.tableStatValue} style={{ color: '#4ecdc4' }}>
              {stats.availableTables}
            </span>
          </div>
          <div className={styles.tableStat}>
            <span className={styles.tableStatLabel}>🔴 اشغال</span>
            <span className={styles.tableStatValue} style={{ color: '#ff6b6b' }}>
              {stats.occupiedTables}
            </span>
          </div>
          <div className={styles.tableStat}>
            <span className={styles.tableStatLabel}>🟡 رزرو</span>
            <span className={styles.tableStatValue} style={{ color: '#ffd93d' }}>
              {stats.reservedTables}
            </span>
          </div>
          <div className={styles.tableStat}>
            <span className={styles.tableStatLabel}>💰 درآمد امروز</span>
            <span className={styles.tableStatValue} style={{ color: '#ffd700' }}>
              {stats.todayEarnings.toLocaleString()} تومان
            </span>
          </div>
        </div>

        {/* لیست میزها */}
        <div className={styles.tablesGrid}>
          {tables.map((table) => {
            const statusInfo = getTableStatusInfo(table.status);
            const StatusIcon = statusInfo.icon;
            const currentEarnings = getCurrentEarnings(table);
            const isOccupied = table.status === 'occupied' || table.status === 'reserved';

            return (
              <div key={table.id} className={`${styles.tableCard} ${styles[table.status]}`}>
                <div className={styles.tableCardHeader}>
                  <div className={styles.tableCardTitle}>
                    <Table size={18} />
                    <span>{table.name}</span>
                  </div>
                  <div className={styles.tableCardStatus}>
                    <span 
                      className={styles.statusIndicator}
                      style={{ backgroundColor: statusInfo.color }}
                    />
                    <span className={styles.statusLabel}>{statusInfo.label}</span>
                  </div>
                </div>

                <div className={styles.tableCardBody}>
                  <div className={styles.tableCardInfo}>
                    <div className={styles.tableCardInfoItem}>
                      <DollarSign size={14} />
                      <span>{table.costPerMinute.toLocaleString()} تومان/دقیقه</span>
                    </div>
                    <div className={styles.tableCardInfoItem}>
                      <Clock size={14} />
                      <span>{(table.costPerMinute * 60).toLocaleString()} تومان/ساعت</span>
                    </div>
                  </div>

                  {isOccupied && table.currentUser && (
                    <div className={styles.tableCardUser}>
                      <User size={14} />
                      <span>{table.currentUser.name}</span>
                      <span className={styles.tableCardUserPhone}>{table.currentUser.phone}</span>
                    </div>
                  )}

                  {table.status === 'occupied' && (
                    <div className={styles.tableCardEarnings}>
                      <div className={styles.earningItem}>
                        <Timer size={14} />
                        <span>{table.elapsedMinutes} دقیقه</span>
                      </div>
                      <div className={styles.earningItem}>
                        <TrendingUp size={14} />
                        <span style={{ color: '#ffd700' }}>
                          {currentEarnings.toLocaleString()} تومان
                        </span>
                      </div>
                    </div>
                  )}

                  {table.status === 'reserved' && table.currentUser && (
                    <div className={styles.tableCardReserved}>
                      <Clock size={14} />
                      <span>رزرو شده برای {table.currentUser.name}</span>
                    </div>
                  )}
                </div>

                <div className={styles.tableCardActions}>
                  {table.status === 'available' && (
                    <>
                      <button
                        className={`${styles.tableActionBtn} ${styles.tableActionAssign}`}
                        onClick={() => {
                          setSelectedTable(table);
                          setShowAssignTableModal(true);
                        }}
                      >
                        <UserPlus size={14} />
                        اختصاص به کاربر
                      </button>
                      <button
                        className={`${styles.tableActionBtn} ${styles.tableActionReserve}`}
                        onClick={() => {
                          setSelectedTable(table);
                          setShowAssignTableModal(true);
                        }}
                      >
                        <Clock size={14} />
                        رزرو
                      </button>
                    </>
                  )}

                  {(table.status === 'occupied' || table.status === 'reserved') && (
                    <button
                      className={`${styles.tableActionBtn} ${styles.tableActionFree}`}
                      onClick={() => freeTable(table.id)}
                    >
                      <Square size={14} />
                      آزاد کردن
                    </button>
                  )}

                  <button
                    className={`${styles.tableActionBtn} ${styles.tableActionDetail}`}
                    onClick={() => {
                      setSelectedTable(table);
                      setShowTableDetailModal(true);
                    }}
                  >
                    <Eye size={14} />
                    جزئیات
                  </button>

                  <button
                    className={`${styles.tableActionBtn} ${styles.tableActionDelete}`}
                    onClick={() => deleteTable(table.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* مودال اختصاص میز */}
        <Modal
          isOpen={showAssignTableModal}
          onClose={() => {
            setShowAssignTableModal(false);
            setSelectedTable(null);
            setSelectedUser(null);
          }}
          title={`اختصاص میز ${selectedTable?.name || ''}`}
          size="lg"
        >
          <div className={styles.modalAssignContent}>
            <p className={styles.modalAssignDesc}>
              کاربری را که می‌خواهید این میز را به او اختصاص دهید انتخاب کنید:
            </p>
            
            <div className={styles.modalAssignUsers}>
              {users.filter(u => u.status === 'active').map((user) => (
                <div
                  key={user.id}
                  className={`${styles.modalAssignUser} ${selectedUser === user.id ? styles.modalAssignUserSelected : ''}`}
                  onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                >
                  <div className={styles.modalAssignUserAvatar}>
                    <User size={20} />
                  </div>
                  <div className={styles.modalAssignUserInfo}>
                    <span className={styles.modalAssignUserName}>{user.name}</span>
                    <span className={styles.modalAssignUserPhone}>{user.phone}</span>
                  </div>
                  {selectedUser === user.id && (
                    <div className={styles.modalAssignUserCheck}>
                      <Check size={16} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.modalAssignActions}>
              <button
                className={styles.modalCancel}
                onClick={() => {
                  setShowAssignTableModal(false);
                  setSelectedTable(null);
                  setSelectedUser(null);
                }}
              >
                انصراف
              </button>
              <button
                className={`${styles.modalConfirm} ${!selectedUser ? styles.modalConfirmDisabled : ''}`}
                disabled={!selectedUser}
                onClick={() => {
                  if (selectedTable && selectedUser) {
                    // از کاربر بپرس که می‌خواهد اشغال کند یا رزرو
                    const choice = confirm('آیا می‌خواهید میز را اشغال کنید؟\n(برای رزرو کردن "انصراف" را بزنید)');
                    if (choice) {
                      assignTableToUser(selectedTable.id, selectedUser);
                    } else {
                      reserveTable(selectedTable.id, selectedUser);
                    }
                  }
                }}
              >
                {selectedUser ? (
                  <>
                    <Play size={16} />
                    اختصاص میز
                  </>
                ) : (
                  'کاربری انتخاب نشده'
                )}
              </button>
            </div>
          </div>
        </Modal>

        {/* مودال جزئیات میز */}
        <Modal
          isOpen={showTableDetailModal}
          onClose={() => {
            setShowTableDetailModal(false);
            setSelectedTable(null);
          }}
          title={`جزئیات ${selectedTable?.name || ''}`}
          size="lg"
        >
          {selectedTable && (
            <div className={styles.modalDetailContent}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>وضعیت</span>
                  <span className={`${styles.detailValue} ${styles[selectedTable.status]}`}>
                    {getTableStatusInfo(selectedTable.status).label}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>هزینه هر دقیقه</span>
                  <span className={styles.detailValue}>
                    {selectedTable.costPerMinute.toLocaleString()} تومان
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>هزینه هر ساعت</span>
                  <span className={styles.detailValue}>
                    {(selectedTable.costPerMinute * 60).toLocaleString()} تومان
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>کل درآمد</span>
                  <span className={styles.detailValue} style={{ color: '#ffd700' }}>
                    {selectedTable.totalEarnings.toLocaleString()} تومان
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>درآمد امروز</span>
                  <span className={styles.detailValue} style={{ color: '#ffd700' }}>
                    {selectedTable.todayEarnings.toLocaleString()} تومان
                  </span>
                </div>
                {selectedTable.status === 'occupied' && (
                  <>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>مدت زمان اشغال</span>
                      <span className={styles.detailValue}>
                        {selectedTable.elapsedMinutes} دقیقه
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>درآمد لحظه‌ای</span>
                      <span className={styles.detailValue} style={{ color: '#ff6b6b' }}>
                        {getCurrentEarnings(selectedTable).toLocaleString()} تومان
                      </span>
                    </div>
                  </>
                )}
                {selectedTable.currentUser && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>کاربر</span>
                    <span className={styles.detailValue}>
                      {selectedTable.currentUser.name}
                      <span className={styles.detailPhone}>
                        {selectedTable.currentUser.phone}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.detailActions}>
                {(selectedTable.status === 'occupied' || selectedTable.status === 'reserved') && (
                  <button
                    className={`${styles.tableActionBtn} ${styles.tableActionFree}`}
                    onClick={() => {
                      freeTable(selectedTable.id);
                      setShowTableDetailModal(false);
                    }}
                  >
                    <Square size={16} />
                    آزاد کردن میز
                  </button>
                )}
                <button
                  className={styles.modalCancel}
                  onClick={() => setShowTableDetailModal(false)}
                >
                  بستن
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  // ===== تب پیامک =====
  const renderSMSTab = () => {
    return (
      <div className={styles.tabContent}>
        <div className={styles.tabHeader}>
          <div className={styles.tabHeaderLeft}>
            <h3 className={styles.tabTitle}>
              <MessageSquare size={20} />
              پنل پیامکی
            </h3>
            <span className={styles.tabCount}>
              {users.length} کاربر قابل ارسال
            </span>
          </div>
          <div className={styles.smsCredit}>
            <span>اعتبار پیامک:</span>
            <strong>۵۰,۰۰۰ تومان</strong>
          </div>
        </div>

        <div className={styles.smsContainer}>
          <div className={styles.smsRecipients}>
            <h4>انتخاب گیرندگان</h4>
            <div className={styles.smsUserList}>
              <div className={styles.smsSelectAll}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                  />
                  <span>انتخاب همه</span>
                </label>
                <span className={styles.selectedCount}>
                  {selectedUsers.length} نفر انتخاب شده
                </span>
              </div>
              {users.map((user) => (
                <label key={user.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                  />
                  <span className={styles.userCheckboxInfo}>
                    <strong>{user.name}</strong>
                    <span>{user.phone}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.smsComposer}>
            <h4>متن پیامک</h4>
            <textarea
              className={styles.smsTextarea}
              placeholder="متن پیامک خود را وارد کنید..."
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              rows={6}
            />
            <div className={styles.smsFooter}>
              <span className={styles.smsCount}>
                {smsText.length} کاراکتر
              </span>
              <button
                className={styles.sendSMSButton}
                onClick={handleSendSMS}
                disabled={selectedUsers.length === 0 || !smsText.trim()}
              >
                <Send size={16} />
                ارسال پیامک
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ===== رندر اصلی =====
  return (
    <div className={styles.dashboard}>
      {/* ========== هدر ========== */}
      <div className={styles.dashboardHeader}>
        <div className={styles.dashboardHeaderContent}>
          <Link href="/gym/billiard" className={styles.backLink}>
            <ArrowLeft size={18} />
            بازگشت به انتخاب بسته
          </Link>
          <div className={styles.dashboardHeaderMain}>
            <div>
              <h1 className={styles.dashboardTitle}>
                داشبورد مدیریت باشگاه بیلیارد
              </h1>
              <p className={styles.dashboardSubtitle}>
                مدیریت یکپارچه کاربران، مدیران، میزها و پیامک
              </p>
            </div>
            <div className={styles.dashboardHeaderStats}>
              <span className={styles.headerStat}>
                <Users size={14} />
                {stats.totalUsers}
              </span>
              <span className={styles.headerStat}>
                <Table size={14} />
                {stats.totalTables}
              </span>
              <span className={styles.headerStat}>
                <DollarSign size={14} />
                {stats.todayEarnings.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========== آمار کلی ========== */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(78, 205, 196, 0.15)', color: '#4ecdc4' }}>
            <Users size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalUsers}</span>
            <span className={styles.statLabel}>کل کاربران</span>
          </div>
          <div className={styles.statSub}>
            <span className={styles.statActive}>{stats.activeUsers} فعال</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(78, 205, 196, 0.15)', color: '#4ecdc4' }}>
            <Table size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.totalTables}</span>
            <span className={styles.statLabel}>کل میزها</span>
          </div>
          <div className={styles.statSub}>
            <span className={styles.statActive}>{stats.availableTables} آزاد</span>
            <span className={styles.statOccupied}>{stats.occupiedTables} اشغال</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(78, 205, 196, 0.15)', color: '#4ecdc4' }}>
            <DollarSign size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.todayEarnings.toLocaleString()}</span>
            <span className={styles.statLabel}>درآمد امروز</span>
          </div>
          <div className={styles.statSub}>
            <span className={styles.statTotal}>کل: {stats.totalEarnings.toLocaleString()}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(78, 205, 196, 0.15)', color: '#4ecdc4' }}>
            <MessageSquare size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{users.length}</span>
            <span className={styles.statLabel}>گیرندگان پیامک</span>
          </div>
          <div className={styles.statSub}>
            <span className={styles.statActive}>قابل ارسال</span>
          </div>
        </div>
      </div>

      {/* ========== تب‌ها ========== */}
      <div className={styles.dashboardTabs}>
        <div className={styles.tabsNav}>
          <button
            className={`${styles.tabNavItem} ${activeTab === 'tables' ? styles.tabNavItemActive : ''}`}
            onClick={() => setActiveTab('tables')}
          >
            <Table size={18} />
            میزها
          </button>
          <button
            className={`${styles.tabNavItem} ${activeTab === 'users' ? styles.tabNavItemActive : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            کاربران
          </button>
          <button
            className={`${styles.tabNavItem} ${activeTab === 'admins' ? styles.tabNavItemActive : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            <UserCog size={18} />
            مدیران
          </button>
          <button
            className={`${styles.tabNavItem} ${activeTab === 'sms' ? styles.tabNavItemActive : ''}`}
            onClick={() => setActiveTab('sms')}
          >
            <MessageSquare size={18} />
            پیامک
          </button>
        </div>

        <div className={styles.tabsContent}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}