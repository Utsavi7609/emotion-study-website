import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { scores, isBaseline } = await req.json()
  if (!scores || typeof scores !== "object") {
    return NextResponse.json({ error: "Invalid scores" }, { status: 400 })
  }
  const sql = getSql()
  await sql`
    INSERT INTO fatigue_logs (user_id, fatigue_scores, is_baseline)
    VALUES (${session.userId}, ${JSON.stringify(scores)}::jsonb, ${!!isBaseline})
  `
  if (isBaseline) {
    await sql`
      UPDATE user_progress
      SET baseline_fatigue_done = TRUE, updated_at = NOW()
      WHERE user_id = ${session.userId}
    `
  }
  return NextResponse.json({ ok: true })
}
