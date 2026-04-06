import React from 'react';
import { statBoxClasses, statLabelClasses, statValueClasses, combineClasses } from '@/utils/requiredFlowUtils';

interface StatBoxProps {
  className?: string;
  children: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}

interface StatLabelProps {
  className?: string;
  children: React.ReactNode;
}

interface StatValueProps {
  className?: string;
  children: React.ReactNode;
  clickable?: boolean;
}

export function StatBox({ className, children, clickable = false, onClick }: StatBoxProps) {
  const classes = combineClasses(
    statBoxClasses,
    clickable && 'clickable',
    className
  );
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

export function StatLabel({ className, children }: StatLabelProps) {
  return <div className={combineClasses(statLabelClasses, className)}>{children}</div>;
}

export function StatValue({ className, children, clickable = false }: StatValueProps) {
  const classes = combineClasses(
    statValueClasses,
    clickable && 'cursor-pointer transition-colors hover:text-[var(--rf-accent)]',
    className
  );
  return <div className={classes}>{children}</div>;
}

export default StatBox;
