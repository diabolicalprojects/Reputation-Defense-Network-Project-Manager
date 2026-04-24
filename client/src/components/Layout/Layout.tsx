import React, { type ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title, subtitle, actions }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64 min-w-0 transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-surface-700/50 px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 text-surface-400 hover:text-white transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white leading-tight">{title}</h1>
                {subtitle && <p className="text-xs sm:text-sm text-surface-400 mt-0.5 line-clamp-1">{subtitle}</p>}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2 sm:gap-3 shrink-0">{actions}</div>}
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};


export default Layout;
