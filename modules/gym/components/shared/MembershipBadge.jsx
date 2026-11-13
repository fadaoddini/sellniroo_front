// modules/gym/components/tabs/shared/MembershipBadge.jsx
import styles from './shared.module.css';

const LABEL_MAP = {
  'برنزی': 'برنزی',
  'نقره‌ای': 'نقره‌ای',
  'طلایی': 'طلایی',
  bronze: 'برنزی',
  silver: 'نقره‌ای',
  gold: 'طلایی',
};

const CLASS_MAP = {
  'برنزی': 'bronze',
  'نقره‌ای': 'silver',
  'طلایی': 'gold',
  bronze: 'bronze',
  silver: 'silver',
  gold: 'gold',
};

export default function MembershipBadge({ level }) {
  if (!level) return null;
  const label = LABEL_MAP[level] || level;
  const cls = CLASS_MAP[level] || 'bronze';
  return (
    <span className={`${styles.membershipBadge} ${styles[cls]}`}>
      {label}
    </span>
  );
}