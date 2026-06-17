import { Badge } from "@/components/ui/badge"; 
import { cn } from "@/lib/utils"; 
 
interface AvailabilityBadgeProps { 
  isAvailable: boolean; 
} 
 
export function AvailabilityBadge({ isAvailable }: AvailabilityBadgeProps) { 
  return ( 
    <Badge 
      variant="outline" 
      className={cn( 
        "shrink-0", 
        isAvailable
          ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400"
          : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400" 
      )} 
    > 
      {isAvailable ? "Available" : "Booked"} 
    </Badge> 
  ); 
}