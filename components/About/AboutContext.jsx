// components/About/AboutContext.jsx

'use client'

import React, { createContext, useContext } from 'react'
import { useAbout } from './hooks/useAbout'

const AboutContext = createContext()

export const useAboutContext = () => {
  const context = useContext(AboutContext)
  if (!context) {
    throw new Error('useAboutContext must be used within AboutProvider')
  }
  return context
}

export const AboutProvider = ({ children, language }) => {
  const aboutData = useAbout(language)

  return (
    <AboutContext.Provider value={aboutData}>
      {children}
    </AboutContext.Provider>
  )
}