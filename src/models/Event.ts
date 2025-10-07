import { z } from 'zod'

export const EventSchema = z.object({
    id: z.string(),
    title: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    icon: z.string().optional(),
    color: z.string(),
})

export type Event = z.infer<typeof EventSchema>

export const UpcomingEventSchema = z.object({
    id: z.string(),
    title: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    color: z.string(),
})

export type UpcomingEvent = z.infer<typeof UpcomingEventSchema>
