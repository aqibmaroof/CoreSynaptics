import React from 'react';
import { getAlertClass, AlertVariant, combineClasses } from '@/utils/requiredFlowUtils';

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  title?: string;
}

export function Alert({ variant = 'info', children, className, icon, title }: AlertProps) {
  return (
    <div className={combineClasses(getAlertClass(variant), className)}>
      {(icon || title) && (
        <div className="flex items-center gap-2 mb-2">
          {icon && <span className="text-lg">{icon}</span>}
          {title && <strong>{title}</strong>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Alert;
