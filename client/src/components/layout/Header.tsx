import React from 'react';
import { PanelLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 w-full flex items-center justify-between px-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex-shrink-0 select-none">
      <div className="flex items-center gap-2">
        {/* Toggle Sidebar Button (visible on mobile or when desktop sidebar is collapsed) */}
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-color)] transition-colors ${
            isSidebarCollapsed ? 'flex' : 'flex md:hidden'
          }`}
          title="Toggle sidebar"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium tracking-tight text-[var(--text-primary)] md:hidden">
          NOVA
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-color)] transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
