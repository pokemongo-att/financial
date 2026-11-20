import * as React from "react"

import { cn } from "@/lib/utils"

/** 16px text on touch screens keeps iOS from zooming into the field on focus. */
export const fieldBase =
  "w-full rounded-lg border border-slate-300 bg-white text-base text-slate-900 placeholder:text-slate-500 pointer-fine:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          fieldBase,
          "flex h-10 px-3 py-2 pointer-coarse:h-11 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
