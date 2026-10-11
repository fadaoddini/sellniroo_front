// app/post-job/steps/Step2Basic.jsx
'use client';

import styles from '../PostJob.module.css';

export default function Step2Basic({ form, updateField }) {
  return (
    <div className={styles.stepWrap}>
      <h2 className={styles.stepTitle}>عنوان و توضیحات آگهی</h2>
      <p className={styles.stepSubtitle}>
        عنوان باید حداقل ۳ کاراکتر و توضیحات حداقل ۱۰ کاراکتر باشد
      </p>

      <div className={styles.field}>
        <label className={styles.label}>
          عنوان آگهی <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="مثال: فروشنده حرفه‌ای محصولات صنعتی"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          maxLength={250}
        />
        <span className={styles.hint}>
          {form.title.length} / ۲۵۰
        </span>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          توضیحات <span className={styles.required}>*</span>
        </label>
        <textarea
          className={styles.textarea}
          placeholder="شرح کامل آگهی، شرایط، مسئولیت‌ها و ..."
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          rows={8}
        />
        <span className={styles.hint}>
          {form.description.length} کاراکتر
        </span>
      </div>
    </div>
  );
}