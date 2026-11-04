import * as React from "react";

import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn(
      "h-5 w-5 rounded-md border-slate-300 text-rose-600 accent-rose-600 shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
