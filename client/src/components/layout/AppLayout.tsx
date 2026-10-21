import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Conversation } from '../../types/chat';

interface AppLayoutProps {
  children: React.ReactNode;
  onNewChat: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  onNewChat,
  conversations,
  activeId,
  onSelectConversation,
  onDeleteConversation,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[var(--bg-primary)] text-[var(--text-primary)] relative font-sans">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onNewChat={onNewChat}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={onSelectConversation}
        onDeleteConversation={onDeleteConversation}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[var(--bg-primary)]">
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={!isSidebarOpen}
        />
        <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
