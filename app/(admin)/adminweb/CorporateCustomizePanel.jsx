'use client'

import React from 'react'
import Link from 'next/link'
import { PanelTop, Monitor, List, Smartphone } from 'lucide-react'
import styles from './AdminWeb.module.css'

/**
 * سفارشی‌سازی هدر و منوی موبایل — همیشه در دسترس (مستقل از روشن/خاموش بودن ماژول)
 */
export default function CorporateCustomizePanel() {
  return (
    <section className={styles.section} id="corporate-customize">
      <div className={styles.sectionHead}>
        <PanelTop size={18} />
        <h2>سفارشی‌سازی هدر و منوی موبایل</h2>
      </div>
      <p className={styles.moduleIntro}>
        صرف‌نظر از وضعیت ماژول شرکتی، از اینجا ظاهر هدر دسکتاپ، استایل منوی پایین موبایل
        و لینک‌های منو را کامل تنظیم کنید.
      </p>

      <div className={styles.corpCustomGrid}>
        <Link
          href="/header-menu?tab=desktop"
          className={styles.corpCustomCard}
        >
          <Monitor size={18} />
          <strong>ظاهر دسکتاپ</strong>
          <p>لوگو، رنگ‌ها و ترتیب منوی بالای دسکتاپ</p>
          <span>باز کردن تنظیمات دسکتاپ ←</span>
        </Link>

        <Link
          href="/header-menu?tab=mobile"
          className={styles.corpCustomCard}
        >
          <Smartphone size={18} />
          <strong>ظاهر موبایل</strong>
          <p>استایل، رنگ‌ها و ترتیب نوار پایین — مستقل از دسکتاپ</p>
          <span>سفارشی‌سازی موبایل ←</span>
        </Link>

        <Link
          href="/header-menu?tab=links"
          className={styles.corpCustomCard}
        >
          <List size={18} />
          <strong>لینک‌های منو</strong>
          <p>آیتم‌های منوی بالا و پایین — عنوان، لینک، آیکون و ترتیب</p>
          <span>مدیریت لینک‌ها ←</span>
        </Link>
      </div>
    </section>
  )
}
