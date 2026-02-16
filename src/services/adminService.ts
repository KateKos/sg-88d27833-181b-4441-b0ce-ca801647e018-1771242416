import { supabase } from "@/integrations/supabase/client"
import type { EventItem } from "@/services/eventService"

export interface AdminCheck {
  isAdmin: boolean
  error?: string
}

export const adminService = {
  async isAdmin(): Promise<AdminCheck> {
    const { data: userRes, error: userErr } = await supabase.auth.getUser()
    if (userErr || !userRes?.user) return { isAdmin: false, error: userErr?.message || "Not authenticated" }
    const uid = userRes.user.id
    const { data, error } = await supabase.from("admins").select("user_id").eq("user_id", uid).maybeSingle()
    if (error) return { isAdmin: false, error: error.message }
    return { isAdmin: Boolean(data?.user_id) }
  },

  async listPending(): Promise<{ data: EventItem[]; error: string | null }> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })

    if (error) return { data: [], error: error.message }
    const items: EventItem[] = (data || []).map((e: any) => ({
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
    }))
    return { data: items, error: null }
  },

  async listApproved(limit = 50): Promise<{ data: EventItem[]; error: string | null }> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "approved")
      .order("start", { ascending: true })
      .limit(limit)

    if (error) return { data: [], error: error.message }
    const items: EventItem[] = (data || []).map((e: any) => ({
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
    }))
    return { data: items, error: null }
  },

  async approveEvent(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("events").update({ status: "approved" }).eq("id", id)
    return { error: error?.message ?? null }
  },

  async rejectEvent(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("events").update({ status: "rejected" }).eq("id", id)
    return { error: error?.message ?? null }
  },

  async deleteEvent(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from("events").delete().eq("id", id)
    return { error: error?.message ?? null }
  },
}