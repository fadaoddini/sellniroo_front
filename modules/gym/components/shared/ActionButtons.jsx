// modules/gym/components/tabs/shared/ActionButtons.jsx
import { Eye, Edit, Trash2 } from 'lucide-react';
import styles from './shared.module.css';

export default function ActionButtons({ onView, onEdit, onDelete }) {
  return (
    <div className={styles.actionButtons}>
      {onView && (
        <button className={styles.actionBtn} onClick={onView}>
          <Eye size={16} />
        </button>
      )}
      {onEdit && (
        <button className={styles.actionBtn} onClick={onEdit}>
          <Edit size={16} />
        </button>
      )}
      {onDelete && (
        <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={onDelete}>
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}