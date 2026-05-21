import React from 'react';
import { Flame, Clock } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export default function FeedFilters({ activeCategory, onCategoryChange, sortBy, onSortChange }) {
  return (
    <div className="space-y-2">

      {/* Row 1: Sort + Category chips all in one scrollable strip */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
        {/* Sort pills */}
        {[
          { value: 'recent',   label: 'Recent',   Icon: Clock },
          { value: 'trending', label: 'Trending', Icon: Flame },
        ].map(({ value, label, Icon }) => {
          const active = sortBy === value;
          return (
            <button
              key={value}
              onClick={() => onSortChange(value)}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold transition-all"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                background: active ? '#ffd700' : 'rgba(19,19,19,0.7)',
                color: active ? '#000' : 'rgba(208,198,171,0.65)',
                border: active ? '1px solid #ffd700' : '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
                boxShadow: active ? '0 0 14px rgba(255,215,0,0.35)' : 'none',
              }}
            >
              <Icon className="w-3 h-3" strokeWidth={2.5} />
              {label}
            </button>
          );
        })}

        {/* Thin divider */}
        <div className="shrink-0 self-stretch w-px my-1" style={{ background: 'rgba(255,255,255,0.1)' }} />

        {/* Category chips */}
        <CategoryChip active={activeCategory === 'all'} onClick={() => onCategoryChange('all')} label="All" />
        {CATEGORIES.map(c => (
          <CategoryChip
            key={c.value}
            active={activeCategory === c.value}
            onClick={() => onCategoryChange(c.value)}
            label={c.label}
          />
        ))}
      </div>

    </div>
  );
}

function CategoryChip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-4 py-2 rounded-full text-[12px] font-bold transition-all"
      style={{
        fontFamily: 'JetBrains Mono, monospace',
        background: active
          ? 'linear-gradient(135deg, rgba(255,215,0,0.18) 0%, rgba(255,215,0,0.07) 100%)'
          : 'rgba(19,19,19,0.7)',
        color: active ? '#ffd700' : 'rgba(208,198,171,0.65)',
        border: active ? '1px solid rgba(255,215,0,0.45)' : '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
        boxShadow: active ? '0 0 10px rgba(255,215,0,0.15)' : 'none',
      }}
    >
      {label}
    </button>
  );
}
