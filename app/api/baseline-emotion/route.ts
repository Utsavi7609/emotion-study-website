import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { feelingScore, energyScore } = await req.json()

  // Validate numeric and clamp to [1,5]
  const fs = Number(feelingScore)
  const es = Number(energyScore)
  const inRange = (n: number) => typeof n === "number" && !Number.isNaN(n) && n >= 1 && n <= 5
  if (!inRange(fs) || !inRange(es)) {
    return NextResponse.json({ error: "Scores must be numbers between 1 and 5" }, { status: 400 })
  }

  const sql = getSql()

  // Detect current column types to decide float vs integer insert
  const [feelingCol] = await sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'baseline_emotions' AND column_name = 'feeling_score'
  `
  const [energyCol] = await sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'baseline_emotions' AND column_name = 'energy_score'
  `
  const feelingIsInt = feelingCol?.data_type === "integer"
  const energyIsInt = energyCol?.data_type === "integer"

  const toDbValue = (n: number, toInt: boolean) => (toInt ? Math.round(n) : Number(n.toFixed(2)))
  const fsDb = toDbValue(fs, feelingIsInt)
  const esDb = toDbValue(es, energyIsInt)

  await sql`
    INSERT INTO baseline_emotions (user_id, feeling_score, energy_score)
    VALUES (${session.userId}, ${fsDb}, ${esDb})
  `
  await sql`
    UPDATE user_progress SET baseline_emotion_done = TRUE, updated_at = NOW()
    WHERE user_id = ${session.userId}
  `
  return NextResponse.json({ ok: true })
}
