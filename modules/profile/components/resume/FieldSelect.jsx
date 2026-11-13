// modules/profile/components/resume/FieldSelect.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import styles from "./ResumeForm.module.css";

const FieldSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "انتخاب کنید",
  searchable = false,
  allowClear = false,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef(null);

  const selected = useMemo(
    () => options.find((o) => String(o.value) === String(value)),
    [options, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) =>
      String(o.label).toLowerCase().includes(q)
    );
  }, [options, query]);

  const showSearch = searchable || options.length > 8;

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = setTimeout(() => searchRef.current?.focus(), 40);
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className={styles.formGroup}>
      {label ? <label>{label}</label> : null}
      <button
        type="button"
        className={`${styles.fieldSelectTrigger} ${
          selected ? styles.fieldSelectFilled : ""
        } ${disabled ? styles.fieldSelectDisabled : ""}`}
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={styles.fieldSelectValue}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown size={14} strokeWidth={2.2} />
      </button>

      {open ? (
        <div
          className={styles.fieldSelectOverlay}
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className={styles.fieldSelectDialog}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={label || placeholder}
          >
            <div className={styles.fieldSelectHeader}>
              <h4>{label || "انتخاب"}</h4>
              <button
                type="button"
                className={styles.fieldSelectClose}
                onClick={() => setOpen(false)}
                aria-label="بستن"
              >
                <X size={15} strokeWidth={2.2} />
              </button>
            </div>

            {showSearch ? (
              <div className={styles.fieldSelectSearch}>
                <Search size={14} strokeWidth={2.2} />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="جستجو..."
                />
              </div>
            ) : null}

            <div className={styles.fieldSelectList}>
              {allowClear ? (
                <button
                  type="button"
                  className={`${styles.fieldSelectOption} ${
                    !value && value !== 0 ? styles.fieldSelectOptionActive : ""
                  }`}
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                >
                  <span>{placeholder}</span>
                </button>
              ) : null}

              {filtered.length === 0 ? (
                <p className={styles.fieldSelectEmpty}>موردی یافت نشد</p>
              ) : (
                filtered.map((opt) => {
                  const active = String(opt.value) === String(value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      className={`${styles.fieldSelectOption} ${
                        active ? styles.fieldSelectOptionActive : ""
                      }`}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                      }}
                    >
                      <span>{opt.label}</span>
                      {active ? (
                        <Check size={14} strokeWidth={2.4} />
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FieldSelect;
