// "use client"
// import { useCallback, useMemo, useRef, useState } from "react"
// import type React from "react"

// type Labels = { x: string; y: string }

// export function EmotionGrid({
//   onChange,
//   initial,
//   labels = { x: "Feeling (Unpleasant → Pleasant)", y: "Energy (Calm → Excited)" },
// }: {
//   onChange: (feeling: number, energy: number) => void
//   initial?: { feeling: number; energy: number }
//   labels?: Labels
// }) {
//   const containerRef = useRef<HTMLDivElement | null>(null)
//   const pointerDownRef = useRef(false)
//   const pointerIdRef = useRef<number | null>(null)
//   const [sel, setSel] = useState<{ feeling: number; energy: number } | null>(initial ?? null)

//   const markerStyle = useMemo(() => {
//     if (!sel) return { display: "none" } as const
//     const left = ((sel.feeling - 1) / 4) * 100
//     const top = ((5 - sel.energy) / 4) * 100 // invert Y (top=5 → bottom=1)
//     return { left: `${left}%`, top: `${top}%` }
//   }, [sel])

//   const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

//   const pick = useCallback(
//     (evt: any) => {
//       const el = containerRef.current
//       if (!el) return
//       const rect = el.getBoundingClientRect()
//       let clientX: number | undefined
//       let clientY: number | undefined

//       // Touch event
//       if (evt.touches && evt.touches[0]) {
//         clientX = evt.touches[0].clientX
//         clientY = evt.touches[0].clientY
//       } else if (typeof evt.clientX === "number" && typeof evt.clientY === "number") {
//         // Mouse/Pointer event
//         clientX = evt.clientX
//         clientY = evt.clientY
//       } else if (evt.nativeEvent && evt.nativeEvent.touches && evt.nativeEvent.touches[0]) {
//         clientX = evt.nativeEvent.touches[0].clientX
//         clientY = evt.nativeEvent.touches[0].clientY
//       }
//       if (clientX === undefined || clientY === undefined) return

//       const xRatio = clamp((clientX - rect.left) / rect.width, 0, 1)
//       const yRatio = clamp((clientY - rect.top) / rect.height, 0, 1)
//       const feeling = 1 + 4 * xRatio
//       const energy = 1 + 4 * (1 - yRatio) // invert to make top high energy
//       const f = Number(feeling.toFixed(2))
//       const e = Number(energy.toFixed(2))
//       setSel({ feeling: f, energy: e })
//       onChange(f, e)
//     },
//     [onChange],
//   )

//   return (
//     <div className="space-y-3">
//       <div className="text-sm text-muted-foreground">
//         {sel
//           ? `Selected: Feeling (1–5) ${sel.feeling.toFixed(2)}, Energy (1–5) ${sel.energy.toFixed(2)}`
//           : "Click or tap anywhere in the plane to select. You can refine by dragging."}
//       </div>

//       <div className="relative rounded-md border bg-background p-2">
//         {/* Grid plane */}
//         <div
//           ref={containerRef}
//           className="relative w-full max-w-[360px] md:max-w-[480px] aspect-square rounded-md bg-white dark:bg-neutral-900 cursor-crosshair"
//           onPointerDown={(e) => {
//             // start tracking pointer and capture it for smooth dragging
//             pointerDownRef.current = true
//             pointerIdRef.current = e.pointerId
//             // @ts-ignore - safe to call on DOM node
//             containerRef.current?.setPointerCapture?.(e.pointerId)
//             pick(e.nativeEvent || e)
//           }}
//           onPointerMove={(e) => {
//             if (pointerDownRef.current) pick(e.nativeEvent || e)
//           }}
//           onPointerUp={(e) => {
//             pointerDownRef.current = false
//             // release pointer capture
//             if (pointerIdRef.current != null) {
//               try {
//                 // @ts-ignore
//                 containerRef.current?.releasePointerCapture?.(pointerIdRef.current)
//               } catch {}
//               pointerIdRef.current = null
//             }
//           }}
//           onPointerCancel={() => {
//             pointerDownRef.current = false
//             pointerIdRef.current = null
//           }}
//           onTouchStart={pick}
//           onTouchMove={pick}
//           onClick={pick}
//           role="application"
//           aria-label={`${labels.x}; ${labels.y}`}
//           tabIndex={0}
//         >
//           {/* Subtle 5x5 lines */}
//           <div
//             aria-hidden="true"
//             className="absolute inset-0 rounded-md pointer-events-none"
//             style={{
//               // Clearer grid lines with stronger contrast and slightly thicker lines
//               backgroundImage:
//                 "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
//               backgroundSize: "20% 100%, 100% 20%",
//               backgroundPosition: "0 0, 0 0",
//               backgroundRepeat: "repeat",
//             }}
//           />
//           {/* Marker */}
//           <div
//             aria-hidden="true"
//             className="absolute -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-primary bg-primary/20 shadow-sm"
//             style={markerStyle as any}
//           />
//         </div>
//       </div>

//       <div className="flex items-center justify-between text-xs text-muted-foreground">
//         <span className="sr-only">{labels.y}</span>
//         <span>{labels.x}</span>
//       </div>
//     </div>
//   )
// }


"use client"
import { useCallback, useMemo, useRef, useState } from "react"
import type React from "react"

type Labels = { x: string; y: string }

export function EmotionGrid({
  onChange,
  initial,
  labels = { x: "Feeling (Unpleasant → Pleasant)", y: "Energy (Calm → Excited)" },
}: {
  onChange: (feeling: number, energy: number) => void
  initial?: { feeling: number; energy: number }
  labels?: Labels
}) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const pointerDownRef = useRef(false)
  const pointerIdRef = useRef<number | null>(null)
  const [sel, setSel] = useState<{ feeling: number; energy: number } | null>(initial ?? null)

  const markerStyle = useMemo(() => {
    if (!sel) return { display: "none" } as const
    const left = ((sel.feeling - 1) / 4) * 100
    const top = ((5 - sel.energy) / 4) * 100 // invert Y (top=5 → bottom=1)
    return { left: `${left}%`, top: `${top}%` }
  }, [sel])

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

  const pick = useCallback(
    (evt: any) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      let clientX: number | undefined
      let clientY: number | undefined

      // Touch event
      if (evt.touches && evt.touches[0]) {
        clientX = evt.touches[0].clientX
        clientY = evt.touches[0].clientY
      } else if (typeof evt.clientX === "number" && typeof evt.clientY === "number") {
        // Mouse/Pointer event
        clientX = evt.clientX
        clientY = evt.clientY
      } else if (evt.nativeEvent && evt.nativeEvent.touches && evt.nativeEvent.touches[0]) {
        clientX = evt.nativeEvent.touches[0].clientX
        clientY = evt.nativeEvent.touches[0].clientY
      }
      if (clientX === undefined || clientY === undefined) return

      const xRatio = clamp((clientX - rect.left) / rect.width, 0, 1)
      const yRatio = clamp((clientY - rect.top) / rect.height, 0, 1)
      const feeling = 1 + 4 * xRatio
      const energy = 1 + 4 * (1 - yRatio) // invert to make top high energy
      const f = Number(feeling.toFixed(2))
      const e = Number(energy.toFixed(2))
      setSel({ feeling: f, energy: e })
      onChange(f, e)
    },
    [onChange],
  )

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">
        {sel
          ? `Selected: Feeling (1–5) ${sel.feeling.toFixed(2)}, Energy (1–5) ${sel.energy.toFixed(2)}`
          : "Click or tap anywhere in the plane to select. You can refine by dragging."}
      </div>

      <div className="relative flex items-center justify-center">
        {/* Y-axis label */}
        <div className="absolute -left-8 transform -rotate-90 text-xs text-muted-foreground">
          {labels.y}
        </div>

        {/* Grid plane */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[360px] md:max-w-[480px] aspect-square rounded-md bg-white dark:bg-neutral-900 cursor-crosshair"
          onPointerDown={(e) => {
            // start tracking pointer and capture it for smooth dragging
            pointerDownRef.current = true
            pointerIdRef.current = e.pointerId
            // @ts-ignore - safe to call on DOM node
            containerRef.current?.setPointerCapture?.(e.pointerId)
            pick(e.nativeEvent || e)
          }}
          onPointerMove={(e) => {
            if (pointerDownRef.current) pick(e.nativeEvent || e)
          }}
          onPointerUp={(e) => {
            pointerDownRef.current = false
            // release pointer capture
            if (pointerIdRef.current != null) {
              try {
                // @ts-ignore
                containerRef.current?.releasePointerCapture?.(pointerIdRef.current)
              } catch {}
              pointerIdRef.current = null
            }
          }}
          onPointerCancel={() => {
            pointerDownRef.current = false
            pointerIdRef.current = null
          }}
          onTouchStart={pick}
          onTouchMove={pick}
          onClick={pick}
          role="application"
          aria-label={`${labels.x}; ${labels.y}`}
          tabIndex={0}
        >
          {/* Subtle 5x5 lines */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-md pointer-events-none"
            style={{
              // Clearer grid lines with stronger contrast and slightly thicker lines
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)",
              backgroundSize: "20% 100%, 100% 20%",
              backgroundPosition: "0 0, 0 0",
              backgroundRepeat: "repeat",
            }}
          />
          {/* Marker */}
          <div
            aria-hidden="true"
            className="absolute -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-primary bg-primary/20 shadow-sm"
            style={markerStyle as any}
          />
        </div>
      </div>

      <div className="flex items-center justify-center text-xs text-muted-foreground">
        <span>{labels.x}</span>
      </div>
    </div>
  )
}
