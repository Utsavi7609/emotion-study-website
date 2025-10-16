import { NextResponse } from "next/server"
import { getSql } from "@/lib/db"
import { setSession } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
  }
  const sql = getSql()
  const users = await sql`SELECT id, email, password_hash FROM users WHERE email = ${email}`
  const user = users[0]
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  await setSession({ userId: user.id, email: user.email })
  return NextResponse.json({ ok: true })
}
