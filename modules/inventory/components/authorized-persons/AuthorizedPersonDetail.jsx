// modules/inventory/components/authorized-persons/AuthorizedPersonDetail.jsx

'use client';

import React from 'react';
import {
  User, Shield, Phone, Mail, Building2, Edit, X, 
  CheckCircle, Circle, Briefcase, Calendar, Users,
} from 'lucide-react';
import styles from './authorizedPerson.module.css';

const AuthorizedPersonDetail = ({ 
  person, 
  onEdit, 
  onClose,
  getStatusBadge,
  getConfirmBadge,
  getWarehouseNames,
  t = {},
}) => {
  if (!person) return null;

  return (
    <div className={styles.personDetail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailAvatar}>
          <User size={48} />
        </div>
        <div className={styles.detailTitleSection}>
          <h3 className={styles.detailTitle}>{person.full_name}</h3>
          <span className={styles.detailPosition}>
            <Briefcase size={14} />
            {person.position}
          </span>
          <div className={styles.detailStatus}>
            {getStatusBadge?.(person.is_active)}
          </div>
        </div>
        <div className={styles.detailActions}>
          <button className={styles.primaryBtn} onClick={onEdit}>
            <Edit size={16} />
            {t.edit || 'ویرایش'}
          </button>
          <button className={styles.secondaryBtn} onClick={onClose}>
            <X size={16} />
            {t.close || 'بستن'}
          </button>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <User size={14} /> نام کامل:
          </span>
          <span className={styles.detailValue}>{person.full_name}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Briefcase size={14} /> سمت:
          </span>
          <span className={styles.detailValue}>{person.position}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Phone size={14} /> تلفن:
          </span>
          <span className={styles.detailValue}>{person.phone}</span>
        </div>
        {person.email && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Mail size={14} /> ایمیل:
            </span>
            <span className={styles.detailValue}>{person.email}</span>
          </div>
        )}
        {person.user_mobile && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Users size={14} /> کاربر:
            </span>
            <span className={styles.detailValue}>
              {person.user_name || person.user_mobile}
              <span className={styles.detailSub}>({person.user_mobile})</span>
            </span>
          </div>
        )}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Building2 size={14} /> انبارهای مجاز:
          </span>
          <span className={styles.detailValue}>
            {getWarehouseNames?.(person.warehouse_titles || person.warehouses) || '-'}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Shield size={14} /> امکان تایید:
          </span>
          <span className={styles.detailValue}>
            {getConfirmBadge?.(person.can_confirm)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Calendar size={14} /> تاریخ ایجاد:
          </span>
          <span className={styles.detailValue}>
            {new Date(person.created_at).toLocaleDateString('fa-IR')}
          </span>
        </div>
        {person.updated_at && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Calendar size={14} /> آخرین بروزرسانی:
            </span>
            <span className={styles.detailValue}>
              {new Date(person.updated_at).toLocaleDateString('fa-IR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthorizedPersonDetail;