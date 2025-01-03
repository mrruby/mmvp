import { z } from 'zod';

export const fundingSourceDetailsSchema = z.object({
	id: z.string(),
	display_string: z.string().optional(),
	type: z.number(),
	status: z.string().optional()
});

export const fundingSourceSchema = z.object({
	funding_source_details: fundingSourceDetailsSchema.optional()
});

export const adAccountSchema = z
	.object({
		id: z.string(),
		account_id: z.string(),
		name: z.string(),
		currency: z.string(),
		business_name: z.string().optional()
	})
	.merge(fundingSourceSchema);

export const facebookPageSchema = z.object({
	id: z.string(),
	name: z.string()
});

export const businessSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			name: z.string()
		})
	)
});

export const instagramAccountSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			username: z.string(),
			profile_picture_url: z.string().optional()
		})
	)
});

export type AdAccount = z.infer<typeof adAccountSchema>;
export type FundingSource = z.infer<typeof fundingSourceSchema>;
export type FacebookPage = z.infer<typeof facebookPageSchema>;
export type Business = z.infer<typeof businessSchema>;
export type InstagramAccount = z.infer<typeof instagramAccountSchema>;
