// modules/gym/components/tabs/shared/StatusToggle.jsx
import { Check, X } from 'lucide-react';
import styles from './shared.module.css';

export default function StatusToggle({ status, onToggle }) {
  return (
    <button
      className={`${styles.statusToggle} ${styles[status]}`}
      onClick={onToggle}
    >
      {status === 'active' ? (
        <><Check size={14} /> فعال</>
      ) : (
        <><X size={14} /> غیرفعال</>
      )}
    </button>
  );
}