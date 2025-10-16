"use client"
import useSWR from "swr"
const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ProgressHeader() {
  const { data, error } = useSWR("/api/me", fetcher)
  if (error) {
    return <div className="text-sm text-destructive">Unable to load sequence</div>
  }
  if (!data?.user) return null
  const done = data?.progress?.last_completed_sequence_order ?? 0
  const total = data?.totalClips ?? 0
  return (
    <div className="text-sm text-muted-foreground">
      {total > 0 ? `Progress: Video ${Math.min(done + 1, total)} of ${total}` : "Preparing next video..."}
    </div>
  )
}
