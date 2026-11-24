import { test } from "bun:test";
import assert from "node:assert/strict";
import { getSearchUrl } from "./searchEngines";

const custom = "https://example.com/find?lang=en&q=%s";

for (const [engine, prefix] of [
	["google", "https://google.com/search?q="],
	["bing", "https://bing.com/search?q="],
	["duckduckgo", "https://duckduckgo.com/?q="],
	["perplexity", "https://perplexity.ai/search/new?q="],
	["custom", "https://example.com/find?lang=en&q="],
]) {
	for (const query of [
		"sol launcher",
		"AT&T stock",
		"C# vs F#",
		"c++ tutorial",
		"what is 100%?",
		"a=b;c/d",
		"$& $1",
		"größe 你好",
	]) {
		test(`${engine} searches for ${query}`, () => {
			const url = getSearchUrl(engine, query, custom);
			assert.ok(url.startsWith(prefix));
			assert.equal(new URL(url).searchParams.get("q"), query);
		});
	}
}
