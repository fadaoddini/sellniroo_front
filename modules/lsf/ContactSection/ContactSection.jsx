// modules/lsf/ContactSection/ContactSection.jsx
'use client';

import styles from './ContactSection.module.css';
import { useState, useEffect } from 'react';
import { Phone, Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLsf } from '../context/LsfContext';
import Config from '@/config/config';
import axios from 'axios';

export default function ContactSection() {
  const { contact } = useLsf();
  
  // ✅ state برای ذخیره انواع درخواست از دیتابیس
  const [requestTypes, setRequestTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    request_type_id: null, // ✅ تغییر از type به request_type_id
  });
  const [formStatus, setFormStatus] = useState(null); // null, 'loading', 'success', 'error'
  const [formError, setFormError] = useState('');
  const [requestNumber, setRequestNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formOptions = contact.form.options;

  // ✅ دریافت انواع درخواست از دیتابیس
  useEffect(() => {
    const fetchRequestTypes = async () => {
      try {
        setLoadingTypes(true);
        setTypesError(null);
        
        // دریافت از API
        const apiUrl = Config.endpoints.requser.types();
        console.log('Fetching request types from:', apiUrl);
        
        const response = await axios.get(apiUrl, {
          timeout: 5000,
        });
        
        console.log('Request types response:', response.data);
        
        // بررسی پاسخ
        let types = [];
        if (response.data && response.data.results) {
          types = response.data.results;
        } else if (Array.isArray(response.data)) {
          types = response.data;
        } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
          types = response.data.data;
        }
        
        // فیلتر کردن انواع فعال
        types = types.filter(t => t.is_active !== false);
        
        setRequestTypes(types);
        
        // ✅ اگر انواع وجود دارد، اولین مورد را به عنوان پیش‌فرض انتخاب کن
        if (types.length > 0) {
          setFormData(prev => ({
            ...prev,
            request_type_id: types[0].id
          }));
        }
        
      } catch (error) {
        console.error('Error fetching request types:', error);
        setTypesError('خطا در دریافت انواع درخواست');
        
        // ✅ در صورت خطا، از مقادیر پیش‌فرض استفاده کن
        const fallbackTypes = [
          { id: 1, name: 'مشاوره', name_en: 'Consulting', icon: 'MessageSquare' },
          { id: 2, name: 'همکاری', name_en: 'Cooperation', icon: 'Handshake' },
          { id: 3, name: 'فروش عمده', name_en: 'Wholesale', icon: 'ShoppingCart' },
          { id: 4, name: 'پشتیبانی فنی', name_en: 'Technical Support', icon: 'HelpCircle' },
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
  }, []);

  // ✅ تابع اعتبارسنجی شماره موبایل
  const validatePhone = (phone) => {
    // حذف فاصله‌ها و کاراکترهای اضافی
    const cleaned = phone.replace(/\s/g, '').replace(/-/g, '').replace(/_/g, '');
    
    // اگر با 0 شروع نشده، 0 را اضافه کن
    let formatted = cleaned;
    if (!formatted.startsWith('0')) {
      formatted = '0' + formatted;
    }
    
    // اگر طول بیشتر از 11 بود، فقط ۱۱ رقم اول را بگیر
    if (formatted.length > 11) {
      formatted = formatted.slice(0, 11);
    }
    
    // اعتبارسنجی نهایی
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

    // ✅ اعتبارسنجی نام
    if (!formData.name.trim()) {
      setFormError('لطفاً نام و نام خانوادگی خود را وارد کنید');
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    // ✅ اعتبارسنجی شماره موبایل
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      setFormError('شماره موبایل باید ۱۱ رقم و با 09 شروع شود (مثال: 09123456789)');
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    // ✅ اعتبارسنجی پیام
    if (!formData.message.trim()) {
      setFormError('لطفاً توضیحات درخواست خود را وارد کنید');
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    // ✅ اعتبارسنجی نوع درخواست
    if (!formData.request_type_id) {
      setFormError('لطفاً نوع درخواست را انتخاب کنید');
      setFormStatus('error');
      setTimeout(() => setFormStatus(null), 3000);
      return;
    }

    setIsSubmitting(true);
    setFormStatus('loading');
    setFormError('');

    try {
      // ✅ استفاده از شماره موبایل فرمت شده
      const formattedPhone = phoneValidation.formatted;
      
      // ✅ پیدا کردن نام نوع درخواست برای استفاده در عنوان
      const selectedType = requestTypes.find(t => t.id === formData.request_type_id);
      const typeName = selectedType ? selectedType.name : 'درخواست';
      
      // آماده‌سازی داده‌ها برای ارسال به API
      const payload = {
        title: `${typeName} - ${formData.name.trim()}`,
        description: formData.message.trim(),
        customer_name: formData.name.trim(),
        customer_mobile: formattedPhone,
        customer_email: formData.email.trim() || '',
        request_type: formData.request_type_id, // ✅ ارسال ID از دیتابیس
        source: 'website_lsf_contact',
      };

      console.log('Sending payload:', payload);

      // ✅ استفاده از Config.endpoints.requser.create()
      const apiUrl = Config.endpoints.requser.create();
      console.log('API URL:', apiUrl);

      const response = await axios.post(apiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('Response from API:', response.data);

      if (response.data && response.data.status === 'ok') {
        setFormStatus('success');
        setRequestNumber(response.data.request_number || '');
        
        // پاک کردن فرم
        setFormData(prev => ({
          ...prev,
          name: '',
          phone: '',
          email: '',
          message: '',
          // ✅ حفظ نوع درخواست انتخاب شده
        }));

        // مخفی کردن پیام موفقیت بعد از 5 ثانیه
        setTimeout(() => {
          setFormStatus(null);
          setRequestNumber('');
        }, 5000);
      } else {
        throw new Error(response.data?.message || 'خطا در ارسال درخواست');
      }

    } catch (error) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      
      // ✅ نمایش خطاهای دقیق‌تر
      let errorMessage = 'خطا در ارسال درخواست';
      
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
    // پاک کردن خطا هنگام تایپ
    if (formError) {
      setFormError('');
    }
  };

  return (
    <section id="consulting" className={styles.contact}>
      <div className={styles.contactGrid}>
        <div>
          <h2 className={styles.contactTitle}>{contact.title}</h2>
          <p className={styles.contactDesc}>{contact.desc}</p>
          
          <div className={styles.contactInfo}>
            {/* تلفن */}
            <div className={styles.contactInfoItem}>
              <Phone size={24} />
              <div>
                <div className={styles.contactInfoLabel}>{contact.phone}</div>
                <div className={styles.contactInfoSub}>{contact.phoneLabel}</div>
              </div>
            </div>
            
            {/* موبایل */}
            {contact.mobile && (
              <div className={styles.contactInfoItem}>
                <Phone size={24} />
                <div>
                  <div className={styles.contactInfoLabel}>{contact.mobile}</div>
                  <div className={styles.contactInfoSub}>{contact.mobileLabel}</div>
                </div>
              </div>
            )}
            
            {/* ایمیل */}
            <div className={styles.contactInfoItem}>
              <Mail size={24} />
              <div>
                <div className={styles.contactInfoLabel}>{contact.email}</div>
                <div className={styles.contactInfoSub}>{contact.emailLabel}</div>
              </div>
            </div>
          </div>

          {/* نمایش شماره درخواست در صورت موفقیت */}
          {requestNumber && (
            <div className={styles.requestNumberBox}>
              <CheckCircle size={20} color="#2e7d32" />
              <span>
                شماره پیگیری درخواست شما: 
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
              placeholder={contact.form.name}
              className={styles.contactInput}
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder={contact.form.phone}
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
            placeholder={contact.form.email}
            className={styles.contactInput}
            value={formData.email}
            onChange={handleInputChange}
            disabled={isSubmitting}
          />

          {/* ✅ نوع درخواست - داینامیک از دیتابیس */}
          <select
            name="request_type_id"
            className={styles.contactSelect}
            value={formData.request_type_id || ''}
            onChange={handleInputChange}
            disabled={isSubmitting || loadingTypes}
          >
            {loadingTypes ? (
              <option value="">در حال بارگذاری...</option>
            ) : typesError ? (
              <option value="">خطا در بارگذاری</option>
            ) : requestTypes.length === 0 ? (
              <option value="">نوع درخواستی موجود نیست</option>
            ) : (
              requestTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon && <span>{type.icon}</span>} {type.name}
                </option>
              ))
            )}
          </select>

          {/* پیام */}
          <textarea
            name="message"
            placeholder={contact.form.message}
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
                در حال ارسال...
              </>
            ) : (
              contact.form.submit
            )}
          </button>

          {/* نمایش پیام‌ها */}
          {formStatus === 'success' && (
            <div className={styles.contactSuccess}>
              <CheckCircle size={18} />
              {contact.form.success}
            </div>
          )}

          {formStatus === 'error' && (
            <div className={styles.contactError}>
              <XCircle size={18} />
              {formError || contact.form.error}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}