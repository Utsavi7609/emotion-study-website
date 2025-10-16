import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ user: null })
  const sql = getSql()
  const [progress] = await sql`
    SELECT baseline_emotion_done, baseline_fatigue_done, last_completed_sequence_order
    FROM user_progress WHERE user_id = ${session.userId}
  `
  const [{ count }] =
    await sql`SELECT COUNT(*)::int AS count FROM user_clip_sequences WHERE user_id = ${session.userId}`
  return NextResponse.json({
    user: { id: session.userId, email: session.email },
    progress: progress ?? null,
    totalClips: count ?? 0,
  })
}
