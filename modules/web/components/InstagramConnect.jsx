'use client'

import React, { useState } from 'react'
import { Instagram, LogIn, AlertCircle, CheckCircle } from 'lucide-react'
import { setInstagramToken, setInstagramUserId } from '../../../services/instagramService'
import styles from '../../../styles/modules/InstagramConnect.module.css'

const InstagramConnect = ({ onConnect }) => {
  const [token, setToken] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleConnect = async (e) => {
    e.preventDefault()
    
    if (!token.trim() || !userId.trim()) {
      setError('لطفاً توکن و ID کاربری را وارد کنید')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // ذخیره توکن و ID
      setInstagramToken(token.trim())
      setInstagramUserId(userId.trim())
      
      setSuccess(true)
      
      // فراخوانی callback
      if (onConnect) {
        onConnect()
      }
    } catch (err) {
      setError('خطا در اتصال به اینستاگرام: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.connectContainer}>
      <div className={styles.connectCard}>
        <div className={styles.connectHeader}>
          <div className={styles.connectIcon}>
            <Instagram size={40} />
          </div>
          <h2>اتصال به اینستاگرام</h2>
          <p>برای مدیریت محتوا، توکن دسترسی خود را وارد کنید</p>
        </div>

        <form onSubmit={handleConnect} className={styles.connectForm}>
          <div className={styles.formGroup}>
            <label>توکن دسترسی (Access Token)</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="توکن خود را وارد کنید..."
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label>ID کاربری اینستاگرام</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="ID کاربری خود را وارد کنید..."
              className={styles.formInput}
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className={styles.successMessage}>
              <CheckCircle size={18} />
              <span>اتصال با موفقیت برقرار شد!</span>
            </div>
          )}

          <button 
            type="submit" 
            className={styles.connectBtn}
            disabled={loading}
          >
            {loading ? (
              'در حال اتصال...'
            ) : (
              <>
                <LogIn size={18} />
                اتصال به اینستاگرام
              </>
            )}
          </button>
        </form>

        <div className={styles.connectHelp}>
          <p>برای دریافت توکن:</p>
          <ol>
            <li>به <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer">Graph API Explorer</a> بروید</li>
            <li>اپلیکیشن خود را انتخاب کنید</li>
            <li>مجوزهای (Permissions) زیر را انتخاب کنید:</li>
            <ul>
              <li>instagram_business_basic</li>
              <li>instagram_business_manage_comments</li>
              <li>instagram_business_content_publish</li>
            </ul>
            <li>توکن را کپی کرده و در اینجا جایگذاری کنید</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default InstagramConnect
