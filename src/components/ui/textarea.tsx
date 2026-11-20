import * as React from "react"

import { cn } from "@/lib/utils"
import { fieldBase } from "./input"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(fieldBase, "flex min-h-[80px] px-3 py-2", className)}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
