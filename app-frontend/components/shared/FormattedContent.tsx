
import React from "react"

export function FormattedContent({ content }: { content: string }) {
    // Decode HTML entities
    const decodeHtml = (text: string) => {
        const entities: { [key: string]: string } = {
            '&#39;': "'",
            '&quot;': '"',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>'
        }
        return Object.entries(entities).reduce((str, [entity, char]) =>
            str.replace(new RegExp(entity, 'g'), char), text
        )
    }

    const formatContent = (text: string) => {
        const decoded = decodeHtml(text)
        const sections = decoded.split(/(?=^[A-Z][A-Z\s]+:)/m).filter(Boolean)

        return sections.map((section, index) => {
            const lines = section.trim().split('\n').filter(Boolean)
            if (lines.length === 0) return null

            const firstLine = lines[0]
            const titleMatch = firstLine.match(/^([A-Z][A-Z\s]+):/)

            if (titleMatch) {
                const title = titleMatch[1].trim()
                const content = lines.slice(1).join('\n')
                const icon = getIconForSection(title)

                return (
                    <div key={index} className="mb-6 bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-lg">{icon}</span>
                            <h4 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                                {title}
                            </h4>
                        </div>
                        <div className="space-y-2">
                            {content.split('\n').map((line, i) => {
                                const trimmed = line.trim()
                                if (!trimmed) return null

                                if (trimmed.startsWith('•') || trimmed.match(/^\d+\./)) {
                                    return (
                                        <div key={i} className="flex items-start gap-3 p-2 bg-background/50 rounded">
                                            <span className="text-primary text-sm mt-0.5">•</span>
                                            <span className="flex-1 text-sm">{trimmed.replace(/^[•\d\.\s]+/, '')}</span>
                                        </div>
                                    )
                                }

                                return (
                                    <p key={i} className="text-sm leading-relaxed p-2 bg-background/50 rounded">
                                        {trimmed}
                                    </p>
                                )
                            })}
                        </div>
                    </div>
                )
            }

            return (
                <div key={index} className="mb-4 p-3 bg-muted/20 rounded">
                    <p className="text-sm leading-relaxed">{section.trim()}</p>
                </div>
            )
        })
    }

    const getIconForSection = (title: string) => {
        const icons: { [key: string]: string } = {
            'TOP PRIORITIES': '🔥',
            'TODAY\'S SCHEDULE': '📅',
            'ACTION ITEMS': '✅',
            'COMMUNICATIONS': '💬',
            'PREPARATION NEEDED': '📋',
            'STRATEGIC INSIGHTS': '💡',
            'RECOMMENDATIONS': '⭐',
            'NEXT STEPS': '➡️'
        }
        return icons[title] || '📌'
    }

    return <div className="space-y-4">{formatContent(content)}</div>
}
