"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    setLoading(true)
    setErr("")
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setErr(data.error || "Login failed")
      return
    }
    router.push("/study")
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-lg border bg-card p-6 md:p-8 space-y-4">
        <h1 className="text-xl font-semibold">Log In</h1>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        {err ? <p className="text-sm text-destructive">{err}</p> : null}
        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  )
}
