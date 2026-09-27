// app/post-job/PostJobClient.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, ChevronLeft, Check, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import jobisellApi from '@/services/jobisellApi';

import Step1Type from './steps/Step1Type';
import Step2Basic from './steps/Step2Basic';
import Step3Location from './steps/Step3Location';
import Step4Details from './steps/Step4Details';
import Step5Features from './steps/Step5Features';
import Step6Salary from './steps/Step6Salary';
import Step7Contact from './steps/Step7Contact';

import styles from './PostJob.module.css';

// ============================================
// ✅ state اولیه فرم
// ============================================
const INITIAL_FORM = {
  // Step 1
  type: '',

  // Step 2
  title: '',
  description: '',

  // Step 3
  province: '',
  city: '',
  neighborhood: '',
  address: '',

  // Step 4
  cooperation_type: '',
  category: '',
  job_title: '',
  experience_level: '',
  education_level: '',
  gender: '',
  age_range: '',

  // Step 5
  features: [], // [{ feature: 1, value_boolean: true }, ...]

  // Step 6
  min_salary: '',
  max_salary: '',
  salary_range: '',

  // Step 7
  image: null,
  tags: [],
  contact_phone: '',
  contact_email: '',
};

export default function PostJobClient() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [filterOptions, setFilterOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState(null);

  // ============================================
  // ✅ چک لاگین
  // ============================================
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/post-job');
    }
  }, [authLoading, isAuthenticated, router]);

  // ============================================
  // ✅ بارگذاری گزینه‌های فیلتر
  // ============================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setOptionsLoading(true);
        const data = await jobisellApi.getFilterOptions();
        if (mounted) setFilterOptions(data);
      } catch (err) {
        console.error('Error loading options:', err);
      } finally {
        if (mounted) setOptionsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ============================================
  // ✅ تعریف مراحل
  // ============================================
  const steps = [
    { id: 'type', title: 'نوع آگهی', component: Step1Type },
    { id: 'basic', title: 'اطلاعات پایه', component: Step2Basic },
    { id: 'location', title: 'موقعیت مکانی', component: Step3Location },
    { id: 'details', title: 'جزئیات شغلی', component: Step4Details },
    // ویژگی‌ها فقط برای استخدام
    ...(form.type === 'hiring'
      ? [
          { id: 'features', title: 'مزایا و امکانات', component: Step5Features },
          { id: 'salary', title: 'حقوق و دستمزد', component: Step6Salary },
        ]
      : []),
    { id: 'contact', title: 'تماس و تصویر', component: Step7Contact },
  ];

  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // ============================================
  // ✅ به‌روزرسانی فیلد
  // ============================================
  const updateField = useCallback((key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // آبشاری
      if (key === 'province') {
        next.city = '';
        next.neighborhood = '';
      }
      if (key === 'city') {
        next.neighborhood = '';
      }

      // اگر نوع عوض شد، ویژگی‌ها را ریست کن
      if (key === 'type' && prev.type !== value) {
        next.features = [];
        if (value === 'seeking') {
          next.min_salary = '';
          next.max_salary = '';
          next.salary_range = '';
        }
      }

      return next;
    });
  }, []);

  // ============================================
  // ✅ اعتبارسنجی هر مرحله
  // ============================================
  const validateStep = useCallback((stepIndex) => {
    const step = steps[stepIndex];
    if (!step) return true;

    switch (step.id) {
      case 'type':
        return !!form.type;
      case 'basic':
        return form.title.trim().length >= 3 && form.description.trim().length >= 10;
      case 'location':
        return !!form.province && !!form.city;
      case 'details':
        return !!form.cooperation_type;
      case 'features':
        return true; // اختیاری
      case 'salary':
        return true; // اختیاری
      case 'contact':
        return true; // اختیاری
      default:
        return true;
    }
  }, [form, steps]);

  const canGoNext = validateStep(currentStep);

  // ============================================
  // ✅ ناوبری
  // ============================================
  const handleNext = () => {
    if (!canGoNext) return;
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
      scrollToTop();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((s) => s - 1);
      scrollToTop();
    }
  };

  const handleStepClick = (index) => {
    // فقط اگر قبلاً پرش کرده یا مرحله قبلی معتبر باشد
    if (index <= currentStep) {
      setCurrentStep(index);
      scrollToTop();
    }
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ============================================
  // ✅ ارسال به سرور
  // ============================================
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      // ساخت FormData برای آپلود تصویر
      const formData = new FormData();

      // فیلدهای ساده
      const simpleFields = [
        'type', 'title', 'description', 'address',
        'cooperation_type', 'category', 'job_title',
        'experience_level', 'education_level', 'gender', 'age_range',
        'contact_phone', 'contact_email',
      ];
      simpleFields.forEach((key) => {
        if (form[key] !== '' && form[key] != null) {
          formData.append(key, form[key]);
        }
      });

      // موقعیت
      if (form.province) formData.append('province', form.province);
      if (form.city) formData.append('city', form.city);
      if (form.neighborhood) formData.append('neighborhood', form.neighborhood);

      // حقوق (فقط استخدام)
      if (form.type === 'hiring') {
        if (form.min_salary) formData.append('min_salary', form.min_salary);
        if (form.max_salary) formData.append('max_salary', form.max_salary);
        if (form.salary_range) formData.append('salary_range', form.salary_range);
      }

      // تگ‌ها (آرایه)
      form.tags.forEach((tagId) => formData.append('tags', tagId));

      // ویژگی‌ها (آرایه‌ای از object) → به JSON
      if (form.features.length > 0) {
        formData.append('features', JSON.stringify(form.features));
      }

      // تصویر
      if (form.image) {
        formData.append('image', form.image);
      }

      const result = await jobisellApi.createJob(formData);
      setCreatedJobId(result.id);
      setSubmitSuccess(true);
      scrollToTop();
    } catch (err) {
      console.error('Submit error:', err);
      const data = err.response?.data;
      let msg = 'خطا در ثبت آگهی. لطفاً دوباره تلاش کنید.';
      if (typeof data === 'string') msg = data;
      else if (data?.detail) msg = data.detail;
      else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstErr = data[firstKey];
        msg = `${firstKey}: ${Array.isArray(firstErr) ? firstErr[0] : firstErr}`;
      }
      setSubmitError(msg);
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // ✅ در حال بارگذاری
  // ============================================
  if (authLoading || optionsLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Loader2 size={32} className={styles.spinner} />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // ============================================
  // ✅ صفحه موفقیت
  // ============================================
  if (submitSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <CheckCircle size={64} className={styles.successIcon} />
          <h1>آگهی شما با موفقیت ثبت شد!</h1>
          <p>
            آگهی شما در انتظار بررسی توسط مدیر است. پس از تایید، در سایت نمایش داده می‌شود.
          </p>
          <div className={styles.successActions}>
            <Link href={`/jobs/${createdJobId}`} className={styles.successBtn}>
              مشاهده آگهی
            </Link>
            <Link href="/" className={styles.successBtnSecondary}>
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // ✅ رندر Wizard
  // ============================================
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* هدر */}
        <div className={styles.header}>
          <h1 className={styles.title}>ثبت آگهی جدید</h1>
          <p className={styles.subtitle}>
            در {totalSteps} مرحله ساده، آگهی خود را ثبت کنید
          </p>
        </div>

        {/* Progress Steps */}
        <div className={styles.stepper}>
          {steps.map((step, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;
            const isClickable = index <= currentStep;

            return (
              <div key={step.id} className={styles.stepItem}>
                <button
                  className={`${styles.stepCircle} ${isDone ? styles.stepDone : ''} ${isActive ? styles.stepActive : ''}`}
                  onClick={() => isClickable && handleStepClick(index)}
                  disabled={!isClickable}
                  type="button"
                >
                  {isDone ? <Check size={16} /> : <span>{index + 1}</span>}
                </button>
                <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''}`}>
                  {step.title}
                </span>
                {index < totalSteps - 1 && <div className={styles.stepLine} />}
              </div>
            );
          })}
        </div>

        {/* خطا */}
        {submitError && (
          <div className={styles.errorBox}>
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        {/* محتوای مرحله */}
        <div className={styles.stepContent}>
          <CurrentStepComponent
            form={form}
            updateField={updateField}
            filterOptions={filterOptions}
          />
        </div>

        {/* دکمه‌های ناوبری */}
        <div className={styles.navButtons}>
          {!isFirstStep ? (
            <button
              className={styles.prevBtn}
              onClick={handlePrev}
              disabled={submitting}
              type="button"
            >
              <ChevronRight size={18} />
              مرحله قبل
            </button>
          ) : (
            <div />
          )}

          <button
            className={styles.nextBtn}
            onClick={handleNext}
            disabled={!canGoNext || submitting}
            type="button"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                در حال ثبت...
              </>
            ) : isLastStep ? (
              <>
                <Check size={18} />
                ثبت آگهی
              </>
            ) : (
              <>
                مرحله بعد
                <ChevronLeft size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}