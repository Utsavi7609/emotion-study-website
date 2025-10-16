"use client"
import { useEffect, useMemo, useState } from "react"
import { toast } from "@/hooks/use-toast"
import useSWR, { mutate } from "swr"
import { ProgressHeader } from "@/components/progress-header"
import { VideoPlayerCard } from "@/components/video-player-card"
import { EmotionSelection } from "@/components/emotion-selection"
import { EmotionGrid } from "@/components/emotion-grid"
import { FatigueForm } from "@/components/fatigue-form"
import { Button } from "@/components/ui/button"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Stage =
  | "baseline-emotion"
  | "baseline-fatigue"
  | "watch"
  | "induced-select"
  | "induced-intensity"
  | "perceived-grid"
  | "break"
  | "done"

export default function StudyPage() {
  const { data: me } = useSWR("/api/me", fetcher)
  const [stage, setStage] = useState<Stage>("watch")
  const needsBaselineEmotion = me?.user && me?.progress && me.progress.baseline_emotion_done === false
  const needsBaselineFatigue = me?.user && me?.progress && me.progress.baseline_fatigue_done === false

  useEffect(() => {
    if (!me?.user) return
    if (needsBaselineEmotion) setStage("baseline-emotion")
    else if (needsBaselineFatigue) setStage("baseline-fatigue")
    else setStage("watch")
  }, [me?.user, needsBaselineEmotion, needsBaselineFatigue])

  const [baselineSel, setBaselineSel] = useState<{ feeling: number; energy: number } | null>(null)
  const [inducedPayload, setInducedPayload] = useState<{ selections: { emotion: string; intensity: number }[] } | null>(
    null,
  )
  const [perceived, setPerceived] = useState<{ feeling: number; energy: number } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submitBaselineEmotion() {
    if (!baselineSel) return
    await fetch("/api/baseline-emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feelingScore: baselineSel.feeling, energyScore: baselineSel.energy }),
    })
    await mutate("/api/me")
    setStage("baseline-fatigue")
  }

  async function submitPerClip(clipId: number) {
    try {
      setSubmitting(true)
      const t = toast({ title: "Submitting…", description: "Saving your responses" })
      // Add a client-side timeout so a hung request doesn't block the UI
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const res = await fetch("/api/submit-emotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId,
          inducedEmotions: inducedPayload?.selections ?? [],
          perceivedFeelingScore: perceived?.feeling,
          perceivedEnergyScore: perceived?.energy,
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) {
        const text = await res.text()
        console.error("submitPerClip failed", text)
  t.update({ id: t.id, title: "Submission failed", description: text })
      } else {
  t.update({ id: t.id, title: "Submitted", description: "Your responses were saved" })
      }
    } catch (err) {
      // Network error / timeout — continue anyway but log for debugging
      console.error("submitPerClip error", err)
      toast({ title: "Submission error", description: String(err) })
    }

  // Reset local selections immediately so the UI is responsive
    setInducedPayload(null)
    setPerceived(null)

    // Refresh the next-clip and me data in the background; don't await so we
    // don't block the UI if the requests are slow.
    void mutate("/api/next-clip")
    void mutate("/api/me")

    setStage("watch")
    setSubmitting(false)
  }

  const Actions = useMemo(() => {
    if (stage === "baseline-emotion") {
      return (
        <div className="rounded-lg border bg-card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Your Current Emotion</h2>
          <EmotionGrid
            onChange={(f, e) => setBaselineSel({ feeling: f, energy: e })}
            initial={baselineSel ?? undefined}
          />
          <div className="flex items-center gap-2">
            <Button onClick={submitBaselineEmotion} disabled={!baselineSel}>
              Confirm baseline
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Click and drag within the plane for finer selection. Values support decimals.
          </div>
        </div>
      )
    }
    if (stage === "baseline-fatigue") {
      return (
        <div className="rounded-lg border bg-card p-4 md:p-6 space-y-4">
          <FatigueForm
            isBaseline
            onSubmitted={async () => {
              await mutate("/api/me")
              setStage("watch")
            }}
          />
        </div>
      )
    }
    if (stage === "break") {
      return (
        <div className="rounded-lg border bg-card p-4 md:p-6 space-y-4">
          <h2 className="text-lg font-semibold">Break</h2>
          <FatigueForm onSubmitted={() => setStage("watch")} />
          <div className="text-sm text-muted-foreground">You can resume the study anytime.</div>
        </div>
      )
    }
    return null
  }, [stage, baselineSel])

  return (
    <main className="min-h-dvh p-4 flex items-start justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Emotion Study</h1>
          <ProgressHeader />
        </div>

        {Actions}

        {stage === "watch" && (
          <VideoAndReport
            onBreak={() => setStage("break")}
            // Don't change the top-level `stage` when the user begins reporting.
            // VideoAndReport manages its own internal phases (video -> induced -> perceived).
            onReport={() => {}}
            onPerceivedComplete={(clipId) => submitPerClip(clipId)}
            onBackToWatch={() => setStage("watch")}
            onInducedSubmit={(payload) => {
              // Only record the induced payload here. Let VideoAndReport manage
              // its internal phase transitions (induced -> perceived) so the
              // component doesn't get unmounted by a top-level stage change.
              setInducedPayload(payload)
            }}
            onPerceivedSelect={(f, e) => setPerceived({ feeling: f, energy: e })}
            perceived={perceived}
          />
        )}
      </div>
    </main>
  )
}

function VideoAndReport({
  onBreak,
  onReport,
  onPerceivedComplete,
  onBackToWatch,
  onInducedSubmit,
  onPerceivedSelect,
  perceived,
}: {
  onBreak: () => void
  onReport: () => void
  onPerceivedComplete: (clipId: number) => void
  onBackToWatch: () => void
  onInducedSubmit: (payload: { selections: { emotion: string; intensity: number }[] }) => void
  onPerceivedSelect: (f: number, e: number) => void
  perceived: { feeling: number; energy: number } | null
}) {
  const { data } = useSWR("/api/next-clip", (url) => fetch(url).then((r) => r.json()))
  const clip = data?.clip
  const [phase, setPhase] = useState<"video" | "induced" | "perceived">("video")

  useEffect(() => {
    setPhase("video")
  }, [clip?.clip_id])

  if (!clip) return null

  return (
    <div className="space-y-4">
      {phase === "video" && (
        <VideoPlayerCard
          onReport={() => {
            onReport()
            setPhase("induced")
          }}
          onBreak={onBreak}
        />
      )}
      {phase === "induced" && (
        <div className="rounded-lg border bg-card p-4 md:p-6">
          <EmotionSelection
            onSubmit={(payload) => {
              onInducedSubmit(payload)
              setPhase("perceived")
            }}
            onCancel={() => {
              onBackToWatch()
              setPhase("video")
            }}
          />
        </div>
      )}
      {phase === "perceived" && (
        <div className="rounded-lg border bg-card p-4 md:p-6 space-y-4">
          <h3 className="text-base font-semibold">What mood did the video convey?</h3>
          <EmotionGrid onChange={onPerceivedSelect} initial={perceived ?? undefined} />
          <div className="flex items-center gap-2">
            <Button
              onClick={async () => {
                // Wait for parent to submit the perceived scores, then reset local phase
                // so the VideoAndReport flow returns to the video state even if the
                // next clip hasn't been returned yet.
                await onPerceivedComplete(clip.clip_id)
                setPhase("video")
              }}
              disabled={!perceived}
            >
              Submit & Continue
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setPhase("induced")
              }}
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
