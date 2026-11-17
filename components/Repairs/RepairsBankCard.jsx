'use client'

import React, { useState } from 'react'
import { Building2, Copy, UserRound } from 'lucide-react'
import styles from './RepairsBankCard.module.css'

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '')
}

export function formatBankCardNumber(value) {
  const digits = digitsOnly(value)
  if (!digits) return String(value || '').trim()
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

export default function RepairsBankCard({
  cardNumber,
  holder = '',
  bankName = '',
  instructions = '',
  amount = null,
  amountLabel = 'مبلغ واریز',
  formatMoney,
  compact = false,
}) {
  const [copied, setCopied] = useState(false)
  const raw = String(cardNumber || '').trim()
  if (!raw) return null

  const pretty = formatBankCardNumber(raw)
  const copyDigits = digitsOnly(raw) || raw

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyDigits)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className={`${styles.card} ${compact ? styles.cardCompact : ''}`}
      dir="rtl"
    >
      <div className={styles.shine} aria-hidden />
      <div className={styles.chip} aria-hidden />
      <div className={styles.top}>
        <span className={styles.bank}>
          <Building2 size={14} aria-hidden />
          {bankName || 'واریز کارت‌به‌کارت'}
        </span>
        {amount != null && formatMoney ? (
          <em className={styles.amount}>
            {amountLabel}: {formatMoney(amount)} ت
          </em>
        ) : null}
      </div>

      <div className={styles.numberRow}>
        <span className={styles.number} dir="ltr">
          {pretty}
        </span>
        <button type="button" className={styles.copyBtn} onClick={onCopy}>
          <Copy size={13} aria-hidden />
          {copied ? 'کپی شد' : 'کپی'}
        </button>
      </div>

      <div className={styles.meta}>
        <span>
          <UserRound size={13} aria-hidden />
          {holder || '—'}
        </span>
      </div>

      {instructions ? <p className={styles.hint}>{instructions}</p> : null}
    </div>
  )
}
