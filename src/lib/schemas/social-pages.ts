import { z } from 'zod';

export const facebookPageSchema = z.object({
	id: z.string(),
	name: z.string(),
	access_token: z.string(),
	instagram_business_account: z
		.object({
			id: z.string()
		})
		.optional()
});

export const instagramBusinessAccountSchema = z.object({
	instagram_business_account: z
		.object({
			id: z.string()
		})
		.optional()
});

export const instagramConnectedPageSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	username: z.string(),
	profile_picture_url: z.string().optional()
});

export const instagramPostSchema = z.object({
	id: z.string(),
	caption: z.string().optional(),
	media_url: z.string().optional(),
	thumbnail_url: z.string().optional(),
	timestamp: z.string(),
	media_type: z.string()
});

export const facebookPageWithInstagramSchema = z.object({
	id: z.string(),
	name: z.string(),
	hasInstagram: z.boolean(),
	instagramAccountId: z.string().optional()
});

export const instagramAccountDetailsSchema = z.object({
	id: z.string(),
	name: z.string(),
	username: z.string().optional(),
	profilePicture: z.string().optional()
});

export type FacebookPage = z.infer<typeof facebookPageSchema>;
export type InstagramBusinessAccount = z.infer<typeof instagramBusinessAccountSchema>;
export type InstagramConnectedPage = z.infer<typeof instagramConnectedPageSchema>;
export type InstagramPost = z.infer<typeof instagramPostSchema>;
export type FacebookPageWithInstagram = z.infer<typeof facebookPageWithInstagramSchema>;
export type InstagramAccountDetails = z.infer<typeof instagramAccountDetailsSchema>;
