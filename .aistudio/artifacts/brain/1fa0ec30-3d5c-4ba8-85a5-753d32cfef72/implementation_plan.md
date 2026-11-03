# Responsive Layout & Horizontal Scroll Prevention

## Overview & Goal
Ensure the invoice application layout is robustly responsive across both desktop (1440px+ without horizontal side scrolling) and mobile devices (with seamless touch-friendly tab/view switching between Editor and CanvasPreview).

---

## 1. User Experience & Visual Design
- **Desktop Viewport**: Enforce strict max-width constraints, `overflow-x-hidden`, and flex/grid boundaries so that the side-by-side Editor and CanvasPreview fit comfortably within the screen without any horizontal side scrolling.
- **Mobile Viewport**: Provide clear, accessible tab switching (Editor vs. Preview) and mobile-optimized drawers so small screens never suffer from cramped or clipped layouts.
- **Visual Integrity**: Maintain the clean Tailwind CSS design system with crisp typography (`Plus Jakarta Sans`), cohesive dark/light surfaces, and touch targets $\ge 44\text{px}$.

---

## 2. Technical Architecture & Layout Strategy
- **Container Boundaries**: Wrap root layout and main flex containers in `overflow-x-hidden w-full max-w-[100vw]`.
- **Panel Sizing**: Ensure Editor panel and CanvasPreview use proper flex-shrink and responsive widths (`w-full lg:w-[48%] xl:w-[45%]`, `max-w-full`) preventing any element from pushing outside the viewport width.
- **Canvas Scaling**: Ensure the invoice preview sheet scales cleanly on smaller viewports with `transform scale` or responsive padding so tables and totals never overflow horizontally.

---

## 3. Verification Plan
- **Build Verification**: Compile applet (`compile_applet`) and run linter (`lint_applet` / `tsc --noEmit`).
- **Responsive Review**: Check mobile and desktop CSS classes for overflow hazards (`overflow-x-hidden`, `max-w-full`).
