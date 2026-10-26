'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import { fetchMenuLists } from '@/services/menuLists'
import {
  DEFAULT_NAV_WIDGET_SETTINGS,
  NAV_BAR_COLORS,
  NAV_DEVICES,
  NAV_MARGIN_FIELDS,
  NAV_MENU_COLORS,
  NAV_PROFILE_COLORS,
  NAV_SPACE_FIELDS,
  PROFILE_MODES,
  PROFILE_SHAPES,
  SHEET_SPEEDS,
  buildNavViewportPatch,
  getNavVisibilityFlags,
  normalizeNavWidgetSettings,
  snapshotNavViewportSettings,
} from '@/config/navWidgetSettings'
import LucideIconPicker from '@/components/common/LucideIconPicker'
import styles from './AdminWeb.module.css'

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className={styles.wsRow}>
      <span className={styles.wsRowText}>
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className={`${styles.wsSwitch} ${checked ? styles.wsSwitchOn : ''}`}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <i />
      </span>
    </label>
  )
}

function PxField({ label, value, onChange }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <span className={styles.wsPxInput}>
        <input
          type="number"
          min={0}
          max={240}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          dir="ltr"
        />
        <em>px</em>
      </span>
    </label>
  )
}

function ColorRow({ label, value, onChange, allowTransparent = false }) {
  const isTransparent = value === 'transparent'
  const hex = value && /^#/.test(value) ? value : '#14181f'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={isTransparent ? '#ffffff' : hex}
          disabled={isTransparent}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder="auto"
          onChange={(e) => onChange(e.target.value)}
        />
        {allowTransparent ? (
          <button
            type="button"
            className={`${styles.wsTinyBtn} ${
              isTransparent ? styles.wsTinyBtnOn : ''
            }`}
            onClick={() => onChange(isTransparent ? '' : 'transparent')}
            title="شفاف"
          >
            شفاف
          </button>
        ) : null}
        {value && !isTransparent ? (
          <button
            type="button"
            className={styles.wsTinyBtn}
            onClick={() => onChange('')}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  )
}

function Accordion({ id, title, openId, setOpenId, children }) {
  const open = openId === id
  return (
    <div className={`${styles.wsAcc} ${open ? styles.wsAccOpen : ''}`}>
      <button
        type="button"
        className={styles.wsAccHead}
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown size={14} />
      </button>
      {open ? <div className={styles.wsAccBody}>{children}</div> : null}
    </div>
  )
}

/**
 * پنل تنظیمات مینیمال ویجت نوار خبر / منو / پروفایل
 * نوار خبر فوری: دو حالت دسکتاپ و موبایل جدا
 */
export default function WidgetNavSettings({ type, settings: raw, onChange }) {
  const isTickerBar = type === 'breaking_news'
  const [device, setDevice] = useState('desktop')
  const [menus, setMenus] = useState([])
  const [openId, setOpenId] = useState('display')

  const rawSettings = raw || DEFAULT_NAV_WIDGET_SETTINGS
  const visibility = getNavVisibilityFlags(rawSettings)
  const settings = isTickerBar
    ? normalizeNavWidgetSettings(rawSettings, { viewport: device })
    : normalizeNavWidgetSettings(rawSettings)

  useEffect(() => {
    fetchMenuLists({ force: true })
      .then((list) => setMenus(Array.isArray(list) ? list : []))
      .catch(() => setMenus([]))
  }, [])

  const showMenuFields =
    type === 'breaking_news' ||
    type === 'hamburger_menu' ||
    type === 'header_menu' ||
    type === 'nav_bar'
  const showProfileFields =
    type === 'breaking_news' || type === 'profile' || type === 'nav_bar'

  const patch = (key, value) => {
    if (isTickerBar) {
      onChange(buildNavViewportPatch(rawSettings, device, key, value))
      return
    }
    onChange({ [key]: value })
  }

  const copyDesktopToMobile = () => {
    const snap = snapshotNavViewportSettings(rawSettings, 'desktop')
    onChange({ mobile: snap })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
      {isTickerBar ? (
        <>
          <p className={styles.wsMiniLabel}>نمایش در دستگاه</p>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!visibility.show_on_desktop}
              onChange={(v) => patch('show_on_desktop', v)}
              label="نمایش در دسکتاپ"
              hint="بالای ۷۶۸px"
            />
            <Toggle
              checked={!!visibility.show_on_mobile}
              onChange={(v) => patch('show_on_mobile', v)}
              label="نمایش در موبایل / اپ"
              hint="زیر ۷۶۸px"
            />
          </div>

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            ویرایش تنظیمات برای
          </p>
          <div
            className={styles.wsSeg}
            style={{ gridTemplateColumns: '1fr 1fr' }}
          >
            {NAV_DEVICES.map((d) => {
              const on = device === d.id
              return (
                <button
                  key={d.id}
                  type="button"
                  className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
                  onClick={() => setDevice(d.id)}
                >
                  {d.id === 'desktop' ? (
                    <Monitor size={14} style={{ marginInlineEnd: 4 }} />
                  ) : (
                    <Smartphone size={14} style={{ marginInlineEnd: 4 }} />
                  )}
                  {d.label}
                </button>
              )
            })}
          </div>
          <p className={styles.wsHint}>
            {device === 'desktop'
              ? 'در حال ویرایش ظاهر و نمایش دسکتاپ'
              : 'در حال ویرایش ظاهر و نمایش موبایل / اپ'}
          </p>
          {device === 'mobile' ? (
            <button
              type="button"
              className={styles.wsGhostLink}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                padding: 0,
                marginBottom: '0.5rem',
              }}
              onClick={copyDesktopToMobile}
            >
              کپی تنظیمات دسکتاپ روی موبایل
            </button>
          ) : null}
        </>
      ) : (
        <div
          className={`${styles.wsMobileCard} ${
            settings.show_on_mobile ? '' : styles.wsMobileCardOff
          }`}
        >
          <div className={styles.wsMobileMeta}>
            <Smartphone size={15} strokeWidth={1.75} />
            <div>
              <strong>موبایل</strong>
              <span>
                {settings.show_on_mobile
                  ? 'نمایش داده می‌شود'
                  : 'مخفی زیر ۷۶۸px'}
              </span>
            </div>
          </div>
          <span
            className={`${styles.wsSwitch} ${
              settings.show_on_mobile ? styles.wsSwitchOn : ''
            }`}
          >
            <input
              type="checkbox"
              checked={!!settings.show_on_mobile}
              onChange={(e) => patch('show_on_mobile', e.target.checked)}
              aria-label="نمایش در موبایل"
            />
            <i />
          </span>
        </div>
      )}

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          {isTickerBar ? (
            <Toggle
              checked={!!settings.show_ticker}
              onChange={(v) => patch('show_ticker', v)}
              label="تیتر خبری"
            />
          ) : null}
          {showMenuFields && type !== 'header_menu' ? (
            <Toggle
              checked={!!settings.show_hamburger}
              onChange={(v) => patch('show_hamburger', v)}
              label="منوی همبرگری"
            />
          ) : null}
          {type === 'nav_bar' || type === 'breaking_news' ? (
            <Toggle
              checked={!!settings.show_menu_items}
              onChange={(v) => patch('show_menu_items', v)}
              label="لینک‌های افقی"
            />
          ) : null}
        </div>
      </Accordion>

      {isTickerBar ? (
        <Accordion id="space" title="شکل و فاصله نوار" openId={openId} setOpenId={setOpenId}>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.bar_full_bleed}
              onChange={(v) => patch('bar_full_bleed', v)}
              label="تمام‌عرض صفحه"
              hint={
                settings.bar_full_bleed
                  ? 'لبه به لبه — مناسب دسکتاپ'
                  : 'کارت با فاصله از کنار — مناسب موبایل'
              }
            />
          </div>
          <div className={styles.wsPxGrid}>
            <PxField
              label="گردی گوشه"
              value={settings.bar_radius}
              onChange={(v) => patch('bar_radius', v)}
            />
          </div>
          <p className={styles.wsHint}>
            برای موبایل: تمام‌عرض را خاموش کنید، گردی (مثلاً ۱۴) و مارجین چپ/راست بدهید
          </p>
          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            Padding
          </p>
          <div className={styles.wsPxGrid}>
            {NAV_SPACE_FIELDS.map((f) => (
              <PxField
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
          </div>
          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            Margin
          </p>
          <div className={styles.wsPxGrid}>
            {NAV_MARGIN_FIELDS.map((f) => (
              <PxField
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
          </div>
          {settings.bar_full_bleed ? (
            <p className={styles.wsHint}>
              در حالت تمام‌عرض، مارجین چپ/راست اعمال نمی‌شود
            </p>
          ) : null}
        </Accordion>
      ) : null}

      {isTickerBar ? (
        <Accordion id="barColors" title="رنگ نوار" openId={openId} setOpenId={setOpenId}>
          <div className={styles.wsColorList}>
            {NAV_BAR_COLORS.map((f) => (
              <ColorRow
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
          </div>
        </Accordion>
      ) : null}

      {isTickerBar || showMenuFields ? (
        <Accordion id="menu" title="منو" openId={openId} setOpenId={setOpenId}>
          {showMenuFields ? (
            <>
              <div className={styles.wsLabelRow}>
                <p className={styles.wsMiniLabel}>فهرست</p>
                <Link href="/menu-lists" className={styles.wsGhostLink}>
                  مدیریت
                </Link>
              </div>
              <select
                className={styles.wsSelect}
                value={settings.menu_slug}
                onChange={(e) => patch('menu_slug', e.target.value)}
              >
                {menus.length === 0 ? (
                  <option value="main">منوی اصلی</option>
                ) : (
                  menus.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name}
                      {m.items_count != null ? ` (${m.items_count})` : ''}
                    </option>
                  ))
                )}
              </select>
              {isTickerBar ? (
                <Link href="/ticker" className={styles.wsGhostLink}>
                  مدیریت تیترها
                </Link>
              ) : null}
              {isTickerBar ? (
                <p className={styles.wsHint}>
                  فهرست منو برای هر دو حالت مشترک است
                </p>
              ) : null}
            </>
          ) : null}

          {isTickerBar ? (
            <div className={styles.wsColorList}>
              {NAV_MENU_COLORS.map((f) => (
                <ColorRow
                  key={f.key}
                  label={f.label}
                  value={settings[f.key]}
                  onChange={(v) => patch(f.key, v)}
                />
              ))}
            </div>
          ) : null}
        </Accordion>
      ) : null}

      {showProfileFields ? (
        <Accordion
          id="profile"
          title="پروفایل"
          openId={openId}
          setOpenId={setOpenId}
        >
          <p className={styles.wsMiniLabel}>حالت نمایش</p>
          <div className={styles.wsSeg}>
            {PROFILE_MODES.map((m) => {
              const on = settings.profile_mode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
                  onClick={() => patch('profile_mode', m.id)}
                >
                  {m.label}
                </button>
              )
            })}
          </div>

          {isTickerBar && settings.profile_mode !== 'hidden' ? (
            <>
              <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                شکل آواتار
              </p>
              <div
                className={styles.wsSeg}
                style={{ gridTemplateColumns: '1fr 1fr' }}
              >
                {PROFILE_SHAPES.map((m) => {
                  const on = settings.avatar_shape === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
                      onClick={() => patch('avatar_shape', m.id)}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>

              <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
                {NAV_PROFILE_COLORS.map((f) => (
                  <ColorRow
                    key={f.key}
                    label={f.label}
                    value={settings[f.key]}
                    onChange={(v) => patch(f.key, v)}
                    allowTransparent={
                      f.key === 'color_profile_bg' ||
                      f.key === 'color_avatar_border'
                    }
                  />
                ))}
              </div>

              <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                ضخامت حاشیه تصویر
              </p>
              <PxField
                label="ضخامت"
                value={settings.avatar_border_width}
                onChange={(v) => patch('avatar_border_width', v)}
              />

              <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                سرعت انیمیشن شیت موبایل
              </p>
              <div
                className={styles.wsSeg}
                style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
              >
                {SHEET_SPEEDS.map((m) => {
                  const on = settings.sheet_ms === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
                      onClick={() => patch('sheet_ms', m.id)}
                    >
                      {m.label}
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}

          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.guest_visible}
              onChange={(v) => patch('guest_visible', v)}
              label="دکمه مهمان"
              hint="قبل از ورود"
            />
          </div>

          {settings.guest_visible ? (
            <div className={styles.wsGuest}>
              <div className={styles.wsGuestGrid}>
                <input
                  className={styles.wsInput}
                  type="text"
                  value={settings.guest_label}
                  onChange={(e) => patch('guest_label', e.target.value)}
                  placeholder="متن"
                />
                <input
                  className={styles.wsInput}
                  type="text"
                  dir="ltr"
                  value={settings.guest_href}
                  onChange={(e) => patch('guest_href', e.target.value)}
                  placeholder="/login"
                />
              </div>
              <LucideIconPicker
                value={settings.guest_icon || 'LogIn'}
                onChange={(name) => patch('guest_icon', name)}
              />
            </div>
          ) : null}
        </Accordion>
      ) : null}
    </div>
  )
}
