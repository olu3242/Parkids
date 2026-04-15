// ============================================================
// PAR-KIDS — Utility Functions
// ============================================================
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isTomorrow } from 'date-fns';

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a date relative to now */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Format a date for display */
export function formatDate(dateString: string, pattern = 'MMM d, yyyy'): string {
  return format(new Date(dateString), pattern);
}

/** Get age from date of birth */
export function getAge(dob: string): number {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** Determine age group from age */
export function getAgeGroup(age: number): 'early' | 'preteen' | 'teen' | 'unknown' {
  if (age >= 6 && age <= 10) return 'early';
  if (age >= 11 && age <= 13) return 'preteen';
  if (age >= 14 && age <= 17) return 'teen';
  return 'unknown';
}

/** Get initials from name */
export function getInitials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

/** Truncate text */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}...`;
}

/** Format mood level to label */
export function moodLabel(level: number): string {
  const labels: Record<number, string> = {
    1: 'Very Low',
    2: 'Low',
    3: 'Okay',
    4: 'Good',
    5: 'Great',
  };
  return labels[level] ?? 'Unknown';
}

/** Calculate average from array of numbers */
export function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Generate a random avatar color from palette */
const avatarColors = [
  '#3ABFBF', '#2D7D5A', '#F4A535', '#9B7FD4',
  '#E05252', '#4F86C6', '#6CC79A', '#F4D03F',
];
export function randomAvatarColor(): string {
  return avatarColors[Math.floor(Math.random() * avatarColors.length)];
}

/** Check if a check-in is overdue */
export function isOverdue(scheduledAt: string): boolean {
  return new Date(scheduledAt) < new Date();
}

/** Capitalize first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
