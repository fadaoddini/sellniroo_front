// app/post-job/steps/Step4Details.jsx
'use client';

import styles from '../PostJob.module.css';

export default function Step4Details({ form, updateField, filterOptions }) {
  const availableJobTitles = filterOptions?.job_titles || [];

  return (
    <div className={styles.stepWrap}>
      <h2 className={styles.stepTitle}>جزئیات شغلی</h2>
      <p className={styles.stepSubtitle}>
        اطلاعات تکمیلی درباره موقعیت شغلی
      </p>

      <div className={styles.field}>
        <label className={styles.label}>
          نوع همکاری <span className={styles.required}>*</span>
        </label>
        <select
          className={styles.select}
          value={form.cooperation_type}
          onChange={(e) => updateField('cooperation_type', e.target.value)}
        >
          <option value="">انتخاب کنید</option>
          {filterOptions?.cooperation_types?.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>دسته‌بندی شغلی</label>
        <select
          className={styles.select}
          value={form.category}
          onChange={(e) => updateField('category', e.target.value)}
        >
          <option value="">انتخاب کنید (اختیاری)</option>
          {filterOptions?.categories?.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>عنوان شغلی</label>
        <select
          className={styles.select}
          value={form.job_title}
          onChange={(e) => updateField('job_title', e.target.value)}
        >
          <option value="">انتخاب کنید (اختیاری)</option>
          {availableJobTitles.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>سابقه کار</label>
          <select
            className={styles.select}
            value={form.experience_level}
            onChange={(e) => updateField('experience_level', e.target.value)}
          >
            <option value="">انتخاب کنید</option>
            {filterOptions?.experience_levels?.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>مدرک تحصیلی</label>
          <select
            className={styles.select}
            value={form.education_level}
            onChange={(e) => updateField('education_level', e.target.value)}
          >
            <option value="">انتخاب کنید</option>
            {filterOptions?.education_levels?.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>جنسیت</label>
          <select
            className={styles.select}
            value={form.gender}
            onChange={(e) => updateField('gender', e.target.value)}
          >
            <option value="">انتخاب کنید</option>
            {filterOptions?.genders?.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>بازه سنی</label>
          <input
            type="text"
            className={styles.input}
            placeholder="مثال: ۲۵ تا ۴۰ سال"
            value={form.age_range}
            onChange={(e) => updateField('age_range', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}