import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-2xl border border-[var(--ink-100)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink-900)] shadow-[0_1px_2px_rgba(74,2,24,0.03)] transition-all duration-200 placeholder:text-[var(--ink-300)] focus-visible:border-[var(--cardiac-400)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(222,17,69,0.12)] disabled:cursor-not-allowed disabled:bg-[var(--cardiac-50)]/60 disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
