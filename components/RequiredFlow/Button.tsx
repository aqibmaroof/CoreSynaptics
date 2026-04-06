import React from 'react';
import { getButtonClass, ButtonVariant, ButtonSize, combineClasses } from '@/utils/requiredFlowUtils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={combineClasses(getButtonClass(variant, size), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {icon && <span className="inline-flex">{icon}</span>}
      <span>{isLoading ? 'Loading...' : children}</span>
    </button>
  );
}

export default Button;
