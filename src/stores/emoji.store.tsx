import { solNative } from "lib/SolNative";
import MiniSearch from "minisearch";
import { autorun, makeAutoObservable, runInAction, toJS } from "mobx";
import { Platform } from "react-native";
import type { IRootStore } from "store";
import {
	getDisplayedEmoji,
	getVisibleEmojiFavorites,
	isEmojiSupported,
	normalizePersistedFrequentlyUsedEmojis,
	recordEmojiUse,
	serializeFrequentlyUsedEmojis,
} from "../lib/emojiCompatibility";
import { applyEmojiSkinTone } from "../lib/emojiSkinTones";
import { emojis as rawEmojis_ } from "../lib/emojis";
import { extraSymbols } from "../lib/symbols";
import { readPersistedStore, writePersistedStore } from "./persisted-config";

export interface Emoji {
	emoji: string;
	description: string;
	category: string;
	aliases: string[];
	tags: string[];
	macos_version?: string;
}

type DisplayEmoji = Emoji & { baseEmoji: string };

// Validity uses the full catalog; only the supported subset is selectable.
const knownEmojis: Emoji[] = [...rawEmojis_, ...extraSymbols];
const validEmojiChars = new Set(knownEmojis.map((emoji) => emoji.emoji));
const currentMacOSVersion = Platform.Version;
const supportedEmojis = knownEmojis
	.filter((emoji) => isEmojiSupported(emoji, currentMacOSVersion))
	.map((emoji, id) => ({ ...emoji, baseEmoji: emoji.emoji, id }));
const supportedEmojiChars = new Set(supportedEmojis.map((emoji) => emoji.emoji));

const minisearch = new MiniSearch<Emoji & { id: number }>({
	fields: ["description", "category", "aliases", "tags"],
	searchOptions: {
		prefix: true,
		fuzzy: 0.2,
		boost: { description: 2, aliases: 1.5, tags: 1 },
	},
});

minisearch.addAll(supportedEmojis);

export const EMOJI_ROW_SIZE = 7;

function groupEmojis(emojis: DisplayEmoji[]): Array<DisplayEmoji[]> {
	const emojisArray: Array<DisplayEmoji[]> = [];

	for (let i = 0; i < emojis.length; i += EMOJI_ROW_SIZE) {
		emojisArray.push(emojis.slice(i, i + EMOJI_ROW_SIZE));
	}

	return emojisArray;
}

export type EmojiStore = ReturnType<typeof createEmojiStore>;

export const createEmojiStore = (root: IRootStore) => {
	const persist = () => {
		const frequentlyUsedEmojis = serializeFrequentlyUsedEmojis(
			toJS(store.frequentlyUsedEmojis),
			validEmojiChars,
		);

		writePersistedStore("emoji", { frequentlyUsedEmojis });
	};

	const hydrate = async () => {
		const persistedState = await readPersistedStore<{
			frequentlyUsedEmojis?: Record<string, unknown>;
		}>("emoji");

		if (!persistedState) {
			return;
		}

		runInAction(() => {
			store.frequentlyUsedEmojis = normalizePersistedFrequentlyUsedEmojis(
				persistedState.frequentlyUsedEmojis,
				validEmojiChars,
				supportedEmojiChars,
				EMOJI_ROW_SIZE,
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
		get visibleFavorites(): Array<[string, number]> {
			return getVisibleEmojiFavorites(
				store.frequentlyUsedEmojis,
				supportedEmojiChars,
				EMOJI_ROW_SIZE,
			);
		},
		get preferredEmojis(): DisplayEmoji[] {
			const tone = root.ui.emojiSkinTone;
			if (tone === "default") {
				return supportedEmojis;
			}

			return supportedEmojis.map((entry) => {
				const emoji = applyEmojiSkinTone(entry.emoji, tone, currentMacOSVersion);
				return emoji === entry.emoji ? entry : { ...entry, emoji };
			});
		},
		get emojis(): DisplayEmoji[][] {
			const query = root.ui.query;
			const preferredEmojis = store.preferredEmojis;
			const searchResults = query
				? groupEmojis(
						minisearch.search(query).map(({ id }) => preferredEmojis[id]),
					)
				: groupEmojis(preferredEmojis);

			const favorites = store.visibleFavorites;
			if (!query && favorites.length) {
				const tone = root.ui.emojiSkinTone;
				const mappedFavorites: DisplayEmoji[] = favorites.map(([baseEmoji]) => ({
					baseEmoji,
					emoji: applyEmojiSkinTone(baseEmoji, tone, currentMacOSVersion),
					description: "",
					category: "",
					aliases: [],
					tags: [],
				}));

				for (let i = mappedFavorites.length; i < EMOJI_ROW_SIZE; i++) {
					mappedFavorites.push({
						baseEmoji: "",
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
			const emoji = getDisplayedEmoji(store.emojis, index, EMOJI_ROW_SIZE);
			if (!emoji) {
				return;
			}

			const emojiChar = emoji.emoji;
			recordEmojiUse(
				store.frequentlyUsedEmojis,
				emoji.baseEmoji,
				store.visibleFavorites,
				EMOJI_ROW_SIZE,
			);

			solNative.insertToFrontmostApp(emojiChar);
		},
	});

	hydrate().then(() => {
		autorun(persist);
	});

	return store;
};
