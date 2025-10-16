import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const sql = getSql()
  const [prog] = await sql`SELECT last_completed_sequence_order FROM user_progress WHERE user_id = ${session.userId}`
  const nextOrder = (prog?.last_completed_sequence_order ?? 0) + 1
  const rows = await sql`
    SELECT m.id as clip_id, m.title, m.file_url, m.duration_seconds,
           s.sequence_order, t.total
    FROM user_clip_sequences s
    JOIN movie_clips m ON m.id = s.clip_id
    JOIN (
      SELECT COUNT(*)::int AS total FROM user_clip_sequences WHERE user_id = ${session.userId}
    ) t ON TRUE
    WHERE s.user_id = ${session.userId} AND s.sequence_order = ${nextOrder}
  `
  const clip = rows[0] ?? null
  return NextResponse.json({ clip })
}
