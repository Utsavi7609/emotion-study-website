"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"

// const QUESTIONS = Array.from({ length: 18 }, (_, i) => `Question ${i + 1}`)
const QUESTIONS = [
  "1.How tired do you feel right now?",
  "2.How sleepy do you feel right now??",
  "3.How drowsy do you feel right now?",
  "4.How fatigued do you feel?",
  "5.How wornout do you feel?",
  "6.How energetic do you feel to complete tasks?",
  "7.How active do you feel?",
  "8.How vigorous do you feel?",
  "9.How efficient do you feel?",
  "10.How lively do you feel?",
  "11.How bushed do you feel?",
  "12.How exhausted do you feel?",
  "13.How much effort does it take to keep your eyes open?",
  "14.How much effort does it take to move your body?",
  "15.How much effort does it take to concentrate?",
  "16.How much effort does it take to carry on a conversation?",
  "17.How strong is your desire to close your eyes?",
  "18.How strong is your desire to lie down?"
]
export function FatigueForm({
  onSubmitted,
  isBaseline = false,
}: {
  onSubmitted: () => void
  isBaseline?: boolean
}) {
  const [scores, setScores] = useState<Record<string, number>>({})

  async function submit() {
    await fetch("/api/fatigue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores, isBaseline }),
    })
    onSubmitted()
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">{isBaseline ? "Baseline Fatigue Assessment" : "Fatigue Assessment"}</h3>
        <p className="text-sm text-muted-foreground">Use the sliders to indicate your current state.</p>
      </div>
      <div className="space-y-3">
        {QUESTIONS.map((q) => (
          <div key={q} className="grid grid-cols-1 md:grid-cols-[1fr_56px] items-center gap-2 rounded-md border p-3">
            <label className="text-sm">{q}</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={10}
                aria-label={q}
                value={scores[q] ?? 0}
                onChange={(e) => setScores((s) => ({ ...s, [q]: Number(e.target.value) }))}
              />
              <span className="text-sm text-muted-foreground w-8 text-right">{scores[q] ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={submit}>Submit</Button>
    </div>
  )
}
