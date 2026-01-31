import AsyncStorage from "@react-native-async-storage/async-storage";
import { solNative } from "lib/SolNative";
import { autorun, makeAutoObservable, runInAction, toJS } from "mobx";
import type { EmitterSubscription } from "react-native";
import type { IRootStore } from "store";
import { Widget } from "./ui.store";
import MiniSearch from "minisearch";
import { storage } from "./storage";
import { safeCaptureException } from "../config";

const MAX_ITEMS = 1000;

let onTextCopiedListener: EmitterSubscription | undefined;
let onFileCopiedListener: EmitterSubscription | undefined;

export type ClipboardStore = ReturnType<typeof createClipboardStore>;

export type PasteItem = {
	id: number;
	text: string;
	url?: string | null;
	bundle?: string | null;
	datetime: number; // Unix timestamp when copied
};

const minisearch = new MiniSearch({
	fields: ["text"],
	storeFields: ["id", "text", "url", "bundle", "datetime"],
	// tokenize: (text: string, fieldName?: string) =>
	// 	text.toLowerCase().split(/[\s\.-]+/),
});

export const createClipboardStore = (root: IRootStore) => {
	const store = makeAutoObservable({
		deleteItem: (index: number) => {
			if (index >= 0 && index < store.items.length) {
				minisearch.remove(store.items[index]);
				store.items.splice(index, 1);
			}
		},
		deleteAllItems: () => {
			store.items = [];
			minisearch.removeAll();
		},
		items: [] as PasteItem[],
		saveHistory: false,
		onFileCopied: (obj: {
			text: string;
			url: string;
			bundle: string | null;
		}) => {
			const newItem: PasteItem = {
				id: +Date.now(),
				datetime: Date.now(),
				...obj,
			};

			// If save history move file to more permanent storage
			if (store.saveHistory) {
				// TODO!
			}

			// const index = store.items.findIndex(t => t.text === newItem.text)
			// // Item already exists, move to top
			// if (index !== -1) {
			//   // Re-add to minisearch to update the order
			//   minisearch.remove(store.items[index])
			//   minisearch.add(newItem)

			//   store.popToTop(index)
			//   return
			// }

			// Item does not already exist, put to queue and add to minisearch
			store.items.unshift(newItem);
			minisearch.add(newItem);

			// Remove last item from minisearch
			store.removeLastItemIfNeeded();
		},
		onTextCopied: (obj: { text: string; bundle: string | null }) => {
			if (!obj.text) {
				return;
			}

			const newItem: PasteItem = {
				id: Date.now().valueOf(),
				datetime: Date.now(),
				...obj,
			};

			const index = store.items.findIndex((t) => t.text === newItem.text);
			// Item already exists, move to top
			if (index !== -1) {
				// Re-add to minisearch to update the order
				minisearch.remove(store.items[index]);
				minisearch.add(store.items[index]);

				store.popToTop(index);
				return;
			}

			// Item does not already exist, put to queue and add to minisearch
			store.items.unshift(newItem);
			minisearch.add(newItem);

			// Remove last item from minisearch
			store.removeLastItemIfNeeded();
		},
		get clipboardItems(): PasteItem[] {
			const items = store.items;

			if (!root.ui.query || root.ui.focusedWidget !== Widget.CLIPBOARD) {
				return items;
			}

			// Boost recent items in search results
			const now = Date.now();
			return minisearch.search(root.ui.query, {
				boostDocument: (documentId, term, storedFields) => {
					const dt =
						typeof storedFields?.datetime === "number"
							? storedFields.datetime
							: Number(storedFields?.datetime);
					if (!dt || Number.isNaN(dt)) return 1;
					// Boost items copied in the last 24h, scale down for older
					const hoursAgo = (now - dt) / (1000 * 60 * 60);
					if (hoursAgo < 1) return 1.2; // very recent
					if (hoursAgo < 24) return 1.1; // recent
					return 1;
				},
				// boost: { text: 2 },
				// prefix: true,
				// fuzzy: 0.1,
			}) as any;
		},
		removeLastItemIfNeeded: () => {
			if (store.items.length > MAX_ITEMS) {
				try {
					minisearch.remove(store.items[store.items.length - 1]);
				} catch (e) {
					safeCaptureException(e);
				}

				store.items = store.items.slice(0, MAX_ITEMS);
			}
		},
		popToTop: (index: number) => {
			const newItems = [...store.items];
			const item = newItems.splice(index, 1);
			newItems.unshift(item[0]);
			store.items = newItems;
		},
		setSaveHistory: (v: boolean) => {
			store.saveHistory = v;
			if (!v) {
				solNative.securelyStore("@sol.clipboard_history_v2", "[]");
			}
		},
		cleanUp: () => {
			onTextCopiedListener?.remove();
			onTextCopiedListener = undefined;
			onFileCopiedListener?.remove();
			onFileCopiedListener = undefined;
		},
	});

	onTextCopiedListener = solNative.addListener(
		"onTextCopied",
		store.onTextCopied,
	);
	// onFileCopiedListener = solNative.addListener(
	//   'onFileCopied',
	//   store.onFileCopied,
	// )

	const hydrate = async () => {
		let state: string | null | undefined;
		try {
			state = storage.getString("@clipboard.store");
		} catch {
			// intentionally left blank
		}
		if (!state) {
			state = await AsyncStorage.getItem("@clipboard.store");
		}

		if (state) {
			const parsedStore = JSON.parse(state);
			store.saveHistory = parsedStore.saveHistory;
		}

		if (store.saveHistory) {
			const entry = await solNative.securelyRetrieve(
				"@sol.clipboard_history_v2",
			);

			if (entry) {
				let items = JSON.parse(entry);
				// Ensure all items have datetime
				items = items.map((item: any) => ({
					...item,
					datetime:
						typeof item.datetime === "number" && !Number.isNaN(item.datetime)
							? item.datetime
							: item.id || Date.now(), // fallback: use id or now
				}));
				runInAction(() => {
					store.items = items;
					minisearch.addAll(store.items);
				});
			}
		}
	};

	const persist = async () => {
		if (store.saveHistory) {
			// Ensure all items have datetime before persisting
			const itemsToPersist = store.items.map((item) => ({
				...item,
				datetime:
					typeof item.datetime === "number" && !Number.isNaN(item.datetime)
						? item.datetime
						: item.id || Date.now(),
			}));
			try {
				await solNative.securelyStore(
					"@sol.clipboard_history_v2",
					JSON.stringify(itemsToPersist),
				);
			} catch (e) {
				console.warn("Could not persist data", e);
			}
		}

		const storeWithoutItems = { ...store };
		storeWithoutItems.items = [];

		try {
			await AsyncStorage.setItem(
				"@clipboard.store",
				JSON.stringify(storeWithoutItems),
			);
		} catch (e) {
			await AsyncStorage.clear();
			await AsyncStorage.setItem(
				"@clipboard.store",
				JSON.stringify(storeWithoutItems),
			).catch((e) =>
				console.warn("Could re-persist persist clipboard store", e),
			);
		}
	};

	hydrate().then(() => {
		autorun(persist);
	});

	return store;
};
