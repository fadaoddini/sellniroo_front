// app/post-job/steps/Step7Contact.jsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Phone, Mail, Tag } from 'lucide-react';
import Image from 'next/image';
import styles from '../PostJob.module.css';

export default function Step7Contact({ form, updateField, filterOptions }) {
  const [preview, setPreview] = useState(null);
  const [selectedTags, setSelectedTags] = useState(form.tags || []);
  const fileInputRef = useRef(null);

  // انتخاب تصویر
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // حداکثر ۵ مگ
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
      return;
    }

    updateField('image', file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateField('image', null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // toggle tag
  const toggleTag = (tagId) => {
    let updated;
    if (selectedTags.includes(tagId)) {
      updated = selectedTags.filter((t) => t !== tagId);
    } else {
      updated = [...selectedTags, tagId];
    }
    setSelectedTags(updated);
    updateField('tags', updated);
  };

  return (
    <div className={styles.stepWrap}>
      <h2 className={styles.stepTitle}>تماس و تصویر</h2>
      <p className={styles.stepSubtitle}>
        اطلاعات تماس و تصویر آگهی را وارد کنید (اختیاری)
      </p>

      {/* تصویر */}
      <div className={styles.field}>
        <label className={styles.label}>تصویر آگهی</label>
        {preview ? (
          <div className={styles.imagePreview}>
            <Image
              src={preview}
              alt="پیش‌نمایش"
              width={400}
              height={200}
              className={styles.previewImg}
              unoptimized
            />
            <button
              type="button"
              className={styles.removeImgBtn}
              onClick={handleRemoveImage}
            >
              <X size={16} />
              حذف تصویر
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.uploadBox}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={32} />
            <span>کلیک کنید یا فایل را انتخاب کنید</span>
            <span className={styles.uploadHint}>JPG، PNG - حداکثر ۵ مگابایت</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* تگ‌ها */}
      {filterOptions?.tags?.length > 0 && (
        <div className={styles.field}>
          <label className={styles.label}>تگ‌ها (اختیاری)</label>
          <div className={styles.tagsGrid}>
            {filterOptions.tags.map((tag) => {
              const active = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  className={`${styles.tagChip} ${active ? styles.tagChipActive : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  <Tag size={12} />
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* تلفن */}
      <div className={styles.field}>
        <label className={styles.label}>شماره تماس</label>
        <div className={styles.inputWithIcon}>
          <Phone size={16} />
          <input
            type="tel"
            className={styles.input}
            placeholder="۰۹۱۲۱۲۳۴۵۶۷"
            value={form.contact_phone}
            onChange={(e) => updateField('contact_phone', e.target.value)}
          />
        </div>
      </div>

      {/* ایمیل */}
      <div className={styles.field}>
        <label className={styles.label}>ایمیل</label>
        <div className={styles.inputWithIcon}>
          <Mail size={16} />
          <input
            type="email"
            className={styles.input}
            placeholder="info@example.com"
            value={form.contact_email}
            onChange={(e) => updateField('contact_email', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}