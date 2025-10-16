"use client"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const EMOTIONS = ["Happy", "Excited", "Moved", "Anxious", "Sad", "Angry", "Calm", "Surprised", "Other"] as const
type Emotion = (typeof EMOTIONS)[number]

export function EmotionSelection({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: { selections: { emotion: string; intensity: number }[] }) => void
  onCancel: () => void
}) {
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const selectedList = useMemo(() => EMOTIONS.filter((e) => selected[e]), [selected])
  const [intensities, setIntensities] = useState<Record<string, number>>({})
  const [otherLabel, setOtherLabel] = useState("")

  function toggle(emotion: Emotion) {
    setSelected((s) => ({ ...s, [emotion]: !s[emotion] }))
  }

  function handleSubmit() {
    const payload = selectedList.map((e) => {
      const label = e === "Other" ? otherLabel.trim() || "Other" : e
      const intensity = intensities[label] ?? 0
      return { emotion: label, intensity }
    })
    onSubmit({ selections: payload })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Which emotion(s) did the video make you feel?</h3>
        <p className="text-sm text-muted-foreground">Select all that apply.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {EMOTIONS.map((e) => (
          <label key={e} className="flex items-center gap-2 rounded-md border p-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!selected[e]}
              onChange={() => toggle(e)}
              aria-label={`Select ${e}`}
            />
            <span>{e}</span>
          </label>
        ))}
      </div>

      {selectedList.includes("Other") && (
        <div className="flex items-center gap-2">
          <Label htmlFor="other">Specify other</Label>
          <Input
            id="other"
            placeholder="e.g., Nostalgic"
            value={otherLabel}
            onChange={(e) => setOtherLabel(e.target.value)}
          />
        </div>
      )}

      {selectedList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Rate intensity (0–10)</h4>
          <div className="space-y-3">
            {selectedList.map((e) => {
              const label = e === "Other" ? otherLabel.trim() || "Other" : e
              return (
                <div key={e} className="grid grid-cols-1 md:grid-cols-[140px_1fr_56px] items-center gap-2">
                  <span className="text-sm">{label}</span>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={intensities[label] ?? 0}
                    onChange={(ev) => setIntensities((s) => ({ ...s, [label]: Number(ev.target.value) }))}
                  />
                  <span className="text-right text-sm text-muted-foreground">{intensities[label] ?? 0}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button onClick={handleSubmit} disabled={selectedList.length === 0}>
          Continue
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  )
}
