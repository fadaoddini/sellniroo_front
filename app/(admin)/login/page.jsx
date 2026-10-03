// app/login/page.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Phone, 
  ChevronLeft, 
  Shield,
  Lock
} from "lucide-react";
import styles from "./Login.module.css";

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
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // بررسی خودکار کد وقتی همه ۴ رقم پر شد
  useEffect(() => {
    const fullCode = code.join("");
    if (fullCode.length === 4 && !isVerifying) {
      handleAutoVerify(fullCode);
    }
  }, [code]);

  const validateMobile = (mobile) => {
    const mobileRegex = /^09[0-9]{9}$/;
    return mobileRegex.test(mobile);
  };

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

    const result = await sendOtp(mobile);
    
    if (result.success) {
      setSuccess(result.message);
      setStep(2);
      setCode(["", "", "", ""]);
      if (result.waitTime > 0) {
        setCountdown(result.waitTime);
      }
      // فوکوس روی اولین input
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } else {
      setError(result.message);
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
      // پاک کردن کد و فوکوس روی اولین input
      setCode(["", "", "", ""]);
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 300);
    } else {
      setSuccess("ورود موفقیت‌آمیز!");
    }
    
    setIsVerifying(false);
  };

  const handleCodeChange = (index, value) => {
    // فقط عدد قبول کن
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 1) return;

    const newCode = [...code];
    newCode[index] = numericValue;
    setCode(newCode);

    // پاک کردن خطا
    if (error) setError("");

    // اگر عدد وارد شد، برو به input بعدی
    if (numericValue && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // اگر backspace زده شد و input خالی بود، برو به قبلی
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    
    // اگر Enter زده شد، کد کامل را بررسی کن
    if (e.key === "Enter") {
      const fullCode = code.join("");
      if (fullCode.length === 4) {
        handleAutoVerify(fullCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").replace(/\D/g, '');
    const digits = pastedData.slice(0, 4).split('');
    
    const newCode = ["", "", "", ""];
    digits.forEach((digit, index) => {
      newCode[index] = digit;
    });
    setCode(newCode);

    // فوکوس روی آخرین input پر شده
    const lastFilledIndex = digits.length - 1;
    if (lastFilledIndex < 3) {
      inputRefs.current[lastFilledIndex + 1].focus();
    }
  };

  const handleBack = () => {
    setStep(1);
    setCode(["", "", "", ""]);
    setError("");
    setSuccess("");
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setError("");
    setSuccess("");
    setCode(["", "", "", ""]);
    
    const result = await sendOtp(mobile);
    if (result.success) {
      setSuccess("کد جدید با موفقیت ارسال شد");
      if (result.waitTime > 0) {
        setCountdown(result.waitTime);
      }
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 100);
    } else {
      setError(result.message);
    }
  };

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
                <Phone className={styles.inputIcon} size={18} strokeWidth={1.5} />
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className={styles.input}
                  maxLength={11}
                  dir="ltr"
                  autoFocus
                />
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
              type="submit"
              className={`${styles.button} ${styles.btnPrimary}`}
              disabled={loading || !mobile}
            >
              {loading ? (
                <span className={styles.loadingSpinner} />
              ) : (
                "دریافت کد تایید"
              )}
            </button>

            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>ورود امن</span>
              <span className={styles.dividerLine} />
            </div>

            <p className={styles.footerText}>
              با ورود، شما با <a href="/terms">قوانین و شرایط</a> موافقت می‌کنید
            </p>
          </form>
        ) : (
          <div className={styles.form}>
         

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
                      className={`${styles.codeInput} ${code[index] ? styles.filled : ''}`}
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
              disabled={countdown > 0 || isVerifying || loading}
            >
              {countdown > 0 
                ? `ارسال مجدد (${countdown} ثانیه)` 
                : "ارسال مجدد کد"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}