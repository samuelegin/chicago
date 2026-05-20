import React from 'react';

export default function UserAvatar({ name, avatar, size = 'md', noRing = false }) {
  const px = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }[size] || 40;
  const fs = Math.round(px * 0.36);

  const img = (
    <div className="rounded-full bg-neutral-200 overflow-hidden shrink-0 flex items-center justify-center"
         style={{ width: px, height: px }}>
      {avatar
        ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
        : <span className="font-semibold text-neutral-500 select-none" style={{ fontSize: fs }}>
            {(name || '?')[0].toUpperCase()}
          </span>
      }
    </div>
  );

  if (noRing) return img;

  return (
    <div className="story-ring inline-block">
      <div className="story-ring-inner">{img}</div>
    </div>
  );
}
