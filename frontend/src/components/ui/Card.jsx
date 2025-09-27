import React from 'react';
import { clsx } from 'clsx';

/**
 * Card Component
 * Reusable card component for content containers
 */

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'default',
  ...props
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const classes = clsx(
    'bg-white rounded-lg border border-sage-200',
    paddingClasses[padding],
    shadowClasses[shadow],
    className
  );

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('border-b border-sage-200 pb-4 mb-4', className)} {...props}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={clsx('text-lg font-semibold text-forest-900', className)} {...props}>
      {children}
    </h3>
  );
};

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={clsx('text-sm text-sage-600 mt-1', className)} {...props}>
      {children}
    </p>
  );
};

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('', className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={clsx('border-t border-sage-200 pt-4 mt-4', className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
