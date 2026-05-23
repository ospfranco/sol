import { solNative } from "lib/SolNative";
import MiniSearch from "minisearch";
import { autorun, makeAutoObservable, runInAction, toJS } from "mobx";
import type { IRootStore } from "store";
import { emojis as rawEmojis_ } from "../lib/emojis";
import { readPersistedStore, writePersistedStore } from "./persisted-config";

const rawEmojis = rawEmojis_.map((emoji: any, idx) => ({ id: idx, ...emoji }));
const validEmojiChars = new Set(rawEmojis.map((emoji) => emoji.emoji));
const EMOJI_STORAGE_PREFIX = "cp:";

export interface Emoji {
	emoji: string;
	description: string;
	category: string;
	aliases: string[];
	tags: string[];
}

const minisearch = new MiniSearch({
	fields: ["description", "category", "aliases", "tags"],
	storeFields: ["emoji"],
	searchOptions: {
		prefix: true,
		fuzzy: 0.2,
		boost: { description: 2, aliases: 1.5, tags: 1 },
	},
});

minisearch.addAll(rawEmojis);

export const EMOJI_ROW_SIZE = 7;

function groupEmojis(emojis: Emoji[]): Array<Emoji[]> {
	const emojisArray: Array<Emoji[]> = [];

	for (let i = 0; i < emojis.length; i += EMOJI_ROW_SIZE) {
		emojisArray.push(emojis.slice(i, i + EMOJI_ROW_SIZE));
	}

	return emojisArray;
}

function encodePersistedEmoji(emoji: string): string {
	const encodedCodePoints = Array.from(emoji, (symbol) => {
		const codePoint = symbol.codePointAt(0);
		return codePoint == null ? "" : codePoint.toString(16);
	}).filter(Boolean);

	return `${EMOJI_STORAGE_PREFIX}${encodedCodePoints.join("-")}`;
}

function decodePersistedEmoji(storedEmoji: string): string | null {
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

function normalizePersistedFrequentlyUsedEmojis(
	storedFrequentlyUsedEmojis?: Record<string, unknown>,
): Record<string, number> {
	if (!storedFrequentlyUsedEmojis) {
		return {};
	}

	const normalizedEntries = new Map<string, number>();

	for (const [storedEmoji, frequency] of Object.entries(
		storedFrequentlyUsedEmojis,
	)) {
		const decodedEmoji = decodePersistedEmoji(storedEmoji);
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

	return Object.fromEntries(
		[...normalizedEntries.entries()]
			.sort(([_, frequency1], [_2, frequency2]) => frequency2 - frequency1)
			.slice(0, EMOJI_ROW_SIZE),
	);
}

function serializeFrequentlyUsedEmojis(
	frequentlyUsedEmojis: Record<string, number>,
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

export type EmojiStore = ReturnType<typeof createEmojiStore>;

export const createEmojiStore = (root: IRootStore) => {
	const persist = () => {
		const frequentlyUsedEmojis = serializeFrequentlyUsedEmojis(
			toJS(store.frequentlyUsedEmojis),
		);

		writePersistedStore("emoji", { frequentlyUsedEmojis });
	};

	const hydrate = async () => {
		const persistedState = await readPersistedStore<{
			frequentlyUsedEmojis?: Record<string, unknown>;
		}>("emoji", (legacyState) => ({
			frequentlyUsedEmojis: legacyState.frequentlyUsedEmojis ?? {},
		}));

		if (!persistedState) {
			return;
		}

		runInAction(() => {
			store.frequentlyUsedEmojis = normalizePersistedFrequentlyUsedEmojis(
				persistedState.frequentlyUsedEmojis,
			);
		});
	};

	const store = makeAutoObservable({
		//    ____  _                              _     _
		//   / __ \| |                            | |   | |
		//  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
		//  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
		//  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
		//   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
		frequentlyUsedEmojis: {} as Record<string, number>,
		//    _____                            _           _
		//   / ____|                          | |         | |
		//  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
		//  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
		//  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
		//   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
		//                        | |
		//                        |_|
		get emojis(): Emoji[][] {
			const query = root.ui.query;
			const searchResults = query
				? groupEmojis(minisearch.search(query) as any)
				: groupEmojis(rawEmojis);

			// TODO move these from UI Store here
			const favorites = Object.entries(store.frequentlyUsedEmojis);
			if (!root.ui.query && favorites.length) {
				const mappedFavorites = favorites
					.sort(([_, frequency1], [_2, frequency2]) => frequency2 - frequency1)
					.map((entry) => ({
						emoji: entry[0],
						description: "",
						category: "",
						aliases: [],
						tags: [],
					}));

				for (let i = mappedFavorites.length; i < EMOJI_ROW_SIZE; i++) {
					mappedFavorites.push({
						emoji: "",
						description: "",
						category: "",
						aliases: [],
						tags: [],
					});
				}

				return [mappedFavorites, ...searchResults];
			}

			return searchResults;
		},
		insert(index: number) {
			const favorites = Object.entries(store.frequentlyUsedEmojis).sort(
				([_, freq1], [_2, freq2]) => freq2 - freq1,
			);

			const query = root.ui.query;
			const data = query ? minisearch.search(query) : rawEmojis;
			const emoji = data[index];
			if (!emoji) {
				return;
			}

			let emojiChar = emoji.emoji;
			if (favorites.length && !query) {
				if (index < EMOJI_ROW_SIZE) {
					emojiChar = favorites[index]?.[0];
					if (!emojiChar) {
						return;
					}
				} else {
					emojiChar = data[index - EMOJI_ROW_SIZE].emoji;
				}
			}

			if (store.frequentlyUsedEmojis[emojiChar]) {
				store.frequentlyUsedEmojis[emojiChar] += 1;
			} else if (favorites.length === EMOJI_ROW_SIZE) {
				let leastUsed = favorites[0];
				favorites.forEach(([favoriteEmoji, frequency]) => {
					if (frequency < leastUsed[1]) {
						leastUsed = [favoriteEmoji, frequency];
					}
				});

				delete store.frequentlyUsedEmojis[leastUsed[0]];
				store.frequentlyUsedEmojis[emojiChar] = 1;
			} else {
				store.frequentlyUsedEmojis[emojiChar] = 1;
			}

			solNative.insertToFrontmostApp(emojiChar);
		},
	});

	hydrate().then(() => {
		autorun(persist);
	});

	return store;
};
