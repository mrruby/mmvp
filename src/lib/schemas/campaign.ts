import { z } from 'zod';

export const campaignDataSchema = z.object({
	adAccountId: z.string(),
	campaignName: z.string(),
	dailyBudget: z.string(),
	pageId: z.string(),
	instagramAccountId: z.string(),
	instagramUsername: z.string(),
	message: z.string(),
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
		geo_locations: z.record(z.unknown()),
		publisher_platforms: z.array(z.enum(['instagram']))
	})
});

export const createAdCreativeParamsSchema = z
	.object({
		name: z.string(),
		object_story_id: z.string().optional(),
		object_story_spec: z
			.object({
				page_id: z.string(),
				instagram_actor_id: z.string(),
				instagram_username: z.string(),
				link_data: z.object({
					image_hash: z.string().optional(),
					message: z.string()
				})
			})
			.optional()
	})
	.refine(
		(data) => {
			// Either object_story_id must be present, or object_story_spec with all required fields
			if (data.object_story_id) {
				return data.object_story_spec === undefined;
			}
			if (data.object_story_spec) {
				return data.object_story_id === undefined;
			}
			return false;
		},
		{
			message: 'Either object_story_id or complete object_story_spec must be provided, but not both'
		}
	);

export const createAdParamsSchema = z.object({
	name: z.string(),
	adsetId: z.string(),
	creativeId: z.string(),
	instagramActorId: z.string()
});

export type CampaignData = z.infer<typeof campaignDataSchema>;
export type CreateCampaignParams = z.infer<typeof createCampaignParamsSchema>;
export type CreateAdSetParams = z.infer<typeof createAdSetParamsSchema>;
export type CreateAdCreativeParams = z.infer<typeof createAdCreativeParamsSchema>;
export type CreateAdParams = z.infer<typeof createAdParamsSchema>;
