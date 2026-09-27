// app/post-job/steps/Step5Features.jsx
'use client';

import { Check } from 'lucide-react';
import styles from '../PostJob.module.css';

export default function Step5Features({ form, updateField, filterOptions }) {
  const features = filterOptions?.features || [];

  // چک می‌کند آیا این ویژگی در form هست یا نه
  const isFeatureActive = (featureId) => {
    return form.features.some((f) => f.feature === featureId);
  };

  // toggle
  const toggleFeature = (featureId) => {
    const exists = isFeatureActive(featureId);
    let updated;

    if (exists) {
      updated = form.features.filter((f) => f.feature !== featureId);
    } else {
      updated = [...form.features, { feature: featureId, value_boolean: true }];
    }

    updateField('features', updated);
  };

  return (
    <div className={styles.stepWrap}>
      <h2 className={styles.stepTitle}>مزایا و امکانات</h2>
      <p className={styles.stepSubtitle}>
        هر کدام از این مزایا که برای این شغل فراهم است را انتخاب کنید (اختیاری)
      </p>

      <div className={styles.featuresGrid}>
        {features.map((feat) => {
          const active = isFeatureActive(feat.id);
          return (
            <button
              key={feat.id}
              type="button"
              className={`${styles.featureChip} ${active ? styles.featureChipActive : ''}`}
              onClick={() => toggleFeature(feat.id)}
            >
              {active && <Check size={14} />}
              <span>{feat.name}</span>
            </button>
          );
        })}
      </div>

      <p className={styles.hint}>
        {form.features.length} مورد انتخاب شده
      </p>
    </div>
  );
}