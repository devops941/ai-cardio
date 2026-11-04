import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cardiac-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-5 py-2.5 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[var(--cardiac-600)] via-[var(--cardiac-700)] to-[var(--cardiac-800)] text-white shadow-lg shadow-[color:rgba(222,17,69,0.28)] hover:shadow-xl hover:shadow-[color:rgba(222,17,69,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        secondary:
          "bg-[var(--cardiac-50)] text-[var(--cardiac-800)] border border-[var(--cardiac-200)] hover:bg-[var(--cardiac-100)] hover:border-[var(--cardiac-300)]",
        outline:
          "border border-[var(--cardiac-200)] bg-white/80 text-[var(--ink-900)] backdrop-blur-sm hover:border-[var(--cardiac-400)] hover:bg-[var(--cardiac-50)] hover:text-[var(--cardiac-700)]",
        ghost:
          "text-[var(--ink-700)] hover:bg-[var(--cardiac-50)] hover:text-[var(--cardiac-700)]",
        danger:
          "bg-gradient-to-r from-red-600 to-[var(--cardiac-700)] text-white shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 hover:-translate-y-0.5",
        emergency:
          "bg-gradient-to-r from-red-600 via-[var(--cardiac-600)] to-red-700 text-white text-base font-bold shadow-xl shadow-red-600/35 animate-pulse-glow hover:-translate-y-0.5",
        cardiac:
          "bg-gradient-to-r from-[var(--cardiac-600)] via-[var(--cardiac-700)] to-[var(--cardiac-900)] text-white shadow-lg shadow-[color:rgba(222,17,69,0.3)] hover:shadow-2xl hover:shadow-[color:rgba(222,17,69,0.45)] hover:-translate-y-0.5 active:translate-y-0",
        glass:
          "border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:border-white/40",
        link: "text-[var(--cardiac-700)] underline-offset-4 hover:underline hover:text-[var(--cardiac-900)] min-h-0 px-0 py-0",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 min-h-[36px] px-4 text-xs rounded-full",
        lg: "h-14 min-h-[52px] px-8 text-base rounded-full",
        icon: "h-11 w-11 px-0 rounded-full",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
