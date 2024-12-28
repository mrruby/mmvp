export interface AdAccount {
	id: string;
	account_id: string;
	name: string;
	currency: string;
	business_name?: string;
	business_id?: string;
	end_advertiser_id?: string;
	media_agency_id?: string;
	partner_id?: string;
	fundingSource?: FundingSource;
}

export interface FundingSource {
	funding_source_details?: {
		id: string;
		display_string: string;
		type: number;
		status?: string;
	};
}
