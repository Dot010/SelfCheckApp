"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Reloads the server data every few seconds while the tab is visible, so new
// paid orders show up on the board without touching the screen.
const AutoRefresh = ({ seconds = 10 }: { seconds?: number }) => {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
};

export default AutoRefresh;
