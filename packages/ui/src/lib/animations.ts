import { cn } from './utils';

/** Tailwind-compatible animation class names for fade/slide/scale. */
export const animations = {
  fadeIn: 'animate-in fade-in-0',
  fadeOut: 'animate-out fade-out-0',
  slideInFromTop: 'animate-in slide-in-from-top-2',
  slideInFromBottom: 'animate-in slide-in-from-bottom-2',
  slideOutToTop: 'animate-out slide-out-to-top-2',
  slideOutToBottom: 'animate-out slide-out-to-bottom-2',
  zoomIn: 'animate-in zoom-in-95',
  zoomOut: 'animate-out zoom-out-95',
} as const;

/** Duration utilities (use with Tailwind animate-duration if supported). */
export const durations = {
  fast: 'duration-150',
  normal: 'duration-200',
  slow: 'duration-300',
} as const;

/**
 * Combine animation classes with optional duration.
 */
export function animationClass(
  animation: keyof typeof animations,
  duration?: keyof typeof durations
): string {
  const base = animations[animation];
  const dur = duration ? durations[duration] : '';
  return cn(base, dur);
}
