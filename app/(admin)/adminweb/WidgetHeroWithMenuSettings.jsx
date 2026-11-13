'use client'

import React, { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  createDefaultHeroWithMenuSettings,
  normalizeHeroWithMenuSettings,
  DEFAULT_HERO_WITH_MENU_PROFILE,
  HERO_BG_MODES,
} from '@/config/heroWithMenuSettings'
import { normalizeGymDialItems } from '@/components/widgets/gym/gymDialDefaults'
import {
  PROFILE_MODES,
  PROFILE_SHAPES,
  DATE_FONT_WEIGHTS,
} from '@/config/navWidgetSettings'
import WidgetSiteTopNavSettings from './WidgetSiteTopNavSettings'
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

function Accordion({ title, open, onToggle, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <button
        type="button"
        className={styles.wsSegBtn}
        style={{
          width: '100%',
          justifyContent: 'space-between',
          display: 'flex',
          alignItems: 'center',
          marginBottom: open ? 10 : 0,
        }}
        onClick={onToggle}
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform .15s ease',
          }}
        />
      </button>
      {open ? children : null}
    </div>
  )
}

function Seg({ options, value, onChange }) {
  return (
    <div
      className={styles.wsSeg}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => {
        const on = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
            onClick={() => onChange(opt.id)}
            title={opt.hint || opt.label}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ColorField({ label, value, onChange, allowTransparent = false }) {
  const isTransparent = value === 'transparent'
  const hex = value && /^#/.test(String(value)) ? value : '#023c2c'
  return (
    <label className={styles.wsField}>
      <span>{label}</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="color"
          value={isTransparent ? '#023c2c' : hex}
          disabled={isTransparent}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 42, height: 34, padding: 0, border: 'none' }}
        />
        <input
          type="text"
          dir="ltr"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1 }}
        />
        {allowTransparent ? (
          <button
            type="button"
            className={styles.wsSegBtn}
            onClick={() =>
              onChange(isTransparent ? '#000000' : 'transparent')
            }
          >
            {isTransparent ? 'رنگ' : 'شفاف'}
          </button>
        ) : null}
      </div>
    </label>
  )
}

function PxField({ label, value, onChange, min = 0, max = 120 }) {
  return (
    <label className={styles.wsField}>
      <span>{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={Number.isFinite(Number(value)) ? Number(value) : min}
        onChange={(e) => onChange(Number(e.target.value))}
        dir="ltr"
      />
    </label>
  )
}

/** خواندن مقدار منو با اولویت دسکتاپ */
function menuVal(menu, key, fallback) {
  const desk = menu?.desktop && typeof menu.desktop === 'object' ? menu.desktop : {}
  if (desk[key] != null) return desk[key]
  if (menu?.[key] != null) return menu[key]
  return fallback
}

export default function WidgetHeroWithMenuSettings({
  type,
  settings: raw,
  onChange,
}) {
  const settings = useMemo(
    () => ({
      ...createDefaultHeroWithMenuSettings(),
      ...normalizeHeroWithMenuSettings(raw || {}),
      menu: raw?.menu && typeof raw.menu === 'object' ? raw.menu : {},
    }),
    [raw],
  )
  const [openMenu, setOpenMenu] = useState(true)
  const [openMenuAdvanced, setOpenMenuAdvanced] = useState(false)
  const [openProfile, setOpenProfile] = useState(false)
  const [openDial, setOpenDial] = useState(false)
  const [openBg, setOpenBg] = useState(true)

  const patchRoot = (key, value) => onChange?.({ [key]: value })

  const patchMenu = (patch) => {
    const next = { ...(settings.menu || {}), ...patch }
    onChange?.({ menu: next })
  }

  /** همزمان ریشه + دسکتاپ + موبایل تا رنگ/ظاهر در هر دو viewport اعمال شود */
  const patchMenuEssential = (key, value) => {
    const menu = { ...(settings.menu || {}) }
    const desktop =
      menu.desktop && typeof menu.desktop === 'object' ? { ...menu.desktop } : {}
    const mobile =
      menu.mobile && typeof menu.mobile === 'object' ? { ...menu.mobile } : {}
    menu[key] = value
    desktop[key] = value
    mobile[key] = value
    menu.desktop = desktop
    menu.mobile = mobile
    onChange?.({ menu })
  }

  const dialItems = normalizeGymDialItems(settings.dial_items)
  const profile = {
    ...DEFAULT_HERO_WITH_MENU_PROFILE,
    ...(settings.menu || {}),
  }
  const menu = settings.menu || {}
  const bgMode = settings.bg_mode || 'curve'

  return (
    <div className={styles.wsPanel}>
      <p className={styles.wsHint} style={{ marginBottom: 12 }}>
        تنظیمات اصلی هیرو، پس‌زمینه و منو — جزئیات کامل منو داخل «پیشرفته» است.
      </p>

      <label className={styles.wsField}>
        <span>برند / عنوان هیرو</span>
        <input
          type="text"
          value={settings.brand || ''}
          onChange={(e) => patchRoot('brand', e.target.value)}
        />
      </label>

      <Toggle
        checked={settings.show_menu !== false}
        onChange={(v) => patchRoot('show_menu', v)}
        label="نمایش نوار منو"
      />

      <Accordion
        title="پس‌زمینه دسکتاپ"
        open={openBg}
        onToggle={() => setOpenBg((v) => !v)}
      >
        <div className={styles.wsStack}>
          <p className={styles.wsMiniLabel}>نوع پس‌زمینه</p>
          <Seg
            options={HERO_BG_MODES}
            value={bgMode}
            onChange={(id) => patchRoot('bg_mode', id)}
          />
          <p className={styles.wsHint} style={{ marginTop: 6 }}>
            {HERO_BG_MODES.find((m) => m.id === bgMode)?.hint}
          </p>

          {bgMode === 'curve' ? (
            <label className={styles.wsField}>
              <span>
                شدت انحنا — {Number(settings.curve_intensity) || 50}
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Number(settings.curve_intensity) || 50}
                onChange={(e) =>
                  patchRoot('curve_intensity', Number(e.target.value))
                }
                dir="ltr"
              />
              <small className={styles.wsHint}>
                ۰ خط صاف · ۵۰ معمولی · ۱۰۰ موج زیاد
              </small>
            </label>
          ) : null}

          <ColorField
            label={bgMode === 'gradient' ? 'رنگ شروع' : 'رنگ روشن / چپ'}
            value={settings.bg_color || '#ffffff'}
            onChange={(v) => patchRoot('bg_color', v)}
          />
          <ColorField
            label={
              bgMode === 'gradient' ? 'رنگ پایان' : 'رنگ تیره / راست (منحنی)'
            }
            value={settings.bg_color_alt || '#023c2c'}
            onChange={(v) => patchRoot('bg_color_alt', v)}
          />
        </div>
      </Accordion>

      {settings.show_menu !== false ? (
        <Accordion
          title="منو (سریع)"
          open={openMenu}
          onToggle={() => setOpenMenu((v) => !v)}
        >
          <div className={styles.wsStack}>
            <ColorField
              label="رنگ پس‌زمینه منو (دسکتاپ و موبایل)"
              value={menuVal(menu, 'color_bg', 'transparent')}
              onChange={(v) => patchMenuEssential('color_bg', v)}
              allowTransparent
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <PxField
                label="ارتفاع نوار"
                min={32}
                max={72}
                value={menuVal(menu, 'height', 40)}
                onChange={(v) => patchMenuEssential('height', v)}
              />
              <PxField
                label="فاصله از بالا"
                min={0}
                max={48}
                value={menuVal(menu, 'margin_top', 16)}
                onChange={(v) => patchMenuEssential('margin_top', v)}
              />
            </div>
            <p className={styles.wsMiniLabel}>عرض منو</p>
            <Seg
              options={[
                { id: 'full', label: 'تمام‌عرض' },
                { id: 'inset', label: 'وسط‌چین' },
              ]}
              value={menuVal(menu, 'full_bleed', true) !== false ? 'full' : 'inset'}
              onChange={(id) => patchMenuEssential('full_bleed', id === 'full')}
            />
            {menuVal(menu, 'full_bleed', true) === false ? (
              <PxField
                label="گردی گوشه"
                min={0}
                max={28}
                value={menuVal(menu, 'radius', 14)}
                onChange={(v) => patchMenuEssential('radius', v)}
              />
            ) : null}
            <Toggle
              checked={menuVal(menu, 'show_logo', true) !== false}
              onChange={(v) => patchMenuEssential('show_logo', v)}
              label="نمایش لوگو"
            />
            <Toggle
              checked={menu.mobile_bottom_nav !== false}
              onChange={(v) => patchMenu({ mobile_bottom_nav: v })}
              label="نوار پایین موبایل"
            />

            <Accordion
              title="تنظیمات پیشرفته منو"
              open={openMenuAdvanced}
              onToggle={() => setOpenMenuAdvanced((v) => !v)}
            >
              <WidgetSiteTopNavSettings
                type="site_top_nav"
                settings={menu}
                onChange={(patch) => patchMenu(patch)}
              />
            </Accordion>
          </div>
        </Accordion>
      ) : null}

      {settings.show_menu !== false ? (
        <Accordion
          title="پروفایل و تاریخ"
          open={openProfile}
          onToggle={() => setOpenProfile((v) => !v)}
        >
          <div className={styles.wsStack}>
            <Toggle
              checked={profile.show_date !== false}
              onChange={(v) => patchMenu({ show_date: v })}
              label="نمایش تاریخ"
            />
            {profile.show_date !== false ? (
              <>
                <div
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
                >
                  <PxField
                    label="اندازه فونت"
                    min={9}
                    max={22}
                    value={profile.date_font_size || 11}
                    onChange={(v) => patchMenu({ date_font_size: v || 11 })}
                  />
                  <ColorField
                    label="رنگ تاریخ"
                    value={profile.color_date || '#a7f3d0'}
                    onChange={(v) => patchMenu({ color_date: v })}
                  />
                </div>
                <p className={styles.wsMiniLabel}>وزن فونت</p>
                <Seg
                  options={DATE_FONT_WEIGHTS.map((m) => ({
                    id: m.id,
                    label: m.label,
                  }))}
                  value={Number(profile.date_font_weight) || 400}
                  onChange={(id) => patchMenu({ date_font_weight: id })}
                />
              </>
            ) : null}

            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              حالت پروفایل
            </p>
            <Seg
              options={PROFILE_MODES}
              value={profile.profile_mode}
              onChange={(id) => patchMenu({ profile_mode: id })}
            />

            {profile.profile_mode !== 'hidden' ? (
              <>
                <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                  شکل آواتار
                </p>
                <Seg
                  options={PROFILE_SHAPES}
                  value={profile.avatar_shape || 'circle'}
                  onChange={(id) => patchMenu({ avatar_shape: id })}
                />
              </>
            ) : null}

            <Toggle
              checked={profile.guest_visible !== false}
              onChange={(v) => patchMenu({ guest_visible: v })}
              label="دکمه ورود مهمان"
            />
            {profile.guest_visible !== false ? (
              <label className={styles.wsField}>
                <span>متن دکمه</span>
                <input
                  type="text"
                  value={profile.guest_label || ''}
                  onChange={(e) => patchMenu({ guest_label: e.target.value })}
                />
              </label>
            ) : null}
          </div>
        </Accordion>
      ) : null}

      <Accordion
        title="اسلایدها"
        open={openDial}
        onToggle={() => setOpenDial((v) => !v)}
      >
        <div>
          {dialItems.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                border: '1px solid rgba(0,0,0,.08)',
                borderRadius: 12,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <label className={styles.wsField}>
                <span>برچسب</span>
                <input
                  type="text"
                  value={item.label || ''}
                  onChange={(e) => {
                    const next = dialItems.map((row, i) =>
                      i === idx ? { ...row, label: e.target.value } : row,
                    )
                    patchRoot('dial_items', next)
                  }}
                />
              </label>
              <label className={styles.wsField}>
                <span>عنوان</span>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => {
                    const next = dialItems.map((row, i) =>
                      i === idx ? { ...row, title: e.target.value } : row,
                    )
                    patchRoot('dial_items', next)
                  }}
                />
              </label>
              <label className={styles.wsField}>
                <span>توضیح</span>
                <textarea
                  rows={2}
                  value={item.desc || ''}
                  onChange={(e) => {
                    const next = dialItems.map((row, i) =>
                      i === idx ? { ...row, desc: e.target.value } : row,
                    )
                    patchRoot('dial_items', next)
                  }}
                />
              </label>
              <label className={styles.wsField}>
                <span>آدرس تصویر</span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={item.image || ''}
                  onChange={(e) => {
                    const next = dialItems.map((row, i) =>
                      i === idx ? { ...row, image: e.target.value } : row,
                    )
                    patchRoot('dial_items', next)
                  }}
                />
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <label className={styles.wsField} style={{ flex: 1 }}>
                  <span>رنگ</span>
                  <input
                    type="color"
                    value={item.color || '#10b981'}
                    onChange={(e) => {
                      const next = dialItems.map((row, i) =>
                        i === idx ? { ...row, color: e.target.value } : row,
                      )
                      patchRoot('dial_items', next)
                    }}
                  />
                </label>
                <label className={styles.wsField} style={{ flex: 1 }}>
                  <span>رنگ نرم</span>
                  <input
                    type="color"
                    value={item.color_soft || '#023c2c'}
                    onChange={(e) => {
                      const next = dialItems.map((row, i) =>
                        i === idx
                          ? { ...row, color_soft: e.target.value }
                          : row,
                      )
                      patchRoot('dial_items', next)
                    }}
                  />
                </label>
              </div>
              <button
                type="button"
                className={styles.wsSegBtn}
                onClick={() => {
                  patchRoot(
                    'dial_items',
                    dialItems.filter((_, i) => i !== idx),
                  )
                }}
              >
                حذف آیتم
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.wsSegBtn}
            onClick={() => {
              patchRoot('dial_items', [
                ...dialItems,
                {
                  id: `item_${Date.now()}`,
                  label: 'موضوع جدید',
                  title: 'عنوان اسلاید',
                  desc: 'توضیح کوتاه',
                  color: '#10b981',
                  color_soft: '#023c2c',
                  image: '',
                },
              ])
            }}
          >
            افزودن اسلاید
          </button>
        </div>
      </Accordion>

      <p className={styles.wsHint} style={{ marginTop: 10 }}>
        نوع ویجت: <code>{type || 'hero_with_menu'}</code>
      </p>
    </div>
  )
}
