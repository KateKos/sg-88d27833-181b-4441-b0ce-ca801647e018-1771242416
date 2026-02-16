import { supabase } from "@/integrations/supabase/client"

export interface EventItem {
  id: string
  title: string
  description: string
  category: "Food" | "Music" | "Arts" | "Sports" | "Family"
  start: string
  end: string | null
  address: string
  price: string
  website: string
  lat: number
  lng: number
}

export async function fetchEventsNext7Days(): Promise<EventItem[]> {
  const now = new Date()
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .gte("start", now.toISOString())
    .lte("start", end.toISOString())
    .order("start", { ascending: true })

  console.log("fetchEventsNext7Days:", { count: data?.length, error })

  if (error) {
    console.error("Error fetching events:", error)
    return []
  }

  const safe: EventItem[] =
    (data?.map((e: any) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      category: e.category,
      start: e.start,
      end: e.end ?? null,
      address: e.address,
      price: e.price,
      website: e.website,
      lat: Number(e.lat),
      lng: Number(e.lng),
    })) as EventItem[]) || []

  return safe
}