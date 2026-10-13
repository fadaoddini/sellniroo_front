'use client'

import React, { useCallback, useMemo, useState } from 'react'
import styles from './School.module.css'

function isVideoSrc(src, file) {
  if (file?.type?.startsWith('video/')) return true
  if (typeof src !== 'string') return false
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src)
}

export default function DropZone({
  accept,
  label = 'فایل را اینجا رها کنید یا کلیک کنید',
  onFile,
  preview,
  previewFile,
}) {
  const [active, setActive] = useState(false)

  const handleFiles = useCallback((files) => {
    const file = files?.[0]
    if (file && onFile) onFile(file)
  }, [onFile])

  const showVideo = useMemo(
    () => isVideoSrc(preview, previewFile),
    [preview, previewFile]
  )

  return (
    <label
      className={`${styles.drop} ${active ? styles.dropActive : ''}`}
      onDragOver={(e) => { e.preventDefault(); setActive(true) }}
      onDragLeave={() => setActive(false)}
      onDrop={(e) => {
        e.preventDefault()
        setActive(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        type="file"
        accept={accept}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {preview ? (
        showVideo
          ? <video src={preview} className={styles.video} controls />
          : <img src={preview} alt="" className={styles.cover} />
      ) : (
        <span>{label}</span>
      )}
    </label>
  )
}
