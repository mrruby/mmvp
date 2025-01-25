import { z } from 'zod';

const fundingSourceDetailsSchema = z.object({
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

export type AdAccount = z.infer<typeof adAccountSchema>;
export type FundingSource = z.infer<typeof fundingSourceSchema>;
