'use client';

import { useEffect, useRef, useState } from 'react';

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface HexTheme {
  name: string;
  label: string;
  // [R,G,B] tuples
  rest:  readonly [number, number, number];
  hover: readonly [number, number, number];
  shock: readonly [number, number, number];
  dot:   string; // CSS colour for the theme dot in the switcher
}

const THEMES: HexTheme[] = [
  {
    name:  'violet',
    label: 'Violet',
    rest:  [120, 40, 200],
    hover: [180, 80, 255],
    shock: [220, 170, 255],
    dot:   '#a03cff',
  },
  {
    name:  'crimson',
    label: 'Crimson',
    rest:  [160, 20,  20 ],
    hover: [255, 60,  60 ],
    shock: [255, 160, 160],
    dot:   '#dc1414',
  },
  {
    name:  'teal',
    label: 'Teal',
    rest:  [0,  160, 140],
    hover: [0,  230, 200],
    shock: [140, 255, 240],
    dot:   '#00c8b4',
  },
  {
    name:  'gold',
    label: 'Gold',
    rest:  [180, 120,  0 ],
    hover: [255, 200, 40 ],
    shock: [255, 235, 150],
    dot:   '#ffbe14',
  },
  {
    name:  'silver',
    label: 'Silver',
    rest:  [130, 145, 165],
    hover: [210, 220, 235],
    shock: [255, 255, 255],
    dot:   '#c8d2e6',
  },
];

const STORAGE_KEY = 'hex-theme';

export default function HexBackground() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const themeRef    = useRef<HexTheme>(THEMES[0]);
  const [themeIdx, setThemeIdx] = useState(0);

  // Restore persisted theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const idx = THEMES.findIndex(t => t.name === saved);
      if (idx !== -1) {
        setThemeIdx(idx);
        themeRef.current = THEMES[idx];
        document.documentElement.style.setProperty('--hex-theme-color', THEMES[idx].dot);
      }
    } else {
      // Set default on first load
      document.documentElement.style.setProperty('--hex-theme-color', THEMES[0].dot);
    }
  }, []);

  // Keep ref in sync so the canvas loop always reads the latest theme
  useEffect(() => {
    themeRef.current = THEMES[themeIdx];
    localStorage.setItem(STORAGE_KEY, THEMES[themeIdx].name);
    // Expose active theme colour as a CSS variable so other components can read it
    document.documentElement.style.setProperty('--hex-theme-color', THEMES[themeIdx].dot);
  }, [themeIdx]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Config ────────────────────────────────────────────────
    const HEX_SIZE     = 20;
    const MOUSE_RADIUS = 120;
    const ZOOM_PEAK    = 1.25;
    const BASE_ALPHA   = 0.20;
    const BASE_SPOKE   = 0.25;
    const HOVER_ALPHA  = 0.88;
    const HOVER_SPOKE  = 0.35;
    const SHOCK_ALPHA  = 0.92;
    const SHOCK_WIDTH  = 40;
    const SHOCK_SPEED  = 12;
    // ─────────────────────────────────────────────────────────

    const hexH    = Math.sqrt(3) * HEX_SIZE;
    const hexColW = HEX_SIZE * 1.5;

    let mouseX = -9999;
    let mouseY = -9999;
    let animId: number;
    const shockwaves: Shockwave[] = [];

    function resize() {
      canvas!.width  = window.innerWidth;
      canvas!.height = window.innerHeight;
    }

    function hexCenter(col: number, row: number): [number, number] {
      return [col * hexColW, row * hexH + (col % 2 !== 0 ? hexH / 2 : 0)];
    }

    function hexVertices(cx: number, cy: number, scale: number): [number, number][] {
      return Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return [cx + HEX_SIZE * scale * Math.cos(a), cy + HEX_SIZE * scale * Math.sin(a)] as [number, number];
      });
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const { rest: CR, hover: CH, shock: CS } = themeRef.current;
      const cols = Math.ceil(canvas.width  / hexColW) + 2;
      const rows = Math.ceil(canvas.height / hexH)    + 2;

      for (let col = -1; col < cols; col++) {
        for (let row = -1; row < rows; row++) {
          const [cx, cy] = hexCenter(col, row);

          // Mouse proximity (smoothstep)
          const dM      = Math.hypot(mouseX - cx, mouseY - cy);
          const tM      = Math.max(0, 1 - dM / MOUSE_RADIUS);
          const tSmooth = tM * tM * (3 - 2 * tM);

          // Shockwave ring
          let tShock = 0;
          for (const sw of shockwaves) {
            const d = Math.abs(Math.hypot(sw.x - cx, sw.y - cy) - sw.radius);
            if (d < SHOCK_WIDTH / 2) {
              tShock = Math.max(tShock, (1 - d / (SHOCK_WIDTH / 2)) * sw.alpha);
            }
          }

          const boost = Math.max(tSmooth, tShock);
          const scale = 1 + tSmooth * (ZOOM_PEAK - 1);

          const r = Math.min(255, Math.round(CR[0] + tSmooth * (CH[0] - CR[0]) + tShock * (CS[0] - CR[0])));
          const g = Math.min(255, Math.round(CR[1] + tSmooth * (CH[1] - CR[1]) + tShock * (CS[1] - CR[1])));
          const b = Math.min(255, Math.round(CR[2] + tSmooth * (CH[2] - CR[2]) + tShock * (CS[2] - CR[2])));

          const outlineA = BASE_ALPHA + tSmooth * (HOVER_ALPHA - BASE_ALPHA) + tShock * (SHOCK_ALPHA - BASE_ALPHA);
          const spokeA   = BASE_SPOKE + tSmooth * (HOVER_SPOKE - BASE_SPOKE) + tShock * 0.18;
          const lw       = 0.55 + boost * 1.5;
          const verts    = hexVertices(cx, cy, scale);

          // Outline + bloom
          ctx.beginPath();
          ctx.moveTo(verts[0][0], verts[0][1]);
          for (let i = 1; i < 6; i++) ctx.lineTo(verts[i][0], verts[i][1]);
          ctx.closePath();
          ctx.strokeStyle = `rgba(${r},${g},${b},${outlineA})`;
          ctx.lineWidth   = lw;
          if (boost > 0.08) {
            ctx.shadowColor = `rgba(${r},${g},${b},${boost * 0.75})`;
            ctx.shadowBlur  = 5 + boost * 14;
          } else {
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Spokes
          ctx.lineWidth   = 0.3;
          ctx.strokeStyle = `rgba(${r},${g},${b},${spokeA})`;
          for (const [vx, vy] of verts) {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(vx, vy);
            ctx.stroke();
          }

          // Fill glow
          if (boost > 0.05) {
            ctx.beginPath();
            ctx.moveTo(verts[0][0], verts[0][1]);
            for (let i = 1; i < 6; i++) ctx.lineTo(verts[i][0], verts[i][1]);
            ctx.closePath();
            ctx.fillStyle = `rgba(${r},${g},${b},${boost * 0.09})`;
            ctx.fill();
          }
        }
      }

      // Advance shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        shockwaves[i].radius += SHOCK_SPEED;
        shockwaves[i].alpha   = Math.max(0, 1 - shockwaves[i].radius / shockwaves[i].maxRadius);
        if (shockwaves[i].alpha <= 0) shockwaves.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    }

    const onMouseMove  = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    const onMouseLeave = ()               => { mouseX = -9999; mouseY = -9999; };
    const onClick      = (e: MouseEvent) => {
      shockwaves.push({
        x: e.clientX, y: e.clientY,
        radius: 0,
        maxRadius: Math.hypot(canvas!.width, canvas!.height),
        alpha: 1,
      });
    };

    resize();
    window.addEventListener('resize',     resize);
    window.addEventListener('mousemove',  onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click',      onClick);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize',     resize);
      window.removeEventListener('mousemove',  onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click',      onClick);
    };
  }, []);

  const current = THEMES[themeIdx];
  const next    = THEMES[(themeIdx + 1) % THEMES.length];
  const [burst, setBurst]       = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [clicked, setClicked]   = useState(false);

  // Show hint tooltip after 3 seconds if never clicked
  useEffect(() => {
    if (clicked) return;
    const t = setTimeout(() => setShowHint(true), 3000);
    const t2 = setTimeout(() => setShowHint(false), 7000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, [clicked]);

  function handleCycle() {
    setThemeIdx(i => (i + 1) % THEMES.length);
    setClicked(true);
    setShowHint(false);
    setBurst(true);
    setTimeout(() => setBurst(false), 500);
  }

  return (
    <>
      {/* Canvas layer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Theme switcher */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 50 }}>

        {/* Hint tooltip — appears after 3s if user hasn't clicked */}
        {showHint && (
          <div style={{
            position:    'absolute',
            bottom:      'calc(100% + 10px)',
            left:        '50%',
            whiteSpace:  'nowrap',
            background:  'rgba(0,0,0,0.85)',
            border:      `1px solid ${current.dot}60`,
            color:       current.dot,
            fontFamily:  'var(--font-jetbrains-mono), monospace',
            fontSize:    '9px',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding:     '4px 10px',
            pointerEvents: 'none',
            animation:   'hint-pop 4s ease forwards',
            backdropFilter: 'blur(6px)',
          }}>
            ✦ Click Me
            {/* Arrow */}
            <span style={{
              position: 'absolute', bottom: '-5px', left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `5px solid ${current.dot}60`,
            }} />
          </div>
        )}

        {/* Burst rings on click */}
        {burst && (
          <>
            <span style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '100%', height: '100%',
              border: `2px solid ${current.dot}`,
              borderRadius: '2px',
              pointerEvents: 'none',
              animation: 'burst-ring 0.5s ease-out forwards',
            }} />
            <span style={{
              position: 'absolute', top: '50%', left: '50%',
              width: '100%', height: '100%',
              border: `1px solid ${current.dot}80`,
              borderRadius: '2px',
              pointerEvents: 'none',
              animation: 'burst-ring 0.5s ease-out 0.08s forwards',
            }} />
          </>
        )}

        {/* Main button */}
        <button
          onClick={handleCycle}
          title={`Next: ${next.label}`}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '8px',
            padding:      '7px 14px',
            background:   'rgba(0,0,0,0.75)',
            border:       `1px solid ${current.dot}50`,
            color:        '#fff',
            fontFamily:   'var(--font-jetbrains-mono), monospace',
            fontSize:      '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            cursor:        'pointer',
            backdropFilter: 'blur(10px)',
            // CSS variable for keyframe to read
            ['--theme-dot-color' as string]: current.dot,
            // animation:    'theme-pulse 2.4s ease-in-out infinite',
            transition:   'background 0.2s, border-color 0.3s',
            position:     'relative',
          } as React.CSSProperties}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background   = `${current.dot}18`;
            el.style.borderColor  = current.dot;
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background   = 'rgba(0,0,0,0.75)';
            el.style.borderColor  = `${current.dot}50`;
          }}
        >
          {/* Glowing dot with ping ring */}
          <span style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
            {/* Ping ring */}
            <span style={{
              position:    'absolute', inset: 0,
              borderRadius: '50%',
              background:   current.dot,
              opacity:      0.5,
              animation:    'dot-ping 2s ease-out infinite',
            }} />
            {/* Solid dot */}
            <span style={{
              position:    'absolute', inset: '1px',
              borderRadius: '50%',
              background:   current.dot,
              boxShadow:    `0 0 6px ${current.dot}, 0 0 12px ${current.dot}80`,
            }} />
          </span>

          <span>{current.label}</span>

          {/* Next label preview */}
          <span style={{
            color:        'rgba(255,255,255,0.3)',
            fontSize:     '8px',
            borderLeft:   '1px solid rgba(255,255,255,0.15)',
            paddingLeft:  '8px',
            marginLeft:   '2px',
          }}>
            {next.label} ▶
          </span>
        </button>
      </div>
    </>
  );
}
