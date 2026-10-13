'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Play, Pause, Volume2, VolumeX, Maximize, Minimize,
  PictureInPicture2, Download, Share2, Link2, Check,
} from 'lucide-react'
import styles from './School.module.css'

const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2]
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

function toFaDigits(str) {
  return String(str).replace(/\d/g, (d) => FA_DIGITS[d])
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '۰:۰۰'
  const total = Math.floor(sec)
  const s = total % 60
  const m = Math.floor(total / 60) % 60
  const h = Math.floor(total / 3600)
  const pad = (n) => String(n).padStart(2, '0')
  if (h > 0) return toFaDigits(`${h}:${pad(m)}:${pad(s)}`)
  return toFaDigits(`${m}:${pad(s)}`)
}

function speedLabel(s) {
  if (s === 1) return '۱×'
  return `${toFaDigits(String(s))}×`
}

function shareTargets(pageUrl, title, stylesMap) {
  const url = encodeURIComponent(pageUrl || '')
  const text = encodeURIComponent(title || 'درس مدرسه')
  return [
    {
      id: 'bale',
      label: 'بله',
      href: `https://ble.ir/share/url?url=${url}`,
      className: stylesMap.vShareBale,
    },
    {
      id: 'eitaa',
      label: 'ایتا',
      href: `https://eitaa.com/share/url?url=${url}`,
      className: stylesMap.vShareEitaa,
    },
    {
      id: 'rubika',
      label: 'روبیکا',
      href: `https://rubika.ir/share?url=${url}&text=${text}`,
      className: stylesMap.vShareRubika,
    },
  ]
}

function getFullscreenElement() {
  return (
    document.fullscreenElement
    || document.webkitFullscreenElement
    || null
  )
}

async function requestFs(el) {
  if (!el) return
  if (el.requestFullscreen) await el.requestFullscreen()
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
}

async function exitFs() {
  if (document.exitFullscreen) await document.exitFullscreen()
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
}

export function LessonShareBar({ title }) {
  const [pageUrl, setPageUrl] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setShareOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [])

  const socials = shareTargets(pageUrl, title, styles)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <div ref={rootRef} className={`${styles.vPlayerActions} ${styles.vPlayerActionsCompact}`}>
      <div className={styles.vActionMenuWrap}>
        <button
          type="button"
          className={`${styles.vActionBtn} ${shareOpen ? styles.vActionBtnOn : ''}`}
          onClick={() => setShareOpen((o) => !o)}
          aria-expanded={shareOpen}
        >
          <Share2 size={16} />
          اشتراک
        </button>
        {shareOpen ? (
          <div className={`${styles.vActionMenu} ${styles.vShareMenu}`} role="menu">
            <p className={styles.vShareLabel}>اشتراک در شبکه‌ها</p>
            <div className={styles.vShareGrid}>
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`${styles.vShareItem} ${s.className || ''}`}
                  role="menuitem"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <button type="button" className={styles.vShareCopy} onClick={copyLink}>
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? 'لینک کپی شد' : 'کپی لینک صفحه'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function LessonVideoPlayer({
  src,
  poster,
  title,
  allowDownload = true,
}) {
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const seekingRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [shareOpen, setShareOpen] = useState(false)
  const [fs, setFs] = useState(false)
  const [pipOk, setPipOk] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pageUrl, setPageUrl] = useState('')
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setPipOk(typeof document !== 'undefined' && !!document.pictureInPictureEnabled)
    setPageUrl(typeof window !== 'undefined' ? window.location.href : '')
  }, [])

  useEffect(() => {
    setReady(false)
    setFailed(false)
    setPlaying(false)
    setCurrent(0)
    setDuration(0)
    seekingRef.current = false
  }, [src])

  useEffect(() => {
    const syncFs = () => {
      const active = getFullscreenElement()
      setFs(Boolean(active && rootRef.current && active === rootRef.current))
    }
    document.addEventListener('fullscreenchange', syncFs)
    document.addEventListener('webkitfullscreenchange', syncFs)
    return () => {
      document.removeEventListener('fullscreenchange', syncFs)
      document.removeEventListener('webkitfullscreenchange', syncFs)
    }
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (v) v.playbackRate = speed
  }, [speed])

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setShareOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }

  const onTime = () => {
    const v = videoRef.current
    if (!v || seekingRef.current) return
    setCurrent(v.currentTime || 0)
    if (v.buffered?.length) {
      try {
        setBuffered(v.buffered.end(v.buffered.length - 1))
      } catch {
        /* ignore */
      }
    }
  }

  const seekTo = (time) => {
    const v = videoRef.current
    if (!v) return
    const max = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : duration
    if (!max || !Number.isFinite(max)) return
    const next = Math.max(0, Math.min(max, time))
    try {
      v.currentTime = next
    } catch {
      /* ignore */
    }
    setCurrent(next)
  }

  const onSeekInput = (e) => {
    seekingRef.current = true
    seekTo(Number(e.target.value))
  }

  const onSeekCommit = (e) => {
    seekTo(Number(e.target.value))
    seekingRef.current = false
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }

  const changeVolume = (val) => {
    const v = videoRef.current
    if (!v) return
    const next = Math.max(0, Math.min(1, val))
    v.volume = next
    v.muted = next === 0
    setVolume(next)
    setMuted(v.muted)
  }

  const toggleFs = async () => {
    try {
      const active = getFullscreenElement()
      if (active) {
        await exitFs()
        setFs(false)
        return
      }
      await requestFs(rootRef.current)
    } catch {
      /* ignore */
    }
  }

  const togglePip = async () => {
    const v = videoRef.current
    if (!v || !document.pictureInPictureEnabled) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await v.requestPictureInPicture()
    } catch {
      /* ignore */
    }
  }

  const downloadVideo = async () => {
    if (!src || !allowDownload) return
    try {
      const res = await fetch(src)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(title || 'lesson-video').replace(/[^\w\u0600-\u06FF-]+/g, '-')}.mp4`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      const a = document.createElement('a')
      a.href = src
      a.download = ''
      a.target = '_blank'
      a.rel = 'noreferrer'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl || src || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0
  const progress = safeDuration > 0 ? (current / safeDuration) * 100 : 0
  const bufPct = safeDuration > 0 ? Math.min(100, (buffered / safeDuration) * 100) : 0
  const socials = shareTargets(pageUrl || src, title, styles)

  return (
    <div
      ref={rootRef}
      className={`${styles.vPlayerRoot} ${fs ? styles.vPlayerRootFs : ''}`}
    >
      <div className={styles.vPlayer}>
        {!ready && !failed ? (
          <div className={styles.vPlayerSkeleton} aria-hidden>
            <span />
          </div>
        ) : null}

        {failed ? (
          <div className={styles.vPlayerError}>
            ویدیو بارگذاری نشد
          </div>
        ) : null}

        <video
          ref={videoRef}
          className={`${styles.vPlayerVideo} ${ready ? styles.vPlayerVideoReady : ''}`}
          src={src}
          poster={poster || undefined}
          playsInline
          preload="auto"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={onTime}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            const d = v.duration
            setDuration(Number.isFinite(d) ? d : 0)
            v.playbackRate = speed
            if (!poster && v.currentTime < 0.05) {
              try { v.currentTime = 0.05 } catch { /* ignore */ }
            }
          }}
          onDurationChange={(e) => {
            const d = e.currentTarget.duration
            if (Number.isFinite(d) && d > 0) setDuration(d)
          }}
          onLoadedData={() => {
            setReady(true)
            setFailed(false)
          }}
          onCanPlay={() => setReady(true)}
          onError={() => {
            setFailed(true)
            setReady(false)
          }}
          onEnded={() => setPlaying(false)}
          onSeeked={() => {
            seekingRef.current = false
            const v = videoRef.current
            if (v) setCurrent(v.currentTime || 0)
          }}
        />

        <div className={styles.vPlayerFrame} aria-hidden />

        {!playing && !failed ? (
          <button
            type="button"
            className={styles.vPlayerBigPlay}
            onClick={togglePlay}
            aria-label="پخش"
          >
            <Play size={28} fill="currentColor" />
          </button>
        ) : null}

        {title ? (
          <div className={styles.vPlayerCaption}>{title}</div>
        ) : null}
      </div>

      <div className={styles.vPlayerDock}>
        <div className={styles.vPlayerDockTop}>
          <button
            type="button"
            className={`${styles.vActionBtn} ${styles.vActionPrimary} ${styles.vDockPlay}`}
            onClick={togglePlay}
          >
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? 'توقف' : 'پخش'}
          </button>

          <div className={styles.vPlayerTimeBox}>
            <strong>{formatTime(current)}</strong>
            <span>/</span>
            <em>{formatTime(safeDuration)}</em>
          </div>

          <div className={styles.vPlayerVol}>
            <button
              type="button"
              className={styles.vPlayerBtn}
              onClick={toggleMute}
              aria-label={muted || volume === 0 ? 'صدا روشن' : 'بی‌صدا'}
            >
              {muted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              className={styles.vPlayerRangeVisible}
              aria-label="بلندی صدا"
              onChange={(e) => changeVolume(Number(e.target.value))}
            />
          </div>

          {pipOk ? (
            <button
              type="button"
              className={styles.vPlayerBtn}
              onClick={togglePip}
              aria-label="تصویر در تصویر"
              title="تصویر در تصویر"
            >
              <PictureInPicture2 size={17} />
            </button>
          ) : null}

          <button
            type="button"
            className={styles.vPlayerBtn}
            onClick={toggleFs}
            aria-label={fs ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'}
          >
            {fs ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </div>

        <div className={styles.vPlayerSeekTrack}>
          <div className={styles.vPlayerSeekRail} aria-hidden>
            <div className={styles.vPlayerBuf} style={{ width: `${bufPct}%` }} />
            <div className={styles.vPlayerProg} style={{ width: `${progress}%` }} />
          </div>
          <input
            type="range"
            className={styles.vPlayerSeekInput}
            min={0}
            max={safeDuration || 1}
            step={0.05}
            value={Math.min(current, safeDuration || 0)}
            disabled={!safeDuration}
            aria-label="نوار پیمایش ویدیو"
            onChange={onSeekInput}
            onMouseUp={onSeekCommit}
            onTouchEnd={onSeekCommit}
            onKeyUp={onSeekCommit}
            onBlur={onSeekCommit}
          />
        </div>

        <div className={styles.vPlayerSpeedRow}>
          <span className={styles.vPlayerSpeedLabel}>سرعت پخش</span>
          <div className={styles.vPlayerSpeedChips} role="radiogroup" aria-label="سرعت ویدیو">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={speed === s}
                className={`${styles.vSpeedChip} ${speed === s ? styles.vSpeedChipOn : ''}`}
                onClick={() => setSpeed(s)}
              >
                {speedLabel(s)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.vPlayerActions}>
          {allowDownload ? (
            <button type="button" className={styles.vActionBtn} onClick={downloadVideo}>
              <Download size={16} />
              دانلود
            </button>
          ) : null}

          <div className={styles.vActionMenuWrap}>
            <button
              type="button"
              className={`${styles.vActionBtn} ${shareOpen ? styles.vActionBtnOn : ''}`}
              onClick={() => setShareOpen((o) => !o)}
              aria-expanded={shareOpen}
            >
              <Share2 size={16} />
              اشتراک
            </button>
            {shareOpen ? (
              <div className={`${styles.vActionMenu} ${styles.vShareMenu}`} role="menu">
                <p className={styles.vShareLabel}>اشتراک در شبکه‌ها</p>
                <div className={styles.vShareGrid}>
                  {socials.map((s) => (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className={`${styles.vShareItem} ${s.className || ''}`}
                      role="menuitem"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
                <button type="button" className={styles.vShareCopy} onClick={copyLink}>
                  {copied ? <Check size={14} /> : <Link2 size={14} />}
                  {copied ? 'لینک کپی شد' : 'کپی لینک صفحه'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
