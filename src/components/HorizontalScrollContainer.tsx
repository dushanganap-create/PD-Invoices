import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  scrollAmount?: number;
  arrowPosition?: 'inline' | 'floating';
  arrowSize?: 'xs' | 'sm' | 'md';
  alwaysShowArrows?: boolean;
}

export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  className = '',
  contentClassName = '',
  scrollAmount = 240,
  arrowPosition = 'inline',
  arrowSize = 'sm',
  alwaysShowArrows = false,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 2;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => checkScroll();
    el.addEventListener('scroll', handleScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => checkScroll());
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll, children]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const delta = direction === 'left' ? -scrollAmount : scrollAmount;
    el.scrollBy({ left: delta, behavior: 'smooth' });
    setTimeout(checkScroll, 320);
  };

  const btnPadding =
    arrowSize === 'xs'
      ? 'p-1'
      : arrowSize === 'sm'
      ? 'p-1.5'
      : 'p-2';

  const iconSize =
    arrowSize === 'xs'
      ? 'w-3 h-3'
      : arrowSize === 'sm'
      ? 'w-3.5 h-3.5'
      : 'w-4 h-4';

  const showArrows = alwaysShowArrows || hasOverflow;

  return (
    <div className={`relative flex items-center group/scroll min-w-0 ${className}`}>
      {/* Left < Scroll Arrow Button */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={`shrink-0 ${btnPadding} rounded-xl border border-white/15 bg-[#101827]/95 hover:bg-[#19253A] text-white shadow-lg transition-all cursor-pointer z-10 mr-1.5 disabled:opacity-25 disabled:cursor-not-allowed hover:border-[#526DFF] hover:scale-105 active:scale-95`}
          title="Scroll left"
        >
          <ChevronLeft className={iconSize} />
        </button>
      )}

      {/* Main Horizontally Scrollable Content Area */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-x-auto scroll-smooth scrollbar-none flex items-center min-w-0 ${contentClassName}`}
      >
        {children}
      </div>

      {/* Right > Scroll Arrow Button */}
      {showArrows && (
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={`shrink-0 ${btnPadding} rounded-xl border border-white/15 bg-[#101827]/95 hover:bg-[#19253A] text-white shadow-lg transition-all cursor-pointer z-10 ml-1.5 disabled:opacity-25 disabled:cursor-not-allowed hover:border-[#526DFF] hover:scale-105 active:scale-95`}
          title="Scroll right"
        >
          <ChevronRight className={iconSize} />
        </button>
      )}
    </div>
  );
};
