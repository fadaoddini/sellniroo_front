// modules/lsf/ProductsSection/ProductsSection.jsx
'use client';

import styles from './ProductsSection.module.css';
import Image from 'next/image';
import { useLsf } from '../context/LsfContext';

export default function ProductsSection() {
  const { products } = useLsf();

  return (
    <section id="products" className={styles.products}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionBadge}>{products.badge}</span>
        <h2 className={styles.sectionTitle}>{products.title}</h2>
        <p className={styles.sectionDesc}>{products.desc}</p>
      </div>

      <div className={styles.productsGrid}>
        {products.items.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImage}>
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <h3 className={styles.productTitle}>{product.title}</h3>
            <p className={styles.productDesc}>{product.description}</p>
            <div className={styles.productFeatures}>
              {product.features.map((feature, i) => (
                <span key={i} className={styles.productFeature}>{feature}</span>
              ))}
            </div>
            <div className={styles.productFooter}>
              <span className={styles.productPrice}>{product.price}</span>
              <button type="button" className={styles.productBtn}>{products.btn}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}