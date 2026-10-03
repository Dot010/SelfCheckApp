import * as React from "react";

import { cn } from "@/lib/utils";

// A native checkbox styled as a switch, so it works with forms and keyboards
// without an extra dependency.
const Switch = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => (
  <span className={cn("relative inline-flex h-7 w-12 shrink-0", className)}>
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      className="peer absolute inset-0 z-10 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      {...props}
    />
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full bg-border transition-colors peer-checked:bg-success peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-disabled:opacity-50"
    />
    <span
      aria-hidden
      className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-card shadow transition-transform peer-checked:translate-x-5"
    />
  </span>
));
Switch.displayName = "Switch";

export { Switch };
