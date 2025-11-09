

import React, { ReactNode, forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';

// FIX: Change props to be compatible with motion.button to avoid type conflicts.
type ButtonProps = {
    children?: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: ReactNode;
    className?: string;
} & Omit<MotionProps, 'children'> & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ children, variant = 'primary', size = 'md', isLoading = false, icon, className = '', disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center border border-transparent font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

    const variantClasses = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-lg shadow-primary-500/30',
        secondary: 'bg-neutral-200 text-neutral-700 hover:bg-neutral-300 focus:ring-primary-500 border border-transparent',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg shadow-red-500/40',
    };

    const sizeClasses = {
        sm: 'px-4 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-7 py-3 text-base',
    };

    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-5 h-5',
    }

    return (
        <motion.button
            ref={ref}
            whileHover={{ scale: disabled ? 1 : 1.03, y: disabled ? 0 : -2 }}
            whileTap={{ scale: disabled ? 1 : 0.97, y: 0 }}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : icon ? (
                <span className={`mr-2 -ml-1 ${iconSizeClasses[size]}`}>{icon}</span>
            ): null}
            {children}
        </motion.button>
    );
});

Button.displayName = "Button";

export default Button;