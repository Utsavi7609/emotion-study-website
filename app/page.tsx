import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl">
        <div
          className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-[color:var(--color-secondary)] to-[color:var(--color-primary)]/10"
          aria-hidden="true"
        />
        <div className="rounded-3xl border bg-card p-6 md:p-10 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent-foreground">Academic Study</span>
            </div>
            <span className="text-xs text-muted-foreground">IRB-approved protocol</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-balance">Welcome to the Emotion Study</h1>
          <p className="text-sm md:text-base text-muted-foreground text-pretty">
            Watch short movie clips and share your emotional responses. Your progress is saved securely, and you can
            resume at any time.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button asChild className="sm:w-auto">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="secondary" className="sm:w-auto">
              <Link href="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
