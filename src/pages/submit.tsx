import Head from "next/head"
import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { EventForm } from "@/components/events/EventForm"
import { useToast } from "@/hooks/use-toast"
import { SEO } from "@/components/SEO"
import { supabase } from "@/integrations/supabase/client"
import { authService } from "@/services/authService"

export default function SubmitPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authSubmitting, setAuthSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const current = await authService.getCurrentSession()
      if (mounted) {
        setSession(current)
        setIsLoading(false)
      }
    })()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setAuthSubmitting(true)
    try {
      const { error } = await authService.signIn(email, password)
      if (error) {
        toast({ title: "Login failed", description: error.message ?? "Check your credentials", variant: "destructive" })
        return
      }
      toast({ title: "Logged in", description: "You can now submit events." })
    } finally {
      setAuthSubmitting(false)
    }
  }

  async function handleLogout() {
    await authService.signOut()
    toast({ title: "Logged out" })
  }

  const isAuthed = Boolean(session?.user)

  return (
    <>
      <SEO title="Submit an Event | Springfield Events" description="Organizers can submit local events for inclusion on the Springfield events map." />
      <Head>
        <title>Submit an Event</title>
      </Head>
      <main className="min-h-screen py-12 px-4 md:px-8 bg-background text-foreground">
        <div className="mx-auto max-w-5xl space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">Submit an Event</h1>
              <p className="text-muted-foreground mt-1">Sign in to submit your event for review. Approved events appear on the public map.</p>
            </div>
            {isAuthed && (
              <Button variant="secondary" onClick={handleLogout}>Log out</Button>
            )}
          </header>

          {isLoading ? (
            <p>Loading...</p>
          ) : isAuthed ? (
            <EventForm />
          ) : (
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Organizer Login</CardTitle>
                <CardDescription>Use your email and password to sign in.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Separator />
                  <div>
                    <Button type="submit" disabled={authSubmitting}>
                      {authSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </>
  )
}