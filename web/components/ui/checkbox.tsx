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
      "h-5 w-5 rounded border-slate-300 text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600",
      className,
    )}
    {...props}
  />
));
Checkbox.displayName = "Checkbox";
