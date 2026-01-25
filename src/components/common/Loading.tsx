import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type LoadingProps = {
  count?: number
  className?: string
  itemClassName?: string
}

export default function Loading({
  count = 3,
  className,
  itemClassName,
}: LoadingProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={`loading-${index}`}
          className={cn("h-24 w-full rounded-lg", itemClassName)}
        />
      ))}
    </div>
  )
}
