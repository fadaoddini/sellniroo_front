// app/post-job/PostJobClient.jsx
'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle,
  FilePlus2,
  Home,
} from 'lucide-react';
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

const INITIAL_FORM = {
  type: '',
  title: '',
  description: '',
  province: '',
  city: '',
  neighborhood: '',
  address: '',
  cooperation_type: '',
  category: '',
  job_title: '',
  experience_level: '',
  education_level: '',
  gender: '',
  age_range: '',
  features: [],
  min_salary: '',
  max_salary: '',
  salary_range: '',
  image: null,
  tags: [],
  contact_phone: '',
  contact_email: '',
};

export default function PostJobClient() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [filterOptions, setFilterOptions] = useState(null);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [createdJobId, setCreatedJobId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/post-job');
    }
  }, [authLoading, isAuthenticated, router]);

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

  const steps = useMemo(
    () => [
      { id: 'type', title: 'نوع آگهی', short: 'نوع', component: Step1Type },
      { id: 'basic', title: 'اطلاعات پایه', short: 'پایه', component: Step2Basic },
      { id: 'location', title: 'موقعیت مکانی', short: 'مکان', component: Step3Location },
      { id: 'details', title: 'جزئیات شغلی', short: 'جزئیات', component: Step4Details },
      ...(form.type === 'hiring'
        ? [
            { id: 'features', title: 'مزایا و امکانات', short: 'مزایا', component: Step5Features },
            { id: 'salary', title: 'حقوق و دستمزد', short: 'حقوق', component: Step6Salary },
          ]
        : []),
      { id: 'contact', title: 'تماس و تصویر', short: 'تماس', component: Step7Contact },
    ],
    [form.type]
  );

  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  // اگر تعداد مراحل کم شد (مثلاً از hiring به seeking)، ایندکس را اصلاح کن
  useEffect(() => {
    if (currentStep > totalSteps - 1) {
      setCurrentStep(Math.max(0, totalSteps - 1));
    }
  }, [currentStep, totalSteps]);

  const updateField = useCallback((key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'province') {
        next.city = '';
        next.neighborhood = '';
      }
      if (key === 'city') {
        next.neighborhood = '';
      }
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

  const validateStep = useCallback(
    (stepIndex) => {
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
        default:
          return true;
      }
    },
    [form, steps]
  );

  const canGoNext = validateStep(currentStep);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();
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

      if (form.province) formData.append('province', form.province);
      if (form.city) formData.append('city', form.city);
      if (form.neighborhood) formData.append('neighborhood', form.neighborhood);

      if (form.type === 'hiring') {
        if (form.min_salary) formData.append('min_salary', form.min_salary);
        if (form.max_salary) formData.append('max_salary', form.max_salary);
        if (form.salary_range) formData.append('salary_range', form.salary_range);
      }

      form.tags.forEach((tagId) => formData.append('tags', tagId));

      if (form.features.length > 0) {
        formData.append('features', JSON.stringify(form.features));
      }

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
    if (index <= currentStep) {
      setCurrentStep(index);
      scrollToTop();
    }
  };

  if (authLoading || optionsLoading) {
    return (
      <div className={styles.loadingWrap}>
        <Loader2 size={32} className={styles.spinner} />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (submitSuccess) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <div className={styles.successIconWrap}>
            <CheckCircle size={40} />
          </div>
          <h1>آگهی شما ثبت شد</h1>
          <p>
            آگهی در انتظار بررسی مدیر است. پس از تایید، در سایت نمایش داده می‌شود.
          </p>
          <div className={styles.successActions}>
            <Link href={`/jobs/${createdJobId}`} className={styles.successBtn}>
              مشاهده آگهی
            </Link>
            <Link href="/" className={styles.successBtnSecondary}>
              <Home size={16} />
              بازگشت به خانه
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const CurrentStepComponent = steps[currentStep]?.component;
  const currentMeta = steps[currentStep];

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerBadge}>
            <FilePlus2 size={16} />
            <span>فرم ثبت آگهی</span>
          </div>
          <h1 className={styles.title}>ثبت آگهی جدید</h1>
          <p className={styles.subtitle}>
            در {totalSteps} مرحله ساده، آگهی خود را کامل کنید
          </p>
        </header>

        {/* نوار پیشرفت */}
        <div className={styles.progressBlock}>
          <div className={styles.progressMeta}>
            <span className={styles.progressStep}>
              مرحله {currentStep + 1} از {totalSteps}
            </span>
            <span className={styles.progressPct}>{progress}٪</span>
          </div>
          <div className={styles.progressTrack} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <p className={styles.progressCurrent}>{currentMeta?.title}</p>
        </div>

        {/* استپر RTL: ترتیب DOM = آیتم، خط، آیتم… → از راست: ۱ ـ خط ـ ۲ */}
        <nav className={styles.stepper} aria-label="مراحل ثبت آگهی" dir="rtl">
          {steps.map((step, index) => {
            const isDone = index < currentStep;
            const isActive = index === currentStep;
            const isClickable = index <= currentStep;
            const connectorDone = index > 0 && index <= currentStep;

            return (
              <Fragment key={step.id}>
                {index > 0 && (
                  <div
                    className={`${styles.stepConnector} ${connectorDone ? styles.stepConnectorDone : ''}`}
                    aria-hidden="true"
                  />
                )}
                <div className={styles.stepItem}>
                  <button
                    className={`${styles.stepCircle} ${isDone ? styles.stepDone : ''} ${isActive ? styles.stepActive : ''}`}
                    onClick={() => isClickable && handleStepClick(index)}
                    disabled={!isClickable}
                    type="button"
                    aria-current={isActive ? 'step' : undefined}
                    title={step.title}
                  >
                    {isDone ? <Check size={14} /> : <span>{index + 1}</span>}
                  </button>
                  <span className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ''} ${isDone ? styles.stepLabelDone : ''}`}>
                    {step.short}
                  </span>
                </div>
              </Fragment>
            );
          })}
        </nav>

        {submitError && (
          <div className={styles.errorBox} role="alert">
            <AlertCircle size={18} />
            <span>{submitError}</span>
          </div>
        )}

        <div className={styles.stepContent}>
          {CurrentStepComponent && (
            <CurrentStepComponent
              form={form}
              updateField={updateField}
              filterOptions={filterOptions}
            />
          )}
        </div>

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
            <Link href="/" className={styles.cancelBtn}>
              انصراف
            </Link>
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
