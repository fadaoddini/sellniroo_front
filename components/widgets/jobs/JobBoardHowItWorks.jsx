'use client'

import React from 'react'
import { Compass, GraduationCap } from 'lucide-react'
import GuidedTour, { useGuidedTour } from '@/components/Admin/GuidedTour'
import { JOB_BOARD_TOUR_STEPS } from '@/config/jobBoardTour'
import styles from './JobBoardHowItWorks.module.css'

/**
 * ردیف معرفی بالای سیستم کاریابی + تور راهنمای کامل
 */
export default function JobBoardHowItWorks({
  title = 'سیستم کاریابی چطور کار می‌کند؟',
  eyebrow = 'راهنمای سریع',
  buttonLabel = 'راهنما',
  steps = JOB_BOARD_TOUR_STEPS,
  tourTarget = 'jb-how',
  ariaLabel = 'شروع تور راهنمای سیستم کاریابی',
}) {
  const tour = useGuidedTour(steps)

  return (
    <>
      <div className={styles.bar} data-tour={tourTarget}>
        <div className={styles.copy}>
          <span className={styles.iconWrap} aria-hidden>
            <Compass size={20} strokeWidth={2.2} />
          </span>
          <div className={styles.textCol}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h3 className={styles.title}>{title}</h3>
          </div>
        </div>
        <button
          type="button"
          className={styles.guideBtn}
          onClick={() => tour.start()}
          aria-label={ariaLabel}
        >
          <GraduationCap size={16} strokeWidth={2.3} aria-hidden />
          <span>{buttonLabel}</span>
        </button>
      </div>

      <GuidedTour
        open={tour.open}
        steps={tour.steps}
        stepIndex={tour.stepIndex}
        onStepChange={tour.setStepIndex}
        onClose={tour.close}
        theme="job"
      />
    </>
  )
}
