// src/components/AllBoxItem/hooks/usePagination.js

import { useMemo } from 'react'

export const usePagination = (items, itemsPerPage, currentPage) => {
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return items.slice(startIndex, endIndex)
  }, [items, currentPage, itemsPerPage])

  const goToPage = (page, setCurrentPage) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return {
    totalItems,
    totalPages,
    currentItems,
    goToPage
  }
}