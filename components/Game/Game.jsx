// components/Game/Game.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Game.module.css';
import {
  Gamepad2,
  RotateCcw,
  Moon,
  Sun,
  Trophy,
  Sparkles,
} from 'lucide-react';

/* ============================================
   CONSTANTS
   ============================================ */
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 400;

// فیزیک پاراگلایدر (Flappy-style)
const GRAVITY = 0.45;
const SINGLE_TAP_FORCE = -7.2;
const DOUBLE_TAP_FORCE = -5.5;
const MAX_FALL_SPEED = 7;
const MAX_RISE_SPEED = -9;

// دیباونس برای تشخیص دوبار Space
const DOUBLE_TAP_WINDOW = 220; // ms

// ایموجی‌های منفی (دشمن‌ها)
const NEGATIVE_EMOJIS = [
  { emoji: '😞', name: 'ناامید', color: '#6b7280', bgColor: '#f3f4f6' },
  { emoji: '😨', name: 'ترس',    color: '#7c3aed', bgColor: '#ede9fe' },
  { emoji: '😰', name: 'عجله',   color: '#ea580c', bgColor: '#ffedd5' },
  { emoji: '😟', name: 'نگرانی', color: '#0891b2', bgColor: '#cffafe' },
  { emoji: '😩', name: 'خستگی',  color: '#b91c1c', bgColor: '#fee2e2' },
];

// اندازه‌های مختلف
const EMOJI_SCALES = [1, 1, 1, 1.15, 0.9, 1.05];

// ایموجی‌های مثبت (برای صفحه برد احتمالی)
const POSITIVE_EMOJIS = ['🎯', '🚀', '💪', '🔥', '⭐', '🏆'];

export default function Game() {
  const canvasRef = useRef(null);

  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNight, setIsNight] = useState(false);
  const [speed, setSpeed] = useState(3);

  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const speedIncreaseTimerRef = useRef(0);
  const lastTapTimeRef = useRef(0);

  /* ============================================
     GAME STATE
     ============================================ */
  const gameRef = useRef({
    plane: {
      x: 140,
      y: CANVAS_HEIGHT / 2,
      width: 70,
      height: 40,
      vy: 0,
      rotation: 0,
      propellerAngle: 0,
    },
    crows: [], // ایموجی‌های دشمن
    clouds: [],
    stars: [],
    frame: 0,
    score: 0,
    speed: 3,
    isNight: false,
  });

  /* ============================================
     INITIAL CLOUDS & STARS
     ============================================ */
  useEffect(() => {
    gameRef.current.clouds = Array.from({ length: 5 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: 30 + Math.random() * 120,
      width: 60 + Math.random() * 80,
      speed: 0.3 + Math.random() * 0.5,
    }));

    gameRef.current.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * 200,
      size: 1 + Math.random() * 2,
      twinkle: Math.random() * Math.PI * 2,
    }));
  }, []);

  /* ============================================
     DRAW: BACKGROUND
     ============================================ */
  const drawBackground = (ctx) => {
    const isNight = gameRef.current.isNight;
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);

    if (isNight) {
      gradient.addColorStop(0, '#0f1729');
      gradient.addColorStop(0.7, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
    } else {
      gradient.addColorStop(0, '#87ceeb');
      gradient.addColorStop(0.7, '#b3e0f2');
      gradient.addColorStop(1, '#e8f4f8');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  };

  /* ============================================
     DRAW: STARS
     ============================================ */
  const drawStars = (ctx) => {
    if (!gameRef.current.isNight) return;
    const frame = gameRef.current.frame;
    gameRef.current.stars.forEach((star) => {
      const twinkle = Math.sin(star.twinkle + frame * 0.02) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  /* ============================================
     DRAW: CLOUDS
     ============================================ */
  const drawClouds = (ctx) => {
    const isNight = gameRef.current.isNight;
    gameRef.current.clouds.forEach((cloud) => {
      ctx.fillStyle = isNight
        ? 'rgba(255,255,255,0.06)'
        : 'rgba(255,255,255,0.7)';

      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        cloud.x - cloud.width / 3,
        cloud.y + 5,
        cloud.width / 3,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(
        cloud.x + cloud.width / 3,
        cloud.y + 5,
        cloud.width / 3,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CANVAS_WIDTH + cloud.width;
        cloud.y = 30 + Math.random() * 120;
      }
    });
  };

  /* ============================================
     DRAW: BRAND TEXT
     ============================================ */
  const drawBrandText = (ctx) => {
    const isNight = gameRef.current.isNight;
    const frame = gameRef.current.frame;

    const text = 'Sellniroo';
    const fontSize = 48;
    const opacity = isNight ? 0.2 : 0.15;

    ctx.save();
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2 - 20 + Math.sin(frame * 0.005) * 8;

    ctx.shadowColor = isNight
      ? 'rgba(100, 150, 255, 0.4)'
      : 'rgba(14, 143, 89, 0.3)';
    ctx.shadowBlur = 25;

    if (isNight) {
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    } else {
      ctx.fillStyle = `rgba(14, 143, 89, ${opacity})`;
    }

    ctx.fillText(text, centerX, centerY);
    ctx.restore();
  };

  /* ============================================
     DRAW: PARAGLIDER + MARKETER
     ============================================ */
  const drawPlane = (ctx) => {
    const plane = gameRef.current.plane;
    const { x, y, width, height, rotation } = plane;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation);
    ctx.translate(-width / 2, -height / 2);

    /* ============================================
       PARAGLIDER CANOPY
       ============================================ */
    const canopyWidth = width * 1.6;
    const canopyHeight = 22;
    const canopyX = -canopyWidth / 2 + width / 2;
    const canopyY = -height / 2 - 8;

    // سایه زیر پاراگلایدر
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.beginPath();
    ctx.ellipse(
      width / 2,
      canopyY + canopyHeight / 2 + 3,
      canopyWidth / 2,
      canopyHeight / 2 + 2,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // سلول‌های پاراگلایدر
    const cellCount = 9;
    const cellWidth = canopyWidth / cellCount;

    for (let i = 0; i < cellCount; i++) {
      const cellX = canopyX + i * cellWidth;
      const centerOffset = Math.abs(i - (cellCount - 1) / 2);
      const arcFactor = 1 - (centerOffset / cellCount) * 0.5;
      const cellH = canopyHeight * arcFactor;
      const cellY = canopyY + (canopyHeight - cellH) / 2;

      let color;
      if (i % 3 === 0) color = '#0e8f59';
      else if (i % 3 === 1) color = '#fbc300';
      else color = '#2da170';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cellX, cellY);
      ctx.quadraticCurveTo(
        cellX + cellWidth / 2,
        cellY - 6,
        cellX + cellWidth,
        cellY
      );
      ctx.lineTo(cellX + cellWidth, cellY + cellH);
      ctx.quadraticCurveTo(
        cellX + cellWidth / 2,
        cellY + cellH + 4,
        cellX,
        cellY + cellH
      );
      ctx.closePath();
      ctx.fill();

      if (i > 0) {
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(cellX, cellY);
        ctx.lineTo(cellX, cellY + cellH);
        ctx.stroke();
      }
    }

    // خط پایین پاراگلایدر
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(canopyX, canopyY + canopyHeight);
    for (let i = 1; i <= cellCount; i++) {
      ctx.lineTo(canopyX + i * cellWidth, canopyY + canopyHeight);
    }
    ctx.stroke();

    // لوگو
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', width / 2, canopyY + canopyHeight / 2 - 2);

    /* ============================================
       STRINGS
       ============================================ */
    ctx.strokeStyle = 'rgba(60, 60, 70, 0.85)';
    ctx.lineWidth = 1.2;

    const leftAttachX = canopyX + cellWidth * 0.5;
    const rightAttachX = canopyX + cellWidth * (cellCount - 0.5);
    const attachY = canopyY + canopyHeight;

    const bodyAttachX = width / 2;
    const bodyAttachY = height / 2 - 2;

    ctx.beginPath();
    ctx.moveTo(leftAttachX, attachY);
    ctx.quadraticCurveTo(
      (leftAttachX + bodyAttachX) / 2,
      (attachY + bodyAttachY) / 2 + 4,
      bodyAttachX - 4,
      bodyAttachY
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightAttachX, attachY);
    ctx.quadraticCurveTo(
      (rightAttachX + bodyAttachX) / 2,
      (attachY + bodyAttachY) / 2 + 4,
      bodyAttachX + 4,
      bodyAttachY
    );
    ctx.stroke();

    ctx.strokeStyle = 'rgba(60, 60, 70, 0.5)';
    ctx.beginPath();
    ctx.moveTo(width / 2, attachY);
    ctx.lineTo(bodyAttachX, bodyAttachY);
    ctx.stroke();

    /* ============================================
       HARNESS
       ============================================ */
    const harnessY = bodyAttachY - 2;

    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bodyAttachX, harnessY, 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.beginPath();
    ctx.arc(bodyAttachX, harnessY, 1.5, 0, Math.PI * 2);
    ctx.fill();

    /* ============================================
       MARKETER BODY
       ============================================ */
    // پاها
    ctx.strokeStyle = '#1a237e';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(width / 2 - 4, height / 2 + 8);
    ctx.lineTo(width / 2 - 7, height / 2 + 20);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2 + 4, height / 2 + 8);
    ctx.lineTo(width / 2 + 7, height / 2 + 20);
    ctx.stroke();

    // کفش‌ها
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(width / 2 - 8, height / 2 + 22, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(width / 2 + 8, height / 2 + 22, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // تنه
    ctx.fillStyle = '#0e8f59';
    ctx.beginPath();
    ctx.roundRect(width / 2 - 8, height / 2 - 2, 16, 14, 3);
    ctx.fill();

    // نوار روی پیراهن
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(width / 2 - 8, height / 2 + 2, 16, 1.5);

    // کمربند
    ctx.fillStyle = '#333';
    ctx.fillRect(width / 2 - 8, height / 2 + 4, 16, 3);

    // دست‌ها
    ctx.strokeStyle = '#fdbcb4';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(width / 2 - 7, height / 2 + 1);
    ctx.lineTo(width / 2 - 10, height / 2 - 5);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width / 2 + 7, height / 2 + 3);
    ctx.lineTo(width / 2 + 12, height / 2 + 6);
    ctx.stroke();

    /* ============================================
       PHONE
       ============================================ */
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.roundRect(width / 2 + 11, height / 2 + 5, 6, 11, 1.5);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.roundRect(width / 2 + 12, height / 2 + 6, 4, 8, 1);
    ctx.fill();

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(width / 2 + 13, height / 2 + 3, 2, 2.5);

    // موج سیگنال
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.7)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(
        width / 2 + 14,
        height / 2 + 4,
        2 + i * 2,
        Math.PI * 1.2,
        Math.PI * 1.8
      );
      ctx.stroke();
    }

    /* ============================================
       HEAD
       ============================================ */
    ctx.fillStyle = '#fdbcb4';
    ctx.fillRect(width / 2 - 2, height / 2 - 5, 4, 4);

    ctx.fillStyle = '#fdbcb4';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, 7, 0, Math.PI * 2);
    ctx.fill();

    // کلاه
    ctx.fillStyle = '#c41e3a';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, 7.5, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(width / 2 - 7.5, height / 2 - 11, 15, 2);

    ctx.fillStyle = '#0e8f59';
    ctx.fillRect(width / 2 - 7.5, height / 2 - 11, 15, 1.5);

    // موها
    ctx.fillStyle = '#3d2817';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, 6.5, Math.PI, Math.PI * 2);
    ctx.fill();

    // چشم‌ها
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(width / 2 - 2.5, height / 2 - 10, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width / 2 + 2.5, height / 2 - 10, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(width / 2 - 2.5, height / 2 - 10, 1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width / 2 + 2.5, height / 2 - 10, 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(width / 2 - 3, height / 2 - 10.5, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(width / 2 + 2, height / 2 - 10.5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // لبخند
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 7, 2.5, 0.3, Math.PI - 0.3);
    ctx.stroke();

    /* ============================================
       HEADSET
       ============================================ */
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 10, 7.5, Math.PI * 0.2, Math.PI * 0.8);
    ctx.stroke();

    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(width / 2 - 6, height / 2 - 7, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 6, height / 2 - 7);
    ctx.lineTo(width / 2 - 3, height / 2 - 8);
    ctx.stroke();

    /* ============================================
       WIND LINES + RIBBON
       ============================================ */
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(canopyX - 15 - i * 8, canopyY + 5 + i * 6);
      ctx.lineTo(canopyX - 5 - i * 8, canopyY + 5 + i * 6);
      ctx.stroke();
    }

    const time = Date.now() / 200;
    ctx.strokeStyle = '#fbc300';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canopyX + 2, canopyY + canopyHeight);
    for (let i = 1; i <= 8; i++) {
      const wave = Math.sin(time + i * 0.5) * 3;
      ctx.lineTo(
        canopyX + 2 - i * 3,
        canopyY + canopyHeight + i * 2 + wave
      );
    }
    ctx.stroke();

    ctx.restore();
  };

  /* ============================================
     DRAW: NEGATIVE EMOJI (دشمن)
     ============================================ */
/* ============================================
   DRAW: NEGATIVE EMOJI (دشمن) — ابعاد کوچک
   ============================================ */
const drawWord = (ctx, enemy) => {
  const { x, y, width, height, emoji, name, color, bgColor, opacity, bobPhase } = enemy;

  ctx.save();
  ctx.globalAlpha = opacity;

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  /* ---------- هاله رنگی ---------- */
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, width / 1.1
  );
  glowGradient.addColorStop(0, `${color}30`);
  glowGradient.addColorStop(0.6, `${color}10`);
  glowGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, width / 1.2, 0, Math.PI * 2);
  ctx.fill();

  /* ---------- دایره پس‌زمینه ---------- */
  ctx.shadowColor = `${color}55`;
  ctx.shadowBlur = 6;         // ✅ کاهش از 14
  ctx.shadowOffsetY = 2;      // ✅ کاهش از 4

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.arc(centerX, centerY, Math.min(width, height) / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  /* ---------- حلقه رنگی ---------- */
  ctx.shadowBlur = 0;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;        // ✅ کاهش از 2.5
  ctx.beginPath();
  ctx.arc(centerX, centerY, Math.min(width, height) / 2 - 1, 0, Math.PI * 2);
  ctx.stroke();

  /* ---------- ایموجی ---------- */
  const emojiSize = Math.min(width, height) * 0.72;
  ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetY = 1;

  ctx.fillText(emoji, centerX, centerY + 1);

  /* ---------- نام زیر ایموجی ---------- */
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // ✅ فونت متناسب با ابعاد کوچک
  const nameFontSize = Math.max(7, Math.round(width / 2.5));
  ctx.font = `bold ${nameFontSize}px var(--font-iran-bold), Tahoma, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const nameText = name;
  const nameMetrics = ctx.measureText(nameText);
  const nameWidth = nameMetrics.width + 6;         // ✅ کاهش از 12
  const nameHeight = nameFontSize + 4;             // ✅ متناسب
  const nameX = centerX - nameWidth / 2;
  const nameY = y + height + 1;                    // ✅ کاهش از 2

  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(nameX, nameY, nameWidth, nameHeight, nameHeight / 2);
  ctx.fill();

  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8;                              // ✅ کاهش از 1.2
  ctx.beginPath();
  ctx.roundRect(nameX, nameY, nameWidth, nameHeight, nameHeight / 2);
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(nameText, centerX, nameY + nameHeight / 2 + 0.5);

  /* ---------- خطوط حرکت ---------- */
  ctx.strokeStyle = `${color}66`;
  ctx.lineWidth = 1;                                // ✅ کاهش از 1.8
  const time = Date.now() / 150;
  for (let i = 0; i < 3; i++) {
    const offsetY = (i - 1) * 3;                    // ✅ کاهش از 7
    const wave = Math.sin(time + i + bobPhase) * 1.5;
    ctx.beginPath();
    ctx.moveTo(x + width + 2, centerY + offsetY + wave);
    ctx.lineTo(x + width + 8, centerY + offsetY + wave);  // ✅ کاهش از 16
    ctx.stroke();
  }

  ctx.restore();
};

  /* ============================================
     DRAW: SCORE UI
     ============================================ */
  const drawScore = (ctx) => {
    const isNight = gameRef.current.isNight;
    ctx.save();

    ctx.fillStyle = isNight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)';
    ctx.font = 'bold 20px var(--font-iran)';
    ctx.textAlign = 'left';
    ctx.fillText(`🎯 ${gameRef.current.score}`, 20, 35);

    ctx.fillStyle = isNight
      ? 'rgba(255,255,255,0.5)'
      : 'rgba(0,0,0,0.4)';
    ctx.font = '12px var(--font-iran)';
    ctx.fillText(`⚡ سرعت: ${Math.round(gameRef.current.speed)}`, 20, 55);

    if (isNight) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '11px var(--font-iran)';
      ctx.fillText('🌙 شب', 20, 72);
    }

    ctx.restore();
  };

  /* ============================================
     SPAWN ENEMY (ایموجی منفی)
     ============================================ */
/* ============================================
   SPAWN ENEMY (ایموجی منفی) — ابعاد کوچک
   ============================================ */
const spawnCrow = () => {
  const enemyData =
    NEGATIVE_EMOJIS[Math.floor(Math.random() * NEGATIVE_EMOJIS.length)];

  const scale =
    EMOJI_SCALES[Math.floor(Math.random() * EMOJI_SCALES.length)];

  // ✅ ابعاد تقسیم بر ۴ شده
  const baseSize = 24; // قبلاً 62 بود → 62 ÷ 4 ≈ 15.5
  const width = baseSize * scale;
  const height = baseSize * scale;

  const minY = 30;
  const maxY = CANVAS_HEIGHT - height - 30;
  const y = minY + Math.random() * (maxY - minY);

  const baseSpeed = 3 + Math.random() * (6 - 3);

  gameRef.current.crows.push({
    x: CANVAS_WIDTH + 40,
    y,
    width,
    height,
    speed: baseSpeed + gameRef.current.speed * 0.3,
    emoji: enemyData.emoji,
    name: enemyData.name,
    color: enemyData.color,
    bgColor: enemyData.bgColor,
    opacity: 0.9 + Math.random() * 0.1,
    bobPhase: Math.random() * Math.PI * 2,
    passed: false,
  });
};

  /* ============================================
     CHECK COLLISION
     ============================================ */
/* ============================================
   CHECK COLLISION — متناسب با ابعاد کوچک
   ============================================ */
const checkCollision = (plane, enemy) => {
  // محدوده بازاریاب
  const planeLeft = plane.x + plane.width / 2 - 12;
  const planeRight = plane.x + plane.width / 2 + 12;
  const planeTop = plane.y + plane.height / 2 - 15;
  const planeBottom = plane.y + plane.height / 2 + 25;

  // ✅ شعاع دایره‌ی ایموجی، متناسب با ابعاد کوچک
  const enemyCenterX = enemy.x + enemy.width / 2;
  const enemyCenterY = enemy.y + enemy.height / 2;
  const enemyRadius = Math.min(enemy.width, enemy.height) / 2 - 2; // ✅ کاهش padding

  const closestX = Math.max(planeLeft, Math.min(enemyCenterX, planeRight));
  const closestY = Math.max(planeTop, Math.min(enemyCenterY, planeBottom));

  const dx = enemyCenterX - closestX;
  const dy = enemyCenterY - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < enemyRadius;
};

  /* ============================================
     GAME LOOP
     ============================================ */
  const gameLoopFn = useCallback(
    (timestamp) => {
      if (gameState !== 'playing') return;

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawBackground(ctx);
      drawStars(ctx);
      drawBrandText(ctx);
      drawClouds(ctx);

      /* ----- Physics ----- */
      const plane = gameRef.current.plane;
      plane.vy += GRAVITY;

      if (plane.vy > MAX_FALL_SPEED) plane.vy = MAX_FALL_SPEED;
      if (plane.vy < MAX_RISE_SPEED) plane.vy = MAX_RISE_SPEED;

      plane.y += plane.vy;

      if (plane.y < 0) {
        plane.y = 0;
        plane.vy = 0;
      }
      if (plane.y + plane.height > CANVAS_HEIGHT) {
        plane.y = CANVAS_HEIGHT - plane.height;
        plane.vy = 0;
        handleGameOver();
        return;
      }

      const targetRotation = Math.max(
        -0.5,
        Math.min(0.5, plane.vy * 0.08)
      );
      plane.rotation += (targetRotation - plane.rotation) * 0.15;
      plane.propellerAngle += 0.6;

      drawPlane(ctx);

      /* ----- Speed increase ----- */
      speedIncreaseTimerRef.current += deltaTime;
      if (speedIncreaseTimerRef.current >= 8) {
        speedIncreaseTimerRef.current = 0;
        gameRef.current.speed = Math.min(gameRef.current.speed + 0.3, 10);
        setSpeed(gameRef.current.speed);
      }

      /* ----- Spawn enemies ----- */
      if (gameRef.current.frame % 75 === 0) {
        spawnCrow();
      }

      if (
        gameRef.current.speed > 6 &&
        gameRef.current.frame % 110 === 0
      ) {
        spawnCrow();
      }

      /* ----- Update & Draw enemies ----- */
      const newCrows = [];
      let collision = false;

      for (const crow of gameRef.current.crows) {
        crow.x -= crow.speed;

        // حرکت موج‌دار عمودی
        crow.bobPhase += 0.06;
        crow.y += Math.sin(crow.bobPhase) * 0.35;

        if (checkCollision(plane, crow)) {
          collision = true;
          break;
        }

        if (!crow.passed && crow.x + crow.width < plane.x) {
          crow.passed = true;
          gameRef.current.score += 1;
          setScore(gameRef.current.score);

          if (gameRef.current.score % 15 === 0 && gameRef.current.score > 0) {
            gameRef.current.isNight = !gameRef.current.isNight;
            setIsNight(gameRef.current.isNight);
          }
        }

        if (crow.x + crow.width > -80) {
          newCrows.push(crow);
        }
      }

      if (collision) {
        handleGameOver();
        return;
      }

      gameRef.current.crows = newCrows;
      gameRef.current.crows.forEach((crow) => drawWord(ctx, crow));

      drawScore(ctx);
      gameRef.current.frame += 1;

      animationRef.current = requestAnimationFrame(gameLoopFn);
    },
    [gameState, highScore]
  );

  /* ============================================
     GAME OVER
     ============================================ */
  const handleGameOver = () => {
    if (gameRef.current.score > highScore) {
      setHighScore(gameRef.current.score);
    }
    setGameState('gameover');
  };

  /* ============================================
     RESET
     ============================================ */
  const resetGame = () => {
    gameRef.current = {
      plane: {
        x: 140,
        y: CANVAS_HEIGHT / 2,
        width: 70,
        height: 40,
        vy: 0,
        rotation: 0,
        propellerAngle: 0,
      },
      crows: [],
      clouds: gameRef.current.clouds,
      stars: gameRef.current.stars,
      frame: 0,
      score: 0,
      speed: 3,
      isNight: false,
    };
    setScore(0);
    setSpeed(3);
    setIsNight(false);
    setGameState('idle');
    lastTimeRef.current = 0;
    speedIncreaseTimerRef.current = 0;
    lastTapTimeRef.current = 0;
  };

  /* ============================================
     START
     ============================================ */
  const startGame = () => {
    gameRef.current.plane = {
      x: 140,
      y: CANVAS_HEIGHT / 2,
      width: 70,
      height: 40,
      vy: 0,
      rotation: 0,
      propellerAngle: 0,
    };
    gameRef.current.crows = [];
    gameRef.current.frame = 0;
    gameRef.current.score = 0;
    gameRef.current.speed = 3;
    gameRef.current.isNight = false;

    setScore(0);
    setSpeed(3);
    setIsNight(false);
    setGameState('playing');
    lastTimeRef.current = 0;
    speedIncreaseTimerRef.current = 0;
    lastTapTimeRef.current = 0;
  };

  /* ============================================
     FLAP (کنترل تک‌دکمه)
     ============================================ */
  const flap = useCallback(() => {
    if (gameState !== 'playing') return;

    const plane = gameRef.current.plane;
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;

    if (timeSinceLastTap < DOUBLE_TAP_WINDOW) {
      plane.vy += DOUBLE_TAP_FORCE;
    } else {
      plane.vy = SINGLE_TAP_FORCE;
    }

    if (plane.vy < MAX_RISE_SPEED) {
      plane.vy = MAX_RISE_SPEED;
    }

    lastTapTimeRef.current = now;
  }, [gameState]);

  /* ============================================
     KEYBOARD
     ============================================ */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();

        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
          return;
        }

        if (gameState === 'playing') {
          flap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, flap]);

  /* ============================================
     TOUCH / CLICK
     ============================================ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTap = (e) => {
      e.preventDefault();

      if (gameState === 'idle' || gameState === 'gameover') {
        startGame();
        return;
      }
      if (gameState === 'playing') {
        flap();
      }
    };

    canvas.addEventListener('pointerdown', handleTap);
    canvas.addEventListener('touchstart', handleTap, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', handleTap);
      canvas.removeEventListener('touchstart', handleTap);
    };
  }, [gameState, flap]);

  /* ============================================
     ANIMATION LOOP
     ============================================ */
  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = 0;
      animationRef.current = requestAnimationFrame(gameLoopFn);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [gameState, gameLoopFn]);

  /* ============================================
     INITIAL DRAW
     ============================================ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');

    drawBackground(ctx);
    drawStars(ctx);
    drawBrandText(ctx);
    drawClouds(ctx);

    gameRef.current.plane.x = CANVAS_WIDTH / 2 - 35;
    gameRef.current.plane.y = CANVAS_HEIGHT / 2;
    drawPlane(ctx);
    gameRef.current.plane.x = 140;
    gameRef.current.plane.y = CANVAS_HEIGHT / 2;

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 20px var(--font-iran)';
    ctx.textAlign = 'center';
    ctx.fillText('برای شروع Space بزن', CANVAS_WIDTH / 2, 140);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '14px var(--font-iran)';
    ctx.fillText(
      '⬆️ Space بزن تا پرواز کنی • دوبار پشت‌سرهم = پرواز بلندتر',
      CANVAS_WIDTH / 2,
      170
    );
  }, []);

  /* ============================================
     RENDER
     ============================================ */
  return (
    <div className={`${styles.container} ${isNight ? styles.night : ''}`}>
      <div className={`${styles.gameWrapper} ${isNight ? styles.night : ''}`}>
        <div className={styles.gameHeader}>
          <div
            className={`${styles.gameTitle} ${isNight ? styles.night : ''}`}
          >
            <Gamepad2 size={20} />
            بازاریاب پرنده
          </div>
          <div
            className={`${styles.gameStats} ${isNight ? styles.night : ''}`}
          >
            <span>
              🎯 <strong>{score}</strong>
            </span>
            <span>
              🏆 <strong>{highScore}</strong>
            </span>
            <span>
              ⚡ <strong>{Math.round(speed)}</strong>
            </span>
            {isNight ? <Moon size={16} /> : <Sun size={16} />}
          </div>
        </div>

        <div
          className={`${styles.canvasWrapper} ${
            isNight ? styles.night : ''
          }`}
        >
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />

          {(gameState === 'idle' || gameState === 'gameover') && (
            <div className={styles.gameOverlay}>
              {gameState === 'gameover' ? (
                <>
                  <h2>💥 تسلیم نشو!</h2>
                  <div className={styles.score}>{score}</div>
                  <p>امتیاز شما</p>
                  {score === highScore && score > 0 && (
                    <p className={styles.newRecord}>
                      <Trophy size={16} /> رکورد جدید!
                    </p>
                  )}
                  <p className={styles.highScore}>
                    بهترین امتیاز: {highScore}
                  </p>
                  <button
                    onClick={startGame}
                    className={styles.startButton}
                  >
                    <RotateCcw size={18} />
                    دوباره (Space)
                  </button>
                </>
              ) : (
                <>
                  <h2>🪂 بازاریاب پرنده</h2>
                  <p>
                    از «ناامیدی»، «ترس» و «عجله» فرار کن و به موفقیت برس!
                  </p>
                  <div className={styles.helpRow}>
                    <span>⌨️ Space = پرواز</span>
                    <span>⚡ دوبار پشت‌سرهم = پرواز بلندتر</span>
                  </div>
                  <button
                    onClick={startGame}
                    className={styles.startButton}
                  >
                    <Sparkles size={18} />
                    شروع بازی (Space)
                  </button>
                </>
              )}
            </div>
          )}
        </div>

     

      
      </div>
    </div>
  );
}