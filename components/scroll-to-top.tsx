'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Next's App Router only auto-scrolls when it can find a suitable DOM node for the changed
 * route segment — it walks past nodes that are zero-sized or `position: sticky`/`fixed`, and
 * bails if the one it lands on is already in view. With this layout it consistently bails, so a
 * client-side navigation leaves you at the previous page's scroll offset.
 *
 * Scroll to the top ourselves, while leaving alone the two cases that already behave correctly:
 *   - in-page anchors, where the target element should win;
 *   - back/forward, where the browser restores the offset you left.
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const cameFromHistory = useRef(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const onPopState = () => {
      cameFromHistory.current = true;
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    // The initial render is a full page load; the browser has already positioned it.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (cameFromHistory.current) {
      cameFromHistory.current = false;
      return;
    }

    if (window.location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
