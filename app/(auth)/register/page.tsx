"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    watchesEnglishMovies: "Yes",
  })
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit() {
    setLoading(true)
    setErr("")
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        gender: form.gender || null,
        age: form.age ? Number(form.age) : null,
        watchesEnglishMovies: form.watchesEnglishMovies === "Yes",
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      setErr(data.error || "Registration failed")
      return
    }
    router.push("/study")
  }

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-lg border bg-card p-6 md:p-8 space-y-4">
        <h1 className="text-xl font-semibold">Tell Us About Yourself</h1>
        <div className="grid grid-cols-1 gap-3">
          <div className="grid gap-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              placeholder="e.g., Female"
              value={form.gender}
              onChange={(e) => setForm((s) => ({ ...s, gender: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              min={1}
              value={form.age}
              onChange={(e) => setForm((s) => ({ ...s, age: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="wem">Do you watch English movies in general?</Label>
            <select
              id="wem"
              className="rounded-md border bg-background p-2"
              value={form.watchesEnglishMovies}
              onChange={(e) => setForm((s) => ({ ...s, watchesEnglishMovies: e.target.value }))}
            >
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>
        {err ? <p className="text-sm text-destructive">{err}</p> : null}
        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={loading}>
            {loading ? "Creating..." : "Create Account"}
          </Button>
          <Button variant="secondary" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  )
}
