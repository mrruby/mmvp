import { z } from 'zod';

export const fundingSourceDetailsSchema = z.object({
	id: z.string(),
	display_string: z.string(),
	type: z.number(),
	status: z.string().optional()
});

export const fundingSourceSchema = z.object({
	funding_source_details: fundingSourceDetailsSchema.optional()
});

export const adAccountSchema = z.object({
	id: z.string(),
	account_id: z.string(),
	name: z.string(),
	currency: z.string(),
	business_name: z.string().optional()
});

export const facebookPageSchema = z.object({
	id: z.string(),
	name: z.string()
});

export type AdAccount = z.infer<typeof adAccountSchema>;
export type FundingSource = z.infer<typeof fundingSourceSchema>;
export type FacebookPage = z.infer<typeof facebookPageSchema>;
