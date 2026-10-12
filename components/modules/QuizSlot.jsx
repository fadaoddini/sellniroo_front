'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import Quiz from '@/components/Quiz'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import disabledStyles from './ModuleDisabled.module.css'

function QuizDisabled() {
  return (
    <div className={disabledStyles.wrap}>
      <div className={disabledStyles.card}>
        <h1>آزمون در دسترس نیست</h1>
        <p>این بخش فعلاً غیرفعال است.</p>
        <a href="/">بازگشت به صفحه اصلی</a>
      </div>
    </div>
  )
}

export default function QuizSlot(props) {
  return (
    <ModuleGate
      moduleKey={SITE_MODULE_KEYS.QUIZ}
      fallback={<QuizDisabled />}
    >
      <Quiz {...props} />
    </ModuleGate>
  )
}
