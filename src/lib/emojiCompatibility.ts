const EMOJI_STORAGE_PREFIX = "cp:";

export function isEmojiSupported(
	emoji: { macos_version?: string },
	currentVersion: string | number,
): boolean {
	if (!emoji.macos_version) {
		return true;
	}

	const current = String(currentVersion).split(".").map(Number);
	const required = emoji.macos_version.split(".").map(Number);
	for (let index = 0; index < Math.max(current.length, required.length); index++) {
		const currentComponent = current[index] ?? 0;
		const requiredComponent = required[index] ?? 0;
		if (currentComponent !== requiredComponent) {
			return currentComponent > requiredComponent;
		}
	}
	return true;
}

export function getVisibleEmojiFavorites(
	frequencies: Readonly<Record<string, number>>,
	supportedEmojiChars: ReadonlySet<string>,
	limit: number,
): Array<[string, number]> {
	return Object.entries(frequencies)
		.filter(([emoji]) => supportedEmojiChars.has(emoji))
		.sort(([, first], [, second]) => second - first)
		.slice(0, limit);
}

export function recordEmojiUse(
	frequencies: Record<string, number>,
	emoji: string,
	visibleFavorites: ReadonlyArray<readonly [string, number]>,
	limit: number,
): void {
	if (frequencies[emoji]) {
		frequencies[emoji] += 1;
		return;
	}

	if (visibleFavorites.length === limit) {
		let leastUsed = visibleFavorites[0];
		for (const favorite of visibleFavorites) {
			if (favorite[1] < leastUsed[1]) {
				leastUsed = favorite;
			}
		}
		delete frequencies[leastUsed[0]];
	}
	frequencies[emoji] = 1;
}

export function getDisplayedEmoji<T extends { emoji: string }>(
	rows: ReadonlyArray<ReadonlyArray<T>>,
	index: number,
	rowSize: number,
): T | undefined {
	const emoji = rows[Math.floor(index / rowSize)]?.[index % rowSize];
	return emoji?.emoji ? emoji : undefined;
}

function encodePersistedEmoji(emoji: string): string {
	const encodedCodePoints = Array.from(emoji, (symbol) => {
		const codePoint = symbol.codePointAt(0);
		return codePoint == null ? "" : codePoint.toString(16);
	}).filter(Boolean);

	return `${EMOJI_STORAGE_PREFIX}${encodedCodePoints.join("-")}`;
}

function decodePersistedEmoji(
	storedEmoji: string,
	validEmojiChars: ReadonlySet<string>,
): string | null {
	if (validEmojiChars.has(storedEmoji)) {
		return storedEmoji;
	}

	if (!storedEmoji.startsWith(EMOJI_STORAGE_PREFIX)) {
		return null;
	}

	const codePoints = storedEmoji
		.slice(EMOJI_STORAGE_PREFIX.length)
		.split("-")
		.filter(Boolean)
		.map((hexCodePoint) => Number.parseInt(hexCodePoint, 16));

	if (!codePoints.length || codePoints.some(Number.isNaN)) {
		return null;
	}

	try {
		const decodedEmoji = String.fromCodePoint(...codePoints);
		return validEmojiChars.has(decodedEmoji) ? decodedEmoji : null;
	} catch {
		return null;
	}
}

export function normalizePersistedFrequentlyUsedEmojis(
	storedFrequentlyUsedEmojis: Record<string, unknown> | undefined,
	validEmojiChars: ReadonlySet<string>,
	supportedEmojiChars: ReadonlySet<string>,
	limit: number,
): Record<string, number> {
	if (!storedFrequentlyUsedEmojis) {
		return {};
	}

	const normalizedEntries = new Map<string, number>();

	for (const [storedEmoji, frequency] of Object.entries(
		storedFrequentlyUsedEmojis,
	)) {
		const decodedEmoji = decodePersistedEmoji(storedEmoji, validEmojiChars);
		const numericFrequency =
			typeof frequency === "number" ? frequency : Number(frequency);

		if (
			decodedEmoji == null ||
			!Number.isFinite(numericFrequency) ||
			numericFrequency <= 0
		) {
			continue;
		}

		normalizedEntries.set(
			decodedEmoji,
			(normalizedEntries.get(decodedEmoji) ?? 0) + numericFrequency,
		);
	}

	// Hidden history does not consume the existing visible-favorites limit.
	let supportedCount = 0;
	return Object.fromEntries(
		[...normalizedEntries.entries()]
			.sort(([, first], [, second]) => second - first)
			.filter(([emoji]) => {
				if (!supportedEmojiChars.has(emoji)) {
					return true;
				}
				supportedCount += 1;
				return supportedCount <= limit;
			}),
	);
}

export function serializeFrequentlyUsedEmojis(
	frequentlyUsedEmojis: Readonly<Record<string, number>>,
	validEmojiChars: ReadonlySet<string>,
): Record<string, number> {
	const serializedEntries: Array<[string, number]> = [];

	for (const [emoji, frequency] of Object.entries(frequentlyUsedEmojis)) {
		if (
			!validEmojiChars.has(emoji) ||
			!Number.isFinite(frequency) ||
			frequency <= 0
		) {
			continue;
		}

		serializedEntries.push([encodePersistedEmoji(emoji), frequency]);
	}

	return Object.fromEntries(serializedEntries);
}
