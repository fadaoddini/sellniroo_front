// modules/profile/components/resume/TemplateSelector.jsx
"use client";

import { useState } from "react";
import styles from "./TemplateSelector.module.css";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import { Check, Eye, X } from "lucide-react";

const TEMPLATES = [
  {
    key: "modern",
    name: "مدرن و حرفه‌ای",
    description: "دو ستونی، رنگی، سایدبار",
    bestFor: "مهندس، برنامه‌نویس، طراح",
    component: ModernTemplate,
    color: "#3b82f6",
  },
  {
    key: "classic",
    name: "کلاسیک و شیک",
    description: "تک ستونی، رسمی، ATS-friendly",
    bestFor: "فروش، بانک، اداری",
    component: ClassicTemplate,
    color: "#0f172a",
  },
  {
    key: "minimal",
    name: "مینیمال",
    description: "ساده، تمیز، بدون رنگ اضافی",
    bestFor: "همه‌کاره، مدرن",
    component: MinimalTemplate,
    color: "#64748b",
  },
  {
    key: "creative",
    name: "خلاقانه",
    description: "گرادیانت، رنگی، بولد",
    bestFor: "طراح، بازاریاب، محتوا",
    component: CreativeTemplate,
    color: "#ec4899",
  },
  {
    key: "executive",
    name: "مدیریتی",
    description: "شیک، تیره، حرفه‌ای",
    bestFor: "مدیر، C-level، مشاور",
    component: ExecutiveTemplate,
    color: "#0f172a",
  },
];

const TemplateSelector = ({ value, onChange, resumeData }) => {
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const handleSelect = (templateKey) => {
    onChange(templateKey);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3>انتخاب قالب رزومه</h3>
        <p className={styles.subtitle}>
          یک قالب انتخاب کنید. می‌توانید پیش‌نمایش رو ببینید و بعد انتخاب کنید.
        </p>
      </div>

      <div className={styles.grid}>
        {TEMPLATES.map((tpl) => {
          const isActive = value === tpl.key;
          const PreviewComponent = tpl.component;

          return (
            <div
              key={tpl.key}
              className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
              style={{ "--tpl-color": tpl.color }}
            >
              {/* پیش‌نمایش کوچک */}
              <div className={styles.thumbWrapper}>
                <div className={styles.thumbInner}>
                  <PreviewComponent resume={resumeData || {}} />
                </div>

                {/* Overlay */}
                <div className={styles.overlay}>
                  <button
                    type="button"
                    className={styles.previewBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(tpl.key);
                    }}
                  >
                    <Eye size={14} />
                    پیش‌نمایش
                  </button>
                </div>

                {/* Badge انتخاب شده */}
                {isActive && (
                  <div className={styles.selectedBadge}>
                    <Check size={14} />
                    انتخاب شده
                  </div>
                )}
              </div>

              {/* اطلاعات */}
              <div className={styles.info}>
                <h4 className={styles.name}>{tpl.name}</h4>
                <p className={styles.description}>{tpl.description}</p>
                <span className={styles.bestFor}>مناسب برای: {tpl.bestFor}</span>
              </div>

              {/* دکمه انتخاب */}
              <button
                type="button"
                className={`${styles.selectBtn} ${
                  isActive ? styles.selectBtnActive : ""
                }`}
                onClick={() => handleSelect(tpl.key)}
              >
                {isActive ? (
                  <>
                    <Check size={14} />
                    انتخاب شده
                  </>
                ) : (
                  "انتخاب این قالب"
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* مودال پیش‌نمایش بزرگ */}
      {previewTemplate && (
        <div
          className={styles.modalOverlay}
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>
                پیش‌نمایش:{" "}
                {TEMPLATES.find((t) => t.key === previewTemplate)?.name}
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPreviewTemplate(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalPreview}>
                {(() => {
                  const PreviewComp = TEMPLATES.find(
                    (t) => t.key === previewTemplate
                  )?.component;
                  return PreviewComp ? (
                    <PreviewComp resume={resumeData || {}} />
                  ) : null;
                })()}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setPreviewTemplate(null)}
              >
                بستن
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={() => {
                  handleSelect(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                <Check size={14} />
                انتخاب این قالب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
export { TEMPLATES };