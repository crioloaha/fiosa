'use client';

import { useEffect, useRef } from 'react';

interface AnalyticsTrackerProps {
  slug?: string;
  id?: string;
  type: 'profile' | 'product';
}

export default function AnalyticsTracker({ slug, id, type }: AnalyticsTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per page mount
    if (tracked.current) return;
    tracked.current = true;

    if (type === 'profile' && slug) {
      fetch('/api/analytics/view-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      }).catch((err) => console.error('Error logging profile view:', err));
    } else if (type === 'product' && id) {
      fetch('/api/analytics/view-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      }).catch((err) => console.error('Error logging product view:', err));
    }
  }, [slug, id, type]);

  return null;
}
