import { useMemo, useState } from "react"
import dynamic from "next/dynamic"
import Head from "next/head"
import Link from "next/link"
import { SEO } from "@/components/SEO"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { MapProps } from "@/components/Map"

type EventCategory = "Food" | "Music" | "Arts" | "Sports" | "Family"

export interface EventItem {
  id: string
  title: string
  description: string
  category: EventCategory
  start: string
  end?: string
  address: string
  price: string
  website: string
  lat: number
  lng: number
}

const Map = dynamic<MapProps<EventItem>>(
  () => import("@/components/Map").then(m => m.Map as unknown as React.ComponentType<MapProps<EventItem>>),
  { ssr: false }
)

const categories: EventCategory[] = ["Food", "Music", "Arts", "Sports", "Family"]

const demoEvents: EventItem[] = [
  {
    id: "1",
    title: "Downtown Farmers' Market",
    description: "Local produce, baked goods, and handmade crafts from Springfield vendors.",
    category: "Food",
    start: "2026-02-17T09:00:00Z",
    end: "2026-02-17T13:00:00Z",
    address: "100 Main St, Springfield",
    price: "Free",
    website: "https://example.com/farmers-market",
    lat: 39.8015,
    lng: -89.6437
  },
  {
    id: "2",
    title: "Live Jazz in the Park",
    description: "An evening of smooth jazz with local artists. Bring a blanket!",
    category: "Music",
    start: "2026-02-18T23:00:00Z",
    end: "2026-02-19T01:00:00Z",
    address: "Riverside Park, Springfield",
    price: "$10",
    website: "https://example.com/jazz-park",
    lat: 39.7969,
    lng: -89.6502
  },
  {
    id: "3",
    title: "Family Art Workshop",
    description: "Hands-on art activities for kids and parents. Materials provided.",
    category: "Family",
    start: "2026-02-20T16:00:00Z",
    end: "2026-02-20T18:00:00Z",
    address: "Community Arts Center, Springfield",
    price: "Free (RSVP)",
    website: "https://example.com/art-workshop",
    lat: 39.7988,
    lng: -89.6369
  },
  {
    id: "4",
    title: "Local Makers Pop-up",
    description: "Discover crafts, jewelry, and design goods from Springfield makers.",
    category: "Arts",
    start: "2026-02-21T15:00:00Z",
    end: "2026-02-21T21:00:00Z",
    address: "Warehouse District, Springfield",
    price: "Free",
    website: "https://example.com/makers",
    lat: 39.8032,
    lng: -89.6481
  },
  {
    id: "5",
    title: "Community 5K Run",
    description: "A friendly 5K through the historic district. All levels welcome.",
    category: "Sports",
    start: "2026-02-22T14:00:00Z",
    end: "2026-02-22T15:00:00Z",
    address: "Heritage Square, Springfield",
    price: "$25",
    website: "https://example.com/5k",
    lat: 39.7951,
    lng: -89.6408
  }
]

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

  const filtered = useMemo(() => {
    return demoEvents.filter(e => {
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
  }, [category, date, query])

  return (
    <>
      <SEO
        title="Springfield Events — What’s happening this week"
        description="Discover local markets, music, arts, sports, and family events across Springfield. Filter by date and category, and explore on the interactive map."
        image="/og-image.png"
        url="/"
      />
      <Head>
        <meta name="theme-color" content="#0A66FF" />
      </Head>

      <main className="min-h-screen bg-background text-foreground">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero opacity-90" />
          <div className="relative z-10">
            <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
              <div className="flex flex-col items-start gap-6">
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Springfield • Next 7 Days
                </span>
                <h1 className="font-heading text-4xl font-semibold leading-tight md:text-5xl">
                  Your week in Springfield, at a glance
                </h1>
                <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                  Markets, music, arts, sports, and family-friendly happenings — mapped and easy to filter.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild>
                    <Link href="#explore">Explore events</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="#submit">Submit an event</Link>
                  </Button>
                </div>
              </div>
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
                  {filtered.length === 0 ? (
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