// modules/lsf/FactoriesSection/FactoriesSection.jsx
'use client';

import styles from './FactoriesSection.module.css';
import Image from 'next/image';
import { MapPin, Package, Users } from 'lucide-react';
import { useLsf } from '../context/LsfContext';

export default function FactoriesSection() {
  const { factories } = useLsf();

  return (
    <section id="factories" className={styles.factories}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{factories.badge}</span>
        <h2 className={styles.sectionTitle}>{factories.title}</h2>
        <p className={styles.sectionDesc}>{factories.desc}</p>
      </div>

      <div className={styles.factoriesGrid}>
        {factories.items.map((factory) => (
          <div key={factory.id} className={styles.factoryCard}>
            <div className={styles.factoryImage}>
              <Image
                src={factory.image}
                alt={factory.name}
                fill
                className="object-cover"
              />
            </div>
            <h3 className={styles.factoryName}>{factory.name}</h3>
            <div className={styles.factoryInfo}>
              <p className={styles.factoryInfoItem}>
                <MapPin size={16} />
                {factory.location}
              </p>
              <p className={styles.factoryInfoItem}>
                <Package size={16} />
                {factories.capacityLabel} {factory.capacity}
              </p>
         
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}