'use client'

import {
  amountWordsLabel,
  formatGroupedDigits,
  parseGroupedAmount,
} from '../utils/moneyInput'
import styles from '../styles/ReboAccounting.module.css'

/**
 * فیلد مبلغ با جداسازی سه‌رقمی، پشتیبانی کیبورد فارسی، و نمایش به حروف.
 */
export default function MoneyAmountField({
  label = 'مبلغ',
  value,
  onChange,
  required = false,
  placeholder = 'مثلاً ۵٬۰۰۰٬۰۰۰',
  unit = 'تومان',
  className = '',
  disabled = false,
  name,
}) {
  const display = formatGroupedDigits(value)
  const words = amountWordsLabel(value, unit)

  return (
    <label className={className || undefined}>
      {label}
      <input
        name={name}
        required={required}
        disabled={disabled}
        value={display}
        onChange={(e) => {
          const next = formatGroupedDigits(e.target.value)
          onChange?.(next, parseGroupedAmount(next))
        }}
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        dir="ltr"
        style={{ textAlign: 'left' }}
      />
      {words ? <span className={styles.amountWords}>{words}</span> : null}
    </label>
  )
}
