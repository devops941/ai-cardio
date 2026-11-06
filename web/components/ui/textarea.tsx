import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-[var(--ink-300)] bg-white px-3.5 py-2.5 text-sm text-[var(--ink-900)] transition-all duration-200 placeholder:text-[var(--ink-300)] focus-visible:border-[var(--cardiac-400)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(222,17,69,0.12)] disabled:cursor-not-allowed disabled:bg-[var(--cardiac-50)]/60 disabled:opacity-70 aria-[invalid=true]:border-[var(--cardiac-600)] aria-[invalid=true]:focus-visible:ring-[color:rgba(222,17,69,0.18)]",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
