export type FacebookClient = {
	get: <T>(path: string, fields: string) => Promise<T>;
	post: <T>(path: string, params: Record<string, string | undefined>) => Promise<T>;
};
