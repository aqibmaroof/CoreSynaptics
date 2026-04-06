/**
 * RequiredFlow Design System Utilities
 * Provides helper functions and class names for using the design system
 */

/* ────────────────────────────────────────────────────────────────────────────
   BUTTON CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const buttonVariants = {
  primary: 'rf-btn rf-btn-primary',
  ghost: 'rf-btn rf-btn-ghost',
  red: 'rf-btn rf-btn-red',
  green: 'rf-btn rf-btn-green',
} as const;

export const buttonSizes = {
  sm: 'rf-btn-sm',
  md: '',
  lg: 'rf-btn-lg',
} as const;

export function getButtonClass(
  variant: keyof typeof buttonVariants = 'primary',
  size: keyof typeof buttonSizes = 'md'
): string {
  return `${buttonVariants[variant]} ${buttonSizes[size]}`.trim();
}

/* ────────────────────────────────────────────────────────────────────────────
   CARD CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const cardClasses = 'rf-card';
export const cardHeaderClasses = 'rf-card-header';
export const cardTitleClasses = 'rf-card-title';
export const cardBodyClasses = 'rf-card-body';

export const statBoxClasses = 'rf-stat-box';
export const statLabelClasses = 'rf-stat-label';
export const statValueClasses = 'rf-stat-value';

/* ────────────────────────────────────────────────────────────────────────────
   BADGE CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const badgeVariants = {
  green: 'rf-badge rf-badge-green',
  yellow: 'rf-badge rf-badge-yellow',
  red: 'rf-badge rf-badge-red',
  blue: 'rf-badge rf-badge-blue',
} as const;

export function getBadgeClass(variant: keyof typeof badgeVariants = 'blue'): string {
  return badgeVariants[variant];
}

export const pillVariants = {
  done: 'rf-pill rf-pill-done',
  issue: 'rf-pill rf-pill-issue',
  pending: 'rf-pill rf-pill-pending',
} as const;

export function getPillClass(variant: keyof typeof pillVariants = 'pending'): string {
  return pillVariants[variant];
}

/* ────────────────────────────────────────────────────────────────────────────
   TABLE CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const tableWrapClasses = 'rf-table-wrap';
export const tableClasses = 'rf-table';
export const rowVariants = {
  critical: 'rf-row-critical',
  high: 'rf-row-high',
  medium: 'rf-row-medium',
} as const;

export function getRowClass(priority: keyof typeof rowVariants): string {
  return rowVariants[priority];
}

/* ────────────────────────────────────────────────────────────────────────────
   FORM CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const formGroupClasses = 'rf-form-group';
export const formLabelClasses = 'rf-form-label';
export const formInputClasses = 'rf-form-input';
export const formSelectClasses = 'rf-form-select';
export const formTextareaClasses = 'rf-form-textarea';

/* ────────────────────────────────────────────────────────────────────────────
   MODAL CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const modalOverlayClasses = 'rf-modal-overlay';
export const modalClasses = 'rf-modal';
export const modalWideClasses = 'rf-modal rf-modal-wide';
export const modalHeaderClasses = 'rf-modal-header';
export const modalTitleClasses = 'rf-modal-title';
export const modalBodyClasses = 'rf-modal-body';
export const modalFooterClasses = 'rf-modal-footer';
export const modalCloseClasses = 'rf-modal-close';

/* ────────────────────────────────────────────────────────────────────────────
   ALERT CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const alertVariants = {
  info: 'rf-alert rf-alert-info',
  warning: 'rf-alert rf-alert-warning',
  error: 'rf-alert rf-alert-error',
  success: 'rf-alert rf-alert-success',
} as const;

export function getAlertClass(variant: keyof typeof alertVariants = 'info'): string {
  return alertVariants[variant];
}

/* ────────────────────────────────────────────────────────────────────────────
   TEXT UTILITY CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const textVariants = {
  accent: 'rf-text-accent',
  green: 'rf-text-green',
  red: 'rf-text-red',
  yellow: 'rf-text-yellow',
  orange: 'rf-text-orange',
  muted: 'rf-text-muted',
} as const;

export const textSizes = {
  xs: 'rf-text-xs',
  sm: 'rf-text-sm',
} as const;

export function getTextClass(
  color?: keyof typeof textVariants,
  size?: keyof typeof textSizes
): string {
  const classes = [];
  if (color) classes.push(textVariants[color]);
  if (size) classes.push(textSizes[size]);
  return classes.join(' ');
}

/* ────────────────────────────────────────────────────────────────────────────
   GRID & LAYOUT CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const gridVariants = {
  grid2: 'rf-grid-2',
  grid3: 'rf-grid-3',
  grid4: 'rf-grid-4',
} as const;

export const layoutVariants = {
  flexBetween: 'rf-flex-between',
  flexCenter: 'rf-flex-center',
} as const;

/* ────────────────────────────────────────────────────────────────────────────
   PROGRESS CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const progressVariants = {
  green: 'rf-progress-fill rf-progress-fill-green',
  yellow: 'rf-progress-fill rf-progress-fill-yellow',
  red: 'rf-progress-fill rf-progress-fill-red',
  blue: 'rf-progress-fill rf-progress-fill-blue',
} as const;

export function getProgressClass(color: keyof typeof progressVariants = 'blue'): string {
  return progressVariants[color];
}

/* ────────────────────────────────────────────────────────────────────────────
   ANIMATION CLASSES
   ──────────────────────────────────────────────────────────────────────────── */

export const animationClasses = {
  pulse: 'rf-pulse',
  fadeIn: 'rf-fade-in',
  glowAccent: 'rf-glow-accent',
} as const;

/* ────────────────────────────────────────────────────────────────────────────
   CSS VARIABLES
   ──────────────────────────────────────────────────────────────────────────── */

export const cssVariables = {
  // Backgrounds
  bg: 'var(--rf-bg)',
  bg2: 'var(--rf-bg2)',
  bg3: 'var(--rf-bg3)',
  bg4: 'var(--rf-bg4)',
  bg5: 'var(--rf-bg5)',

  // Borders
  border: 'var(--rf-border)',
  border2: 'var(--rf-border2)',
  border3: 'var(--rf-border3)',

  // Text
  txt: 'var(--rf-txt)',
  txt2: 'var(--rf-txt2)',
  txt3: 'var(--rf-txt3)',

  // Accents
  accent: 'var(--rf-accent)',
  accent2: 'var(--rf-accent2)',
  glow: 'var(--rf-glow)',

  // Status colors
  green: 'var(--rf-green)',
  green2: 'var(--rf-green2)',
  yellow: 'var(--rf-yellow)',
  yellow2: 'var(--rf-yellow2)',
  red: 'var(--rf-red)',
  red2: 'var(--rf-red2)',
  orange: 'var(--rf-orange)',
  purple: 'var(--rf-purple)',
  teal: 'var(--rf-teal)',

  // Typography
  mono: 'var(--rf-mono)',
  sans: 'var(--rf-sans)',
  display: 'var(--rf-display)',

  // Layout
  navHeight: 'var(--rf-nav-h)',
  sidebarWidth: 'var(--rf-side-w)',
  borderRadius: 'var(--rf-border-radius)',
  borderRadiusSm: 'var(--rf-border-radius-sm)',
  borderRadiusLg: 'var(--rf-border-radius-lg)',

  // Transitions
  transitionFast: 'var(--rf-transition-fast)',
  transitionBase: 'var(--rf-transition-base)',
  transitionSlow: 'var(--rf-transition-slow)',
  transitionSlower: 'var(--rf-transition-slower)',
} as const;

/* ────────────────────────────────────────────────────────────────────────────
   TYPE DEFINITIONS
   ──────────────────────────────────────────────────────────────────────────── */

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;
export type BadgeVariant = keyof typeof badgeVariants;
export type PillVariant = keyof typeof pillVariants;
export type AlertVariant = keyof typeof alertVariants;
export type TextColor = keyof typeof textVariants;
export type TextSize = keyof typeof textSizes;
export type ProgressColor = keyof typeof progressVariants;
export type GridVariant = keyof typeof gridVariants;
export type RowPriority = keyof typeof rowVariants;

/* ────────────────────────────────────────────────────────────────────────────
   HELPER FUNCTIONS
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Combine multiple class names conditionally
 */
export function combineClasses(...classes: (string | boolean | undefined | null)[]): string {
  return classes
    .filter((c) => typeof c === 'string' && c.trim())
    .join(' ')
    .trim();
}

/**
 * Create inline styles using CSS variables
 */
export function createStyleWithVariables(
  property: string,
  variableKey: keyof typeof cssVariables
): React.CSSProperties {
  return {
    [property]: cssVariables[variableKey],
  } as React.CSSProperties;
}

/**
 * Get colors for status/priority indicators
 */
export const statusColors = {
  critical: { text: 'var(--rf-red)', bg: 'rgba(255, 68, 85, 0.08)' },
  high: { text: 'var(--rf-orange)', bg: 'rgba(255, 140, 0, 0.05)' },
  medium: { text: 'var(--rf-yellow)', bg: 'rgba(255, 204, 0, 0.05)' },
  low: { text: 'var(--rf-txt3)', bg: 'rgba(74, 96, 128, 0.05)' },
  done: { text: 'var(--rf-green)', bg: 'rgba(0, 229, 160, 0.08)' },
  pending: { text: 'var(--rf-yellow)', bg: 'rgba(255, 204, 0, 0.08)' },
  issue: { text: 'var(--rf-red)', bg: 'rgba(255, 68, 85, 0.1)' },
} as const;

export type StatusColor = keyof typeof statusColors;
