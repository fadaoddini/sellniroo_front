// modules/profile/components/resume/TemplateSelector.jsx
"use client";

import { useState } from "react";
import styles from "./TemplateSelector.module.css";
import { Check, Eye, X, LayoutTemplate } from "lucide-react";

const TEMPLATES = [
  {
    key: "modern",
    name: "مدرن و حرفه‌ای",
    description: "دو ستونی با سایدبار رنگی",
    bestFor: "مهندس، برنامه‌نویس، طراح",
    color: "#D4621A",
    skeleton: "modern",
  },
  {
    key: "classic",
    name: "کلاسیک و شیک",
    description: "تک ستونی، رسمی و ATS-friendly",
    bestFor: "فروش، بانک، اداری",
    color: "#2A1A0E",
    skeleton: "classic",
  },
  {
    key: "minimal",
    name: "مینیمال",
    description: "ساده، تمیز، بدون رنگ اضافه",
    bestFor: "همه‌کاره، مدرن",
    color: "#6B5344",
    skeleton: "minimal",
  },
  {
    key: "creative",
    name: "خلاقانه",
    description: "گرادیانت و ساختار بولد",
    bestFor: "طراح، بازاریاب، محتوا",
    color: "#D4621A",
    skeleton: "creative",
  },
  {
    key: "executive",
    name: "مدیریتی",
    description: "شیک، تیره و حرفه‌ای",
    bestFor: "مدیر، C-level، مشاور",
    color: "#2A1A0E",
    skeleton: "executive",
  },
];

function SkeletonPreview({ type, color }) {
  return (
    <div
      className={`${styles.skel} ${styles[`skel_${type}`] || ""}`}
      style={{ "--skel-accent": color }}
      aria-hidden
    >
      {type === "modern" ? (
        <>
          <div className={styles.skelSidebar}>
            <span className={styles.skelAvatar} />
            <span className={styles.skelLine} />
            <span className={styles.skelLineSm} />
            <span className={styles.skelBlock} />
            <span className={styles.skelBlock} />
          </div>
          <div className={styles.skelMain}>
            <span className={styles.skelTitle} />
            <span className={styles.skelLine} />
            <span className={styles.skelLine} />
            <span className={styles.skelSection} />
            <span className={styles.skelLine} />
            <span className={styles.skelLineSm} />
            <span className={styles.skelSection} />
            <span className={styles.skelLine} />
            <span className={styles.skelLineSm} />
          </div>
        </>
      ) : null}

      {type === "classic" ? (
        <>
          <div className={styles.skelClassicHead}>
            <span className={styles.skelTitleWide} />
            <span className={styles.skelLineSm} />
          </div>
          <span className={styles.skelRule} />
          <span className={styles.skelSection} />
          <span className={styles.skelLine} />
          <span className={styles.skelLine} />
          <span className={styles.skelLineSm} />
          <span className={styles.skelSection} />
          <span className={styles.skelLine} />
          <span className={styles.skelLineSm} />
          <span className={styles.skelSection} />
          <span className={styles.skelLine} />
          <span className={styles.skelLineSm} />
        </>
      ) : null}

      {type === "minimal" ? (
        <>
          <span className={styles.skelTitleWide} />
          <span className={styles.skelLineSm} />
          <span className={styles.skelGap} />
          <span className={styles.skelLine} />
          <span className={styles.skelLine} />
          <span className={styles.skelLineSm} />
          <span className={styles.skelGap} />
          <span className={styles.skelLine} />
          <span className={styles.skelLineSm} />
          <span className={styles.skelGap} />
          <div className={styles.skelChips}>
            <span />
            <span />
            <span />
          </div>
        </>
      ) : null}

      {type === "creative" ? (
        <>
          <div className={styles.skelCreativeBanner}>
            <span className={styles.skelAvatarLight} />
            <div>
              <span className={styles.skelTitleLight} />
              <span className={styles.skelLineLight} />
            </div>
          </div>
          <div className={styles.skelCreativeBody}>
            <span className={styles.skelSection} />
            <span className={styles.skelLine} />
            <span className={styles.skelLineSm} />
            <span className={styles.skelSection} />
            <span className={styles.skelLine} />
            <span className={styles.skelLineSm} />
          </div>
        </>
      ) : null}

      {type === "executive" ? (
        <>
          <div className={styles.skelExecTop}>
            <span className={styles.skelTitleLight} />
            <span className={styles.skelLineLight} />
          </div>
          <div className={styles.skelExecBody}>
            <span className={styles.skelSection} />
            <span className={styles.skelLine} />
            <span className={styles.skelLine} />
            <span className={styles.skelSection} />
            <span className={styles.skelLine} />
            <span className={styles.skelLineSm} />
            <div className={styles.skelTwoCol}>
              <span className={styles.skelBlock} />
              <span className={styles.skelBlock} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

const TemplateSelector = ({ value, onChange }) => {
  const [previewKey, setPreviewKey] = useState(null);
  const previewTpl = TEMPLATES.find((t) => t.key === previewKey);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <LayoutTemplate size={16} strokeWidth={2.2} />
        </div>
        <div>
          <h3>انتخاب قالب رزومه</h3>
          <p className={styles.subtitle}>
            اسکلت هر قالب را ببینید و مناسب‌ترین سبک را انتخاب کنید.
          </p>
        </div>
      </div>

      <div className={styles.grid}>
        {TEMPLATES.map((tpl) => {
          const isActive = value === tpl.key;
          return (
            <button
              key={tpl.key}
              type="button"
              className={`${styles.card} ${isActive ? styles.activeCard : ""}`}
              style={{ "--tpl-color": tpl.color }}
              onClick={() => onChange(tpl.key)}
              aria-pressed={isActive}
            >
              <div className={styles.thumbWrapper}>
                <SkeletonPreview type={tpl.skeleton} color={tpl.color} />

                <div className={styles.overlay}>
                  <span
                    className={styles.previewBtn}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewKey(tpl.key);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewKey(tpl.key);
                      }
                    }}
                  >
                    <Eye size={13} strokeWidth={2.2} />
                    بزرگ‌نمایی
                  </span>
                </div>

                {isActive ? (
                  <div className={styles.selectedBadge}>
                    <Check size={12} strokeWidth={2.5} />
                    انتخاب‌شده
                  </div>
                ) : null}
              </div>

              <div className={styles.info}>
                <h4 className={styles.name}>{tpl.name}</h4>
                <p className={styles.description}>{tpl.description}</p>
                <span className={styles.bestFor}>{tpl.bestFor}</span>
              </div>

              <span
                className={`${styles.selectBtn} ${
                  isActive ? styles.selectBtnActive : ""
                }`}
              >
                {isActive ? (
                  <>
                    <Check size={13} strokeWidth={2.4} />
                    انتخاب شده
                  </>
                ) : (
                  "انتخاب قالب"
                )}
              </span>
            </button>
          );
        })}
      </div>

      {previewTpl ? (
        <div
          className={styles.modalOverlay}
          onClick={() => setPreviewKey(null)}
          role="presentation"
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tpl-preview-title"
          >
            <div className={styles.modalHeader}>
              <h3 id="tpl-preview-title">اسکلت قالب: {previewTpl.name}</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setPreviewKey(null)}
                aria-label="بستن"
              >
                <X size={16} strokeWidth={2.2} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalPreview}>
                <SkeletonPreview
                  type={previewTpl.skeleton}
                  color={previewTpl.color}
                />
              </div>
              <p className={styles.modalHint}>{previewTpl.description}</p>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setPreviewKey(null)}
              >
                بستن
              </button>
              <button
                type="button"
                className={styles.confirmBtn}
                onClick={() => {
                  onChange(previewTpl.key);
                  setPreviewKey(null);
                }}
              >
                <Check size={14} strokeWidth={2.3} />
                انتخاب این قالب
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TemplateSelector;
export { TEMPLATES };
