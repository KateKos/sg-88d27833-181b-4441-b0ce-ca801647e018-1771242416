"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { createEvent, type EventCategory } from "@/services/eventService"

const schema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(10, "Description is required"),
  category: z.enum(["Food", "Music", "Arts", "Sports", "Family"] as [EventCategory, ...EventCategory[]]),
  start: z.string().min(1, "Start date/time is required"),
  end: z.string().min(1, "End date/time is required"),
  address: z.string().min(3, "Address is required"),
  price: z.string().min(1, "Price is required"),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")).transform(v => (v === "" ? undefined : v)),
  lat: z.coerce.number().refine(v => !Number.isNaN(v), "Latitude is required"),
  lng: z.coerce.number().refine(v => !Number.isNaN(v), "Longitude is required"),
})

type FormValues = z.infer<typeof schema>

export function EventForm() {
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      category: "Food",
      start: "",
      end: "",
      address: "",
      price: "Free",
      website: "",
      lat: 0,
      lng: 0,
    }
  })

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const { error } = await createEvent({
        title: values.title.trim(),
        description: values.description.trim(),
        category: values.category,
        start: new Date(values.start).toISOString(),
        end: new Date(values.end).toISOString(),
        address: values.address.trim(),
        price: values.price.trim(),
        website: values.website,
        lat: Number(values.lat),
        lng: Number(values.lng),
      })
      if (error) {
        toast({ title: "Submission failed", description: error.message ?? "Please try again", variant: "destructive" })
        return
      }
      toast({ title: "Event submitted", description: "Your event is pending approval." })
      form.reset()
    } catch (e: unknown) {
      const err = e as Error
      toast({ title: "Unexpected error", description: err.message, variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Submit an Event</CardTitle>
        <CardDescription>Provide details for your event. Submissions require approval before appearing on the map.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Springfield Farmers' Market" {...form.register("title")} />
              {form.formState.errors.title && <p className="text-destructive text-sm">{form.formState.errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(v) => form.setValue("category", v as FormValues["category"])} defaultValue={form.getValues("category")}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Choose category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Music">Music</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && <p className="text-destructive text-sm">{form.formState.errors.category.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={5} placeholder="Tell people what to expect..." {...form.register("description")} />
            {form.formState.errors.description && <p className="text-destructive text-sm">{form.formState.errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start">Start</Label>
              <Input id="start" type="datetime-local" {...form.register("start")} />
              {form.formState.errors.start && <p className="text-destructive text-sm">{form.formState.errors.start.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End</Label>
              <Input id="end" type="datetime-local" {...form.register("end")} />
              {form.formState.errors.end && <p className="text-destructive text-sm">{form.formState.errors.end.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St, Springfield" {...form.register("address")} />
              {form.formState.errors.address && <p className="text-destructive text-sm">{form.formState.errors.address.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" placeholder="Free / $10" {...form.register("price")} />
              {form.formState.errors.price && <p className="text-destructive text-sm">{form.formState.errors.price.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Official website</Label>
            <Input id="website" placeholder="https://example.com" {...form.register("website")} />
            {form.formState.errors.website && <p className="text-destructive text-sm">{form.formState.errors.website.message}</p>}
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input id="lat" type="number" step="any" placeholder="39.7817" {...form.register("lat")} />
              {form.formState.errors.lat && <p className="text-destructive text-sm">{form.formState.errors.lat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input id="lng" type="number" step="any" placeholder="-89.6501" {...form.register("lng")} />
              {form.formState.errors.lng && <p className="text-destructive text-sm">{form.formState.errors.lng.message}</p>}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for approval"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}