// modules/gym/components/modals/ChargeSmsModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import styles from './ChargeSmsModal.module.css';

const PRESET_AMOUNTS = [200000, 500000, 1000000, 2000000];

export default function ChargeSmsModal({ isOpen, onClose, onCharge, smsPanelInfo }) {
  const [amount, setAmount] = useState(200000);
  const [error, setError] = useState('');

  // ✅ پشتیبانی از هر دو فرمت (snake_case و camelCase)
  const pricePerSms = Number(
    smsPanelInfo?.price_per_sms ?? smsPanelInfo?.pricePerSms ?? 250
  );
  const minCharge = Number(
    smsPanelInfo?.min_charge ?? smsPanelInfo?.minCharge ?? 200000
  );

  useEffect(() => {
    if (isOpen) {
      setAmount(minCharge);
      setError('');
    }
  }, [isOpen, minCharge]);

  if (!smsPanelInfo) return null;

  const smsCount = pricePerSms > 0 ? Math.floor(amount / pricePerSms) : 0;

  const handleSubmit = () => {
    if (!amount || amount < minCharge) {
      setError(`حداقل مبلغ شارژ ${minCharge.toLocaleString('fa-IR')} تومان است`);
      return;
    }
    onCharge(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="شارژ پنل پیامکی">
      <div className={styles.chargeContent}>
        {/* نرخ */}
        <div className={styles.rateInfo}>
          <AlertCircle size={16} />
          <span>
            نرخ هر پیامک:{' '}
            <strong>{pricePerSms.toLocaleString('fa-IR')} تومان</strong>
            {' '}— حداقل شارژ:{' '}
            <strong>{minCharge.toLocaleString('fa-IR')} تومان</strong>
          </span>
        </div>

        {/* مبالغ پیشنهادی */}
        <div className={styles.presetSection}>
          <label className={styles.presetLabel}>مبالغ پیشنهادی</label>
          <div className={styles.presetGrid}>
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                className={`${styles.presetBtn} ${
                  amount === preset ? styles.presetBtnActive : ''
                }`}
                onClick={() => {
                  setAmount(preset);
                  setError('');
                }}
              >
                {preset.toLocaleString('fa-IR')}
              </button>
            ))}
          </div>
        </div>

        {/* ورودی مبلغ سفارشی */}
        <div className={styles.formGroup}>
          <label>مبلغ شارژ (تومان)</label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => {
              setAmount(parseInt(e.target.value) || 0);
              setError('');
            }}
            min={minCharge}
            step={10000}
          />
          {error && <span className={styles.errorText}>{error}</span>}
        </div>

        {/* پیش‌نمایش */}
        <div className={styles.previewBox}>
          <Wallet size={20} />
          <div className={styles.previewInfo}>
            <span className={styles.previewLabel}>با این مبلغ دریافت می‌کنید:</span>
            <span className={styles.previewValue}>
              {smsCount.toLocaleString('fa-IR')} پیامک
            </span>
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>
            انصراف
          </button>
          <button
            className={styles.modalConfirm}
            onClick={handleSubmit}
            disabled={amount < minCharge}
          >
            <Wallet size={16} />
            پرداخت و شارژ
          </button>
        </div>
      </div>
    </Modal>
  );
}