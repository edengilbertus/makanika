import React from 'react';

interface NeoCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const NeoCard: React.FC<NeoCardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-white border-4 border-black shadow-neo p-6 ${className}`}>
      {title && (
        <div className="border-b-4 border-black pb-4 mb-4">
          <h2 className="text-xl font-bold uppercase tracking-widest">{title}</h2>
        </div>
      )}
      {children}
    </div>
  );
};