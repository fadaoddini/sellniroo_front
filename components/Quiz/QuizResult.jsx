// components/Quiz/QuizResult.jsx
'use client';

import styles from './QuizResult.module.css';
import { specialties } from './specialties';
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Target,
  RefreshCw,
  Home,
  Share2,
  Send,
  MessageCircle,
  Linkedin,
} from 'lucide-react';

export default function QuizResult({
  answers,
  score,
  totalQuestions,
  onReset,
  specialty,
}) {
  /* ============================================
     محاسبات
     ============================================ */
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const wrongCount = answers.filter(
    (a) => !a.isCorrect && a.answer !== 'زمان تمام شد'
  ).length;
  const timedOutCount = answers.filter(
    (a) => a.answer === 'زمان تمام شد'
  ).length;
  const percentage = totalQuestions
    ? Math.round((correctCount / totalQuestions) * 100)
    : 0;

  /* ============================================
     رتبه‌بندی
     ============================================ */
  const getRank = () => {
    if (percentage >= 90)
      return {
        title: 'استاد فروش',
        emoji: '👑',
        icon: Crown,
        color: '#ffd700',
        badgeColor: 'gold',
        description:
          'شما یک استاد واقعی فروش هستید! دانش شما در سطح بالایی قرار دارد.',
      };
    if (percentage >= 75)
      return {
        title: 'فروشنده حرفه‌ای',
        emoji: '🏆',
        icon: Trophy,
        color: '#c0c0c0',
        badgeColor: 'silver',
        description:
          'شما یک فروشنده حرفه‌ای هستید. دانش بسیار خوبی دارید!',
      };
    if (percentage >= 60)
      return {
        title: 'کارشناس فروش',
        emoji: '🥉',
        icon: Medal,
        color: '#cd7f32',
        badgeColor: 'bronze',
        description:
          'شما در مسیر درستی هستید. با تمرین بیشتر به سطح بالاتر می‌رسید.',
      };
    if (percentage >= 40)
      return {
        title: 'فروشنده در حال رشد',
        emoji: '📚',
        icon: TrendingUp,
        color: '#007aff',
        badgeColor: 'blue',
        description:
          'شما پایه‌های خوبی دارید. مطالعه و تمرین بیشتری توصیه می‌شود.',
      };
    return {
      title: 'تازه‌کار فروش',
      emoji: '🎯',
      icon: Target,
      color: '#8e8e93',
      badgeColor: 'gray',
      description:
        'هر فروشنده حرفه‌ای روزی تازه‌کار بوده. با تمرین و مطالعه به هدف خود می‌رسید.',
    };
  };

  const rank = getRank();
  const specialtyInfo = specialties.find((s) => s.id === specialty);

  /* ============================================
     دایره پیشرفت
     ============================================ */
  const circumference = 2 * Math.PI * 47;
  const offset = circumference - (percentage / 100) * circumference;

  const getCircleClass = () => {
    if (percentage >= 75) return '';
    if (percentage >= 50) return styles.warning;
    if (percentage >= 30) return styles.danger;
    return styles.heartbeat;
  };

  /* ============================================
     متن اشتراک‌گذاری
     ============================================ */
  const shareText = encodeURIComponent(
    `من در آزمون تخصصی ${specialtyInfo?.name || ''} سلنیرو ${percentage}% شدم! تو هم امتحان کن: https://sellniroo.com/quiz`
  );

  const shareLinks = [
    {
      name: 'تلگرام',
      icon: Send,
      className: styles.telegram,
      link: `https://t.me/share/url?url=${shareText}`,
    },
    {
      name: 'واتساپ',
      icon: MessageCircle,
      className: styles.whatsapp,
      link: `https://wa.me/?text=${shareText}`,
    },
    {
      name: 'لینکدین',
      icon: Linkedin,
      className: styles.linkedin,
      link: `https://linkedin.com/sharing/share-offsite/?url=https://sellniroo.com/quiz`,
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* ============ Header Row ============ */}
        <div className={styles.headerRow}>
          {/* Score Circle */}
          <div className={styles.scoreSection}>
            <div className={styles.scoreCircleWrapper}>
              <svg
                className={styles.scoreCircleSvg}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className={styles.scoreCircleBg}
                  cx="50"
                  cy="50"
                  r="47"
                />
                <circle
                  className={`${styles.scoreCircleProgress} ${getCircleClass()}`}
                  cx="50"
                  cy="50"
                  r="47"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className={styles.scoreCircleCenter}>
                <span className={styles.scoreNumber}>{percentage}</span>
                <span className={styles.scoreFraction}>درصد</span>
              </div>
            </div>
          </div>

          {/* Rank Section */}
          <div className={styles.rankSection}>
            <div className={`${styles.rankTitle} ${styles[rank.badgeColor]}`}>
              {rank.title}
            </div>
            <p className={styles.subtitleText}>
              شما در حوزه{' '}
              <strong>{specialtyInfo?.name || ''}</strong>، {correctCount} از{' '}
              {totalQuestions} سوال را درست پاسخ دادید
            </p>
            <p className={styles.descriptionText}>{rank.description}</p>
          </div>
        </div>

        {/* ============ Stats Grid ============ */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.green}`}>
              {correctCount}
            </span>
            <span className={styles.statLabel}>پاسخ صحیح</span>
          </div>

          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.red}`}>
              {wrongCount}
            </span>
            <span className={styles.statLabel}>پاسخ اشتباه</span>
          </div>

          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.orange}`}>
              {timedOutCount}
            </span>
            <span className={styles.statLabel}>زمان تمام شد</span>
          </div>

          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.purple}`}>
              {score}
            </span>
            <span className={styles.statLabel}>امتیاز کل</span>
          </div>
        </div>

        {/* ============ Action Buttons ============ */}
        <div className={styles.actionButtons}>
          <button onClick={onReset} className={styles.buttonPrimary}>
            <RefreshCw size={18} />
            آزمون مجدد
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className={styles.buttonSecondary}
          >
            <Home size={18} />
            صفحه اصلی
          </button>
        </div>

        {/* ============ Share ============ */}
        <div className={styles.shareSection}>
          <p className={styles.shareTitle}>
            <Share2 size={14} />
            نتیجه خود را با دوستان به اشتراک بگذارید
          </p>
          <div className={styles.shareButtons}>
            {shareLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.shareButton} ${social.className}`}
                >
                  <Icon size={16} className={styles.shareIcon} />
                  {social.name}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}