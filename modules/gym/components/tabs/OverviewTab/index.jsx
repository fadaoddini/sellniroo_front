// modules/gym/components/tabs/OverviewTab/index.jsx
'use client';

import React from 'react';
import {
  Users,
  Dumbbell,
  Clock,
  UserCog,
  Bell,
  ShoppingBag,
  BookOpen,
  Crown,
  Gem,
  Star,
  ChevronLeft,
  MessageCircle,
  Wallet,
  Plus,
  Sparkles,
} from 'lucide-react';
import styles from './OverviewTab.module.css';

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR');

const QUICK_LINKS = [
  { id: 'users', label: 'اعضا', desc: 'ثبت و مدیریت', icon: Users },
  { id: 'packages', label: 'بسته‌ها', desc: 'تعرفه و مدت', icon: Dumbbell },
  { id: 'sessions', label: 'سانس‌ها', desc: 'زمان‌بندی', icon: Clock },
  { id: 'trainers', label: 'مربیان', desc: 'تخصیص مربی', icon: UserCog },
  { id: 'products', label: 'محصولات', desc: 'فروشگاه', icon: ShoppingBag },
  { id: 'library', label: 'کتابخانه', desc: 'حرکت و غذا', icon: BookOpen },
];

export default function OverviewTab({
  stats,
  setActiveTab,
  planInfo,
  smsPanelInfo,
  onChargeSms,
}) {
  const alertCount = (stats?.expiringSoon || 0) + (stats?.expired || 0);
  const totalUsers = Number(stats?.totalUsers || 0);
  const total = totalUsers || 1;

  const metricCards = [
    {
      key: 'users',
      tab: 'users',
      icon: Users,
      value: stats.totalUsers,
      label: 'اعضا',
      sub: `${faNum(stats.activeUsers)} فعال`,
      tone: 'ink',
    },
    {
      key: 'packages',
      tab: 'packages',
      icon: Dumbbell,
      value: stats.totalPackages,
      label: 'بسته',
      tone: 'jewel',
    },
    {
      key: 'sessions',
      tab: 'sessions',
      icon: Clock,
      value: stats.totalSessions,
      label: 'سانس',
      tone: 'ink',
    },
    {
      key: 'trainers',
      tab: 'trainers',
      icon: UserCog,
      value: stats.totalTrainers,
      label: 'مربی',
      tone: 'jewel',
    },
    {
      key: 'products',
      tab: 'products',
      icon: ShoppingBag,
      value: stats.totalProducts,
      label: 'محصول',
      tone: 'ink',
    },
    {
      key: 'alerts',
      tab: 'alerts',
      icon: Bell,
      value: alertCount,
      label: 'هشدار',
      sub:
        alertCount > 0
          ? stats.expiringSoon > 0
            ? `${faNum(stats.expiringSoon)} نزدیک`
            : `${faNum(stats.expired)} منقضی`
          : 'پایدار',
      tone: alertCount > 0 ? 'warn' : 'ok',
    },
  ];

  const tiers = [
    { key: 'gold', label: 'طلایی', icon: Crown, count: stats.goldMembers || 0, color: '#b45309' },
    { key: 'silver', label: 'نقره‌ای', icon: Gem, count: stats.silverMembers || 0, color: '#64748b' },
    { key: 'bronze', label: 'برنزی', icon: Star, count: stats.bronzeMembers || 0, color: '#9a3412' },
  ];

  const credit = Number(smsPanelInfo?.credit ?? 0);
  const pricePerSms = Number(
    smsPanelInfo?.price_per_sms ?? smsPanelInfo?.pricePerSms ?? 0,
  );
  const smsCount = Number(
    smsPanelInfo?.sms_count ??
      (pricePerSms > 0 ? Math.floor(credit / pricePerSms) : 0),
  );

  return (
    <div className={styles.tabContent}>
      <div className={styles.metricsGrid}>
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.key}
              type="button"
              className={`${styles.metricCard} ${styles[`tone_${card.tone}`] || ''}`}
              onClick={() => setActiveTab(card.tab)}
            >
              <span className={styles.metricIcon}>
                <Icon size={14} />
              </span>
              <strong className={styles.metricValue}>{faNum(card.value)}</strong>
              <span className={styles.metricLabel}>{card.label}</span>
              {card.sub ? <em className={styles.metricSub}>{card.sub}</em> : null}
            </button>
          );
        })}
      </div>

      <div className={styles.bottomGrid}>
        <section className={styles.panelCard}>
          <header className={styles.panelHead}>
            <span className={styles.panelIcon}>
              <Sparkles size={14} />
            </span>
            <div>
              <h4>دسترسی سامانه</h4>
              <p>{planInfo?.name || 'فعال'}</p>
            </div>
          </header>
          {planInfo ? (
            <ul className={styles.panelMeta}>
              <li>
                <span>انقضا</span>
                <strong>{planInfo.expirationDate || '—'}</strong>
              </li>
              <li>
                <span>باقی‌مانده</span>
                <strong>
                  {planInfo.daysRemaining > 3000
                    ? 'بدون محدودیت'
                    : `${faNum(planInfo.daysRemaining)} روز`}
                </strong>
              </li>
              <li>
                <span>ظرفیت</span>
                <strong>
                  {faNum(planInfo.currentUsers)} / {faNum(planInfo.maxUsers)}
                </strong>
              </li>
            </ul>
          ) : (
            <p className={styles.panelEmpty}>اطلاعات پلن در دسترس نیست.</p>
          )}
        </section>

        <section className={styles.panelCard}>
          <header className={styles.panelHead}>
            <span className={`${styles.panelIcon} ${styles.panelIconSms}`}>
              <MessageCircle size={14} />
            </span>
            <div>
              <h4>پنل پیامکی</h4>
              <p>موجودی و شارژ</p>
            </div>
            {typeof onChargeSms === 'function' ? (
              <button
                type="button"
                className={styles.chargeBtn}
                onClick={onChargeSms}
              >
                <Plus size={12} />
                شارژ
              </button>
            ) : null}
          </header>
          {smsPanelInfo ? (
            <ul className={styles.panelMeta}>
              <li>
                <span>
                  <Wallet size={11} /> موجودی
                </span>
                <strong>{faNum(credit)} ت</strong>
              </li>
              <li>
                <span>پیامک</span>
                <strong className={smsCount < 100 ? styles.lowSms : undefined}>
                  {faNum(smsCount)}
                </strong>
              </li>
            </ul>
          ) : (
            <p className={styles.panelEmpty}>اطلاعات پیامک در دسترس نیست.</p>
          )}
        </section>

        <section className={styles.panelCard} aria-label="توزیع عضویت">
          <header className={styles.panelHead}>
            <span className={styles.panelIcon}>
              <Users size={14} />
            </span>
            <div>
              <h4>توزیع عضویت</h4>
              <p>{faNum(totalUsers)} عضو</p>
            </div>
          </header>
          <div className={styles.tierList}>
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const pct = Math.round((tier.count / total) * 100);
              return (
                <div key={tier.key} className={styles.tierRow}>
                  <div className={styles.tierMeta}>
                    <span
                      className={styles.tierIcon}
                      style={{ color: tier.color, background: `${tier.color}18` }}
                    >
                      <Icon size={12} />
                    </span>
                    <strong>{tier.label}</strong>
                    <em>{faNum(tier.count)}</em>
                  </div>
                  <div className={styles.tierTrack}>
                    <span
                      className={styles.tierFill}
                      style={{ width: `${pct}%`, background: tier.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {alertCount > 0 ? (
            <button
              type="button"
              className={styles.tierAlert}
              onClick={() => setActiveTab('alerts')}
            >
              <Bell size={12} />
              {faNum(alertCount)} هشدار
              <ChevronLeft size={12} />
            </button>
          ) : null}
        </section>
      </div>

      <div className={styles.sectionHead}>
        <h4>دسترسی سریع</h4>
        <p>ورود مستقیم به بخش‌های مدیریت</p>
      </div>

      <div className={styles.sectionsGrid}>
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={styles.sectionCard}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.sectionIcon}>
                <Icon size={15} />
              </span>
              <span className={styles.sectionText}>
                <strong>{item.label}</strong>
                <em>{item.desc}</em>
              </span>
              <ChevronLeft size={14} className={styles.sectionChevron} aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
