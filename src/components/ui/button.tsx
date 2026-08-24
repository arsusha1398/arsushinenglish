import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "pop-sm bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--ink)] active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]",
        party:
          "pop bg-sun text-ink font-display uppercase tracking-wide hover:-translate-y-1 hover:rotate-[-1deg] active:translate-y-0 active:shadow-[2px_2px_0_var(--ink)]",
        blue: "pop-sm bg-blue text-blue-foreground hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]",
        lime: "pop-sm bg-lime text-ink hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]",
        magenta:
          "pop-sm bg-magenta text-magenta-foreground hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0_var(--ink)]",
        destructive: "pop-sm bg-destructive text-destructive-foreground hover:-translate-y-0.5",
        outline: "pop-sm bg-card text-foreground hover:bg-muted hover:-translate-y-0.5",
        secondary: "pop-sm bg-secondary text-secondary-foreground hover:-translate-y-0.5",
        ghost: "hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
