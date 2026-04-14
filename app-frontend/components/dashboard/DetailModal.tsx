
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
    Calendar,
    Share2,
    AlertCircle
} from "lucide-react"
import type { BriefingItem } from "@/lib/transformers"
import { TypeIcon } from "@/components/shared/TypeIcon"
import { PriorityBadge } from "@/components/shared/PriorityBadge"
import { FormattedContent } from "@/components/shared/FormattedContent"
import { GlassCard } from "@/components/shared/GlassCard"
import { useToast } from "@/hooks/use-toast"

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
    const { toast } = useToast();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl bg-background/95 border border-white/10 dark:border-white/5 relative"
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
                {/* Decorative Background Gradient */}
                <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent pointer-events-none" />

                {/* Header Section */}
                <div className="flex-shrink-0 p-8 pb-0 relative">
                    <div className="flex items-start justify-between gap-6">
                        <div className="flex gap-5">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-background to-muted shadow-lg border border-white/10 flex items-center justify-center flex-shrink-0"
                            >
                                <TypeIcon type={item.type} />
                            </motion.div>
                            <div className="space-y-2 pt-1">
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="text-2xl font-bold leading-tight"
                                >
                                    {item.title}
                                </motion.h2>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-3"
                                >
                                    <PriorityBadge priority={item.priority} />
                                    <div className="h-4 w-px bg-border" />
                                    <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 transition-colors uppercase text-[10px] tracking-wider font-semibold">
                                        {item.type}
                                    </Badge>
                                </motion.div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="rounded-full hover:bg-muted/50 -mt-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                    {/* Meta Information Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">Time</p>
                                <p className="text-sm font-semibold">{item.time}</p>
                            </div>
                        </div>
                        {item.sender && (
                            <div className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm group-hover:scale-105 transition-transform">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">From</p>
                                    <p className="text-sm font-semibold truncate max-w-[150px]">{item.sender}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Description */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            <h3>Overview</h3>
                        </div>
                        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed p-4 rounded-2xl bg-muted/30 border border-border/50">
                            <FormattedContent content={item.fullDescription || item.description} />
                        </div>
                    </div>

                    {/* Action Items Section */}
                    {item.actionItems && item.actionItems.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-foreground font-semibold">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                <h3>Action Items</h3>
                            </div>
                            <div className="grid gap-3">
                                {item.actionItems.map((action, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + (index * 0.1) }}
                                        className="flex items-start gap-4 p-4 rounded-2xl bg-background border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group"
                                    >
                                        <div className="w-6 h-6 rounded-full border-2 border-primary/30 group-hover:border-primary flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
                                            <span className="text-[10px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">{index + 1}</span>
                                        </div>
                                        <span className="text-sm text-foreground/90 leading-relaxed">{action}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tags Section */}
                    {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {item.tags.map((tag, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="px-3 py-1 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors rounded-full border border-border/50"
                                >
                                    #{tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Links Section */}
                    {item.relatedLinks && item.relatedLinks.length > 0 && (
                        <div className="pt-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Related Resources</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {item.relatedLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-sm font-medium transition-colors group"
                                    >
                                        {link.label}
                                        <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex-shrink-0 p-6 bg-muted/20 border-t border-border/50 backdrop-blur-sm">
                    <div className="flex gap-4">
                        <Button
                            className="flex-1 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-medium shadow-lg hover:shadow-primary/25 transition-all"
                            onClick={() => onMarkComplete(item.id)}
                        >
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Mark as Complete
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 h-12 rounded-xl border-border/50 hover:bg-muted/50 hover:border-border font-medium bg-background"
                            onClick={() => onSnooze(item.id)}
                        >
                            <Clock className="w-5 h-5 mr-2" />
                            Snooze for Later
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-xl border border-border/50 hover:bg-muted/50"
                            title="Share"
                            onClick={() => {
                                const shareText = `${item.type === 'email' ? 'Email' : item.type === 'calendar' ? 'Event' : item.type === 'social' ? 'Social' : 'Notion'}: ${item.title}\n\n${item.description}`;

                                if (navigator.share) {
                                    navigator.share({
                                        title: item.title,
                                        text: shareText,
                                    }).catch((error) => {
                                        console.log('Error sharing:', error);
                                        toast({
                                            title: "Sharing cancelled",
                                            description: "The share action was cancelled",
                                            variant: "destructive",
                                        });
                                    });
                                } else {
                                    // Fallback: copy to clipboard
                                    navigator.clipboard.writeText(shareText).then(() => {
                                        toast({
                                            title: "Copied to clipboard!",
                                            description: "The item details have been copied to your clipboard",
                                        });
                                    }).catch((error) => {
                                        console.error('Failed to copy:', error);
                                        toast({
                                            title: "Failed to copy",
                                            description: "Could not copy to clipboard. Please try again.",
                                            variant: "destructive",
                                        });
                                    });
                                }
                            }}
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}
