// src/components/AllBoxItem/components/JobCard/JobFeatures.jsx
'use client';

import React from 'react';
import {
  ShieldCheck, Clock, Truck, Utensils, Award, Calendar, Wifi,
  CheckCircle, XCircle, MinusCircle, Star, Heart, Coffee,
} from 'lucide-react';
import styles from './JobFeatures.module.css';

// ✅ نقشه آیکون‌های داینامیک (icon از سرور می‌آید)
const ICON_MAP = {
  'shield-check': ShieldCheck,
  'clock': Clock,
  'truck': Truck,
  'utensils': Utensils,
  'award': Award,
  'calendar': Calendar,
  'wifi': Wifi,
  'star': Star,
  'heart': Heart,
  'coffee': Coffee,
};

const JobFeatures = ({ features = [], isCompact = false }) => {
  // فقط برای آگهی‌های استخدام
  if (!features || features.length === 0) return null;

  const getStatusIcon = (value) => {
    if (value === true || value === 1) {
      return <CheckCircle size={isCompact ? 12 : 14} className={styles.activeIcon} />;
    } else if (value === false || value === 0) {
      return <XCircle size={isCompact ? 12 : 14} className={styles.inactiveIcon} />;
    }
    return <MinusCircle size={isCompact ? 12 : 14} className={styles.unknownIcon} />;
  };

  const getStatusClass = (value) => {
    if (value === true || value === 1) return styles.active;
    if (value === false || value === 0) return styles.inactive;
    return styles.unknown;
  };

  // ✅ مقادیر ویژگی
  const getFeatureValue = (feat) => {
    if (feat.feature_type === 'boolean') {
      return feat.value_boolean;
    }
    if (feat.feature_type === 'text') return feat.value_text;
    if (feat.feature_type === 'number') return feat.value_number;
    return null;
  };

  return (
    <div className={`${styles.featuresContainer} ${isCompact ? styles.compact : ''}`}>
      <span className={styles.featuresLabel}>مزایا و امکانات:</span>
      <div className={styles.featuresGrid}>
        {features.map((feat) => {
          const Icon = ICON_MAP[feat.feature_icon] || ShieldCheck;
          const value = getFeatureValue(feat);

          return (
            <div
              key={feat.id}
              className={`${styles.featureItem} ${getStatusClass(value)}`}
              title={feat.feature_name}
            >
              <Icon size={isCompact ? 12 : 14} />
              <span className={styles.featureLabel}>{feat.feature_name}</span>
              {feat.feature_type === 'boolean' ? (
                getStatusIcon(value)
              ) : (
                <span className={styles.featureValue}>{value ?? '—'}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobFeatures;