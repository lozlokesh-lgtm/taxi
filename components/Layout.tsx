import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, showBack, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-xl min-h-screen relative flex flex-col">
        {/* Header */}
        <div className="bg-brand-600 text-white p-4 sticky top-0 z-50 flex items-center shadow-md">
          {showBack && (
            <button 
              onClick={onBack} 
              className="mr-3 p-1 hover:bg-brand-700 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-bold flex-1 text-center pr-6">{title || 'TealCab'}</h1>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
          {children}
        </div>
      </div>
    </div>
  );
};