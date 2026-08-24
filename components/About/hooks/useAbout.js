// components/About/hooks/useAbout.js

import { useState, useEffect, useCallback } from 'react'
import { aboutData } from '../AboutData'

export const useAbout = (language) => {
  const [data, setData] = useState(aboutData.fa)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    setLoading(true)
    try {
      const selectedData = aboutData[language] || aboutData.fa
      setData(selectedData)
    } catch (error) {
      console.error('Error loading about data:', error)
      setData(aboutData.fa)
    } finally {
      setLoading(false)
    }
  }, [language])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    refresh: loadData
  }
}