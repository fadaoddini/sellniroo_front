// components/Game/Game.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Game.module.css';
import { 
  Gamepad2, 
  RotateCcw, 
  Moon, 
  Sun,
  Zap,
  Trophy,
  Sparkles
} from 'lucide-react';

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 300;
const GROUND_Y = 250;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const DOUBLE_JUMP_FORCE = -10;
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 40;

export default function Game() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNight, setIsNight] = useState(false);
  const [speed, setSpeed] = useState(6);
  const animationRef = useRef(null);
  const lastTimeRef = useRef(0);
  const speedIncreaseTimerRef = useRef(0);

  const gameRef = useRef({
    engineer: {
      x: 80,
      y: GROUND_Y - 40,
      width: 30,
      height: 40,
      vy: 0,
      isJumping: false,
      jumpCount: 0,
      maxJumps: 2
    },
    obstacles: [],
    clouds: [],
    stars: [],
    frame: 0,
    score: 0,
    speed: 6,
    isNight: false
  });

  useEffect(() => {
    gameRef.current.clouds = Array.from({ length: 5 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: 20 + Math.random() * 80,
      width: 60 + Math.random() * 80,
      speed: 0.3 + Math.random() * 0.5,
    }));

    gameRef.current.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * 150,
      size: 1 + Math.random() * 2,
      twinkle: Math.random() * Math.PI * 2
    }));
  }, []);

  // تابع جدید برای رسم متن تبلیغاتی در آسمان
  const drawAdText = (ctx) => {
    const isNight = gameRef.current.isNight;
    const frame = gameRef.current.frame;
    
    // تنظیمات متن
    const text = 'Aria Stud Holding';
    const fontSize = 42;
    const opacity = isNight ? 0.25 : 0.38; // در شب بیشتر دیده می‌شود
    
    // ذخیره وضعیت current context
    ctx.save();
    
    // تنظیم فونت
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // اندازه‌گیری متن برای موقعیت‌یابی
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    // موقعیت متن - در مرکز آسمان با کمی افست
    const centerX = CANVAS_WIDTH / 2;
    const centerY = 80 + Math.sin(frame * 0.005) * 10; // حرکت نرم بالا و پایین
    
    // سایه برای خوانایی بهتر
    ctx.shadowColor = isNight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    
    // رنگ متن بر اساس شب/روز
    if (isNight) {
      // شب: سفید با افکت درخشش
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      
      // افکت درخشش برای شب
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, textWidth / 2
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity + 0.1})`);
      gradient.addColorStop(0.5, `rgba(200, 200, 255, ${opacity})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity * 0.5})`);
      ctx.fillStyle = gradient;
      
      // افکت درخشش اضافی
      ctx.shadowColor = 'rgba(100, 150, 255, 0.5)';
      ctx.shadowBlur = 40;
      
    } else {
      // روز: زرشکی (شرابی)
      const crimsonColor = `rgba(128, 0, 32, ${opacity})`;
      ctx.fillStyle = crimsonColor;
      
      // سایه برای روز
      ctx.shadowColor = 'rgba(128, 0, 0, 1)';
      ctx.shadowBlur = 15;
    }
    
    // کشیدن متن اصلی
    ctx.fillText(text, centerX, centerY);
    
    // کشیدن یک کپی با افکت برای زیبایی بیشتر
    if (isNight) {
      // افکت نئون برای شب
      ctx.shadowColor = 'rgba(100, 150, 255, 0.3)';
      ctx.shadowBlur = 60;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
      ctx.fillText(text, centerX + 1, centerY + 1);
    } else {
      // افکت درخشش خفیف برای روز
      ctx.shadowColor = 'rgba(128, 0, 32, 0.1)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = `rgba(128, 0, 32, ${opacity * 1.5})`;
      ctx.fillText(text, centerX - 1, centerY - 1);
    }
    
    // خط زیر متن (مثل یک لوگو)
    const lineY = centerY + textHeight / 2 + 8;
    const lineWidth = textWidth * 0.6;
    const lineX1 = centerX - lineWidth / 2;
    const lineX2 = centerX + lineWidth / 2;
    
    ctx.shadowBlur = 0;
    ctx.strokeStyle = isNight ? 
      `rgba(255, 255, 255, ${opacity * 0.5})` : 
      `rgba(128, 0, 32, ${opacity * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lineX1, lineY);
    ctx.lineTo(lineX2, lineY);
    ctx.stroke();
    
    // نقطه‌های تزیینی در دو طرف خط
    const dotRadius = 2;
    ctx.fillStyle = isNight ? 
      `rgba(255, 255, 255, ${opacity * 0.3})` : 
      `rgba(128, 0, 32, ${opacity * 0.3})`;
    
    [-1, 1].forEach(side => {
      const dotX = centerX + side * (lineWidth / 2 + 10);
      ctx.beginPath();
      ctx.arc(dotX, lineY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // بازگرداندن context
    ctx.restore();
  };

  // رسم مهندس بیتی
  const drawEngineer = (ctx, x, y, width, height) => {
    const pixelSize = 4;
    const cols = Math.floor(width / pixelSize);
    const rows = Math.floor(height / pixelSize);
    const isNight = gameRef.current.isNight;
    const engineer = gameRef.current.engineer;

    const isDoubleJump = engineer.isJumping && engineer.jumpCount === 2;

    ctx.fillStyle = isNight ? '#4a6fa5' : '#2c3e6b';
    if (isDoubleJump) {
      ctx.fillStyle = isNight ? '#6a8fc5' : '#4a6e8b';
    }
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        let draw = false;

        if (row < 5 && col > 2 && col < cols - 3) draw = true;
        if (row >= 5 && row < 7 && col > 4 && col < cols - 5) draw = true;
        if (row >= 7 && row < rows - 3 && col > 3 && col < cols - 4) draw = true;
        if (row >= 8 && row < 12 && (col < 4 || col > cols - 5)) draw = true;
        if (row >= rows - 3 && col > 4 && col < cols - 5) draw = true;

        if (draw) {
          const px = x + col * pixelSize;
          const py = y + row * pixelSize;
          ctx.fillRect(px, py, pixelSize, pixelSize);
        }
      }
    }

    ctx.fillStyle = '#ffd700';
    if (isDoubleJump) {
      ctx.fillStyle = '#ffed4a';
    }
    for (let row = 0; row < 4; row++) {
      for (let col = 1; col < cols - 2; col++) {
        if (row === 0 && (col < 3 || col > cols - 4)) continue;
        const px = x + col * pixelSize;
        const py = y + row * pixelSize;
        ctx.fillRect(px, py, pixelSize, pixelSize);
      }
    }

    ctx.fillStyle = 'white';
    for (let row = 2; row < 4; row++) {
      for (let col of [4, cols - 5]) {
        const px = x + col * pixelSize;
        const py = y + row * pixelSize;
        ctx.fillRect(px, py, pixelSize * 1.5, pixelSize * 1.5);
      }
    }

    ctx.fillStyle = '#1a1a2e';
    for (let row = 2; row < 4; row++) {
      for (let col of [5, cols - 4]) {
        const px = x + col * pixelSize;
        const py = y + row * pixelSize + 1;
        ctx.fillRect(px + 1, py, pixelSize, pixelSize);
      }
    }

    ctx.fillStyle = '#800020';
    if (isDoubleJump) {
      ctx.fillStyle = '#ff6b6b';
    }
    for (let row = 5; row < 6; row++) {
      for (let col = 5; col < cols - 5; col++) {
        if (col > 3 && col < cols - 4) {
          const px = x + col * pixelSize;
          const py = y + row * pixelSize + 2;
          ctx.fillRect(px, py, pixelSize, pixelSize);
        }
      }
    }

    if (engineer.isJumping) {
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      const jumpText = engineer.jumpCount === 1 ? '⬆️' : '⬆️⬆️';
      ctx.fillText(jumpText, x + width/2, y - 10);
    }
  };

  // رسم موانع
  const drawObstacle = (ctx, obstacle) => {
    const { x, y, width, height, type } = obstacle;
    const isNight = gameRef.current.isNight;
    
    if (type === 'brick') {
      ctx.fillStyle = isNight ? '#8B4513' : '#a0522d';
      ctx.fillRect(x, y, width, height);
      
      ctx.strokeStyle = isNight ? '#6B3410' : '#8B4513';
      ctx.lineWidth = 1;
      const brickHeight = 8;
      for (let row = 0; row < height / brickHeight; row++) {
        const offset = row % 2 === 0 ? 0 : width / 2;
        ctx.beginPath();
        ctx.moveTo(x + offset, y + row * brickHeight);
        ctx.lineTo(x + width + offset, y + row * brickHeight);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y);
      ctx.lineTo(x + width / 2, y + height);
      ctx.stroke();
    } else {
      ctx.fillStyle = isNight ? '#666' : '#888';
      ctx.beginPath();
      ctx.ellipse(x + width/2, y + height/2, width/2, height/2, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = isNight ? '#555' : '#777';
      ctx.beginPath();
      ctx.ellipse(x + width/3, y + height/3, width/6, height/6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + width*2/3, y + height*2/3, width/5, height/5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // رسم زمین
  const drawGround = (ctx) => {
    const isNight = gameRef.current.isNight;
    const speed = gameRef.current.speed;
    const frame = gameRef.current.frame;
    
    const groundColor = isNight ? '#2a2a4a' : '#d4a574';
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

    ctx.fillStyle = isNight ? '#3a3a5a' : '#c4956a';
    const lineWidth = 20;
    const gap = 30;
    const offset = frame * speed * 0.5 % (lineWidth + gap);
    for (let x = -offset; x < CANVAS_WIDTH + lineWidth; x += lineWidth + gap) {
      ctx.fillRect(x, GROUND_Y + 6, lineWidth, 2);
    }
  };

  // رسم ابرها
  const drawClouds = (ctx) => {
    const isNight = gameRef.current.isNight;
    gameRef.current.clouds.forEach(cloud => {
      ctx.fillStyle = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, cloud.width/2, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x - cloud.width/3, cloud.y + 5, cloud.width/3, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cloud.x + cloud.width/3, cloud.y + 5, cloud.width/3, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      cloud.x -= cloud.speed;
      if (cloud.x + cloud.width < 0) {
        cloud.x = CANVAS_WIDTH + cloud.width;
        cloud.y = 20 + Math.random() * 80;
      }
    });
  };

  // رسم ستاره‌ها
  const drawStars = (ctx) => {
    if (!gameRef.current.isNight) return;
    const frame = gameRef.current.frame;
    gameRef.current.stars.forEach(star => {
      const twinkle = Math.sin(star.twinkle + frame * 0.02) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.8})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // ایجاد مانع جدید
  const spawnObstacle = () => {
    const types = ['brick', 'stone'];
    const type = types[Math.floor(Math.random() * types.length)];
    const height = type === 'brick' ? OBSTACLE_HEIGHT : OBSTACLE_HEIGHT * 0.8;
    const width = type === 'brick' ? OBSTACLE_WIDTH : OBSTACLE_WIDTH * 0.9;
    
    gameRef.current.obstacles.push({
      x: CANVAS_WIDTH + 50,
      y: GROUND_Y - height,
      width,
      height,
      type,
      passed: false
    });
  };

  // تشخیص برخورد
  const checkCollision = (engineer, obstacle) => {
    const padding = 5;
    return engineer.x + padding < obstacle.x + obstacle.width &&
           engineer.x + engineer.width - padding > obstacle.x &&
           engineer.y + padding < obstacle.y + obstacle.height &&
           engineer.y + engineer.height - padding > obstacle.y;
  };

  // حلقه اصلی بازی
  const gameLoopFn = useCallback((timestamp) => {
    if (gameState !== 'playing') return;

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
    const deltaTime = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const bgColor = gameRef.current.isNight ? '#1a1a2e' : '#e8f0fe';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawStars(ctx);
    drawAdText(ctx); // رسم متن تبلیغاتی در آسمان
    drawClouds(ctx);
    drawGround(ctx);

    const engineer = gameRef.current.engineer;
    engineer.vy += GRAVITY;
    engineer.y += engineer.vy;

    if (engineer.y >= GROUND_Y - engineer.height) {
      engineer.y = GROUND_Y - engineer.height;
      engineer.vy = 0;
      engineer.isJumping = false;
      engineer.jumpCount = 0;
    }

    drawEngineer(ctx, engineer.x, engineer.y, engineer.width, engineer.height);

    speedIncreaseTimerRef.current += deltaTime;
    if (speedIncreaseTimerRef.current >= 10) {
      speedIncreaseTimerRef.current = 0;
      gameRef.current.speed = Math.min(gameRef.current.speed + 0.5, 15);
      setSpeed(gameRef.current.speed);
    }

    const speed = gameRef.current.speed;
    const newObstacles = [];
    let collision = false;
    
    for (const obstacle of gameRef.current.obstacles) {
      obstacle.x -= speed;
      
      if (checkCollision(engineer, obstacle)) {
        collision = true;
        break;
      }

      if (!obstacle.passed && obstacle.x + obstacle.width < engineer.x) {
        obstacle.passed = true;
        gameRef.current.score += 1;
        setScore(gameRef.current.score);
        
        if (gameRef.current.score % 10 === 0 && gameRef.current.score > 0) {
          gameRef.current.isNight = !gameRef.current.isNight;
          setIsNight(gameRef.current.isNight);
        }
      }

      if (obstacle.x + obstacle.width > -50) {
        newObstacles.push(obstacle);
      }
    }
    
    if (collision) {
      if (gameRef.current.score > highScore) {
        setHighScore(gameRef.current.score);
      }
      setGameState('gameover');
      return;
    }
    
    gameRef.current.obstacles = newObstacles;

    gameRef.current.obstacles.forEach(obstacle => {
      drawObstacle(ctx, obstacle);
    });

    gameRef.current.frame += 1;
    const spawnInterval = Math.max(40, 100 - speed * 3);
    if (gameRef.current.frame % Math.floor(spawnInterval) === 0) {
      spawnObstacle();
    }

    if (gameRef.current.obstacles.length < 2 && gameRef.current.frame % 30 === 0) {
      spawnObstacle();
    }

    ctx.fillStyle = gameRef.current.isNight ? 'white' : '#333';
    ctx.font = 'bold 20px var(--font-iran)';
    ctx.textAlign = 'left';
    ctx.fillText(`🏗️ ${gameRef.current.score}`, 20, 35);

    ctx.fillStyle = gameRef.current.isNight ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    ctx.font = '12px var(--font-iran)';
    ctx.fillText(`🚀 ${Math.round(gameRef.current.speed * 2)}`, 20, 55);

    if (gameRef.current.isNight) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = '10px var(--font-iran)';
      ctx.fillText('🌙 شب', 20, 72);
    }

    if (engineer.isJumping) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '10px var(--font-iran)';
      ctx.textAlign = 'right';
      const jumpStatus = engineer.jumpCount === 1 ? 'پرش ۱' : 'پرش ۲ ⚡';
      ctx.fillText(jumpStatus, CANVAS_WIDTH - 20, 35);
    }

    animationRef.current = requestAnimationFrame(gameLoopFn);
  }, [gameState, highScore]);

  // ریست بازی
  const resetGame = () => {
    gameRef.current = {
      engineer: {
        x: 80,
        y: GROUND_Y - 40,
        width: 30,
        height: 40,
        vy: 0,
        isJumping: false,
        jumpCount: 0,
        maxJumps: 2
      },
      obstacles: [],
      clouds: gameRef.current.clouds,
      stars: gameRef.current.stars,
      frame: 0,
      score: 0,
      speed: 6,
      isNight: false
    };
    setScore(0);
    setSpeed(6);
    setIsNight(false);
    setGameState('idle');
    lastTimeRef.current = 0;
    speedIncreaseTimerRef.current = 0;
  };

  // شروع بازی
  const startGame = () => {
    resetGame();
    setGameState('playing');
    gameRef.current.speed = 6;
    gameRef.current.score = 0;
    gameRef.current.obstacles = [];
    gameRef.current.engineer.y = GROUND_Y - 40;
    gameRef.current.engineer.vy = 0;
    gameRef.current.engineer.isJumping = false;
    gameRef.current.engineer.jumpCount = 0;
    gameRef.current.isNight = false;
    gameRef.current.frame = 0;
    setSpeed(6);
    setIsNight(false);
    setScore(0);
    lastTimeRef.current = 0;
    speedIncreaseTimerRef.current = 0;
  };

  // پرش
  const jump = useCallback(() => {
    if (gameState !== 'playing') return;
    const engineer = gameRef.current.engineer;
    
    if (engineer.jumpCount < engineer.maxJumps) {
      if (engineer.jumpCount === 0) {
        engineer.vy = JUMP_FORCE;
      } else {
        engineer.vy = DOUBLE_JUMP_FORCE;
      }
      
      engineer.isJumping = true;
      engineer.jumpCount += 1;
    }
  }, [gameState]);

  // کنترل‌های کیبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (gameState === 'idle' || gameState === 'gameover') {
          startGame();
        } else {
          jump();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump]);

  // کنترل تاچ برای موبایل
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouch = (e) => {
      e.preventDefault();
      if (gameState === 'idle' || gameState === 'gameover') {
        startGame();
      } else {
        jump();
      }
    };

    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('click', handleTouch);
    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('click', handleTouch);
    };
  }, [gameState, jump]);

  // شروع/توقف حلقه بازی
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

  // لود اولیه
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#e8f0fe';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawAdText(ctx); // رسم متن در صفحه اولیه
    drawEngineer(ctx, 80, GROUND_Y - 40, 30, 40);
    drawGround(ctx);
    
    ctx.fillStyle = '#666';
    ctx.font = '18px var(--font-iran)';
    ctx.textAlign = 'center';
    ctx.fillText('برای شروع کلیک کنید یا Space بزنید', CANVAS_WIDTH/2, 140);
    ctx.fillStyle = '#999';
    ctx.font = '14px var(--font-iran)';
    ctx.fillText('🏗️ مهندس بیتی آماده است! (پرش دوگانه با دوبار Space)', CANVAS_WIDTH/2, 170);
  }, []);

  return (
    <div className={`${styles.container} ${isNight ? styles.night : ''}`}>
      <div className={`${styles.gameWrapper} ${isNight ? styles.night : ''}`}>
        <div className={styles.gameHeader}>
          <div className={`${styles.gameTitle} ${isNight ? styles.night : ''}`}>
            <Gamepad2 size={20} />
            مهندس بیتی
          </div>
          <div className={`${styles.gameStats} ${isNight ? styles.night : ''}`}>
            <span>🏗️ <strong>{score}</strong></span>
            <span>🏆 <strong>{highScore}</strong></span>
            <span>🚀 <strong>{Math.round(speed * 2)}</strong></span>
            {isNight ? <Moon size={16} /> : <Sun size={16} />}
          </div>
        </div>

        <div className={`${styles.canvasWrapper} ${isNight ? styles.night : ''}`}>
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
                  <h2>💥 بازی تمام شد!</h2>
                  <div className={styles.score}>{score}</div>
                  <p>امتیاز شما</p>
                  {score === highScore && score > 0 && (
                    <p style={{ color: '#ffd700', fontSize: '14px' }}>
                      <Trophy size={16} style={{ display: 'inline' }} /> رکورد جدید!
                    </p>
                  )}
                  <p className={styles.highScore}>بهترین امتیاز: {highScore}</p>
                  <button onClick={startGame} className={styles.startButton}>
                    <RotateCcw size={18} style={{ display: 'inline' }} />
                    دوباره
                  </button>
                </>
              ) : (
                <>
                  <h2>🏗️ مهندس بیتی</h2>
                  <p>از موانع عبور کن و رکورد بزن!</p>
                  <div style={{ display: 'flex', gap: '20px', color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                    <span>⬆️⬆️ Space (پرش دوگانه)</span>
                    <span>🏆 رکورد: {highScore}</span>
                  </div>
                  <button onClick={startGame} className={styles.startButton}>
                    <Sparkles size={18} style={{ display: 'inline' }} />
                    شروع بازی
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles.gameControls}>
          <button 
            onClick={jump}
            className={`${styles.controlButton} ${isNight ? styles.night : ''}`}
            disabled={gameState !== 'playing'}
          >
            <Zap size={18} />
            پرش (×۲)
          </button>
          <button 
            onClick={startGame}
            className={`${styles.controlButton} ${isNight ? styles.night : ''}`}
          >
            <RotateCcw size={18} />
            شروع مجدد
          </button>
        </div>
      </div>
    </div>
  );
}