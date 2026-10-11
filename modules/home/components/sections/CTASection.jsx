// modules/home/components/sections/CTASection.jsx — بخش تماس (تم آبی تیره + دیالوگ نوع درخواست)
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Phone, Smartphone, Mail, CheckCircle, XCircle, Loader2, Send,
  MessageSquare, ChevronDown, X, Check,
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '@/contexts/LanguageContext';
import Config from '@/config/config';
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings';
import styles from '../../styles/CTASection.module.css';

const FALLBACK_TYPES = [
  { id: 1, name: 'مشاوره', name_en: 'Consulting', icon: '💬' },
  { id: 2, name: 'همکاری', name_en: 'Cooperation', icon: '🤝' },
  { id: 3, name: 'پشتیبانی', name_en: 'Support', icon: '🛠️' },
];

const TYPE_ICONS = ['💬', '🤝', '🛠️', '📋', '⭐', '📞', '💼', '✨'];

export default function ContactSection() {
  const { language, dir } = useLanguage();
  const isFa = language !== 'en';

  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [requestTypes, setRequestTypes] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    request_type_id: '',
  });
  const [formStatus, setFormStatus] = useState(null);
  const [formError, setFormError] = useState('');
  const [requestNumber, setRequestNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetchSiteSettings({ force: true }).then((data) => {
      if (alive) setSettings(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingTypes(true);
        const res = await axios.get(Config.endpoints.requser.types(), { timeout: 8000 });
        let types = res.data?.results || res.data?.data || res.data || [];
        if (!Array.isArray(types)) types = [];
        types = types.filter((t) => t.is_active !== false);
        if (!alive) return;
        if (!types.length) types = FALLBACK_TYPES;
        setRequestTypes(types);
        setFormData((prev) => ({
          ...prev,
          request_type_id: prev.request_type_id || String(types[0].id),
        }));
      } catch {
        if (!alive) return;
        setRequestTypes(FALLBACK_TYPES);
        setFormData((prev) => ({
          ...prev,
          request_type_id: prev.request_type_id || '1',
        }));
      } finally {
        if (alive) setLoadingTypes(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!typeDialogOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setTypeDialogOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [typeDialogOpen]);

  const copy = useMemo(() => {
    const title = isFa
      ? settings.contact_title || DEFAULT_SITE_SETTINGS.contact_title
      : settings.contact_title_en || settings.contact_title || DEFAULT_SITE_SETTINGS.contact_title_en;
    const desc = isFa
      ? settings.contact_description || DEFAULT_SITE_SETTINGS.contact_description
      : settings.contact_description_en ||
        settings.contact_description ||
        DEFAULT_SITE_SETTINGS.contact_description_en;

    return {
      title,
      desc,
      phone: settings.contact_phone || '',
      mobile: settings.contact_mobile || '',
      email: settings.contact_email || '',
      showPhone: settings.show_contact_phone !== false,
      showMobile: settings.show_contact_mobile !== false,
      showEmail: settings.show_contact_email !== false,
      phoneLabel: settings.contact_phone_label || (isFa ? 'تلفن ثابت' : 'Phone'),
      mobileLabel: settings.contact_mobile_label || (isFa ? 'موبایل' : 'Mobile'),
      emailLabel: settings.contact_email_label || (isFa ? 'ایمیل' : 'Email'),
      submit: settings.contact_submit_label || (isFa ? 'ارسال درخواست' : 'Submit'),
      namePh: isFa ? 'نام و نام خانوادگی' : 'Full name',
      phonePh: isFa ? 'شماره موبایل' : 'Mobile number',
      emailPh: isFa ? 'ایمیل (اختیاری)' : 'Email (optional)',
      messagePh: isFa ? 'متن درخواست شما...' : 'Your message...',
      typePh: isFa ? 'نوع درخواست' : 'Request type',
      typePick: isFa ? 'انتخاب نوع درخواست' : 'Choose request type',
      success: isFa ? 'درخواست شما با موفقیت ثبت شد' : 'Request submitted successfully',
      error: isFa ? 'خطا در ارسال درخواست' : 'Failed to submit request',
    };
  }, [settings, isFa]);

  const typeLabel = useCallback(
    (type) => {
      if (!type) return '';
      return isFa ? type.name : type.name_en || type.name;
    },
    [isFa]
  );

  const selectedType = useMemo(
    () => requestTypes.find((t) => String(t.id) === String(formData.request_type_id)),
    [requestTypes, formData.request_type_id]
  );

  const channels = useMemo(() => {
    const list = [];
    if (copy.showPhone && copy.phone) {
      list.push({
        key: 'phone',
        icon: Phone,
        value: copy.phone,
        label: copy.phoneLabel,
        href: `tel:${copy.phone.replace(/\s/g, '')}`,
      });
    }
    if (copy.showMobile && copy.mobile) {
      list.push({
        key: 'mobile',
        icon: Smartphone,
        value: copy.mobile,
        label: copy.mobileLabel,
        href: `tel:${copy.mobile.replace(/\s/g, '')}`,
      });
    }
    if (copy.showEmail && copy.email) {
      list.push({
        key: 'email',
        icon: Mail,
        value: copy.email,
        label: copy.emailLabel,
        href: `mailto:${copy.email}`,
      });
    }
    return list;
  }, [copy]);

  const validatePhone = (phone) => {
    let formatted = phone.replace(/[\s\-_]/g, '');
    if (formatted && !formatted.startsWith('0')) formatted = `0${formatted}`;
    if (formatted.length > 11) formatted = formatted.slice(0, 11);
    return {
      isValid: /^09\d{9}$/.test(formatted),
      formatted,
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const pickType = (id) => {
    setFormData((prev) => ({ ...prev, request_type_id: String(id) }));
    setTypeDialogOpen(false);
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setFormError(isFa ? 'نام را وارد کنید' : 'Enter your name');
      setFormStatus('error');
      return;
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      setFormError(
        isFa
          ? 'شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود'
          : 'Mobile must be 11 digits starting with 09'
      );
      setFormStatus('error');
      return;
    }

    if (!formData.message.trim()) {
      setFormError(isFa ? 'متن درخواست را وارد کنید' : 'Enter your message');
      setFormStatus('error');
      return;
    }

    if (!formData.request_type_id) {
      setFormError(isFa ? 'نوع درخواست را انتخاب کنید' : 'Select a request type');
      setFormStatus('error');
      setTypeDialogOpen(true);
      return;
    }

    setIsSubmitting(true);
    setFormStatus('loading');
    setFormError('');

    try {
      const typeName = typeLabel(selectedType) || (isFa ? 'درخواست' : 'Request');
      const payload = {
        title: `${typeName} - ${formData.name.trim()}`,
        description: formData.message.trim(),
        customer_name: formData.name.trim(),
        customer_mobile: phoneValidation.formatted,
        customer_email: formData.email.trim() || '',
        request_type: formData.request_type_id,
        source: 'website_lsf_contact',
      };

      const response = await axios.post(Config.endpoints.requser.create(), payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 12000,
      });

      if (response.data?.status === 'ok') {
        setFormStatus('success');
        setRequestNumber(response.data.request_number || '');
        setFormData((prev) => ({
          ...prev,
          name: '',
          phone: '',
          email: '',
          message: '',
        }));
        setTimeout(() => {
          setFormStatus(null);
          setRequestNumber('');
        }, 6000);
      } else {
        throw new Error(response.data?.message || copy.error);
      }
    } catch (error) {
      const data = error.response?.data;
      let msg = copy.error;
      if (data?.message) msg = data.message;
      else if (data?.error) msg = data.error;
      else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(' — ');
      }
      setFormError(msg);
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (settings.contact_section_active === false) return null;

  return (
    <section id="consulting" className={styles.contact} dir={dir}>
      <div className={styles.bgGrid} aria-hidden />
      <div className={styles.bgOrb} aria-hidden />

      <div className={styles.inner}>
        <div className={styles.infoCol}>
          <p className={styles.eyebrow}>
            <MessageSquare size={14} />
            {isFa ? 'ارتباط با سلنیرو' : 'Contact Sellniroo'}
          </p>
          <h2 className={styles.title}>{copy.title}</h2>
          <p className={styles.desc}>{copy.desc}</p>

          {channels.length > 0 && (
            <ul className={styles.channels}>
              {channels.map((ch) => {
                const Icon = ch.icon;
                return (
                  <li key={ch.key}>
                    <a href={ch.href} className={styles.channel}>
                      <span className={styles.channelIcon}>
                        <Icon size={18} />
                      </span>
                      <span>
                        <em>{ch.label}</em>
                        <strong dir="ltr">{ch.value}</strong>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          {requestNumber && (
            <div className={styles.trackBox}>
              <CheckCircle size={18} />
              <span>
                {isFa ? 'شماره پیگیری: ' : 'Tracking no: '}
                <b dir="ltr">{requestNumber}</b>
              </span>
            </div>
          )}
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.formHead}>
            <h3>{isFa ? 'فرم درخواست' : 'Request form'}</h3>
            <p>{isFa ? 'در کمتر از یک دقیقه ارسال کنید' : 'Send in under a minute'}</p>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span>{copy.namePh}</span>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={isSubmitting}
                autoComplete="name"
                required
              />
            </label>
            <label className={styles.field}>
              <span>{copy.phonePh}</span>
              <input
                name="phone"
                type="tel"
                dir="ltr"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isSubmitting}
                autoComplete="tel"
                placeholder="0912xxxxxxx"
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span>{copy.emailPh}</span>
            <input
              name="email"
              type="email"
              dir="ltr"
              value={formData.email}
              onChange={handleInputChange}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </label>

          {/* انتخابگر نوع درخواست — دیالوگ */}
          <div className={styles.field}>
            <span>{copy.typePh}</span>
            <button
              type="button"
              className={styles.typeTrigger}
              onClick={() => setTypeDialogOpen(true)}
              disabled={isSubmitting || loadingTypes}
              aria-haspopup="dialog"
              aria-expanded={typeDialogOpen}
            >
              <span className={styles.typeTriggerMain}>
                <span className={styles.typeEmoji} aria-hidden>
                  {selectedType?.icon ||
                    TYPE_ICONS[
                      Math.max(
                        0,
                        requestTypes.findIndex(
                          (t) => String(t.id) === String(formData.request_type_id)
                        )
                      ) % TYPE_ICONS.length
                    ] ||
                    '📋'}
                </span>
                <span>
                  {loadingTypes
                    ? isFa
                      ? 'در حال بارگذاری...'
                      : 'Loading...'
                    : typeLabel(selectedType) || copy.typePick}
                </span>
              </span>
              <ChevronDown size={18} />
            </button>
          </div>

          <label className={styles.field}>
            <span>{copy.messagePh}</span>
            <textarea
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
            />
          </label>

          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting || loadingTypes}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className={styles.spin} />
                {isFa ? 'در حال ارسال...' : 'Sending...'}
              </>
            ) : (
              <>
                <Send size={16} />
                {copy.submit}
              </>
            )}
          </button>

          {formStatus === 'success' && (
            <div className={styles.alertOk} role="status">
              <CheckCircle size={16} />
              {copy.success}
            </div>
          )}
          {formStatus === 'error' && (
            <div className={styles.alertErr} role="alert">
              <XCircle size={16} />
              {formError || copy.error}
            </div>
          )}
        </form>
      </div>

      {typeDialogOpen && (
        <div
          className={styles.dialogOverlay}
          onClick={() => setTypeDialogOpen(false)}
          role="presentation"
        >
          <div
            ref={dialogRef}
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="request-type-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.dialogHead}>
              <div>
                <h3 id="request-type-dialog-title">{copy.typePick}</h3>
                <p>
                  {isFa
                    ? 'یکی از گزینه‌ها را انتخاب کنید'
                    : 'Pick one of the options below'}
                </p>
              </div>
              <button
                type="button"
                className={styles.dialogClose}
                onClick={() => setTypeDialogOpen(false)}
                aria-label={isFa ? 'بستن' : 'Close'}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.typeGrid}>
              {requestTypes.map((type, idx) => {
                const active = String(type.id) === String(formData.request_type_id);
                const emoji = type.icon || TYPE_ICONS[idx % TYPE_ICONS.length];
                return (
                  <button
                    key={type.id}
                    type="button"
                    className={`${styles.typeCard} ${active ? styles.typeCardActive : ''}`}
                    onClick={() => pickType(type.id)}
                  >
                    <span className={styles.typeCardEmoji} aria-hidden>
                      {emoji}
                    </span>
                    <span className={styles.typeCardLabel}>{typeLabel(type)}</span>
                    {active && (
                      <span className={styles.typeCheck}>
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
