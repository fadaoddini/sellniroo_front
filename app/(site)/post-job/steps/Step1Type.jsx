// app/post-job/steps/Step1Type.jsx
'use client';

import { Briefcase, User, Check } from 'lucide-react';
import styles from '../PostJob.module.css';

export default function Step1Type({ form, updateField }) {
  const options = [
    {
      id: 'hiring',
      title: 'استخدام',
      desc: 'می‌خواهم نیرو استخدام کنم',
      icon: Briefcase,
      color: '#e67e22',
    },
    {
      id: 'seeking',
      title: 'کارجو',
      desc: 'به دنبال شغل هستم',
      icon: User,
      color: '#2ecc71',
    },
  ];

  return (
    <div className={styles.stepWrap}>
      <h2 className={styles.stepTitle}>آگهی شما از چه نوعی است؟</h2>
      <p className={styles.stepSubtitle}>
        یکی از گزینه‌های زیر را انتخاب کنید
      </p>

      <div className={styles.typeGrid}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isSelected = form.type === opt.id;

          return (
            <button
              key={opt.id}
              type="button"
              className={`${styles.typeCard} ${isSelected ? styles.typeCardSelected : ''}`}
              onClick={() => updateField('type', opt.id)}
              style={isSelected ? { borderColor: opt.color } : {}}
            >
              <div
                className={styles.typeIcon}
                style={isSelected ? { background: opt.color, color: '#fff' } : {}}
              >
                <Icon size={32} />
              </div>
              <h3 className={styles.typeTitle}>{opt.title}</h3>
              <p className={styles.typeDesc}>{opt.desc}</p>
              {isSelected && (
                <div className={styles.typeCheck} style={{ background: opt.color }}>
                  <Check size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}