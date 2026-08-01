"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showClearButton?: boolean;
  onClear?: () => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, showClearButton, onClear, value, onChange, ...props }, ref) => {
    const hasValue = value !== undefined && value !== null && String(value).length > 0;
    return (
      <div className="relative w-full">
        {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{leftIcon}</div>}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-background/80 px-3 py-2 text-sm ring-offset-background",
            "placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            leftIcon && "pl-10", (rightIcon || (showClearButton && hasValue)) && "pr-10", className,
          )}
          ref={ref} value={value} onChange={onChange} {...props}
        />
        {showClearButton && hasValue && onClear ? (
          <button type="button" onClick={onClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Clear input">
            <X className="h-4 w-4" />
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{rightIcon}</div>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
export { Input };
