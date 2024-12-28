const FB_API_VERSION = 'v21.0';
const FB_API_BASE_URL = 'https://graph.facebook.com';

export const buildFacebookUrl = (path: string, fields: string, accessToken: string): string => {
	return `${FB_API_BASE_URL}/${FB_API_VERSION}${path}?fields=${fields}&access_token=${accessToken}`;
};

export const fetchFromFacebook = async <T>(url: string): Promise<T> => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error('Error fetching data:', await response.text());
			return {} as T;
		}
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error:', error);
		return {} as T;
	}
};

export const postToFacebook = async <T>(
	url: string,
	params: Record<string, string | undefined>
): Promise<T> => {
	const filteredParams = Object.fromEntries(
		Object.entries(params).filter(([, value]) => value !== undefined)
	) as Record<string, string>;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams(filteredParams).toString()
	});

	if (!response.ok) {
		throw new Error(`Facebook API error: ${await response.text()}`);
	}
	return response.json();
};
