import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const press = 'active:scale-[0.98] transition-transform';
const variantStyles: Record<ButtonVariant, string> = {
  primary: `bg-[#0f5f55] text-white shadow-xs hover:bg-[#0f4c4a] ${press}`,
  secondary: `border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 ${press}`,
  outline: `border border-emerald-600 bg-transparent text-emerald-800 hover:bg-emerald-50 ${press}`,
  ghost: `text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${press}`,
  success: `bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 ${press}`,
  danger: `bg-rose-600 text-white hover:bg-rose-700 shadow-xs ${press}`,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center font-semibold transition-all duration-150 ease-out cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
    'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none',
    variantStyles[variant],
    sizeStyles[size],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  disabled,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={buttonClasses(variant, size, className)}
      {...rest}
    >
      {isLoading ? (
        <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
}

