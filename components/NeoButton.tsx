import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "font-bold border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-wider flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-mk-blue text-white shadow-neo hover:bg-mk-blue/90",
    secondary: "bg-white text-black shadow-neo hover:bg-gray-50",
    danger: "bg-mk-red text-white shadow-neo hover:bg-mk-red/90",
    success: "bg-mk-green text-black shadow-neo hover:bg-mk-green/90",
    outline: "bg-transparent text-black border-black shadow-none hover:bg-black hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1 text-xs shadow-neo-sm",
    md: "px-6 py-3 text-sm shadow-neo",
    lg: "px-8 py-4 text-lg shadow-neo-lg"
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};