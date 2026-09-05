// src/components/AllBoxItem/hooks/useDialog.js

import { useState } from 'react'

export const useDialog = (initialValue = '') => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)
  const [tempValue, setTempValue] = useState(initialValue)

  const openDialog = (key, currentValue = '') => {
    setSelectedKey(key)
    setTempValue(currentValue)
    setIsOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeDialog = () => {
    setIsOpen(false)
    setSelectedKey(null)
    setTempValue('')
    document.body.style.overflow = 'unset'
  }

  const selectOption = (value) => {
    setTempValue(value)
  }

  return {
    isOpen,
    selectedKey,
    tempValue,
    openDialog,
    closeDialog,
    selectOption,
    setTempValue
  }
}