'use client'

import React from 'react'
import Link from 'next/link'
import { PanelTop, Menu, PanelBottom } from 'lucide-react'
import styles from './AdminWeb.module.css'

/**
 * انتخاب اختیاری هدر / منو / فوتر برای یک صفحه
 * (به‌جای «اعمال هدر و رنگ به همه»)
 */
export default function PageChromeOptIn({
  chrome = { header: false, menu: false, footer: false },
  onChange,
  title = 'هدر، منو و فوتر این صفحه',
  hint,
  showFooter = true,
  separateHeaderMenu = true,
}) {
  const patch = (key, value) => {
    if (typeof onChange !== 'function') return
    onChange({ ...chrome, [key]: !!value })
  }

  return (
    <div className={styles.chromeOptIn} role="group" aria-label={title}>
      <div className={styles.chromeOptInHead}>
        <strong>{title}</strong>
        <p>
          {hint || (
            <>
              اگر روشن باشد، همان طراحی تب‌های{' '}
              <Link href="/adminsettings?tab=header">هدر بالا</Link> و{' '}
              <Link href="/adminsettings?tab=menu">منوی بالا</Link>
              {showFooter ? (
                <>
                  {' '}
                  و <Link href="/adminsettings?tab=footer">فوتر</Link>
                </>
              ) : null}{' '}
              دقیقاً در محل خودش نمایش داده می‌شود.
            </>
          )}
        </p>
      </div>
      <div className={styles.chromeOptInGrid}>
        <label className={styles.chromeOptInRow}>
          <span className={styles.chromeOptInLabel}>
            <PanelTop size={14} />
            هدر بالا
            <small>بالاترین قسمت سایت</small>
          </span>
          <span
            className={`${styles.wsSwitch} ${chrome.header ? styles.wsSwitchOn : ''}`}
          >
            <input
              type="checkbox"
              checked={!!chrome.header}
              onChange={(e) => patch('header', e.target.checked)}
            />
            <i />
          </span>
        </label>
        <label className={styles.chromeOptInRow}>
          <span className={styles.chromeOptInLabel}>
            <Menu size={14} />
            منوی بالا
            <small>
              {separateHeaderMenu ? 'زیر هدر' : 'نوار منو'}
            </small>
          </span>
          <span
            className={`${styles.wsSwitch} ${chrome.menu ? styles.wsSwitchOn : ''}`}
          >
            <input
              type="checkbox"
              checked={!!chrome.menu}
              onChange={(e) => patch('menu', e.target.checked)}
            />
            <i />
          </span>
        </label>
        {showFooter ? (
          <label className={styles.chromeOptInRow}>
            <span className={styles.chromeOptInLabel}>
              <PanelBottom size={14} />
              فوتر
              <small>پایین‌ترین قسمت سایت</small>
            </span>
            <span
              className={`${styles.wsSwitch} ${chrome.footer ? styles.wsSwitchOn : ''}`}
            >
              <input
                type="checkbox"
                checked={!!chrome.footer}
                onChange={(e) => patch('footer', e.target.checked)}
              />
              <i />
            </span>
          </label>
        ) : null}
      </div>
    </div>
  )
}
