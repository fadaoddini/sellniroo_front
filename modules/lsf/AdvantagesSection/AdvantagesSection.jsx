// modules/lsf/AdvantagesSection/AdvantagesSection.jsx
'use client';

import styles from './AdvantagesSection.module.css';
import { Shield, Zap, Leaf, Flame, Wind, Droplet } from 'lucide-react';
import { useLsf } from '../context/LsfContext';

const ICON_MAP = {
  'مقاوم در برابر زلزله': Shield,
  'Earthquake Resistant': Shield,
  'سرعت اجرای بالا': Zap,
  'High Execution Speed': Zap,
  'سازگار با محیط زیست': Leaf,
  'Eco-Friendly': Leaf,
  'مقاوم در برابر آتش': Flame,
  'Fire Resistant': Flame,
  'عایق صوتی': Wind,
  'Sound Insulation': Wind,
  'مقاوم در برابر رطوبت': Droplet,
  'Moisture Resistant': Droplet,
};

export default function AdvantagesSection() {
  const { advantages } = useLsf();

  const getIcon = (title) => {
    const IconComponent = ICON_MAP[title];
    return IconComponent ? <IconComponent size={24} /> : <Shield size={24} />;
  };

  return (
    <section id="advantages" className={styles.advantages}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{advantages.badge}</span>
        <h2 className={styles.sectionTitle}>{advantages.title}</h2>
        <p className={styles.sectionDesc}>{advantages.desc}</p>
      </div>

      <div className={styles.advantagesGrid}>
        {advantages.items.map((item) => (
          <div key={item.id} className={styles.advantageCard}>
            <div className={styles.advantageIcon}>{getIcon(item.title)}</div>
            <h3 className={styles.advantageTitle}>{item.title}</h3>
            <p className={styles.advantageDesc}>{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}