//src/components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow",
        outline: "border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-100",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-100",
        link: "text-blue-600 underline-offset-4 hover:underline bg-transparent dark:text-blue-400",
        success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow",
        warning: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow",
        info: "bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm hover:shadow",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-2",
        "icon-sm": "h-8 w-8 p-1.5",
        "icon-lg": "h-12 w-12 p-2.5",
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        none: "rounded-none",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      rounded: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loadingText?: string;
  iconOnly?: boolean; // New prop for icon-only buttons
  icon?: React.ReactNode; // New prop for a centered icon
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    rounded,
    isLoading, 
    leftIcon, 
    rightIcon, 
    icon, // New prop
    iconOnly, // New prop
    loadingText,
    children, 
    ...props 
  }, ref) => {
    // Automatically set size to icon if iconOnly is true and no size is specified
    const buttonSize = iconOnly && !size ? 'icon' : size;
    
    return (
      <button
        className={cn(
          buttonVariants({ variant, size: buttonSize, fullWidth, rounded }), 
          iconOnly && "p-0", // Remove padding for icon-only buttons
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {!isLoading && icon && <span>{icon}</span>}
        {!iconOnly && (isLoading && loadingText ? loadingText : children)}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
