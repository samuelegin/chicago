import React from 'react';
import { Flame, Clock } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

export default function FeedFilters({ activeCategory, onCategoryChange, sortBy, onSortChange }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      {/* Sort tabs */}
      <div className="flex border-b border-border">
        {[
          { value: 'recent',   label: 'Recent',   Icon: Clock  },
          { value: 'trending', label: 'Trending', Icon: Flame  },
        ].map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => onSortChange(value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold transition-colors relative ${
              sortBy === value ? 'text-foreground' : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            <Icon
              className={`w-3.5 h-3.5 ${value === 'trending' && sortBy === value ? 'text-amber-500' : ''}`}
              strokeWidth={2.2}
            />
            {label}
            {sortBy === value && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-400 rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 px-3 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <Chip active={activeCategory === 'all'} onClick={() => onCategoryChange('all')} label="All" />
        {CATEGORIES.map(c => (
          <Chip
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

function Chip({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
        active
          ? 'text-white border-transparent bg-gradient-to-r from-amber-500 to-yellow-400 shadow-sm shadow-amber-200'
          : 'bg-white text-neutral-500 border-border hover:border-amber-300 hover:text-amber-600'
      }`}
    >
      {label}
    </button>
  );
}
