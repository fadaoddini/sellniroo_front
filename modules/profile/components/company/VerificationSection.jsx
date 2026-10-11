// modules/profile/components/company/VerificationSection.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../../styles/company/VerificationSection.module.css";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  XCircle,
  Loader2,
  Send,
  AlertCircle,
  Info,
  Upload,
  Trash2,
  FileText,
  Plus,
} from "lucide-react";

const VerificationSection = ({ company, onRequestSubmitted }) => {
  const { getAuthHeaders } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [newDocs, setNewDocs] = useState([]);
  const docsInputRef = useRef(null);
  const [localDocs, setLocalDocs] = useState(company.documents || []);

  useEffect(() => {
    setLocalDocs(company.documents || []);
  }, [company.documents]);

  const status = company.verification_status;
  const docsCount = localDocs.length;

  // ✅ آپلود مدارک جدید
  const handleUploadDocs = async () => {
  if (newDocs.length === 0) {
    setUploadError("لطفاً حداقل یک فایل انتخاب کنید");
    return;
  }

  try {
    setUploadingDocs(true);
    setUploadError(null);

    const fd = new FormData();
    newDocs.forEach((doc) => {
      fd.append("documents", doc);
    });

    // ✅ endpoint جدید
    const url = Config.endpoints.jobisell.myCompany.uploadDocuments();

    const res = await axios.post(url, fd, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    setNewDocs([]);
    if (docsInputRef.current) docsInputRef.current.value = "";
    onRequestSubmitted?.();
  } catch (err) {
    setUploadError(
      err.response?.data?.error ||
        err.response?.data?.message ||
        "خطا در آپلود مدارک"
    );
  } finally {
    setUploadingDocs(false);
  }
};

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const total = docsCount + newDocs.length + files.length;
    if (total > 5) {
      setUploadError(`حداکثر ۵ مدرک می‌توانید داشته باشید (فعلاً ${docsCount} دارید)`);
      return;
    }
    const valid = files.filter((f) => {
      const ok = /image\/(jpeg|jpg|png|webp)|application\/pdf/.test(f.type);
      if (!ok) setUploadError(`فرمت ${f.name} پشتیبانی نمی‌شود`);
      return ok;
    });
    setNewDocs((prev) => [...prev, ...valid]);
    if (docsInputRef.current) docsInputRef.current.value = "";
  };

  const removeNewDoc = (idx) => {
    setNewDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  // ✅ ثبت درخواست تایید
  const handleRequest = async () => {
    if (docsCount === 0) {
      setError("لطفاً ابتدا مدارک مرتبط با شرکت خود را آپلود نمایید");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await axios.post(
        Config.endpoints.jobisell.myCompany.requestVerification(),
        { note },
        { headers: getAuthHeaders() }
      );

      setSuccess(true);
      setNote("");
      onRequestSubmitted?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "خطا در ارسال درخواست"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // تایید شده
  // ============================================
  if (status === "verified") {
    return (
      <div className={`${styles.card} ${styles.verified}`}>
        <div className={styles.iconBox}>
          <ShieldCheck size={32} />
        </div>
        <div className={styles.content}>
          <h3>شرکت شما تایید شده است</h3>
          <p>
            تبریک! شرکت شما به عنوان یک شرکت تاییدشده در سامانه معرفی می‌شود.
          </p>
          {company.verified_at && (
            <span className={styles.dateInfo}>
              تاریخ تایید:{" "}
              {new Date(company.verified_at).toLocaleDateString("fa-IR")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // در انتظار بررسی
  // ============================================
  if (status === "pending") {
    return (
      <div className={`${styles.card} ${styles.pending}`}>
        <div className={styles.iconBox}>
          <Clock size={32} />
        </div>
        <div className={styles.content}>
          <h3>درخواست شما در حال بررسی است</h3>
          <p>
            تیم پشتیبانی در حال بررسی مدارک شرکت شماست. این فرآیند معمولاً بین
            ۲ تا ۵ روز کاری زمان می‌برد.
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // رد شده
  // ============================================
  if (status === "rejected") {
    return (
      <div className={`${styles.card} ${styles.rejected}`}>
        <div className={styles.iconBox}>
          <XCircle size={32} />
        </div>
        <div className={styles.content}>
          <h3>درخواست شما رد شد</h3>
          <p>
            متاسفانه درخواست تایید شرکت شما رد شده است. لطفاً مدارک خود را بررسی
            و مجدداً درخواست دهید.
          </p>

          <DocumentsUploader
            docsCount={docsCount}
            newDocs={newDocs}
            uploadingDocs={uploadingDocs}
            uploadError={uploadError}
            docsInputRef={docsInputRef}
            onFilesChange={handleFilesChange}
            onRemove={removeNewDoc}
            onUpload={handleUploadDocs}
          />

          <RequestForm
            note={note}
            setNote={setNote}
            onSubmit={handleRequest}
            submitting={submitting}
            error={error}
            success={success}
            docsCount={docsCount}
          />
        </div>
      </div>
    );
  }

  // ============================================
  // پیش‌فرض: تایید نشده
  // ============================================
  return (
    <div className={`${styles.card} ${styles.unverified}`}>
      <div className={styles.iconBox}>
        <ShieldAlert size={32} />
      </div>
      <div className={styles.content}>
        <h3>درخواست تایید شرکت</h3>
        <p>
          با ثبت درخواست تایید، مدارک شرکت شما توسط تیم پشتیبانی بررسی می‌شود و
          در صورت تایید، شرکت شما به عنوان «شرکت تاییدشده» در سامانه نمایش داده
          می‌شود.
        </p>

        {/* ✅ بخش آپلود مدارک */}
        <DocumentsUploader
          docsCount={docsCount}
          newDocs={newDocs}
          uploadingDocs={uploadingDocs}
          uploadError={uploadError}
          docsInputRef={docsInputRef}
          onFilesChange={handleFilesChange}
          onRemove={removeNewDoc}
          onUpload={handleUploadDocs}
        />

        {docsCount === 0 && newDocs.length === 0 && (
          <div className={styles.warningBox}>
            <Info size={14} />
            <span>
              برای ثبت درخواست، ابتدا باید مدارک شرکت خود را آپلود کنید
            </span>
          </div>
        )}

        <RequestForm
          note={note}
          setNote={setNote}
          onSubmit={handleRequest}
          submitting={submitting}
          error={error}
          success={success}
          docsCount={docsCount}
        />
      </div>
    </div>
  );
};

// ============================================
// ✅ کامپوننت آپلود مدارک
// ============================================
const DocumentsUploader = ({
  docsCount,
  newDocs,
  uploadingDocs,
  uploadError,
  docsInputRef,
  onFilesChange,
  onRemove,
  onUpload,
}) => {
  const total = docsCount + newDocs.length;

  return (
    <div className={styles.uploaderBox}>
      <div className={styles.uploaderHeader}>
        <FileText size={16} />
        <span>
          مدارک آپلود شده: {docsCount} / 5
        </span>
      </div>

      {/* لیست فایل‌های آماده آپلود */}
      {newDocs.length > 0 && (
        <div className={styles.newDocsList}>
          {newDocs.map((doc, idx) => (
            <div key={idx} className={styles.newDocItem}>
              <FileText size={14} />
              <span className={styles.newDocName}>
                {doc.name.length > 25
                  ? doc.name.slice(0, 25) + "..."
                  : doc.name}
              </span>
              <button
                type="button"
                className={styles.removeNewDocBtn}
                onClick={() => onRemove(idx)}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* دکمه‌ها */}
      <div className={styles.uploaderActions}>
        {total < 5 && (
          <>
            <button
              type="button"
              className={styles.selectFilesBtn}
              onClick={() => docsInputRef.current?.click()}
            >
              <Plus size={14} />
              انتخاب فایل
            </button>
            <input
              ref={docsInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={onFilesChange}
              hidden
            />
          </>
        )}

        {newDocs.length > 0 && (
          <button
            type="button"
            className={styles.uploadBtn}
            onClick={onUpload}
            disabled={uploadingDocs}
          >
            {uploadingDocs ? (
              <Loader2 size={14} className={styles.spin} />
            ) : (
              <Upload size={14} />
            )}
            <span>{uploadingDocs ? "در حال آپلود..." : "آپلود"}</span>
          </button>
        )}
      </div>

      {uploadError && (
        <div className={styles.errorBox}>
          <AlertCircle size={12} />
          <span>{uploadError}</span>
        </div>
      )}

      {total === 5 && (
        <div className={styles.fullBox}>
          <Info size={12} />
          <span>به حداکثر تعداد مدارک (۵) رسیده‌اید</span>
        </div>
      )}
    </div>
  );
};

// ============================================
// ✅ کامپوننت فرم درخواست
// ============================================
const RequestForm = ({
  note,
  setNote,
  onSubmit,
  submitting,
  error,
  success,
  docsCount,
}) => {
  if (success) {
    return (
      <div className={styles.successBox}>
        <ShieldCheck size={18} />
        <span>درخواست شما با موفقیت ثبت شد</span>
      </div>
    );
  }

  return (
    <div className={styles.formBox}>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="هر توضیح اضافه‌ای که فکر می‌کنید به بررسی کمک می‌کند..."
        rows={3}
      />

      {error && (
        <div className={styles.errorBox}>
          <AlertCircle size={13} />
          <span>{error}</span>
        </div>
      )}

      <button
        className={styles.submitBtn}
        onClick={onSubmit}
        disabled={submitting || docsCount === 0}
      >
        {submitting ? (
          <Loader2 size={14} className={styles.spin} />
        ) : (
          <Send size={14} />
        )}
        <span>{submitting ? "در حال ارسال..." : "ثبت درخواست تایید"}</span>
      </button>
    </div>
  );
};

export default VerificationSection;