const timelineEvents = [
    {
        year: "2016",
        title: "創立元年",
        description: "《越南華商採購名錄》正式創刊，首度為越南華商建立完整的企業資訊平台。",
    },
    {
        year: "2018",
        title: "擴展產業",
        description: "涵蓋產業從原有的紡織、鞋類擴展至電子、機械、塑膠等多元領域。",
    },
    {
        year: "2020",
        title: "數位轉型",
        description: "推出華商採購網線上平台，突破紙本限制，提供全年無休的商務服務。",
    },
    {
        year: "2022",
        title: "國際連結",
        description: "與台灣、中國、東南亞各地商會建立合作關係，擴大商業網絡。",
    },
    {
        year: "2024",
        title: "智慧升級",
        description: "導入智慧搜尋與企業媒合功能，提升平台使用體驗與商機轉換率。",
    },
]

export default function HorizontalTimeline() {
    return (
        <div className="relative">
            {/* Horizontal line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-primary/50 to-primary/20" />

            <div className="grid grid-cols-5 gap-2">
                {timelineEvents.map((event) => (
                    <div key={event.year} className="relative pt-8">
                        {/* Dot */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-4 border-background bg-primary shadow-sm" />

                        {/* Content */}
                        <div className="px-1 text-center">
                            <span className="mb-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                {event.year}
                            </span>
                            <h3 className="mb-1 text-sm font-bold text-foreground">{event.title}</h3>
                            <p className="text-xs leading-relaxed text-muted-foreground">{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
