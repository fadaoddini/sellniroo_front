'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import SchoolProfileHub from './SchoolProfileHub'
import styles from '../styles/ProfilePage.module.css'
import domainStyles from '../styles/DomainProfilePage.module.css'

export default function SchoolProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={`${styles.loadingContainer} ${styles.profilePageSchool} ${domainStyles.pageSchool}`}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <SchoolProfileHub />
    </Suspense>
  )
}
