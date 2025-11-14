'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * AnimatedCounter smoothly increments from zero (or a server-derived starting point) to a target value.
 *
 * @param value - The final number that should be displayed after the animation completes.
 * @param duration - Optional animation length in milliseconds (defaults to 1000ms).
 * @returns A span element showing the current animated value.
 */
export function AnimatedCounter({
  value,
  duration = 1000,
}: {
  value: number;
  duration?: number;
}) {
  // Determine the initial render value: use the real value during SSR to avoid hydration mismatches.
  const [count, setCount] = useState<number>(() => (typeof window === 'undefined' ? value : 0));

  // Keep track of the number displayed before the latest animation so transitions remain smooth.
  const previousValueRef = useRef<number>(count);

  useEffect(() => {
    // Skip animation on the server because requestAnimationFrame is unavailable there.
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    // Track the animation's start time so we can measure progress.
    let startTime: number | undefined;

    // Hold the current animation frame id to cancel it during cleanup.
    let animationFrame: number;

    /**
     * Advance the counter toward the target value on each animation frame.
     *
     * @param timestamp - High-resolution time provided by requestAnimationFrame.
     */
    const animate = (timestamp: number) => {
      // Initialize the start time the first time the callback executes.
      if (startTime === undefined) {
        startTime = timestamp;
      }

      // Calculate how far through the animation we are (from 0 to 1).
      const progress = Math.min((timestamp - startTime) / duration, 1);

      // Derive the displayed number for the current frame relative to the previous value.
      const startValue = previousValueRef.current;
      const nextValue = Math.round(startValue + (value - startValue) * progress);

      // Apply the new value; React will skip re-renders when the value is unchanged.
      setCount(nextValue);

      // Continue animating until we reach the target progress of 1.
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    // Kick off the animation loop.
    animationFrame = window.requestAnimationFrame(animate);

    // Ensure we stop the animation if the component unmounts or dependencies change.
    return () => {
      // Persist the latest value so subsequent animations start from the right baseline.
      previousValueRef.current = value;
      window.cancelAnimationFrame(animationFrame);
    };
  }, [duration, value]);

  // Render the current numeric value inside a span so it can be composed inline with text.
  return <span>{count}</span>;
}

export default AnimatedCounter;
