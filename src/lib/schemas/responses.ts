import { z } from 'zod';
import { adAccountSchema } from './ad-account';
import { facebookPageSchema } from './social-pages';
import { instagramPostSchema } from './social-pages';

export const responseSchema = z.object({
	id: z.string(),
	success: z.boolean().optional()
});

export const linkDataSchema = z.object({
	message: z.string(),
	call_to_action: z.object({
		type: z.string()
	}),
	link: z.string(),
	image_hash: z.string().optional()
});

export const adImageResponseSchema = z.object({
	hash: z.string()
});

export const adAccountsResponseSchema = z.object({
	data: z.array(adAccountSchema)
});

export const pagesResponseSchema = z.object({
	data: z.array(facebookPageSchema)
});

export const businessResponseSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			name: z.string()
		})
	)
});

export const instagramAccountsResponseSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			ig_id: z.string().optional(),
			username: z.string(),
			profile_picture: z.string().optional()
		})
	)
});

export const instagramMediaResponseSchema = z.object({
	data: z.array(instagramPostSchema)
});

export type Response = z.infer<typeof responseSchema>;
export type LinkData = z.infer<typeof linkDataSchema>;
export type AdAccountsResponse = z.infer<typeof adAccountsResponseSchema>;
export type PagesResponse = z.infer<typeof pagesResponseSchema>;
export type BusinessResponse = z.infer<typeof businessResponseSchema>;
export type InstagramAccountsResponse = z.infer<typeof instagramAccountsResponseSchema>;
export type InstagramMediaResponse = z.infer<typeof instagramMediaResponseSchema>;
export type AdImageResponse = z.infer<typeof adImageResponseSchema>;
