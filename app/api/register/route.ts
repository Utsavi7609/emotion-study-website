import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { setSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { name, email, password, gender, age, watchesEnglishMovies } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
  }
  const sql = getSql()
  try {
    const password_hash = await bcrypt.hash(password, 10)
    // Create user
    const users = await sql`
      INSERT INTO users (email, name, password_hash, gender, age, watches_english_movies)
      VALUES (${email}, ${name ?? null}, ${password_hash}, ${gender ?? null}, ${age ?? null}, ${watchesEnglishMovies ?? null})
      RETURNING id, email
    `
    const user = users[0]

    // Generate randomized sequence
    await sql`
      INSERT INTO user_clip_sequences (user_id, clip_id, sequence_order)
      SELECT ${user.id}::int, mc.id, seq.seq
      FROM movie_clips mc
      JOIN (
        SELECT id, ROW_NUMBER() OVER () AS seq
        FROM (SELECT id FROM movie_clips ORDER BY RANDOM()) r
      ) AS seq ON seq.id = mc.id
    `

    // Initialize progress
    await sql`
      INSERT INTO user_progress (user_id) VALUES (${user.id})
      ON CONFLICT (user_id) DO NOTHING
    `

    await setSession({ userId: user.id, email: user.email })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    const msg = e?.message?.includes("unique") ? "Email already registered" : "Registration failed"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
