export type SearchEngine =
	| "google"
	| "bing"
	| "duckduckgo"
	| "perplexity"
	| "custom";

const SEARCH_URLS: Record<Exclude<SearchEngine, "custom">, string> = {
	google: "https://google.com/search?q=%s",
	bing: "https://bing.com/search?q=%s",
	duckduckgo: "https://duckduckgo.com/?q=%s",
	perplexity: "https://perplexity.ai/search/new?q=%s",
};

export function getSearchUrl(
	engine: SearchEngine,
	query: string,
	customSearchUrl: string,
): string {
	const template = engine === "custom" ? customSearchUrl : SEARCH_URLS[engine];

	return template.replace("%s", encodeURIComponent(query));
}
