'use client';

import { useEffect, useRef, useState } from 'react';

function getThemeColor(): string {
  if (typeof window === 'undefined') return '#FF0000';
  return (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--hex-theme-color')
      .trim() || '#FF0000'
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

interface Particle {
  x:      number;
  y:      number;
  vx:     number;
  vy:     number;
  life:   number;   // 0 → 1 (1 = just born, 0 = dead)
  size:   number;
  angle:  number;
}

export default function CustomCursor() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const dotRef     = useRef<HTMLDivElement>(null);
  const posRef     = useRef({ x: -200, y: -200 });
  const rafRef     = useRef<number>(0);
  const particles  = useRef<Particle[]>([]);
  const colorRef   = useRef('#FF0000');
  const lastPos    = useRef({ x: -200, y: -200 });

  const [visible,  setVisible]  = useState(false);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  // Sync colour
  useEffect(() => {
    colorRef.current = getThemeColor();
    const id = setInterval(() => {
      colorRef.current = getThemeColor();
    }, 200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    function spawnParticles(x: number, y: number, count: number) {
      for (let i = 0; i < count; i++) {
        const angle  = Math.random() * Math.PI * 2;
        const speed  = 0.4 + Math.random() * 1.2;
        particles.current.push({
          x,
          y,
          vx:    Math.cos(angle) * speed,
          vy:    Math.sin(angle) * speed - 0.6, // slight upward drift
          life:  1,
          size:  1.2 + Math.random() * 2.2,
          angle: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      const ctx = canvas!.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      const [r, g, b] = hexToRgb(colorRef.current);
      const pos = posRef.current;

      // Move dot via direct style (no React re-render)
      if (dotRef.current && pos.x > 0) {
        dotRef.current.style.transform =
          `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
        dotRef.current.style.background  = `rgb(${r},${g},${b})`;
        dotRef.current.style.boxShadow   = `0 0 10px rgba(${r},${g},${b},0.9)`;
      }

      // Spawn particles as cursor moves
      const curPos = posRef.current;
      const last   = lastPos.current;
      const dist   = Math.hypot(curPos.x - last.x, curPos.y - last.y);

      if (dist > 3 && curPos.x > 0) {
        const count = Math.min(Math.floor(dist / 4) + 1, 5);
        for (let i = 0; i < count; i++) {
          const t = i / count;
          spawnParticles(
            last.x + (curPos.x - last.x) * t,
            last.y + (curPos.y - last.y) * t,
            1,
          );
        }
        lastPos.current = { x: curPos.x, y: curPos.y };
      }

      // Update and draw particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x    += p.vx;
        p.y    += p.vy;
        p.vy   += 0.04; // gentle gravity
        p.vx   *= 0.97; // air resistance
        p.life -= 0.032;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }

        const alpha = p.life * p.life; // quadratic fade
        const size  = p.size * p.life;

        // Glow outer
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.15})`;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha * 0.9})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (lastPos.current.x === -200) lastPos.current = { ...posRef.current };
      setVisible(true);
      const el = e.target as HTMLElement;
      setHovering(
        !!el.closest('a, button, [data-magnetic]') ||
        window.getComputedStyle(el).cursor === 'pointer'
      );
    };
    const onLeave = () => setVisible(false);
    const onEnter = () => setVisible(true);
    const onDown  = () => {
      setClicking(true);
      // Burst on click
      spawnParticles(posRef.current.x, posRef.current.y, 18);
    };
    const onUp    = () => setClicking(false);

    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('mouseenter', onEnter);
    window.addEventListener('mousedown',  onDown);
    window.addEventListener('mouseup',    onUp);

    return () => {
      document.documentElement.style.cursor = '';
      document.body.style.cursor = '';
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown',  onDown);
      window.removeEventListener('mouseup',    onUp);
    };
  }, []);

  const [r, g, b] = hexToRgb(colorRef.current);

  return (
    <>
      {/* Particle canvas — full screen, behind everything except UI */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          inset:         0,
          pointerEvents: 'none',
          zIndex:        9998,
          opacity:       visible ? 1 : 0,
          transition:    'opacity 0.3s ease',
        }}
      />

      {/* Cursor dot — sharp centre point, moved via rAF */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position:      'fixed',
          top:           0,
          left:          0,
          width:         hovering ? 10 : clicking ? 14 : 7,
          height:        hovering ? 10 : clicking ? 14 : 7,
          borderRadius:  '50%',
          background:    `#FF0000`,
          boxShadow:     `0 0 ${hovering ? 14 : 7}px rgba(255,0,0,0.9)`,
          pointerEvents: 'none',
          zIndex:        9999,
          opacity:       visible ? 1 : 0,
          transition:    'width 0.12s ease, height 0.12s ease, box-shadow 0.2s ease, opacity 0.2s ease',
        }}
      />
    </>
  );
}
