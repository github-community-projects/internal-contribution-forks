import { z } from 'zod'

export const RepositorySettingsSchema = z.object({
  actions: z.object({
    enabled: z.boolean(),
    allowedActions: z.enum(['all', 'local_only', 'selected']).optional(),
  }),
})

export const CreateMirrorSchema = z.object({
  orgId: z.string(),
  forkRepoOwner: z.string(),
  forkRepoName: z.string(),
  forkId: z.string(),
  newRepoName: z.string().max(100),
  newBranchName: z.string(),
  settings: RepositorySettingsSchema,
})

export const ListMirrorsSchema = z.object({
  orgId: z.string(),
  forkName: z.string(),
})

export const EditMirrorSchema = z.object({
  orgId: z.string(),
  mirrorName: z.string(),
  newMirrorName: z.string().max(100),
})

export const DeleteMirrorSchema = z.object({
  orgId: z.string(),
  mirrorName: z.string(),
})

export type CreateMirrorSchema = z.TypeOf<typeof CreateMirrorSchema>
export type ListMirrorsSchema = z.TypeOf<typeof ListMirrorsSchema>
export type EditMirrorSchema = z.TypeOf<typeof EditMirrorSchema>
export type DeleteMirrorSchema = z.TypeOf<typeof DeleteMirrorSchema>
export type RepositorySettingsSchema = z.TypeOf<typeof RepositorySettingsSchema>
