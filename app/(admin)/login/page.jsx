// app/login/page.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Phone,
  ChevronLeft,
  Shield,
  Lock,
  Clock,
} from "lucide-react";
import styles from "./Login.module.css";

const OTP_COOLDOWN_KEY = "otp_cooldown_v1";

function formatWait(seconds) {
  const s = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r} ثانیه`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function readCooldown(mobile) {
  if (typeof window === "undefined" || !mobile) return 0;
  try {
    const raw = sessionStorage.getItem(OTP_COOLDOWN_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (!data?.endsAt || data.mobile !== mobile) return 0;
    const left = Math.ceil((Number(data.endsAt) - Date.now()) / 1000);
    return left > 0 ? left : 0;
  } catch {
    return 0;
  }
}

function writeCooldown(mobile, waitSeconds) {
  if (typeof window === "undefined" || !mobile) return;
  const sec = Math.max(0, Math.floor(Number(waitSeconds) || 0));
  if (sec <= 0) {
    try {
      const raw = sessionStorage.getItem(OTP_COOLDOWN_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (data?.mobile === mobile) sessionStorage.removeItem(OTP_COOLDOWN_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  try {
    sessionStorage.setItem(
      OTP_COOLDOWN_KEY,
      JSON.stringify({
        mobile,
        endsAt: Date.now() + sec * 1000,
      })
    );
  } catch {
    /* ignore */
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, sendOtp, login, loading } = useAuth();

  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState(["", "", "", ""]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [nextPath, setNextPath] = useState("/");

  const inputRefs = useRef([]);

  const applyWait = useCallback((phone, waitSeconds) => {
    const sec = Math.max(0, Math.floor(Number(waitSeconds) || 0));
    if (sec > 0) {
      writeCooldown(phone, sec);
      setCountdown(sec);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const next = new URLSearchParams(window.location.search).get("next");
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    setNextPath(safeNext);

    // اگر قبلاً برای شماره‌ای کد فرستاده شده، تایمر را برگردان
    try {
      const raw = sessionStorage.getItem(OTP_COOLDOWN_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data?.mobile || !data?.endsAt) return;
      const left = Math.ceil((Number(data.endsAt) - Date.now()) / 1000);
      if (left > 0) {
        setMobile(String(data.mobile));
        setCountdown(left);
        setStep(2);
        setSuccess("کد قبلی هنوز معتبر است. همان کد را وارد کنید.");
      } else {
        sessionStorage.removeItem(OTP_COOLDOWN_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(nextPath || "/");
    }
  }, [isAuthenticated, router, nextPath]);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setTimeout(() => {
      setCountdown((c) => {
        const next = c - 1;
        if (next <= 0 && mobile) writeCooldown(mobile, 0);
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, mobile]);

  // با تغییر شماره، تایمر ذخیره‌شده همان شماره را نشان بده
  useEffect(() => {
    if (!mobile || mobile.length !== 11) return;
    const left = readCooldown(mobile);
    if (left > 0) setCountdown(left);
  }, [mobile]);

  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === 4 && !isVerifying) {
      handleAutoVerify(fullCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const validateMobile = (value) => /^09[0-9]{9}$/.test(value);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!mobile) {
      setError("لطفاً شماره موبایل خود را وارد کنید");
      return;
    }

    if (!validateMobile(mobile)) {
      setError("شماره موبایل نامعتبر است (مثال: 09123456789)");
      return;
    }

    // اگر هنوز باید صبر کند، مستقیم به ورود کد ببر
    const left = readCooldown(mobile);
    if (left > 0) {
      setCountdown(left);
      setStep(2);
      setSuccess(
        `کد قبلی هنوز معتبر است. ${formatWait(left)} تا امکان ارسال مجدد باقی مانده.`
      );
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
      return;
    }

    setSending(true);
    const result = await sendOtp(mobile);
    setSending(false);

    if (result.waitTime > 0) {
      applyWait(mobile, result.waitTime);
    }

    if (result.success) {
      setSuccess(
        result.alreadySent
          ? result.message || "کد قبلی هنوز معتبر است"
          : result.message || "کد تایید ارسال شد"
      );
      setStep(2);
      setCode(["", "", "", ""]);
      if (!(result.waitTime > 0)) {
        applyWait(mobile, 120);
      }
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      setError(result.message);
      if (result.waitTime > 0) {
        setSuccess(
          `لطفاً ${formatWait(result.waitTime)} صبر کنید و دوباره تلاش کنید.`
        );
      }
    }
  };

  const handleAutoVerify = async (fullCode) => {
    if (isVerifying || loading) return;

    setIsVerifying(true);
    setError("");
    setSuccess("");

    const result = await login(mobile, fullCode);

    if (!result.success) {
      setError(result.message);
      setCode(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 300);
    } else {
      setSuccess("ورود موفقیت‌آمیز!");
      writeCooldown(mobile, 0);
    }

    setIsVerifying(false);
  };

  const handleCodeChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length > 1) return;

    const newCode = [...code];
    newCode[index] = numericValue;
    setCode(newCode);

    if (error) setError("");

    if (numericValue && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "Enter") {
      const fullCode = code.join("");
      if (fullCode.length === 4) {
        handleAutoVerify(fullCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, "");
    const digits = pastedData.slice(0, 4).split("");

    const newCode = ["", "", "", ""];
    digits.forEach((digit, index) => {
      newCode[index] = digit;
    });
    setCode(newCode);

    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex < 3) {
      inputRefs.current[lastFilledIndex + 1]?.focus();
    }
  };

  const handleBack = () => {
    setStep(1);
    setCode(["", "", "", ""]);
    setError("");
    setSuccess("");
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || sending) return;

    setError("");
    setSuccess("");
    setCode(["", "", "", ""]);

    setSending(true);
    const result = await sendOtp(mobile);
    setSending(false);

    if (result.waitTime > 0) {
      applyWait(mobile, result.waitTime);
    }

    if (result.success) {
      setSuccess(
        result.alreadySent
          ? result.message || "کد قبلی هنوز معتبر است"
          : result.message || "کد جدید با موفقیت ارسال شد"
      );
      if (!(result.waitTime > 0)) {
        applyWait(mobile, 120);
      }
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } else {
      setError(result.message);
    }
  };

  const waitBanner =
    countdown > 0 ? (
      <div className={`${styles.message} ${styles.waitBanner}`}>
        <Clock size={14} strokeWidth={1.8} />
        <span>
          {step === 1
            ? `پیامک اخیراً ارسال شده — ${formatWait(countdown)} تا ارسال مجدد`
            : `ارسال مجدد تا ${formatWait(countdown)} دیگر`}
        </span>
      </div>
    ) : null;

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGradient} />

      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Shield size={32} strokeWidth={1.5} />
          </div>

          <p className={styles.subtitle}>
            {step === 1
              ? "شماره موبایل خود را برای دریافت کد تایید وارد کنید"
              : `کد ۴ رقمی ارسال شده به ${mobile} را وارد کنید`}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <Phone
                  className={styles.inputIcon}
                  size={18}
                  strokeWidth={1.5}
                />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className={styles.input}
                  maxLength={11}
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>

            {waitBanner}

            {error && (
              <div className={`${styles.message} ${styles.error}`}>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={`${styles.message} ${styles.success}`}>
                <span>{success}</span>
              </div>
            )}

            <button
              type="submit"
              className={`${styles.button} ${styles.btnPrimary}`}
              disabled={sending || !mobile}
            >
              {sending ? (
                <span className={styles.loadingSpinner} />
              ) : countdown > 0 && readCooldown(mobile) > 0 ? (
                "ادامه با کد قبلی"
              ) : (
                "دریافت کد تایید"
              )}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>ورود امن</span>
              <span className={styles.dividerLine} />
            </div>
          </form>
        ) : (
          <div className={styles.form}>
            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
              disabled={isVerifying || loading}
            >
              <ChevronLeft size={16} />
              <span>تغییر شماره</span>
            </button>

            <div className={styles.inputGroup}>
              <div className={styles.codeContainer}>
                <div className={styles.codeInputsWrapper}>
                  {[0, 1, 2, 3].map((index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={code[index]}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className={`${styles.codeInput} ${
                        code[index] ? styles.filled : ""
                      }`}
                      maxLength={1}
                      dir="ltr"
                      autoFocus={index === 0}
                      disabled={isVerifying || loading}
                    />
                  ))}
                </div>

                <div className={styles.codeHint}>
                  <Lock size={14} strokeWidth={1.5} />
                  <span>کد تا ۲ دقیقه معتبر است</span>
                </div>

                {waitBanner}

                {(isVerifying || loading) && (
                  <div className={styles.verifyingStatus}>
                    <span className={styles.loadingSpinnerSmall} />
                    <span>در حال تایید...</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className={`${styles.message} ${styles.error}`}>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className={`${styles.message} ${styles.success}`}>
                <span>{success}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleResendOtp}
              className={styles.resendButton}
              disabled={countdown > 0 || isVerifying || loading || sending}
            >
              {countdown > 0
                ? `ارسال مجدد (${formatWait(countdown)})`
                : sending
                  ? "در حال ارسال..."
                  : "ارسال مجدد کد"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
