"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "focus-ring h-10 w-full rounded-control border border-black/[0.08] bg-white px-3 text-sm text-ink placeholder:text-muted",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
