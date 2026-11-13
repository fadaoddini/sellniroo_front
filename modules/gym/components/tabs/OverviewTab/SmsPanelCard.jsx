// modules/gym/components/tabs/OverviewTab/SmsPanelCard.jsx
'use client';

import React from 'react';
import {
  MessageCircle,
  Plus,
  TrendingUp,
  Send,
  Wallet,
} from 'lucide-react';
import styles from './SmsPanelCard.module.css';

export default function SmsPanelCard({ smsPanelInfo, onCharge }) {
  if (!smsPanelInfo) return null;

  // ✅ پشتیبانی از هر دو فرمت (snake_case و camelCase)
  const credit = Number(smsPanelInfo.credit ?? smsPanelInfo.credit ?? 0);
  const pricePerSms = Number(
    smsPanelInfo.price_per_sms ?? smsPanelInfo.pricePerSms ?? 0
  );
  const minCharge = Number(
    smsPanelInfo.min_charge ?? smsPanelInfo.minCharge ?? 0
  );
  const sentThisMonth = Number(
    smsPanelInfo.sent_this_month ?? smsPanelInfo.sentThisMonth ?? 0
  );
  const sentTotal = Number(
    smsPanelInfo.sent_total ?? smsPanelInfo.sentTotal ?? 0
  );

  // محاسبه تعداد پیامک
  const smsCount = Number(
    smsPanelInfo.sms_count ??
      (pricePerSms > 0 ? Math.floor(credit / pricePerSms) : 0)
  );

  const isLowCredit = smsCount < 100;

  return (
    <div className={styles.smsCard}>
      {/* هدر */}
      <div className={styles.smsCardHeader}>
        <div className={styles.smsIconWrapper}>
          <MessageCircle size={18} />
        </div>
        <div className={styles.smsHeaderInfo}>
          <span className={styles.smsLabel}>پنل پیامکی</span>
          <h3 className={styles.smsTitle}>موجودی و شارژ</h3>
        </div>
        <button className={styles.chargeButton} onClick={onCharge}>
          <Plus size={14} />
          شارژ
        </button>
      </div>

      {/* موجودی */}
      <div className={styles.smsBalance}>
        <div className={styles.smsBalanceItem}>
          <div className={styles.smsBalanceIcon}>
            <Wallet size={18} />
          </div>
          <div className={styles.smsBalanceInfo}>
            <span className={styles.smsBalanceLabel}>موجودی (تومان)</span>
            <span className={styles.smsBalanceValue}>
              {credit.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>

        <div className={styles.smsBalanceItem}>
          <div className={styles.smsBalanceIcon}>
            <Send size={18} />
          </div>
          <div className={styles.smsBalanceInfo}>
            <span className={styles.smsBalanceLabel}>تعداد پیامک</span>
            <span
              className={`${styles.smsBalanceValue} ${
                isLowCredit ? styles.lowCredit : ''
              }`}
            >
              {smsCount.toLocaleString('fa-IR')}
            </span>
          </div>
        </div>
      </div>

      {/* نرخ و حداقل شارژ */}
      <div className={styles.smsMeta}>
        <div className={styles.smsMetaItem}>
          <span>نرخ هر پیامک</span>
          <strong>{pricePerSms.toLocaleString('fa-IR')} تومان</strong>
        </div>
        <div className={styles.smsMetaItem}>
          <span>حداقل شارژ</span>
          <strong>{minCharge.toLocaleString('fa-IR')} تومان</strong>
        </div>
      </div>

      {/* آمار مصرف */}
      <div className={styles.smsStats}>
        <div className={styles.smsStatItem}>
          <TrendingUp size={14} />
          <div>
            <span className={styles.smsStatLabel}>ارسال این ماه</span>
            <span className={styles.smsStatValue}>
              {sentThisMonth.toLocaleString('fa-IR')} پیامک
            </span>
          </div>
        </div>
        <div className={styles.smsStatItem}>
          <Send size={14} />
          <div>
            <span className={styles.smsStatLabel}>کل ارسال‌ها</span>
            <span className={styles.smsStatValue}>
              {sentTotal.toLocaleString('fa-IR')} پیامک
            </span>
          </div>
        </div>
      </div>

      {/* هشدار موجودی کم */}
      {isLowCredit && (
        <div className={styles.lowCreditWarning}>
          موجودی پیامک شما کم است. لطفاً شارژ کنید.
        </div>
      )}
    </div>
  );
}