import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getSql } from "@/lib/db"

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { clipId, inducedEmotions, perceivedFeelingScore, perceivedEnergyScore } = await req.json()

  if (!clipId || !Array.isArray(inducedEmotions)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const pfs = Number(perceivedFeelingScore)
  const pes = Number(perceivedEnergyScore)
  const inRange = (n: number) => typeof n === "number" && !Number.isNaN(n) && n >= 1 && n <= 5
  if (!inRange(pfs) || !inRange(pes)) {
    return NextResponse.json({ error: "Perceived scores must be numbers between 1 and 5" }, { status: 400 })
  }

  const sql = getSql()

  // Detect current column types to decide float vs integer insert
  const [pfCol] = await sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'emotion_responses' AND column_name = 'perceived_feeling_score'
  `
  const [peCol] = await sql`
    SELECT data_type FROM information_schema.columns
    WHERE table_name = 'emotion_responses' AND column_name = 'perceived_energy_score'
  `
  const pfIsInt = pfCol?.data_type === "integer"
  const peIsInt = peCol?.data_type === "integer"

  const toDbValue = (n: number, toInt: boolean) => (toInt ? Math.round(n) : Number(n.toFixed(2)))
  const pfsDb = toDbValue(pfs, pfIsInt)
  const pesDb = toDbValue(pes, peIsInt)

  await sql`
    INSERT INTO emotion_responses (user_id, clip_id, induced_emotions, perceived_feeling_score, perceived_energy_score)
    VALUES (${session.userId}, ${clipId}, ${JSON.stringify(inducedEmotions)}::jsonb, ${pfsDb}, ${pesDb})
  `
  const [seq] = await sql`
    SELECT sequence_order FROM user_clip_sequences
    WHERE user_id = ${session.userId} AND clip_id = ${clipId}
  `
  if (seq) {
    await sql`
      UPDATE user_progress
      SET last_completed_sequence_order = GREATEST(last_completed_sequence_order, ${seq.sequence_order}), updated_at = NOW()
      WHERE user_id = ${session.userId}
    `
  }
  return NextResponse.json({ ok: true })
}
