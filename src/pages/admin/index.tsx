import Head from "next/head"
import { useEffect, useState, FormEvent } from "react"
import type { Session } from "@supabase/supabase-js"
import { SEO } from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/authService"
import { adminService } from "@/services/adminService"
import type { EventItem } from "@/services/eventService"
import { supabase } from "@/integrations/supabase/client"

function formatISOBrief(iso: string): string {
  try {
    const s = new Date(iso).toISOString()
    return s.replace("T", " ").slice(0, 16) + "Z"
  } catch {
    return iso
  }
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [pending, setPending] = useState<EventItem[]>([])
  const [approved, setApproved] = useState<EventItem[]>([])
  const [loadingLists, setLoadingLists] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const current = await authService.getCurrentSession()
      if (!mounted) return
      setSession(current)
      if (current?.user) {
        const check = await adminService.isAdmin()
        if (!mounted) return
        setIsAdmin(check.isAdmin)
      }
      setCheckingAdmin(false)
    })()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isAdmin) return
    refreshLists()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin])

  async function refreshLists() {
    setLoadingLists(true)
    const [p, a] = await Promise.all([adminService.listPending(), adminService.listApproved()])
    if (p.error) toast({ title: "Error loading pending", description: p.error, variant: "destructive" })
    if (a.error) toast({ title: "Error loading approved", description: a.error, variant: "destructive" })
    setPending(p.data)
    setApproved(a.data)
    setLoadingLists(false)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setAuthSubmitting(true)
    const { error } = await authService.signIn(email, password)
    if (error) {
      toast({ title: "Login failed", description: error.message ?? "Check your credentials", variant: "destructive" })
      setAuthSubmitting(false)
      return
    }
    const check = await adminService.isAdmin()
    setIsAdmin(check.isAdmin)
    setAuthSubmitting(false)
    if (!check.isAdmin) {
      toast({
        title: "Not an admin",
        description: "Your account is not marked as admin. See instructions below to add yourself.",
        variant: "destructive",
      })
    } else {
      toast({ title: "Welcome, admin" })
      refreshLists()
    }
  }

  async function handleLogout() {
    await authService.signOut()
    setIsAdmin(false)
    setPending([])
    setApproved([])
    toast({ title: "Logged out" })
  }

  async function onApprove(id: string) {
    const { error } = await adminService.approveEvent(id)
    if (error) {
      toast({ title: "Approve failed", description: error, variant: "destructive" })
    } else {
      toast({ title: "Event approved" })
      refreshLists()
    }
  }

  async function onReject(id: string) {
    const { error } = await adminService.rejectEvent(id)
    if (error) {
      toast({ title: "Reject failed", description: error, variant: "destructive" })
    } else {
      toast({ title: "Event rejected" })
      refreshLists()
    }
  }

  async function onDelete(id: string) {
    const { error } = await adminService.deleteEvent(id)
    if (error) {
      toast({ title: "Delete failed", description: error, variant: "destructive" })
    } else {
      toast({ title: "Event deleted" })
      refreshLists()
    }
  }

  const isAuthed = Boolean(session?.user)

  return (
    <>
      <SEO title="Admin Dashboard | Springfield Events" description="Review and manage submitted events." />
      <Head>
        <title>Admin Dashboard</title>
      </Head>
      <main className="min-h-screen py-12 px-4 md:px-8 bg-background text-foreground">
        <div className="mx-auto max-w-6xl space-y-8">
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">Approve, reject, and remove submitted events.</p>
            </div>
            {isAuthed && (
              <Button variant="secondary" onClick={handleLogout}>Log out</Button>
            )}
          </header>

          {!isAuthed ? (
            <Card className="max-w-xl">
              <CardHeader>
                <CardTitle>Admin Login</CardTitle>
                <CardDescription>Sign in with your admin account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
          ) : checkingAdmin ? (
            <p>Checking admin access...</p>
          ) : !isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Access denied</CardTitle>
                <CardDescription>Your account is not marked as admin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  To grant admin access, add your user ID to the admins table. Go to Database tab → SQL editor and run:
                </p>
                <pre className="bg-muted p-3 rounded text-sm overflow-auto">
{`INSERT INTO public.admins (user_id) VALUES ('YOUR_USER_UUID') ON CONFLICT (user_id) DO NOTHING;`}
                </pre>
                <p className="text-sm text-muted-foreground">
                  Find your user UUID in Database → Users. Once added, refresh this page.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Pending Approvals</h2>
                  <Button variant="outline" onClick={refreshLists} disabled={loadingLists}>Refresh</Button>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>When</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pending.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No pending events</TableCell>
                          </TableRow>
                        ) : pending.map(ev => (
                          <TableRow key={ev.id}>
                            <TableCell className="font-medium">{ev.title}</TableCell>
                            <TableCell className="whitespace-nowrap">{formatISOBrief(ev.start)}</TableCell>
                            <TableCell><Badge variant="secondary">{ev.category}</Badge></TableCell>
                            <TableCell className="truncate max-w-[240px]">{ev.address}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" onClick={() => onApprove(ev.id)}>Approve</Button>
                              <Button size="sm" variant="destructive" onClick={() => onReject(ev.id)}>Reject</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Approved Events</h2>
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>When</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {approved.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No approved events</TableCell>
                          </TableRow>
                        ) : approved.map(ev => (
                          <TableRow key={ev.id}>
                            <TableCell className="font-medium">{ev.title}</TableCell>
                            <TableCell className="whitespace-nowrap">{formatISOBrief(ev.start)}</TableCell>
                            <TableCell><Badge variant="secondary">{ev.category}</Badge></TableCell>
                            <TableCell className="truncate max-w-[240px]">{ev.address}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button size="sm" variant="destructive" onClick={() => onDelete(ev.id)}>Delete</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  )
}