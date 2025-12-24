
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    X,
    Clock,
    UserIcon,
    Tag,
    CheckCircle2,
    ExternalLink,
    ArrowRight,
} from "lucide-react"
import type { BriefingItem } from "@/lib/transformers"
import { TypeIcon } from "@/components/shared/TypeIcon"
import { PriorityBadge } from "@/components/shared/PriorityBadge"
import { FormattedContent } from "@/components/shared/FormattedContent"

export function DetailModal({
    item,
    onClose,
    onMarkComplete,
    onSnooze
}: {
    item: BriefingItem;
    onClose: () => void;
    onMarkComplete: (itemId: string) => void;
    onSnooze: (itemId: string) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl p-8 shadow-2xl"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <TypeIcon type={item.type} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-balance text-foreground mb-2">{item.title}</h2>
                            <div className="flex items-center gap-2 flex-wrap">
                                <PriorityBadge priority={item.priority} />
                                <Badge variant="outline" className="capitalize">
                                    {item.type}
                                </Badge>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-muted rounded-full flex-shrink-0">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Time and Sender */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{item.time}</span>
                    </div>
                    {item.sender && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <UserIcon className="w-4 h-4" />
                            <span className="text-sm">{item.sender}</span>
                        </div>
                    )}
                </div>

                {/* Full Description */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">Details</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground">
                        <FormattedContent content={item.fullDescription || item.description} />
                    </div>
                </div>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="bg-muted/50">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Items */}
                {item.actionItems && item.actionItems.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Action Items
                        </h3>
                        <ul className="space-y-2">
                            {item.actionItems.map((action, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-xs font-semibold text-primary">{index + 1}</span>
                                    </div>
                                    <span className="text-sm text-foreground">{action}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Related Links */}
                {item.relatedLinks && item.relatedLinks.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                            <ExternalLink className="w-4 h-4" />
                            Related Links
                        </h3>
                        <div className="space-y-2">
                            {item.relatedLinks.map((link, index) => (
                                <motion.a
                                    key={index}
                                    href={link.url}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-primary/10 hover:text-primary transition-colors group"
                                >
                                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">{link.label}</span>
                                    <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex gap-3 pt-6 border-t border-border">
                    <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => onMarkComplete(item.id)}
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Mark as Complete
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => onSnooze(item.id)}
                    >
                        <Clock className="w-4 h-4 mr-2" />
                        Snooze
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    )
}
