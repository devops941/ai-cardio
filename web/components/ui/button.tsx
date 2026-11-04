import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-4 py-2 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 active:scale-[0.98]",
        secondary: "bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100 hover:border-rose-300",
        outline: "border border-slate-300 bg-white text-slate-800 hover:bg-rose-50/60 hover:text-rose-700 hover:border-rose-300 shadow-sm",
        ghost: "text-slate-700 hover:bg-rose-50 hover:text-rose-700",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-600/20",
        emergency: "bg-gradient-to-r from-red-600 to-rose-700 text-white hover:from-red-700 hover:to-rose-800 text-base font-bold shadow-lg shadow-red-600/30 animate-pulse-glow",
        cardiac: "bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white shadow-md shadow-rose-600/25 hover:shadow-xl hover:shadow-rose-600/35 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 min-h-[36px] px-3.5 text-xs rounded-lg",
        lg: "h-12 px-7 text-base rounded-2xl",
        icon: "h-11 w-11 px-0 rounded-xl",
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
