// src/components/AllBoxItem/components/FilterDialog/FilterDialog.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';
import jobisellApi from '@/services/jobisellApi';
import styles from './FilterDialog.module.css';

const FilterDialog = ({
  isOpen,
  selectedKey,
  tempValue,
  filterOptions,
  onSelectOption,
  onConfirm,
  onClear,
  onClose,
}) => {
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ بارگذاری گزینه‌ها بر اساس فیلتر انتخاب‌شده
  useEffect(() => {
    if (!isOpen || !selectedKey) return;

    const loadOptions = async () => {
      setLoading(true);
      try {
        let options = [];

        // اگر در filterOptions موجود است، از آن استفاده کن
        const map = {
          province: filterOptions?.provinces,
          city: filterOptions?.cities,
          neighborhood: filterOptions?.neighborhoods,
          cooperationType: filterOptions?.cooperation_types,
          jobTitle: filterOptions?.job_titles,
          category: filterOptions?.categories,
        };

        if (map[selectedKey]) {
          options = map[selectedKey];
        } else {
          // وگرنه از API جدا بگیر
          switch (selectedKey) {
            case 'province':
              options = await jobisellApi.getProvinces();
              break;
            case 'city':
              options = await jobisellApi.getCities();
              break;
            case 'neighborhood':
              options = await jobisellApi.getNeighborhoods();
              break;
            case 'cooperationType':
              options = await jobisellApi.getCooperationTypes();
              break;
            case 'jobTitle':
              options = await jobisellApi.getJobTitles();
              break;
            case 'category':
              options = await jobisellApi.getCategories();
              break;
            default:
              options = [];
          }
        }

        setDynamicOptions(Array.isArray(options) ? options : []);
      } catch (err) {
        console.error('Error loading filter options:', err);
        setDynamicOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, [isOpen, selectedKey, filterOptions]);

  // فیلتر جستجو
  const filteredOptions = searchTerm
    ? dynamicOptions.filter((opt) =>
        (opt.name || opt.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dynamicOptions;

  const filterLabels = {
    province: 'استان',
    city: 'شهر',
    neighborhood: 'محله',
    cooperationType: 'نوع همکاری',
    jobTitle: 'عنوان شغلی',
    category: 'دسته‌بندی',
  };

  if (!isOpen || !selectedKey) return null;

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h4 className={styles.dialogTitle}>{filterLabels[selectedKey] || selectedKey}</h4>
          <button className={styles.dialogCloseBtn} onClick={onClose} aria-label="بستن">
            <X size={20} />
          </button>
        </div>

        {/* جستجو */}
        <div className={styles.dialogSearch}>
          <Search size={16} />
          <input
            type="text"
            placeholder="جستجو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.dialogBody}>
          {loading ? (
            <div className={styles.dialogLoading}>در حال بارگذاری...</div>
          ) : filteredOptions.length === 0 ? (
            <div className={styles.dialogEmpty}>گزینه‌ای یافت نشد</div>
          ) : (
            <div className={styles.dialogOptions}>
              {filteredOptions.map((option) => {
                const value = option.id;
                const label = option.name || option.title;
                const isSelected = String(tempValue) === String(value);

                return (
                  <button
                    key={option.id}
                    className={`${styles.dialogOption} ${isSelected ? styles.dialogOptionSelected : ''}`}
                    onClick={() => onSelectOption(value)}
                  >
                    <span>{label}</span>
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.dialogFooter}>
          <button className={styles.dialogClearBtn} onClick={onClear}>
            پاک کردن
          </button>
          <div className={styles.dialogActions}>
            <button className={styles.dialogCancelBtn} onClick={onClose}>
              لغو
            </button>
            <button className={styles.dialogConfirmBtn} onClick={onConfirm}>
              تایید
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterDialog;