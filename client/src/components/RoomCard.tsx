import { RoomResponse } from "@/types"; 
import { AvailabilityBadge } from "./AvailabilityBadge"; 
import { cn } from "@/lib/utils"; 
interface RoomCardProps { 
room: RoomResponse; 
isSelected: boolean; 
onSelect: (id: string) => void; 
} 
export function RoomCard({ room, isSelected, onSelect }: RoomCardProps) { 
return ( 
<div 
onClick={() => onSelect(room.id)} 
className={cn( 
"cursor-pointer rounded-xl border p-5 transition-all duration-150", 
        "bg-white dark:bg-gray-800", 
          isSelected
            ? "border-blue-500 shadow-md ring-2 ring-blue-100 dark:border-blue-400 dark:ring-blue-900"
            : "border-gray-200 hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600"
      )} 
    > 
      <div className="mb-3 flex items-start justify-between gap-2"> 
        <h2 className="text-lg font-semibold leading-tight text-gray-900 
         dark:text-gray-100"> 
          {room.name} 
        </h2> 
        <AvailabilityBadge isAvailable={room.isAvailable} /> 
      </div> 
 
      <p className="text-sm text-gray-500 dark:text-gray-400"> 
        {room.floor} · {room.capacity} people 
      </p> 
 
      {!room.isAvailable && ( 
        <p className="mt-2 text-xs text-red-500 dark:text-red-400"> 
          Next slot: 2:00 PM 
        </p> 
      )} 
    </div> 
  ); 
}

