/**
 * PreviewTabs Component
 *
 * Glassmorphism tab switcher for UI Preview / Code Viewer / File Tree
 * Features:
 * - Smooth tab transitions
 * - Active state indicator
 * - UI Ready badge animation
 * - Responsive design for mobile/tablet
 */

'use client';

import { useState } from 'react';

export type PreviewTab = 'preview' | 'code' | 'files';

interface PreviewTabsProps {
  activeTab: PreviewTab;
  onTabChange: (tab: PreviewTab) => void;
  uiReady?: boolean;
  className?: string;
}

export function PreviewTabs({
  activeTab,
  onTabChange,
  uiReady = false,
  className = ''
}: PreviewTabsProps) {
  const tabs = [
    {
      id: 'preview' as PreviewTab,
      label: 'UI Preview',
      icon: '👁️',
      badge: uiReady,
    },
    {
      id: 'code' as PreviewTab,
      label: 'Code Viewer',
      icon: '📄',
      badge: false,
    },
    {
      id: 'files' as PreviewTab,
      label: 'File Tree',
      icon: '📁',
      badge: false,
    },
  ];

  return (
    <div className={`flex items-center gap-2 border-b border-white/10 bg-white/5 backdrop-blur-md px-3 py-2 ${className}`}>
      {/* Desktop/Tablet: Full labels */}
      <div className="hidden sm:flex items-center gap-2 w-full">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <span>{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
              {tab.badge && (
                <span
                  className="w-2 h-2 bg-green-400 rounded-full inline-block animate-pulse"
                  title="Preview is ready"
                />
              )}
            </span>

            {/* Active indicator */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-white/50 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Mobile: Icon only with active indicator */}
      <div className="flex sm:hidden items-center gap-2 w-full justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex-1 py-2 rounded-lg text-xl transition-all duration-300
              ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg shadow-purple-500/30 scale-110'
                  : 'bg-white/5 hover:bg-white/10 scale-100'
              }
            `}
          >
            <span className="relative inline-block">
              {tab.icon}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
