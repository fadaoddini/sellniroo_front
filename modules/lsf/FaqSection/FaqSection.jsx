// modules/lsf/FaqSection/FaqSection.jsx
'use client';

import styles from './FaqSection.module.css';
import { ChevronDown } from 'lucide-react';
import { useLsf } from '../context/LsfContext';

export default function FaqSection() {
  const { faq } = useLsf();

  return (
    <section id="faq" className={styles.faq}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{faq.badge}</span>
        <h2 className={styles.sectionTitle}>{faq.title}</h2>
        <p className={styles.sectionDesc}>{faq.desc}</p>
      </div>

      <div className={styles.faqContainer}>
        {faq.items.map((item, index) => (
          <details key={index} className={styles.faqDetails}>
            <summary className={styles.faqSummary}>
              {item.question}
              <ChevronDown size={20} className={styles.faqIcon} />
            </summary>
            <div className={styles.faqAnswer}>
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}