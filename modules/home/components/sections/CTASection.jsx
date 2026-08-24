// modules/lsf/ContactSection/ContactSection.jsx
'use client';

import styles from '../../styles/ContactSection.module.css';
import { useState, useEffect } from 'react';
import { Phone, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';  // ✅ اضافه کردن
import Config from '@/config/config';
import axios from 'axios';

export default function ContactSection() {
  // ✅ استفاده از Context زبان
  const { language, t, dir } = useLanguage();
  const isFa = language === 'fa';
  
  // ✅ state برای ذخیره انواع درخواست از دیتابیس
  const [requestTypes, setRequestTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    request_type_id: null,
  });
  const [formStatus, setFormStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [formError, setFormError] = useState('');
  const [requestNumber, setRequestNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ اطلاعات تماس - دو زبانه
const contactInfo = {
    title: isFa ? 'مشاوره و ارتباط با ما' : 'Consultation & Contact Us',
    desc: isFa 
      ? 'برای دریافت مشاوره تخصصی و اطلاعات بیشتر، فرم زیر را تکمیل کنید. کارشناسان ما در اسرع وقت با شما تماس می‌گیرند.'
      : 'Fill out the form below to get expert consultation and more information. Our experts will contact you as soon as possible.',
    phone: '۰۵۱۳۷۶۸۸۵۰۰',
    phoneLabel: isFa ? 'تلفن ثابت ' : 'Phone (24/7 Support)',
    mobile: '۰۹۱۵۱۲۴۴۸۹۸',
    mobileLabel: isFa ? 'شماره موبایل (ارتباط با کارشناس)' : 'Mobile (Expert Contact)',
    email: 'info@ariastudholding.com',
    emailLabel: isFa ? 'ایمیل' : 'Email',
    form: {
      name: isFa ? 'نام و نام خانوادگی' : 'Full Name',
      phone: isFa ? 'شماره موبایل' : 'Phone Number',
      email: isFa ? 'ایمیل (اختیاری)' : 'Email (Optional)',
      message: isFa ? 'متن درخواست شما...' : 'Your request...',
      submit: isFa ? 'ارسال درخواست' : 'Submit Request',
      success: isFa 
        ? 'درخواست شما با موفقیت ثبت شد!' 
        : 'Your request has been successfully submitted!',
      error: isFa 
        ? 'خطا در ارسال درخواست. لطفاً مجدداً تلاش کنید.'
        : 'Error submitting request. Please try again.',
    }
  };

  // ✅ دریافت انواع درخواست از دیتابیس
  useEffect(() => {
    const fetchRequestTypes = async () => {
      try {
        setLoadingTypes(true);
        setTypesError(null);
        
        const apiUrl = Config.endpoints.requser.types();
        console.log('🔍 Fetching request types from:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          timeout: 5000,
        });
        
        console.log('📦 Request types response:', response.data);
        
        let types = [];
        if (response.data && response.data.results) {
          types = response.data.results;
        } else if (Array.isArray(response.data)) {
          types = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          types = response.data.data;
        }
        
        types = types.filter(t => t.is_active !== false);
        
        setRequestTypes(types);
        
        if (types.length > 0) {
          setFormData(prev => ({
            ...prev,
            request_type_id: types[0].id
          }));
        }
        
      } catch (error) {
        console.error('❌ Error fetching request types:', error);
        setTypesError(isFa ? 'خطا در دریافت انواع درخواست' : 'Error fetching request types');
        
        // مقادیر پیش‌فرض در صورت خطا
        const fallbackTypes = [
          { id: 1, name: isFa ? 'مشاوره' : 'Consulting', name_en: 'Consulting' },
          { id: 2, name: isFa ? 'همکاری' : 'Cooperation', name_en: 'Cooperation' },
          { id: 3, name: isFa ? 'فروش عمده' : 'Wholesale', name_en: 'Wholesale' },
          { id: 4, name: isFa ? 'پشتیبانی فنی' : 'Technical Support', name_en: 'Technical Support' },
        ];
        setRequestTypes(fallbackTypes);
        setFormData(prev => ({
          ...prev,
          request_type_id: 1
        }));
      } finally {
        setLoadingTypes(false);
      }
    };
    
    fetchRequestTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);  // ✅ وقتی زبان تغییر می‌کند، دوباره fetch کن

  // ✅ تابع اعتبارسنجی شماره موبایل
  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '').replace(/-/g, '').replace(/_/g, '');
    
    let formatted = cleaned;
    if (!formatted.startsWith('0')) {
      formatted = '0' + formatted;
    }
    
    if (formatted.length > 11) {
      formatted = formatted.slice(0, 11);
    }
    
    const phoneRegex = /^09\d{9}$/;
    return {
      isValid: phoneRegex.test(formatted),
      formatted: formatted,
      original: cleaned
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // اعتبارسنجی نام
    if (!formData.name.trim()) {
      setFormError(isFa ? 'لطفاً نام و نام خانوادگی خود را وارد کنید' : 'Please enter your full name');
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    // اعتبارسنجی شماره موبایل
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      setFormError(isFa 
        ? 'شماره موبایل باید ۱۱ رقم و با 09 شروع شود (مثال: 09123456789)'
        : 'Phone number must be 11 digits and start with 09 (e.g., 09123456789)'
      );
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    // اعتبارسنجی پیام
    if (!formData.message.trim()) {
      setFormError(isFa ? 'لطفاً توضیحات درخواست خود را وارد کنید' : 'Please enter your request details');
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    // اعتبارسنجی نوع درخواست
    if (!formData.request_type_id) {
      setFormError(isFa ? 'لطفاً نوع درخواست را انتخاب کنید' : 'Please select a request type');
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setFormStatus('loading');
    setFormError('');

    try {
      const formattedPhone = phoneValidation.formatted;
      
      const selectedType = requestTypes.find(t => t.id === formData.request_type_id);
      const typeName = selectedType 
        ? (isFa ? selectedType.name : (selectedType.name_en || selectedType.name))
        : (isFa ? 'درخواست' : 'Request');
      
      const payload = {
        title: `${typeName} - ${formData.name.trim()}`,
        description: formData.message.trim(),
        customer_name: formData.name.trim(),
        customer_mobile: formattedPhone,
        customer_email: formData.email.trim() || '',
        request_type: formData.request_type_id,
        source: 'website_lsf_contact',
      };

      console.log('📤 Sending payload:', payload);

      const apiUrl = Config.endpoints.requser.create();
      console.log('🔗 API URL:', apiUrl);

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('✅ Response from API:', response.data);

      if (response.data && response.data.status === 'ok') {
        setFormStatus('success');
        setRequestNumber(response.data.request_number || '');
        
        setFormData(prev => ({
          ...prev,
          name: '',
          phone: '',
          email: '',
          message: '',
        }));

        setTimeout(() => {
          setFormStatus(null);
          setRequestNumber('');
        }, 5000);
      } else {
        throw new Error(response.data?.message || (isFa ? 'خطا در ارسال درخواست' : 'Error submitting request'));
      }

    } catch (error) {
      console.error('❌ Error submitting form:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = isFa ? 'خطا در ارسال درخواست' : 'Error submitting request';
      
      if (error.response?.data) {
        const data = error.response.data;
        
        if (data.errors) {
          const errorList = [];
          for (const [field, errors] of Object.entries(data.errors)) {
            if (Array.isArray(errors)) {
              errorList.push(`${field}: ${errors.join(', ')}`);
            } else {
              errorList.push(`${field}: ${errors}`);
            }
          }
          errorMessage = errorList.join(' | ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        } else if (data.error_list && data.error_list.length > 0) {
          errorMessage = data.error_list.join(' | ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setFormError(errorMessage);
      setFormStatus('error');
      
      setTimeout(() => {
        setFormStatus(null);
        setFormError('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (formError) {
      setFormError('');
    }
  };

  return (
    <section id="consulting" className={styles.contact} dir={dir}>
      <div className={styles.contactGrid}>
        <div>
          <h2 className={styles.contactTitle}>{contactInfo.title}</h2>
          <p className={styles.contactDesc}>{contactInfo.desc}</p>
          
          <div className={styles.contactInfo}>
            {/* تلفن */}
            <div className={styles.contactInfoItem}>
              <Phone size={24} />
              <div>
                <div className={styles.contactInfoLabel}>{contactInfo.phone}</div>
                <div className={styles.contactInfoSub}>{contactInfo.phoneLabel}</div>
              </div>
            </div>
            
            {/* موبایل */}
            {contactInfo.mobile && (
              <div className={styles.contactInfoItem}>
                <Phone size={24} />
                <div>
                  <div className={styles.contactInfoLabel}>{contactInfo.mobile}</div>
                  <div className={styles.contactInfoSub}>{contactInfo.mobileLabel}</div>
                </div>
              </div>
            )}
            
            {/* ایمیل */}
            <div className={styles.contactInfoItem}>
              <Mail size={24} />
              <div>
                <div className={styles.contactInfoLabel}>{contactInfo.email}</div>
                <div className={styles.contactInfoSub}>{contactInfo.emailLabel}</div>
              </div>
            </div>
          </div>

          {/* نمایش شماره درخواست در صورت موفقیت */}
          {requestNumber && (
            <div className={styles.requestNumberBox}>
              <CheckCircle size={20} color="#2e7d32" />
              <span>
                {isFa ? 'شماره پیگیری درخواست شما: ' : 'Your tracking number: '}
                <strong style={{ direction: 'ltr', display: 'inline-block' }}> {requestNumber} </strong>
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.contactForm}>
          {/* نام و نام خانوادگی */}
          <div className={styles.contactFormRow}>
            <input
              type="text"
              name="name"
              placeholder={contactInfo.form.name}
              className={styles.contactInput}
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder={contactInfo.form.phone}
              className={styles.contactInput}
              value={formData.phone}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </div>

          {/* ایمیل */}
          <input
            type="email"
            name="email"
            placeholder={contactInfo.form.email}
            className={styles.contactInput}
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />

          {/* نوع درخواست - داینامیک از دیتابیس */}
          <select
            name="request_type_id"
            className={styles.contactSelect}
            value={formData.request_type_id || ''}
            onChange={handleInputChange}
            disabled={isSubmitting || loadingTypes}
          >
            {loadingTypes ? (
              <option value="">{isFa ? '🔄 در حال بارگذاری...' : '🔄 Loading...'}</option>
            ) : typesError ? (
              <option value="">⚠️ {typesError}</option>
            ) : requestTypes.length === 0 ? (
              <option value="">{isFa ? '❌ نوع درخواستی موجود نیست' : '❌ No request types available'}</option>
            ) : (
              requestTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon && <span>{type.icon}</span>} {isFa ? type.name : (type.name_en || type.name)}
                </option>
              ))
            )}
          </select>

          {/* پیام */}
          <textarea
            name="message"
            placeholder={contactInfo.form.message}
            className={styles.contactTextarea}
            value={formData.message}
            onChange={handleInputChange}
            disabled={isSubmitting}
            rows={5}
          />

          {/* دکمه ارسال */}
          <button 
            type="submit" 
            className={styles.contactSubmit}
            disabled={isSubmitting || loadingTypes || requestTypes.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className={styles.spinning} />
                {isFa ? 'در حال ارسال...' : 'Submitting...'}
              </>
            ) : (
              contactInfo.form.submit
            )}
          </button>

          {/* نمایش پیام‌ها */}
          {formStatus === 'success' && (
            <div className={styles.contactSuccess}>
              <CheckCircle size={18} />
              {contactInfo.form.success}
            </div>
          )}

          {formStatus === 'error' && (
            <div className={styles.contactError}>
              <XCircle size={18} />
              {formError || contactInfo.form.error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}