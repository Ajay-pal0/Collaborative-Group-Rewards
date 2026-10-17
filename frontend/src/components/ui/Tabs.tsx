import React from 'react';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChange: (tabId: T) => void;
  className?: string;
}

export function Tabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 bg-[#f5f5f4] p-1.5 rounded-2xl border border-[#e7e5e4] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isActive
                ? 'bg-white text-[#0c0a09] shadow-xs font-semibold'
                : 'text-[#57534e] hover:text-[#0c0a09] hover:bg-black/[0.02]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="shrink-0">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
