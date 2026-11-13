// modules/inventory/components/products/StockBreakdown.jsx

'use client';

import React from 'react';
import { Layers, ChevronRight, Package } from 'lucide-react';
import styles from './product.module.css';

const StockBreakdown = ({ breakdown, rootUnit }) => {
  if (!breakdown || !breakdown.all_levels || breakdown.all_levels.length === 0) {
    return (
      <div className={styles.breakdownEmpty}>
        <Package size={20} />
        <span>موجودی در سطح ریشه: {breakdown?.root_quantity || 0} {rootUnit}</span>
      </div>
    );
  }

  return (
    <div className={styles.breakdownContainer}>
      <div className={styles.breakdownHeader}>
        <Layers size={16} />
        <span>تفکیک موجودی در سطوح مختلف</span>
        <span className={styles.breakdownTotal}>
          مجموع: {breakdown.root_quantity} {rootUnit}
        </span>
      </div>
      
      <div className={styles.breakdownTree}>
        {breakdown.all_levels.map((level, index) => (
          <div 
            key={index} 
            className={`${styles.breakdownLevel} ${level.is_root ? styles.rootLevel : ''} ${level.is_input_level ? styles.inputLevel : ''}`}
            style={{ paddingRight: `${level.level * 20}px` }}
          >
            <div className={styles.breakdownLevelContent}>
              <span className={styles.breakdownLevelIcon}>
                {level.is_root ? '📦' : '└─'}
              </span>
              <span className={styles.breakdownLevelTitle}>
                {level.title}
                {level.is_root && <span className={styles.rootBadge}>ریشه</span>}
                {level.is_input_level && <span className={styles.inputBadge}>ورودی</span>}
              </span>
              <span className={styles.breakdownLevelQuantity}>
                {level.quantity}
              </span>
              {level.full_units !== undefined && level.full_units !== level.quantity && (
                <span className={styles.breakdownLevelDetail}>
                  ({level.full_units} کامل + {level.remaining} باقیمانده)
                </span>
              )}
              {level.remaining !== undefined && level.remaining > 0 && (
                <span className={styles.breakdownRemaining}>
                  ⚠️ {level.remaining} باقیمانده
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockBreakdown;