"use client"
import { Button } from "@/components/ui/button"
import useSWR from "swr"
import { useState, useMemo } from "react"
import { Progress } from "@/components/ui/progress"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function VideoPlayerCard({ onReport, onBreak }: { onReport: () => void; onBreak: () => void }) {
  const { data, isLoading, error, mutate } = useSWR("/api/next-clip", fetcher)
  const clip = data?.clip
  const [playing, setPlaying] = useState(false)

  const pct = useMemo(() => {
    if (!clip?.sequence_order || !clip?.total) return 0
    return Math.round(((clip.sequence_order - 1) / clip.total) * 100)
  }, [clip?.sequence_order, clip?.total])

  if (error) {
    return (
      <div className="rounded-lg border bg-destructive/5 p-6 space-y-3">
        <h3 className="text-base font-semibold text-destructive">Unable to load next clip</h3>
        <p className="text-sm text-muted-foreground">
          Please try again. If this persists, your scores may not have saved correctly.
        </p>
        <Button variant="secondary" onClick={() => mutate()}>
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return <div className="rounded-lg border bg-card p-6">Loading next clip...</div>
  }
  if (!clip) {
    return (
      <div className="rounded-lg border bg-card p-6 space-y-2">
        <h2 className="text-lg font-medium">All clips completed</h2>
        <p className="text-sm text-muted-foreground">Thank you for participating in the study!</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-primary">Emotion Study</span>
          </div>
          <h2 className="text-lg font-semibold">{clip.title}</h2>
          <span className="text-sm text-muted-foreground">
            Video {clip.sequence_order} of {clip.total}
          </span>
        </div>
        <div className="min-w-[120px]">
          <Progress value={pct} />
          <div className="mt-1 text-right text-xs text-muted-foreground">{pct}%</div>
        </div>
      </div>
      <video
        className="w-full rounded-md"
        src={clip.file_url}
        controls
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="flex items-center gap-2">
        <Button onClick={onReport} disabled={!clip}>
          Report emotions
        </Button>
        <Button variant="secondary" onClick={onBreak}>
          Take a break
        </Button>
      </div>
    </div>
  )
}
