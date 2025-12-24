
import { BriefingItem } from "@/lib/transformers"
import { Mail, Calendar, Bell, CheckCircle2 } from "lucide-react"

export function TypeIcon({ type }: { type: BriefingItem["type"] }) {
    const icons = {
        email: Mail,
        event: Calendar,
        reminder: Bell,
        task: CheckCircle2,
    }

    const Icon = icons[type]
    return <Icon className="w-5 h-5 text-primary" />
}
