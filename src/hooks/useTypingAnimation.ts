'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export interface UseTypingAnimationOptions {
  pauseMs?: number;
  speedMs?: number;
}

export interface UseTypingAnimationReturn {
  displayText: string;
  isTyping: boolean;
  pause: () => void;
  resume: () => void;
}

type TypingState = 'TYPING' | 'PAUSED_AT_END' | 'RESETTING';

const noop = (): void => undefined;

export function useTypingAnimation(
  text: string,
  options?: UseTypingAnimationOptions
): UseTypingAnimationReturn {
  const { pauseMs = 1000, speedMs = 50 } = options ?? {};

  const reducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const cursorRef = useRef<number>(0);
  const stateRef = useRef<TypingState>('TYPING');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef = useRef<boolean>(false);

  const [displayText, setDisplayText] = useState<string>(reducedMotion ? text : '');
  const [isTyping, setIsTyping] = useState<boolean>(!reducedMotion);

  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    clearCurrentInterval();

    intervalRef.current = setInterval(() => {
      if (stateRef.current === 'TYPING') {
        cursorRef.current += 1;
        setDisplayText(text.slice(0, cursorRef.current));

        if (cursorRef.current >= text.length) {
          stateRef.current = 'PAUSED_AT_END';
          setIsTyping(false);
          clearCurrentInterval();

          setTimeout(() => {
            cursorRef.current = 0;
            setDisplayText('');
            stateRef.current = 'TYPING';
            setIsTyping(true);
            if (!pausedRef.current) {
              startInterval();
            }
          }, pauseMs);
        }
      }
    }, speedMs);
  // startInterval references itself via closure; deps are stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speedMs, pauseMs, clearCurrentInterval]);

  useEffect(() => {
    if (reducedMotion) return;

    cursorRef.current = 0;
    stateRef.current = 'TYPING';
    setDisplayText('');
    setIsTyping(true);
    pausedRef.current = false;
    startInterval();

    return () => {
      clearCurrentInterval();
    };
  }, [reducedMotion, startInterval, clearCurrentInterval]);

  const pause = useCallback((): void => {
    if (reducedMotion) return;
    pausedRef.current = true;
    clearCurrentInterval();
    setIsTyping(false);
  }, [reducedMotion, clearCurrentInterval]);

  const resume = useCallback((): void => {
    if (reducedMotion) return;
    if (!pausedRef.current) return;
    pausedRef.current = false;
    setIsTyping(true);
    startInterval();
  }, [reducedMotion, startInterval]);

  if (reducedMotion) {
    return { displayText: text, isTyping: false, pause: noop, resume: noop };
  }

  return { displayText, isTyping, pause, resume };
}
