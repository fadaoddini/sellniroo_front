// modules/gym/components/tabs/UsersTab/index.jsx
'use client';

import React from 'react';
import { Users, Search, UserPlus } from 'lucide-react';
import styles from './UsersTab.module.css';
import StatusToggle from '../../shared/StatusToggle';
import ActionButtons from '../../shared/ActionButtons';
import { formatJalaliShort } from '@/utils/dateUtils';

export default function UsersTab({
  users,
  filteredUsers,
  searchQuery,
  setSearchQuery,
  genderFilter,
  setGenderFilter,
  statusFilter,
  setStatusFilter,
  onToggleStatus,
  onDelete,
  onView,
  onEdit,
  onAdd,
}) {
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
          <div className={styles.filters}>
            <select
              className={styles.filterSelect}
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
            >
              <option value="all">همه جنسیت‌ها</option>
              <option value="male">آقایان</option>
              <option value="female">بانوان</option>
            </select>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="جستجوی کاربر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.addButton} onClick={onAdd}>
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
              <th>جنسیت</th>
              <th>بسته</th>
              <th>مربی</th>
              <th>تاریخ عضویت</th>
              <th>تاریخ انقضا</th>
              <th>باقی‌مانده</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                  کاربری یافت نشد
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className={styles.userName}>{user.full_name}</td>
                  <td dir="ltr">{user.phone}</td>
                  <td>
                    {user.gender === 'male' ? 'آقا' : 'خانم'}
                  </td>
                  <td>{user.package_title || '-'}</td>
                  <td>{user.trainer_name || '-'}</td>
                  <td>
                    <span className={styles.dateCell}>
                      {formatJalaliShort(user.join_date)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.dateCell}>
                      {formatJalaliShort(user.expiration_date)}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        user.days_remaining < 0
                          ? styles.expiredBadge
                          : user.days_remaining <= 15
                          ? styles.expiringBadge
                          : styles.activeBadge
                      }
                    >
                      {user.days_remaining < 0
                        ? `${Math.abs(user.days_remaining)} روز گذشته`
                        : `${user.days_remaining} روز`}
                    </span>
                  </td>
                  <td>
                    <StatusToggle
                      status={user.status}
                      onToggle={() => onToggleStatus(user.id)}
                    />
                  </td>
                  <td>
                    <ActionButtons
                      onView={() => onView(user)}
                      onEdit={() => onEdit(user)}
                      onDelete={() => onDelete(user.id)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}