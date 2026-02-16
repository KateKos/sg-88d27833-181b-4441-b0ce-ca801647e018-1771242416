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

export type EventCategory = "Food" | "Music" | "Arts" | "Sports" | "Family"

export interface CreateEventInput {
  title: string
  description: string
  category: EventCategory
  start: string
  end: string
  address: string
  price: string
  website?: string
  lat: number
  lng: number
}

export async function createEvent(input: CreateEventInput) {
  const {
    title,
    description,
    category,
    start,
    end,
    address,
    price,
    website,
    lat,
    lng
  } = input

  const { data: userRes, error: userErr } = await supabase.auth.getUser()
  if (userErr || !userRes?.user) {
    return { data: null, error: userErr ?? new Error("Not authenticated") }
  }

  const organizerId = userRes.user.id

  const { data, error } = await supabase
    .from("events")
    .insert([
      {
        title,
        description,
        category,
        start,
        end,
        address,
        price,
        website: website ?? "",
        lat,
        lng,
        status: "pending",
        organizer_id: organizerId
      }
    ])
    .select()
    .maybeSingle()

  return { data, error }
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