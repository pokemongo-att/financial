import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { fieldBase } from "./input";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

/** Native select on purpose: phones and tablets open their own picker. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        className={cn(fieldBase, "flex h-10 px-3 py-2 pointer-coarse:h-11", className)}
        ref={ref}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
