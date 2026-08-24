// modules/lsf/TimelineSection/TimelineSection.jsx
'use client';

import styles from './TimelineSection.module.css';
import { useLsf } from '../context/LsfContext';

export default function TimelineSection() {
  const { timeline } = useLsf();

  return (
    <section id="timeline" className={styles.timeline}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{timeline.badge}</span>
        <h2 className={styles.sectionTitle}>{timeline.title}</h2>
        <p className={styles.sectionDesc}>{timeline.desc}</p>
      </div>

      <div className={styles.timelineContainer}>
        <div className={styles.timelineLine} />

        {timeline.items.map((item, index) => (
          <div
            key={item.step}
            className={`${styles.timelineItem} ${index % 2 === 1 ? styles.timelineItemEven : ''}`}
          >
            <div className={styles.timelineContent}>
              <div className={styles.timelineBox}>
                <div className={styles.timelineStep}>
                  <span className={styles.timelineStepNumber}>{item.step}</span>
                  <h3 className={styles.timelineStepTitle}>{item.title}</h3>
                </div>
                <p className={styles.timelineStepDesc}>{item.description}</p>
                <span className={styles.timelineStepDuration}>⏱️ {item.duration}</span>
              </div>
            </div>
            <div className={styles.timelineDotWrapper}>
              <div className={styles.timelineDot}>{item.step}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}