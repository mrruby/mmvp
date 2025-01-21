import { z } from 'zod';

export const fundingSourceDetailsSchema = z.object({
	id: z.string().optional(),
	display_string: z.string().optional(),
	type: z.number().optional(),
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
	name: z.string(),
	access_token: z.string(),
	instagram_business_account: z
		.object({
			id: z.string()
		})
		.optional()
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

export const instagramBusinessAccountSchema = z.object({
	instagram_business_account: z
		.object({
			id: z.string()
		})
		.optional()
});

export const instagramMediaSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			caption: z.string().optional(),
			media_type: z.string(),
			media_url: z.string().optional(),
			thumbnail_url: z.string().optional(),
			timestamp: z.string()
		})
	)
});

export const businessWithInstagramSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			instagram_accounts: z
				.object({
					data: z.array(
						z.object({
							id: z.string(),
							username: z.string()
						})
					)
				})
				.optional()
		})
	)
});

export const campaignListSchema = z.object({
	data: z.array(
		z.object({
			id: z.string(),
			name: z.string(),
			status: z.enum(['ACTIVE', 'PAUSED', 'DELETED', 'ARCHIVED']),
			effective_status: z.string(),
			adsets: z
				.object({
					data: z.array(
						z.object({
							destination_type: z.string()
						})
					)
				})
				.optional(),
			ads: z
				.object({
					data: z.array(
						z.object({
							creative: z
								.object({
									id: z.string(),
									thumbnail_url: z.string().optional(),
									image_url: z.string().optional(),
									body: z.string().optional(),
									object_story_spec: z.record(z.unknown()).optional(),
									asset_feed_spec: z.record(z.unknown()).optional()
								})
								.optional()
						})
					)
				})
				.optional()
		})
	)
});

export const responseSchema = z.object({
	id: z.string(),
	success: z.boolean().optional()
});

export const instagramConnectedPageSchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	username: z.string(),
	profile_picture_url: z.string().optional()
});

export const pagesSchema = z.object({
	data: z.array(facebookPageSchema)
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

export type AdAccount = z.infer<typeof adAccountSchema>;
export type FundingSource = z.infer<typeof fundingSourceSchema>;
export type FacebookPage = z.infer<typeof facebookPageSchema>;
export type Business = z.infer<typeof businessSchema>;
export type InstagramAccount = z.infer<typeof instagramAccountSchema>;
export type CampaignList = z.infer<typeof campaignListSchema>;
export type InstagramBusinessAccount = z.infer<typeof instagramBusinessAccountSchema>;
export type InstagramMedia = z.infer<typeof instagramMediaSchema>;
export type BusinessWithInstagram = z.infer<typeof businessWithInstagramSchema>;
export type Response = z.infer<typeof responseSchema>;
export type InstagramConnectedPage = z.infer<typeof instagramConnectedPageSchema>;
export type Pages = z.infer<typeof pagesSchema>;
export type InstagramPost = z.infer<typeof instagramPostSchema>;
export type FacebookPageWithInstagram = z.infer<typeof facebookPageWithInstagramSchema>;
export type InstagramAccountDetails = z.infer<typeof instagramAccountDetailsSchema>;

// Response schemas for Facebook API endpoints
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
			username: z.string(),
			profile_picture_url: z.string().optional()
		})
	)
});

export const instagramMediaResponseSchema = z.object({
	data: z.array(instagramPostSchema)
});

// Export response types
export type AdAccountsResponse = z.infer<typeof adAccountsResponseSchema>;
export type PagesResponse = z.infer<typeof pagesResponseSchema>;
export type BusinessResponse = z.infer<typeof businessResponseSchema>;
export type InstagramAccountsResponse = z.infer<typeof instagramAccountsResponseSchema>;
export type InstagramMediaResponse = z.infer<typeof instagramMediaResponseSchema>;
