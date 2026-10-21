import React, { useMemo } from 'react';
import { PanelLeftClose, Plus, MessageSquare, Trash2 } from 'lucide-react';
import { Conversation } from '../../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

type HistoryGroup = 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older';

const GROUP_ORDER: HistoryGroup[] = [
  'Today',
  'Yesterday',
  'Previous 7 days',
  'Older',
];

const groupConversationsByDate = (
  conversations: Conversation[]
): Record<HistoryGroup, Conversation[]> => {
  const groups: Record<HistoryGroup, Conversation[]> = {
    Today: [],
    Yesterday: [],
    'Previous 7 days': [],
    Older: [],
  };

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;

  // Sort descending by updatedAt or createdAt (most recent first)
  const sorted = [...conversations].sort((a, b) => {
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    return timeB - timeA;
  });

  for (const conv of sorted) {
    const time = new Date(conv.createdAt).getTime();
    if (isNaN(time)) {
      groups.Older.push(conv);
    } else if (time >= startOfToday) {
      groups.Today.push(conv);
    } else if (time >= startOfYesterday) {
      groups.Yesterday.push(conv);
    } else if (time >= sevenDaysAgo) {
      groups['Previous 7 days'].push(conv);
    } else {
      groups.Older.push(conv);
    }
  }

  return groups;
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onNewChat,
  conversations,
  activeId,
  onSelectConversation,
  onDeleteConversation,
}) => {
  const groupedConversations = useMemo(
    () => groupConversationsByDate(conversations),
    [conversations]
  );

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-surface)] transition-transform duration-200 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border-color)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
            NOVA
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Action Button: New Chat */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={() => {
            onNewChat();
            if (window.innerWidth < 768) {
              onClose();
            }
          }}
          className="w-full flex items-center justify-start gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--border-color)]/30 transition-colors"
        >
          <Plus className="w-4 h-4 text-[var(--text-secondary)]" />
          <span>New chat</span>
        </button>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {conversations.length === 0 ? (
          <div className="px-3 py-6 text-xs text-[var(--text-secondary)] text-center select-none">
            No chat history
          </div>
        ) : (
          GROUP_ORDER.map((group) => {
            const items = groupedConversations[group];
            if (!items || items.length === 0) return null;

            return (
              <div key={group} className="space-y-1">
                <div className="text-xs font-medium text-[var(--text-secondary)] px-2.5 py-1 uppercase tracking-wider">
                  {group}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = activeId === item.id;
                    return (
                      <div
                        key={item.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          onSelectConversation(item.id);
                          if (window.innerWidth < 768) {
                            onClose();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectConversation(item.id);
                          }
                        }}
                        className={`group relative flex items-center justify-between w-full px-2.5 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                          isActive
                            ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-medium border border-[var(--border-color)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]/70 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-secondary)]" />
                          <span className="truncate">{item.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(item.id);
                          }}
                          className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)]/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 focus:opacity-100"
                          title="Delete conversation"
                          aria-label={`Delete conversation ${item.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer / User Profile Stub */}
      <div className="p-3 border-t border-[var(--border-color)] flex-shrink-0 text-xs text-[var(--text-secondary)] flex items-center justify-between">
        <span className="font-medium text-[var(--text-primary)]">NOVA AI</span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
};
