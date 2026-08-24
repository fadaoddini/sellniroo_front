'use client'

import React, { useState, useEffect } from 'react'
import { getInstagramToken, getInstagramUserId } from '../../services/instagramService'
import InstagramConnect from '../../modules/web/components/InstagramConnect'
import InstagramDashboard from '../../modules/web/components/InstagramDashboard'
import styles from '../../styles/modules/WebPage.module.css'

export default function WebPage() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const token = getInstagramToken()
    const userId = getInstagramUserId()
    setIsConnected(!!token && !!userId)
  }, [])

  const handleConnect = () => {
    setIsConnected(true)
  }

  return (
    <div className="container">
      <div className={styles.webContainer}>
        {!isConnected ? (
          <InstagramConnect onConnect={handleConnect} />
        ) : (
          <InstagramDashboard />
        )}
      </div>
    </div>
  )
}
