// modules/gym/components/PoolPage.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  ArrowLeft, Check, Sparkles, Star, Users, Waves,
  Shield, Clock, Award, Crown, Zap, Gem, Loader2,
} from 'lucide-react';
import Config from '@/config/config';
import { useAuth } from '@/contexts/AuthContext';
import styles from './PoolPage.module.css';

const iconMap = { Star, Gem, Crown, Zap, Sparkles };
const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price);

export default function PoolPage() {
  const router = useRouter();
  const { isAuthenticated, getAuthHeaders } = useAuth();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [purchasing, setPurchasing] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    business_name: '', business_phone: '', business_address: '',
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const url = Config.endpoints.club.subcategories.plans('pool');
        const response = await axios.get(url);
        const data = Array.isArray(response.data) ? response.data : response.data.results || [];
        setPlans(data);
      } catch (err) {
        setError('خطا در دریافت پلن‌ها. لطفاً دوباره تلاش کنید.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const getPrice = (plan) =>
    billingCycle === 'yearly'
      ? parseFloat(plan.yearly_price || plan.price * 12)
      : parseFloat(plan.price);

  const handleSelectPlan = (planId) =>
    setSelectedPlan(selectedPlan === planId ? null : planId);

  const handleChoosePlan = (plan) => {
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingPlanId', plan.id);
        localStorage.setItem('pendingBillingCycle', billingCycle);
        localStorage.setItem('pendingReturnUrl', '/gym/pool');
      }
      router.push('/login');
      return;
    }
    setSelectedPlan(plan.id);
    setShowCheckoutModal(true);
  };

  const handlePurchase = async () => {
    if (!selectedPlan || !businessForm.business_name.trim()) {
      alert('لطفاً نام کسب‌وکار را وارد کنید');
      return;
    }
    try {
      setPurchasing(true);
      const response = await axios.post(
        Config.endpoints.club.purchase(),
        {
          plan_id: selectedPlan,
          billing_cycle: billingCycle,
          ...businessForm,
        },
        { headers: getAuthHeaders() }
      );
      router.push(`/checkout/${response.data.transaction.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'خطا در ثبت سفارش');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.poolPage}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderContent}>
            <Link href="/gym" className={styles.backLink}>
              <ArrowLeft size={18} /> بازگشت به انتخاب باشگاه
            </Link>
            <div className={styles.pageHeaderMain}>
              <div className={styles.pageIconWrapper}>
                <Waves size={40} color="#4dabf7" />
              </div>
              <div>
                <div className={styles.pageBadge}>
                  <Sparkles size={14} /> <span>مدیریت مجموعه استخر</span>
                </div>
                <h1 className={styles.pageTitle}>
                  بسته انتخابی شما <span>کدام است؟</span>
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.plansContainer}>
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={48} />
            <p>در حال دریافت پلن‌ها...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.poolPage}>
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderContent}>
            <Link href="/gym" className={styles.backLink}>
              <ArrowLeft size={18} /> بازگشت به انتخاب باشگاه
            </Link>
          </div>
        </div>
        <div className={styles.plansContainer}>
          <div className={styles.errorState}>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={() => window.location.reload()}>
              تلاش دوباره
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.poolPage}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderContent}>
          <Link href="/gym" className={styles.backLink}>
            <ArrowLeft size={18} /> بازگشت به انتخاب باشگاه
          </Link>
          <div className={styles.pageHeaderMain}>
            <div className={styles.pageIconWrapper}>
              <Waves size={40} color="#4dabf7" />
            </div>
            <div>
              <div className={styles.pageBadge}>
                <Sparkles size={14} /> <span>مدیریت مجموعه استخر</span>
              </div>
              <h1 className={styles.pageTitle}>
                بسته انتخابی شما <span>کدام است؟</span>
              </h1>
              <p className={styles.pageSubtitle}>
                پلن مناسب استخر خود را انتخاب کنید و از امکانات پیشرفته REBO بهره‌مند شوید
              </p>
            </div>
          </div>

          <div className={styles.billingToggle}>
            <button
              className={`${styles.billingBtn} ${billingCycle === 'monthly' ? styles.billingBtnActive : ''}`}
              onClick={() => setBillingCycle('monthly')}
            >
              ماهانه
            </button>
            <button
              className={`${styles.billingBtn} ${billingCycle === 'yearly' ? styles.billingBtnActive : ''}`}
              onClick={() => setBillingCycle('yearly')}
            >
              سالانه <span className={styles.discountBadge}>۲۰٪ تخفیف</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.plansContainer}>
        <div className={styles.plansGrid}>
          {plans.map((plan) => {
            const Icon = iconMap[plan.icon_name] || Star;
            const isSelected = selectedPlan === plan.id;
            const currentPrice = getPrice(plan);

            return (
              <div
                key={plan.id}
                className={`${styles.planCard} ${isSelected ? styles.planCardSelected : ''} ${plan.is_popular ? styles.planCardPopular : ''}`}
                onClick={() => handleSelectPlan(plan.id)}
              >
                {plan.is_popular && plan.popular_badge && (
                  <div className={styles.popularBadge}>
                    <Zap size={14} /> {plan.popular_badge}
                  </div>
                )}
                {!plan.is_popular && plan.custom_badge && (
                  <div className={styles.customBadge}>{plan.custom_badge}</div>
                )}
                {isSelected && (
                  <div className={styles.selectedBadge}><Check size={16} /></div>
                )}

                <div className={styles.planHeader}>
                  <div className={styles.planIconWrapper} style={{ backgroundColor: plan.bg_color }}>
                    <Icon size={28} style={{ color: plan.color }} />
                  </div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.planPriceAmount}>{formatPrice(currentPrice)}</span>
                    <span className={styles.planPricePeriod}>
                      /{billingCycle === 'monthly' ? 'ماه' : 'سال'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.yearly_discount_percent > 0 && (
                    <div className={styles.savingsBadge}>
                      {plan.yearly_discount_percent}٪ صرفه‌جویی
                    </div>
                  )}
                  <div className={styles.planUsers}>
                    <Users size={14} />
                    <span>{plan.users_display || `تا ${plan.max_users} کاربر`}</span>
                  </div>
                </div>

                <div className={styles.planFeatures}>
                  {(plan.features || []).map((feature, index) => (
                    <div key={index} className={styles.planFeature}>
                      <Check size={16} style={{ color: plan.color }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.planAction}>
                  <button
                    className={`${styles.planButton} ${isSelected ? styles.planButtonActive : ''}`}
                    style={{
                      backgroundColor: isSelected ? plan.color : 'transparent',
                      borderColor: isSelected ? plan.color : 'rgba(255,255,255,0.2)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChoosePlan(plan);
                    }}
                  >
                    {isSelected ? 'انتخاب شده' : 'انتخاب این بسته'}
                    {!isSelected && <ArrowLeft size={16} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.benefitsSection}>
        <div className={styles.benefitsContent}>
          <h3 className={styles.benefitsTitle}>
            <Sparkles size={20} /> مزایای استفاده از REBO برای استخر
          </h3>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}><Clock size={20} /></div>
              <div>
                <h4>مدیریت سانس‌ها</h4>
                <p>برنامه‌ریزی دقیق سانس‌های شنا و مدیریت ظرفیت</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}><Users size={20} /></div>
              <div>
                <h4>رزرو آنلاین</h4>
                <p>سیستم رزرو اینترنتی برای شناگران</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}><Award size={20} /></div>
              <div>
                <h4>مدیریت مربیان</h4>
                <p>پروفایل و برنامه مربیان شنا</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <div className={styles.benefitIcon}><Shield size={20} /></div>
              <div>
                <h4>ایمنی و نجات‌غریق</h4>
                <p>سیستم مدیریت ایمنی و نجات‌غریقان</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <p className={styles.ctaText}>
            نیاز به مشاوره دارید؟{' '}
            <Link href="/contact" className={styles.ctaLink}>
              با کارشناسان ما تماس بگیرید
            </Link>
          </p>
        </div>
      </div>

      {showCheckoutModal && (
        <CheckoutModal
          plan={plans.find((p) => p.id === selectedPlan)}
          billingCycle={billingCycle}
          form={businessForm}
          setForm={setBusinessForm}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={handlePurchase}
          loading={purchasing}
        />
      )}
    </div>
  );
}

function CheckoutModal({ plan, billingCycle, form, setForm, onClose, onConfirm, loading }) {
  if (!plan) return null;
  const price = billingCycle === 'yearly'
    ? parseFloat(plan.yearly_price || plan.price * 12)
    : parseFloat(plan.price);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>ثبت اطلاعات کسب‌وکار</h3>
          <button className={styles.modalClose} onClick={onClose}>×</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.planSummary}>
            <div className={styles.planSummaryRow}>
              <span>پلن:</span><strong>{plan.name}</strong>
            </div>
            <div className={styles.planSummaryRow}>
              <span>دوره:</span>
              <strong>{billingCycle === 'monthly' ? 'ماهانه' : 'سالانه'}</strong>
            </div>
            <div className={styles.planSummaryRow}>
              <span>مبلغ:</span>
              <strong>{formatPrice(price)} تومان</strong>
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>نام کسب‌وکار *</label>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="مثال: استخر آریا"
            />
          </div>
          <div className={styles.formGroup}>
            <label>شماره تماس</label>
            <input
              type="tel"
              value={form.business_phone}
              onChange={(e) => setForm({ ...form, business_phone: e.target.value })}
              placeholder="021-12345678"
            />
          </div>
          <div className={styles.formGroup}>
            <label>آدرس</label>
            <textarea
              rows={3}
              value={form.business_address}
              onChange={(e) => setForm({ ...form, business_address: e.target.value })}
              placeholder="آدرس کسب‌وکار"
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose} disabled={loading}>انصراف</button>
          <button className={styles.btnConfirm} onClick={onConfirm} disabled={loading}>
            {loading ? 'در حال ثبت...' : 'ثبت و ادامه به پرداخت'}
          </button>
        </div>
      </div>
    </div>
  );
}