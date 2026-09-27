// app/post-job/steps/Step6Salary.jsx
'use client';

import styles from '../PostJob.module.css';

export default function Step6Salary({ form, updateField, filterOptions }) {
  return (
    <div className={styles.stepWrap}>
      <h2 className={styles.stepTitle}>حقوق و دستمزد</h2>
      <p className={styles.stepSubtitle}>
        بازه حقوقی مورد نظر را وارد کنید (اختیاری)
      </p>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>حداقل حقوق (تومان)</label>
          <input
            type="number"
            className={styles.input}
            placeholder="مثال: ۱۵۰۰۰۰۰۰"
            value={form.min_salary}
            onChange={(e) => updateField('min_salary', e.target.value)}
            min={0}
            step={1000000}
          />
          {form.min_salary && (
            <span className={styles.hint}>
              {Number(form.min_salary).toLocaleString('fa-IR')} تومان
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>حداکثر حقوق (تومان)</label>
          <input
            type="number"
            className={styles.input}
            placeholder="مثال: ۲۵۰۰۰۰۰۰"
            value={form.max_salary}
            onChange={(e) => updateField('max_salary', e.target.value)}
            min={0}
            step={1000000}
          />
          {form.max_salary && (
            <span className={styles.hint}>
              {Number(form.max_salary).toLocaleString('fa-IR')} تومان
            </span>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>یا یک بازه آماده انتخاب کنید</label>
        <select
          className={styles.select}
          value={form.salary_range}
          onChange={(e) => {
            updateField('salary_range', e.target.value);
          }}
        >
          <option value="">بازه‌ای انتخاب نشده</option>
          {filterOptions?.salary_ranges?.map((o) => (
            <option key={o.id} value={o.id}>{o.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
}