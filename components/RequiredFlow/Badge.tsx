import React from 'react';
import { getBadgeClass, getPillClass, BadgeVariant, PillVariant, combineClasses } from '@/utils/requiredFlowUtils';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

interface PillProps {
  variant?: PillVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ variant = 'blue', children, className }: BadgeProps) {
  return <span className={combineClasses(getBadgeClass(variant), className)}>{children}</span>;
}

export function Pill({ variant = 'pending', children, className, icon }: PillProps) {
  return (
    <span className={combineClasses(getPillClass(variant), className)}>
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
}

export default Badge;
