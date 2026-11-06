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
      "h-5 w-5 shrink-0 cursor-pointer rounded-md border border-[var(--ink-300)] text-[var(--cardiac-600)] accent-[var(--cardiac-600)] shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(222,17,69,0.15)]",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
