'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';

interface TerminalWidgetProps {
  code: string;
}

// ── Syntax token types ────────────────────────────────────────
type TokenType =
  | 'keyword'    // const, function, return
  | 'identifier' // MohammadQaseem
  | 'string'     // 'value'
  | 'comment'    // // ...
  | 'punct'      // { } [ ] , : ; ( )
  | 'plain';     // everything else

interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'new', 'this']);

// Tokenise a single line into typed tokens
function tokeniseLine(line: string): Token[] {
  if (line.trimStart().startsWith('//')) {
    return [{ type: 'comment', text: line }];
  }

  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // String literal
    if (line[i] === "'" || line[i] === '"' || line[i] === '`') {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) j++;
      j++;
      tokens.push({ type: 'string', text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Punctuation
    if ('{}[](),:;'.includes(line[i])) {
      tokens.push({ type: 'punct', text: line[i] });
      i++;
      continue;
    }

    // Word (keyword / identifier / plain)
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (i === line.search(/[a-zA-Z_$]/) && word[0] === word[0].toUpperCase()) {
        tokens.push({ type: 'identifier', text: word });
      } else {
        tokens.push({ type: 'plain', text: word });
      }
      i = j;
      continue;
    }

    // Spaces and other chars — plain
    tokens.push({ type: 'plain', text: line[i] });
    i++;
  }

  return tokens;
}

const TOKEN_COLOURS: Record<TokenType, string> = {
  keyword:    '#FF4444',   // red — matches accent
  identifier: '#FF8C8C',   // lighter red
  string:     '#98C379',   // soft green
  comment:    '#FF6B35',   // orange-red italic
  punct:      '#ABB2BF',   // grey-white
  plain:      '#D4D4D4',   // off-white
};

// Render a complete tokenised line as React spans
function SyntaxLine({ line, isLast }: { line: string; isLast: boolean }) {
  const tokens = useMemo(() => tokeniseLine(line), [line]);

  return (
    <span>
      {tokens.map((tok, i) => (
        <span
          key={i}
          style={{
            color:      TOKEN_COLOURS[tok.type],
            fontStyle:  tok.type === 'comment' ? 'italic' : 'normal',
            fontWeight: tok.type === 'keyword' ? 600 : 400,
          }}
        >
          {tok.text}
        </span>
      ))}
      {!isLast && '\n'}
    </span>
  );
}

// Render the typed text with syntax highlighting, line by line
function HighlightedCode({ text, showCursor }: { text: string; showCursor: boolean }) {
  const lines = text.split('\n');

  return (
    <>
      {lines.map((line, idx) => {
        const isLast = idx === lines.length - 1;
        return (
          <span key={idx}>
            <SyntaxLine line={line} isLast={isLast} />
            {isLast && showCursor && (
              <span
                className="animate-blink motion-reduce:animate-none"
                style={{ color: '#FF0000' }}
              >
                █
              </span>
            )}
          </span>
        );
      })}
    </>
  );
}

export default function TerminalWidget({ code }: TerminalWidgetProps) {
  const { displayText, pause, resume } = useTypingAnimation(code, { pauseMs: 1500, speedMs: 38 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { entry.isIntersecting ? resume() : pause(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [pause, resume]);

  // Line numbers based on full code (so they don't jump as typing progresses)
  const totalLines = code.split('\n').length;
  const typedLines = displayText.split('\n').length;

  return (
    <div
      ref={containerRef}
      style={{
        fontFamily:      'var(--font-jetbrains-mono), monospace',
        background:      '#0d0d0d',
        border:          '1px solid rgba(255,255,255,0.1)',
        borderRadius:    '0px',
        overflow:        'hidden',
        position:        'relative',
      }}
    >
      {/* ── Title bar ─────────────────────────────────────── */}
      <div style={{
        background:    '#1a1a1a',
        borderBottom:  '1px solid rgba(255,255,255,0.08)',
        padding:       '8px 16px',
        display:       'flex',
        alignItems:    'center',
        gap:           '8px',
      }}>
        {/* Traffic lights */}
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F57', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28C840', display: 'inline-block', flexShrink: 0 }} />

        {/* Terminal name */}
        <span style={{
          marginLeft:    'auto',
          marginRight:   'auto',
          color:         'rgba(255,255,255,0.45)',
          fontSize:      '11px',
          letterSpacing: '0.05em',
        }}>
          Qaseem@system: ~
        </span>
      </div>

      {/* ── Code body ─────────────────────────────────────── */}
      <div style={{
        display:        'flex',
        minHeight:      '320px',
        position:       'relative',
      }}>
        {/* Red scrollbar accent line — right edge */}
        <div style={{
          position:  'absolute',
          right:     0,
          top:       0,
          bottom:    0,
          width:     '3px',
          background: 'linear-gradient(to bottom, #FF000000 0%, #FF000080 30%, #FF0000cc 60%, #FF000000 100%)',
          pointerEvents: 'none',
        }} />

        {/* Line numbers */}
        <div style={{
          padding:       '16px 0',
          minWidth:      '40px',
          textAlign:     'right',
          paddingRight:  '12px',
          borderRight:   '1px solid rgba(255,255,255,0.06)',
          userSelect:    'none',
          flexShrink:    0,
        }}>
          {Array.from({ length: Math.max(totalLines, typedLines) }, (_, i) => (
            <div key={i} style={{
              color:       i < typedLines ? 'rgba(255,0,0,0.45)' : 'rgba(255,255,255,0.12)',
              fontSize:    '12px',
              lineHeight:  '1.6',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code area */}
        <div style={{ padding: '16px', overflowX: 'auto', flex: 1 }}>
          <pre style={{
            margin:      0,
            fontSize:    '13px',
            lineHeight:  '1.6',
            whiteSpace:  'pre',
            color:       '#D4D4D4',
          }}>
            <HighlightedCode text={displayText} showCursor={true} />
          </pre>
        </div>
      </div>

      {/* ── Prompt line at bottom ──────────────────────────── */}
      <div style={{
        borderTop:   '1px solid rgba(255,255,255,0.06)',
        padding:     '6px 16px',
        background:  '#111',
        display:     'flex',
        alignItems:  'center',
        gap:         '6px',
      }}>
        <span style={{ color: '#FF4444', fontSize: '13px' }}>›</span>
        <span
          className="animate-blink motion-reduce:animate-none"
          style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}
        >
          _
        </span>
      </div>
    </div>
  );
}
