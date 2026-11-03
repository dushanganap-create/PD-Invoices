import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [cursorState, setCursorState] = useState<'default' | 'pointer' | 'card' | 'hidden'>('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device is touch-primary or has reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isTouch || prefersReducedMotion) {
      setIsTouchDevice(true);
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let animId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Instantly position the center dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check hovered element
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't show custom cursor over inputs or text areas
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest('input, textarea, select, [contenteditable="true"]');

      if (isInput) {
        setCursorState('hidden');
        return;
      }

      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.getAttribute('role') === 'button' ||
        target.closest('button, a, [role="button"]') ||
        target.getAttribute('data-cursor') === 'pointer';

      const isCard =
        target.getAttribute('data-cursor') === 'card' ||
        target.closest('[data-cursor="card"]');

      if (isClickable) {
        setCursorState('pointer');
      } else if (isCard) {
        setCursorState('card');
      } else {
        setCursorState('default');
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth physics loop for the trailing ring
    const render = () => {
      // Lerp (Linear Interpolation) with 0.16 speed
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible || cursorState === 'hidden') {
    return null;
  }

  const isPointer = cursorState === 'pointer';
  const isCard = cursorState === 'card';

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      {/* Subtle Blue Glow Halo */}
      <div
        ref={glowRef}
        className="fixed -top-12 -left-12 w-24 h-24 rounded-full bg-[#586FFF]/12 blur-xl transition-opacity duration-300 pointer-events-none"
        style={{ willChange: 'transform' }}
      />

      {/* Outer Smooth Trailing Ring */}
      <div
        ref={ringRef}
        className={`fixed -top-4 -left-4 rounded-full border transition-all duration-200 ease-out pointer-events-none flex items-center justify-center ${
          isPointer
            ? 'w-11 h-11 -top-5.5 -left-5.5 border-[#586FFF] bg-[#586FFF]/10 shadow-[0_0_15px_rgba(88,111,255,0.35)]'
            : isCard
            ? 'w-14 h-14 -top-7 -left-7 border-[#8294FF]/60 bg-[#8294FF]/5'
            : 'w-8 h-8 border-[#586FFF]/40 bg-transparent'
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* Inner Precision Dot */}
      <div
        ref={dotRef}
        className={`fixed -top-1 -left-1 rounded-full transition-all duration-150 pointer-events-none ${
          isPointer
            ? 'w-2.5 h-2.5 -top-1.25 -left-1.25 bg-[#8294FF] scale-125 shadow-[0_0_8px_#586FFF]'
            : isCard
            ? 'w-2 h-2 bg-[#F8FAFF]'
            : 'w-2 h-2 bg-[#586FFF] shadow-[0_0_6px_#586FFF]'
        }`}
        style={{ willChange: 'transform' }}
      />
    </div>
  );
};
