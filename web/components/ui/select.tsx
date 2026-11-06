import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full cursor-pointer rounded-md border border-[var(--ink-300)] bg-white px-3.5 py-2 text-sm text-[var(--ink-900)] transition-all duration-200 focus-visible:border-[var(--cardiac-400)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(222,17,69,0.12)] disabled:cursor-not-allowed disabled:bg-[var(--cardiac-50)]/60 disabled:opacity-70 aria-[invalid=true]:border-[var(--cardiac-600)] aria-[invalid=true]:focus-visible:ring-[color:rgba(222,17,69,0.18)]",
      className,
    )}
    {...props}
  />
));
Select.displayName = "Select";
