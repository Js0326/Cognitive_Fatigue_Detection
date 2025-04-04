import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Clock, Eye, MousePointer } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "eye",
    message: "Elevated blink rate detected",
    time: "5 minutes ago",
    icon: Eye,
    severity: "warning",
  },
  {
    id: 2,
    type: "mouse",
    message: "Decreased mouse precision",
    time: "15 minutes ago",
    icon: MousePointer,
    severity: "warning",
  },
  {
    id: 3,
    type: "cognitive",
    message: "Completed memory recall test",
    time: "45 minutes ago",
    icon: Brain,
    severity: "info",
  },
  {
    id: 4,
    type: "idle",
    message: "Extended period of inactivity",
    time: "1 hour ago",
    icon: Clock,
    severity: "info",
  },
  {
    id: 5,
    type: "eye",
    message: "Long fixation time detected",
    time: "1.5 hours ago",
    icon: Eye,
    severity: "error",
  },
]

export function ActivityLog({ activities }: { activities: { id: number; type: string; message: string; time: string; severity: string; icon?: React.ElementType; }[] }) {
  // Function to get icon based on activity type
  const getIconForType = (type: string): React.ElementType => {
    switch (type.toLowerCase()) {
      case 'eye':
        return Eye;
      case 'mouse':
        return MousePointer;
      case 'cognitive':
        return Brain;
      case 'idle':
      default:
        return Clock;
    }
  };

  return (
    <ScrollArea className="h-[300px] pr-4">
      <div className="space-y-4">
        {activities.map((activity) => {
          // Use provided icon or get default based on type
          const IconComponent = activity.icon || getIconForType(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start gap-3 rounded-lg p-2 hover:bg-muted/50">
              <div
                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                  activity.severity === "error"
                    ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
                    : activity.severity === "warning"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
                }`}
              >
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

