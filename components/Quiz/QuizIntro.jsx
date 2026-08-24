// components/Quiz/QuizIntro.jsx
'use client';

import { useState } from 'react';
import styles from './Quiz.module.css';
import { specialties } from './specialties';

export default function QuizIntro({ onStart, totalQuestions }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  const handleStart = () => {
    if (!selectedSpecialty) return;
    setIsLoading(true);
    setTimeout(() => {
      onStart(selectedSpecialty);
    }, 300);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.header}>
          <div className={styles.badge}> 
            هلدینگ آریااِستاد
          </div>
          <h1 className={styles.title}>چالش مهندسان ساختمان</h1>
          <p className={styles.subtitle}>
            حوزه تخصصی خود را انتخاب کنید و دانش خود را بسنجید
          </p>
       
        </div>

        <div className={styles.specialtyGrid}>
          {specialties.map((specialty) => {
            const Icon = specialty.icon;
            const isActive = selectedSpecialty === specialty.id;
            return (
              <button
                key={specialty.id}
                className={`${styles.specialtyButton} ${isActive ? styles.specialtyButtonActive : ''}`}
                onClick={() => setSelectedSpecialty(specialty.id)}
              >
                <Icon size={28} className={styles.specialtyIcon} />
                <span className={styles.specialtyName}>{specialty.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleStart}
          disabled={isLoading || !selectedSpecialty}
          className={styles.buttonPrimary}
        >
          {isLoading 
            ? 'در حال شروع...' 
            : selectedSpecialty 
              ? 'شروع آزمون' 
              : 'لطفاً یک حوزه تخصصی انتخاب کنید'}
        </button>

        <p className={styles.footerText}>
          ⚡ هر حوزه شامل تعدادی سوال تخصصی است • هر سوال ۲۰ ثانیه زمان دارد
        </p>
      </div>
    </div>
  );
}