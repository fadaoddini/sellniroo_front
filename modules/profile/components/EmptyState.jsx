// modules/profile/components/EmptyState.jsx
"use client";

import Link from "next/link";
import styles from "../styles/EmptyState.module.css";

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}) => {
  return (
    <div className={styles.empty}>
      {Icon && (
        <div className={styles.iconWrapper}>
          <Icon size={42} />
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}

      {actionLabel && actionHref && (
        <Link href={actionHref} className={styles.actionBtn}>
          {actionLabel}
        </Link>
      )}

      {actionLabel && onAction && !actionHref && (
        <button className={styles.actionBtn} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;