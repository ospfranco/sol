import { pinyin } from "pinyin-pro";

/**
 * Regular expression matching CJK Unified Ideographs
 * (Chinese, Japanese, Korean Han characters).
 */
const CJK_RE = /\p{Unified_Ideograph}/u;

/**
 * Strip tone marks from pinyin (e.g. "chóng" → "chong").
 */
const stripTone = (s: string): string =>
	s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

/**
 * Generate latin-variant search tokens from an array of searchable texts.
 *
 * Extracts CJK characters from all input texts, obtains polyphonic
 * pinyin candidates per character via pinyin-pro, then produces:
 *  - full-pinyin variants (cartesian product of candidates)
 *  - initial-only variants (first letter of each candidate)
 *
 * Results are space-separated for injection into the minisearch index
 * under the `_latinVariants` field.
 *
 * @param texts - Searchable field values (name, localizedName, alias, etc.)
 * @returns Space-separated pinyin variant string; empty string when no CJK is present.
 */
export function generateLatinVariants(
	texts: (string | null | undefined)[],
): string {
	// 1. Extract pure CJK text, filtering out null/undefined/empty
	const cjkText = texts
		.filter((t): t is string => t != null && t.length > 0)
		.join("");

	if (!cjkText) {
		return "";
	}

	const cjkChars = [...cjkText].filter((ch) => CJK_RE.test(ch));
	if (cjkChars.length === 0) {
		return "";
	}

	// 2. Get polyphonic pinyin candidates per character from pinyin-pro
	//    type: 'all' returns detailed per-character info including polyphonic array
	const allResults = pinyin(cjkChars.join(""), {
		type: "all",
		toneType: "none",
	});

	const candidates: string[][] = [];
	for (const r of allResults) {
		if (!r.isZh || !r.polyphonic || r.polyphonic.length === 0) {
			// Non-CJK or no pinyin mapping available — skip
			continue;
		}
		// Strip tones then deduplicate (polyphonic array may contain
		// duplicates differing only by tone, e.g. ["wei", "wēi"])
		const variants = [
			...new Set(r.polyphonic.map((s) => stripTone(s))),
		];
		candidates.push(variants);
	}

	if (candidates.length === 0) {
		return "";
	}

	// 3. Cartesian product → full-pinyin variants
	const fullVariants = cartesianProduct(candidates).map((parts) =>
		parts.join(""),
	);

	// 4. Initial-letter variants (first letter of each candidate, deduplicated)
	const initialVariants = cartesianProduct(
		candidates.map((targets) =>
			[...new Set(targets.map((t) => t.charAt(0)))],
		),
	).map((parts) => parts.join(""));

	// 5. Merge, deduplicate, and normalize to lowercase
	const allVariants = [
		...new Set([...fullVariants, ...initialVariants]),
	].map((v) => v.toLowerCase());

	return allVariants.join(" ");
}

/**
 * Cartesian product of a 2D string array.
 *
 * E.g. `[["a","b"], ["c"]]` → `[["a","c"], ["b","c"]]`
 */
function cartesianProduct(arrays: string[][]): string[][] {
	if (arrays.length === 0) return [];
	if (arrays.length === 1) return arrays[0].map((item) => [item]);

	const [first, ...rest] = arrays;
	const restProduct = cartesianProduct(rest);
	const result: string[][] = [];
	for (const item of first) {
		for (const combo of restProduct) {
			result.push([item, ...combo]);
		}
	}
	return result;
}
