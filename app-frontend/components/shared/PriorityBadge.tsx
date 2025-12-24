
import { Badge } from "@/components/ui/badge"

export function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
    const colors = {
        high: "bg-secondary/20 text-secondary border-secondary/30",
        medium: "bg-accent/20 text-accent border-accent/30",
        low: "bg-success/20 text-success border-success/30",
    }

    return (
        <Badge variant="outline" className={`${colors[priority]} capitalize font-medium`}>
            {priority}
        </Badge>
    )
}
