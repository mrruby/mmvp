import { z } from 'zod';

export const campaignDataSchema = z.object({
	adAccountId: z.string(),
	campaignName: z.string(),
	dailyBudget: z.string(),
	pageId: z.string(),
	message: z.string(),
	link: z.string(),
	imageFile: z.instanceof(File).nullable()
});

export const createCampaignParamsSchema = z.object({
	name: z.string(),
	objective: z.string(),
	status: z.enum(['ACTIVE', 'PAUSED'])
});

export const createAdSetParamsSchema = z.object({
	name: z.string(),
	campaignId: z.string(),
	dailyBudget: z.string(),
	destination_type: z.enum(['INSTAGRAM_PROFILE']),
	targeting: z.object({
		geo_locations: z.record(z.unknown())
	})
});

export const createAdCreativeParamsSchema = z.object({
	name: z.string(),
	pageId: z.string(),
	message: z.string(),
	link: z.string(),
	imageHash: z.string().optional(),
	instagram_actor_id: z.string().optional(),
	call_to_action: z
		.object({
			type: z.string(),
			value: z.record(z.string())
		})
		.optional(),
	enroll_status: z.enum(['OPT_OUT', 'OPT_IN']).optional()
});

export const createAdParamsSchema = z.object({
	name: z.string(),
	adsetId: z.string(),
	creativeId: z.string()
});

export type CampaignData = z.infer<typeof campaignDataSchema>;
export type CreateCampaignParams = z.infer<typeof createCampaignParamsSchema>;
export type CreateAdSetParams = z.infer<typeof createAdSetParamsSchema>;
export type CreateAdCreativeParams = z.infer<typeof createAdCreativeParamsSchema>;
export type CreateAdParams = z.infer<typeof createAdParamsSchema>;
