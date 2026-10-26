'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './AddressForm.module.css'

const NeshanMapPicker = dynamic(() => import('./NeshanMapPicker'), {
  ssr: false,
  loading: () => <p className={styles.hint}>در حال بارگذاری نقشه…</p>,
})

const DISCLAIMER =
  'مسئولیت صحت آدرس و محل تحویل بر عهده مشتری است. در صورت اشتباه بودن آدرس یا عدم دسترسی پیک، فروشگاه و سامانه هیچ مسئولیتی بابت تأخیر، مرجوعی یا هزینه‌های اضافی ارسال ندارند.'

const EMPTY = {
  name: '',
  family: '',
  mobile: '',
  address: '',
  description: '',
  latitude: null,
  longitude: null,
  mapPicked: false,
}

/**
 * فرم ساخت آدرس فقط با انتخاب روی نقشه نشان
 */
export default function AddressForm({
  user,
  shopLat,
  shopLng,
  busy = false,
  onCancel,
  onSubmit,
  onLocationChange,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    name: user?.first_name || '',
    family: user?.last_name || '',
    mobile: user?.mobile || '',
  }))
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  const canSave = useMemo(
    () =>
      form.mapPicked &&
      form.latitude != null &&
      form.longitude != null &&
      !!form.address?.trim() &&
      !!form.name?.trim() &&
      accepted &&
      !busy,
    [form, accepted, busy],
  )

  const handleSubmit = async () => {
    setError('')
    if (!form.mapPicked || form.latitude == null || form.longitude == null) {
      setError('ابتدا موقعیت را روی نقشه انتخاب کنید')
      return
    }
    if (!form.address?.trim()) {
      setError(
        'آدرس هنوز از نقشه دریافت نشده — کمی صبر کنید یا نقشه را جابه‌جا کنید',
      )
      return
    }
    if (!accepted) {
      setError('پذیرش مسئولیت صحت آدرس الزامی است')
      return
    }
    try {
      const lat = Number(Number(form.latitude).toFixed(6))
      const lng = Number(Number(form.longitude).toFixed(6))
      await onSubmit({
        name: form.name.trim(),
        family: form.family.trim() || form.name.trim(),
        mobile: (form.mobile || user?.mobile || '').trim() || '0',
        address: form.address.trim(),
        description: (form.description || '').trim(),
        latitude: lat,
        longitude: lng,
        codeposti: '0',
      })
    } catch (e) {
      setError(e?.message || 'ثبت آدرس ناموفق بود')
    }
  }

  return (
    <section className={styles.wrap} aria-label="ثبت آدرس جدید">
      <div className={styles.head}>
        <h3 className={styles.headTitle}>آدرس جدید روی نقشه</h3>
        <p className={styles.lead}>
          نقشه را حرکت دهید تا پین روی محل تحویل قرار گیرد. متن آدرس به‌صورت
          خودکار از نقشه نوشته می‌شود.
        </p>
      </div>

      <div className={styles.mapBlock}>
        <NeshanMapPicker
          initialLat={shopLat}
          initialLng={shopLng}
          height={300}
          onLocationSelect={(lat, lng) => {
            setForm((f) => ({
              ...f,
              latitude: lat,
              longitude: lng,
              mapPicked: true,
            }))
            onLocationChange?.(lat, lng)
          }}
          onAddressDetected={(text) => {
            if (!text?.trim()) return
            setForm((f) => ({
              ...f,
              address: text.trim(),
              mapPicked: true,
            }))
          }}
        />
      </div>

      {form.mapPicked && form.latitude != null ? (
        <p className={styles.coords}>
          موقعیت انتخاب‌شده: {Number(form.latitude).toFixed(5)},{' '}
          {Number(form.longitude).toFixed(5)}
        </p>
      ) : (
        <p className={styles.warnInline}>
          هنوز موقعیتی روی نقشه انتخاب نشده است.
        </p>
      )}

      <div className={styles.fields}>
        <label className={styles.label}>
          آدرس (از نقشه)
          <textarea
            className={`${styles.area} ${styles.readonly}`}
            readOnly
            rows={3}
            value={form.address}
            placeholder="پس از انتخاب روی نقشه اینجا پر می‌شود…"
          />
        </label>

        <label className={styles.label}>
          توضیحات (پلاک، واحد، زنگ، راهنمای رسیدن)
          <textarea
            className={styles.area}
            rows={2}
            value={form.description}
            placeholder="مثلاً پلاک ۱۲، واحد ۳، زنگ آبی"
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </label>

        <div className={styles.row2}>
          <label className={styles.label}>
            نام
            <input
              className={styles.field}
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
            />
          </label>
          <label className={styles.label}>
            نام خانوادگی
            <input
              className={styles.field}
              value={form.family}
              onChange={(e) =>
                setForm((f) => ({ ...f, family: e.target.value }))
              }
            />
          </label>
        </div>

        <label className={styles.label}>
          موبایل گیرنده
          <input
            className={styles.field}
            value={form.mobile}
            onChange={(e) =>
              setForm((f) => ({ ...f, mobile: e.target.value }))
            }
            placeholder="09…"
            dir="ltr"
          />
        </label>
      </div>

      <div className={styles.disclaimer}>
        <strong>هشدار مسئولیت آدرس</strong>
        <p>{DISCLAIMER}</p>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
          />
          <span>می‌پذیرم؛ صحت آدرس و تحویل بر عهده منِ مشتری است.</span>
        </label>
      </div>

      {error ? <p className={styles.err}>{error}</p> : null}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          disabled={!canSave}
          onClick={handleSubmit}
        >
          {busy ? 'در حال ثبت…' : 'افزودن به آدرس‌های من'}
        </button>
        {onCancel ? (
          <button type="button" className={styles.ghost} onClick={onCancel}>
            انصراف
          </button>
        ) : null}
      </div>
    </section>
  )
}

export { DISCLAIMER }
