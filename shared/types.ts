import { z } from 'zod'

export const PLAYER_NAME_MAX = 40

export const PlayerIdSchema = z.string().min(1)

export const PlayerSchema = z.object({
  id: PlayerIdSchema,
  name: z.string().min(1).max(PLAYER_NAME_MAX),
})

export const TeamSchema = z.tuple([PlayerIdSchema, PlayerIdSchema])

export const MatchSchema = z.object({
  id: z.string().min(1),
  playedAt: z.string(),
  winners: TeamSchema,
  losers: TeamSchema,
})

export const StreakSchema = z.object({
  type: z.enum(['win', 'loss']),
  count: z.number().int().positive(),
})

export const StandingSchema = z.object({
  player: PlayerSchema,
  played: z.number().int().nonnegative(),
  wins: z.number().int().nonnegative(),
  losses: z.number().int().nonnegative(),
  points: z.number().int().nonnegative(),
  streak: StreakSchema.nullable(),
})

export const CreatePlayerRequestSchema = z.object({
  name: z.string().trim().min(1).max(PLAYER_NAME_MAX),
})

export const CreateMatchRequestSchema = z
  .object({
    winners: TeamSchema,
    losers: TeamSchema,
  })
  .refine((data) => new Set([...data.winners, ...data.losers]).size === 4, {
    message: 'A match needs 4 distinct players.',
  })

export type PlayerId = z.infer<typeof PlayerIdSchema>
export type Player = z.infer<typeof PlayerSchema>
export type Team = z.infer<typeof TeamSchema>
export type Match = z.infer<typeof MatchSchema>
export type Streak = z.infer<typeof StreakSchema>
export type Standing = z.infer<typeof StandingSchema>
export type CreatePlayerRequest = z.infer<typeof CreatePlayerRequestSchema>
export type CreateMatchRequest = z.infer<typeof CreateMatchRequestSchema>
