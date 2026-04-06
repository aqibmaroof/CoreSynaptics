import React from 'react';
import { combineClasses, cardClasses, cardHeaderClasses, cardTitleClasses, cardBodyClasses } from '@/utils/requiredFlowUtils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return <div className={combineClasses(cardClasses, className)}>{children}</div>;
}

export function CardHeader({ className, children, onClick }: CardHeaderProps) {
  const classes = combineClasses(cardHeaderClasses, onClick && 'cursor-pointer hover:bg-[rgba(0,200,255,0.04)]', className);
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: CardTitleProps) {
  return <h3 className={combineClasses(cardTitleClasses, className)}>{children}</h3>;
}

export function CardBody({ className, children }: CardBodyProps) {
  return <div className={combineClasses(cardBodyClasses, className)}>{children}</div>;
}

export default Card;
