"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Re-renders the page with fresh server data every few seconds while the tab
// is visible. Polling is used instead of WebSockets because serverless hosts
// like Vercel don't keep long-lived connections open.
interface AutoRefreshProps {
  seconds?: number;
  enabled?: boolean;
}

const AutoRefresh = ({ seconds = 10, enabled = true }: AutoRefreshProps) => {
  const router = useRouter();
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds, enabled]);
  return null;
};

export default AutoRefresh;
