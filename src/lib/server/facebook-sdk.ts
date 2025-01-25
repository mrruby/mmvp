import {
	FacebookAdsApi,
	AdAccount,
	Campaign,
	AdSet,
	AdCreative,
	Ad,
	AdImage,
	Page,
	User,
	Business
} from 'facebook-nodejs-business-sdk';

export type FacebookSDK = {
	AdAccount: typeof AdAccount;
	Campaign: typeof Campaign;
	AdSet: typeof AdSet;
	AdCreative: typeof AdCreative;
	Ad: typeof Ad;
	AdImage: typeof AdImage;
	Page: typeof Page;
	User: typeof User;
	Business: typeof Business;
};

export function initFacebookSdk(accessToken: string): FacebookSDK {
	// Initialize the SDK with the user's access token
	FacebookAdsApi.init(accessToken);

	// Return SDK classes for use
	return {
		AdAccount,
		Campaign,
		AdSet,
		AdCreative,
		Ad,
		AdImage,
		Page,
		User,
		Business
	};
}
