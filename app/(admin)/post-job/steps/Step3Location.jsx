// app/post-job/steps/Step3Location.jsx
'use client';

import { useMemo } from 'react';
import { MapPin, Building2 } from 'lucide-react';
import styles from '../PostJob.module.css';

export default function Step3Location({ form, updateField, filterOptions }) {
  const availableCities = useMemo(() => {
    if (!form.province || !filterOptions?.cities) return [];
    return filterOptions.cities.filter(
      (c) => String(c.province) === String(form.province)
    );
  }, [filterOptions, form.province]);

  const availableNeighborhoods = useMemo(() => {
    if (!form.city || !filterOptions?.neighborhoods) return [];
    return filterOptions.neighborhoods.filter(
      (n) => String(n.city) === String(form.city)
    );
  }, [filterOptions, form.city]);

  return (
    <div className={styles.stepWrap}>
      <h2 className={styles.stepTitle}>موقعیت مکانی</h2>
      <p className={styles.stepSubtitle}>محل کار را مشخص کنید</p>

      <div className={styles.field}>
        <label className={styles.label}>
          استان <span className={styles.required}>*</span>
        </label>
        <select
          className={styles.select}
          value={form.province}
          onChange={(e) => updateField('province', e.target.value)}
        >
          <option value="">انتخاب استان</option>
          {filterOptions?.provinces?.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          شهر <span className={styles.required}>*</span>
        </label>
        <select
          className={styles.select}
          value={form.city}
          onChange={(e) => updateField('city', e.target.value)}
          disabled={!form.province}
        >
          <option value="">
            {!form.province ? 'اول استان را انتخاب کنید' : 'انتخاب شهر'}
          </option>
          {availableCities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>محله</label>
        <select
          className={styles.select}
          value={form.neighborhood}
          onChange={(e) => updateField('neighborhood', e.target.value)}
          disabled={!form.city}
        >
          <option value="">
            {!form.city ? 'اول شهر را انتخاب کنید' : 'انتخاب محله (اختیاری)'}
          </option>
          {availableNeighborhoods.map((n) => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>آدرس دقیق (اختیاری)</label>
        <input
          type="text"
          className={styles.input}
          placeholder="خیابان، پلاک، واحد"
          value={form.address}
          onChange={(e) => updateField('address', e.target.value)}
        />
      </div>
    </div>
  );
}