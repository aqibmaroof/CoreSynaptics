import React from 'react';
import {
  tableWrapClasses,
  tableClasses,
  getRowClass,
  RowPriority,
  combineClasses,
} from '@/utils/requiredFlowUtils';

interface TableProps {
  className?: string;
  children: React.ReactNode;
}

interface TableHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface TableBodyProps {
  className?: string;
  children: React.ReactNode;
}

interface TableRowProps {
  className?: string;
  children: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
  priority?: RowPriority;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className={combineClasses(tableWrapClasses, className)}>
      <table className={tableClasses}>{children}</table>
    </div>
  );
}

export function TableHeader({ className, children }: TableHeaderProps) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ className, children }: TableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({
  className,
  children,
  clickable = false,
  onClick,
  priority,
}: TableRowProps) {
  const classes = combineClasses(
    clickable && 'clickable',
    priority && getRowClass(priority),
    className
  );

  return (
    <tr className={classes} onClick={onClick}>
      {children}
    </tr>
  );
}

export default Table;
