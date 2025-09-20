import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLElement> {
  as?: "div" | "span"
}

function Skeleton({ className, as = "div", ...props }: SkeletonProps) {
  const Component = as
  return (
    <Component
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
