import { useMemo, useState, useEffect } from "react"
import dynamic from "next/dynamic"
import Head from "next/head"
import Link from "next/link"
import { SEO } from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MapProps } from "@/components/Map"
import { fetchEventsNext7Days, type EventItem } from "@/services/eventService"

type EventCategory = "Food" | "Music" | "Arts" | "Sports" | "Family"

const Map = dynamic<MapProps<EventItem>>(
  () => import("@/components/Map").then(m => m.Map as unknown as React.ComponentType<MapProps<EventItem>>),
  { ssr: false }
)

const categories: EventCategory[] = ["Food", "Music", "Arts", "Sports", "Family"]

function formatEventDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC"
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export default function Home() {
  const [category, setCategory] = useState<string>("All")
  const [date, setDate] = useState<string>("")
  const [query, setQuery] = useState<string>("")
  const [selected, setSelected] = useState<EventItem | null>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const data = await fetchEventsNext7Days()
      if (mounted) {
        setEvents(data)
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    return events.filter(e => {
      const categoryOk = category === "All" ? true : e.category === category
      const dateOk = date ? e.start.slice(0, 10) === date : true
      const q = query.trim().toLowerCase()
      const queryOk = q
        ? e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.address.toLowerCase().includes(q)
        : true
      return categoryOk && dateOk && queryOk
    })
  }, [events, category, date, query])

  return (
    <>
      <SEO
        title="Springfield Events — What’s happening this week"
        description="Discover local markets, music, arts, sports, and family events across Springfield. Filter by date and category, and explore on the interactive map."
        image="/og-image.png"
        url="/"
      />
      <Head>
        <title>Springfield Events - Your week at a glance</title>
      </Head>

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-hero py-12 px-4 border-b border-border/40">
          <div className="mx-auto max-w-6xl">
            <Badge variant="secondary" className="mb-4">
              Springfield • Next 7 Days
            </Badge>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Your week in Springfield, at a glance
            </h1>
            <p className="mb-6 max-w-2xl text-base text-muted-foreground">
              Markets, music, arts, sports, and family-friendly happenings — mapped and easy to filter.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="default" asChild>
                <a href="#events">Explore events</a>
              </Button>
              <Button size="default" variant="ghost" asChild>
                <Link href="/submit">Submit an event</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="explore" className="mx-auto max-w-6xl px-6 pb-16">
          <Card className="border-border/60">
            <CardHeader className="gap-4">
              <CardTitle className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <span>Find events</span>
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="q" className="sr-only">Search</Label>
                    <Input
                      id="q"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search by title, description, or address"
                      className="w-64"
                    />
                  </div>
                  <Separator orientation="vertical" className="hidden h-6 md:block" />
                  <div className="flex items-center gap-2">
                    <Label htmlFor="date" className="whitespace-nowrap text-sm">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-44"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="whitespace-nowrap text-sm">Category</Label>
                    <Select onValueChange={setCategory} value={category}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All</SelectItem>
                        {categories.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="order-2 space-y-3 lg:order-1">
                  {loading ? (
                    <div className="rounded-md border p-8 text-center text-sm text-muted-foreground">
                      Loading events…
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                      No events match your filters.
                    </div>
                  ) : (
                    filtered.map(ev => (
                      <button
                        key={ev.id}
                        className="w-full text-left"
                        onClick={() => setSelected(ev)}
                        aria-label={`View details for ${ev.title}`}
                      >
                        <div className="rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">{ev.category}</div>
                              <h3 className="text-base font-semibold">{ev.title}</h3>
                              <div className="text-sm text-muted-foreground">
                                {formatEventDate(ev.start)} • {ev.address}
                              </div>
                            </div>
                            <div className="shrink-0 rounded bg-primary/10 px-2 py-1 text-xs text-primary">
                              Details
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="order-1 min-h-[420px] overflow-hidden rounded-lg border lg:order-2">
                  <Map
                    events={filtered}
                    onMarkerClick={(ev) => setSelected(ev)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="submit" className="mx-auto max-w-6xl px-6 pb-24">
          <Card>
            <CardHeader>
              <CardTitle>Submit an event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Organizers can submit events here. Submissions require approval before they appear on the map.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="#">Open submission form</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="#">Go to admin dashboard</Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Backend required for authentication and moderation.
              </p>
            </CardContent>
          </Card>
        </section>

        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">
            © 2026 Springfield Events. Built with care for the community.
          </div>
        </footer>
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title ?? "Event details"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{selected.category}</div>
              <div className="text-sm">
                <span className="font-medium">When:</span> {formatEventDate(selected.start)}
                {selected.end ? ` – ${formatEventDate(selected.end)}` : ""}
              </div>
              <div className="text-sm">
                <span className="font-medium">Where:</span> {selected.address}
              </div>
              <div className="text-sm">
                <span className="font-medium">Price:</span> {selected.price}
              </div>
              <p className="text-sm text-muted-foreground">{selected.description}</p>
              <div>
                <Button asChild>
                  <a href={selected.website} target="_blank" rel="noopener noreferrer">Official website</a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}