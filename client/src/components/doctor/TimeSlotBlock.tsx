import { Trash2 } from "lucide-react";
import { TimeSlot } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface TimeSlotBlockProps {
  timeSlot: TimeSlot;
  onRemove: () => void;
}

const TimeSlotBlock = ({ timeSlot, onRemove }: TimeSlotBlockProps) => {
  // Format time for display (e.g., "9:00 - 17:00")
  const formatTime = (time: string) => {
    return time;
  };

  return (
    <div className="flex items-center justify-between bg-neutral-50 p-2 rounded-md text-xs border">
      <span className="font-medium">
        {formatTime(timeSlot.start)} - {formatTime(timeSlot.end)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" />
        <span className="sr-only">Remove time slot</span>
      </Button>
    </div>
  );
};

export default TimeSlotBlock;