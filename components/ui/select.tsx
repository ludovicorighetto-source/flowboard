"use client";

import * as React from "react";

import { cn } from "@/lib/utils/cn";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "focus-ring min-h-12 w-full rounded-xl border border-black/[0.08] bg-white px-4 text-sm text-ink",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = "Select";
