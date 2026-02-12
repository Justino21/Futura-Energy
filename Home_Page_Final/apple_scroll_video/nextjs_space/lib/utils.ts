import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Clamp a value between min and max
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value ?? 0, min), max);
}

// Linear interpolation
export function lerp(start: number, end: number, t: number): number {
  return (start ?? 0) + ((end ?? 0) - (start ?? 0)) * (t ?? 0);
}

// Map a value from one range to another
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const safeValue = value ?? 0;
  const safeInMin = inMin ?? 0;
  const safeInMax = inMax ?? 1;
  const safeOutMin = outMin ?? 0;
  const safeOutMax = outMax ?? 1;
  
  return safeOutMin + ((safeValue - safeInMin) / (safeInMax - safeInMin)) * (safeOutMax - safeOutMin);
}
