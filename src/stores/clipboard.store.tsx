import AsyncStorage from "@react-native-async-storage/async-storage";
import { solNative } from "lib/SolNative";
import { autorun, makeAutoObservable, runInAction, toJS } from "mobx";
import type { EmitterSubscription } from "react-native";
import type { IRootStore } from "store";
import { Widget } from "./ui.store";
import MiniSearch from "minisearch";
import { storage } from "./storage";


const MAX_ITEMS = 1000;
const MAX_TEXT_INDEX_LENGTH = 500; // Only index first N chars for search
const PERSIST_DEBOUNCE_MS = 2000;

let onTextCopiedListener: EmitterSubscription | undefined;
let onFileCopiedListener: EmitterSubscription | undefined;
let persistTimer: ReturnType<typeof setTimeout> | undefined;

export type ClipboardStore = ReturnType<typeof createClipboardStore>;

export type PasteItem = {
	id: number;
	text: string;
	url?: string | null;
	bundle?: string | null;
	datetime: number;
	pinned?: boolean;
};

// Simple hash for fast duplicate detection instead of full string comparison
function hashText(text: string): string {
	const len = text.length;
	if (len === 0) return "0";
	// Use length + first/middle/last chars + a simple rolling hash on a sample
	const sampleSize = Math.min(len, 256);
	let h = len;
	for (let i = 0; i < sampleSize; i++) {
		const idx = Math.floor((i * len) / sampleSize);
		h = (Math.imul(h, 31) + text.charCodeAt(idx)) | 0;
	}
	return `${len}:${h}`;
}

const minisearch = new MiniSearch({
	fields: ["indexText"],
	storeFields: ["id", "datetime"],
});

export const createClipboardStore = (root: IRootStore) => {
	// Hash map for O(1) duplicate detection: hash -> index in items array
	const textHashMap = new Map<string, number>();

	function rebuildHashMap() {
		textHashMap.clear();
		for (let i = 0; i < store.items.length; i++) {
			const hash = hashText(store.items[i].text);
			// Only store first occurrence (latest, since items are sorted newest-first)
			if (!textHashMap.has(hash)) {
				textHashMap.set(hash, i);
			}
		}
	}

	function findDuplicateIndex(text: string): number {
		const hash = hashText(text);
		const candidateIdx = textHashMap.get(hash);
		if (candidateIdx === undefined || candidateIdx >= store.items.length) {
			return -1;
		}
		// Verify it's actually the same text (hash collision check)
		if (store.items[candidateIdx].text === text) {
			return candidateIdx;
		}
		return -1;
	}

	function addToIndex(item: PasteItem) {
		try {
			minisearch.add({
				id: item.id,
				indexText: item.text.slice(0, MAX_TEXT_INDEX_LENGTH),
				datetime: item.datetime,
			});
		} catch {
			// ignore duplicate id errors
		}
	}

	function removeFromIndex(item: PasteItem) {
		try {
			minisearch.discard(item.id);
		} catch {
			// ignore missing id errors
		}
	}

	const store = makeAutoObservable({
		clipboardMenuOpen: false,
		_persistVersion: 0,
		deleteItem: (displayIndex: number) => {
			const displayItems = store.clipboardItems;
			const item = displayItems[displayIndex];
			if (!item) return;
			const rawIndex = store.items.findIndex((i) => i.id === item.id);
			if (rawIndex === -1) return;
			removeFromIndex(item);
			store.items.splice(rawIndex, 1);
			rebuildHashMap();
		},
		deleteAllItems: () => {
			store.items = [];
			minisearch.removeAll();
			textHashMap.clear();
		},
		toggleClipboardMenu: () => {
			store.clipboardMenuOpen = !store.clipboardMenuOpen;
		},
		closeClipboardMenu: () => {
			store.clipboardMenuOpen = false;
		},
		togglePin: (displayIndex: number) => {
			const displayItems = store.clipboardItems;
			const item = displayItems[displayIndex];
			if (!item) return;
			const rawIndex = store.items.findIndex((i) => i.id === item.id);
			if (rawIndex === -1) return;
			store.items.splice(rawIndex, 1, {
				...store.items[rawIndex],
				pinned: !store.items[rawIndex].pinned,
			});
			store._persistVersion++;
			const newIndex = store.clipboardItems.findIndex(
				(i) => i.id === item.id,
			);
			if (newIndex !== -1) {
				root.ui.selectedIndex = newIndex;
			}
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

			store.items.unshift(newItem);
			addToIndex(newItem);
			rebuildHashMap();
			store.removeLastItemIfNeeded();
		},
		onTextCopied: (obj: { text: string; bundle: string | null }) => {
			if (!obj.text) {
				return;
			}

			const index = findDuplicateIndex(obj.text);
			// Item already exists, move to top
			if (index !== -1) {
				store.popToTop(index);
				return;
			}

			const newItem: PasteItem = {
				id: Date.now().valueOf(),
				datetime: Date.now(),
				...obj,
			};

			store.items.unshift(newItem);
			addToIndex(newItem);
			textHashMap.set(hashText(newItem.text), 0);
			// Shift all existing hash map entries by 1
			rebuildHashMap();
			store.removeLastItemIfNeeded();
		},
		get clipboardItems(): PasteItem[] {
			const items = store.items;

			if (!root.ui.query || root.ui.focusedWidget !== Widget.CLIPBOARD) {
				const hasPinned = items.some((i) => i.pinned);
				if (!hasPinned) return items.slice();
				const pinned: PasteItem[] = [];
				const unpinned: PasteItem[] = [];
				for (const item of items) {
					if (item.pinned) pinned.push(item);
					else unpinned.push(item);
				}
				return [...pinned, ...unpinned];
			}

			const now = Date.now();
			const results = minisearch.search(root.ui.query, {
				boostDocument: (documentId, term, storedFields) => {
					const dt =
						typeof storedFields?.datetime === "number"
							? storedFields.datetime
							: Number(storedFields?.datetime);
					if (!dt || Number.isNaN(dt)) return 1;
					const hoursAgo = (now - dt) / (1000 * 60 * 60);
					if (hoursAgo < 1) return 1.2;
					if (hoursAgo < 24) return 1.1;
					return 1;
				},
			});

			// Map search results back to full items by id
			const idToItem = new Map<number, PasteItem>();
			for (const item of items) {
				idToItem.set(item.id, item);
			}
			const mapped = results
				.map((r) => idToItem.get(r.id as number))
				.filter(Boolean) as PasteItem[];
			const hasPinned = mapped.some((i) => i.pinned);
			if (!hasPinned) return mapped;
			const pinned: PasteItem[] = [];
			const unpinned: PasteItem[] = [];
			for (const item of mapped) {
				if (item.pinned) pinned.push(item);
				else unpinned.push(item);
			}
			return [...pinned, ...unpinned];
		},
		removeLastItemIfNeeded: () => {
			while (store.items.length > MAX_ITEMS) {
				// Find the last unpinned item to evict
				let evictIdx = -1;
				for (let i = store.items.length - 1; i >= 0; i--) {
					if (!store.items[i].pinned) {
						evictIdx = i;
						break;
					}
				}
				if (evictIdx === -1) break; // all items are pinned
				const [removed] = store.items.splice(evictIdx, 1);
				removeFromIndex(removed);
			}
		},
		popToTop: (index: number) => {
			const [item] = store.items.splice(index, 1);
			item.datetime = Date.now();
			store.items.unshift(item);
			rebuildHashMap();
			// Update MiniSearch so datetime boost stays correct
			removeFromIndex(item);
			addToIndex(item);
			store._persistVersion++;
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
			if (persistTimer) {
				clearTimeout(persistTimer);
				persistTimer = undefined;
			}
		},
	});

	onTextCopiedListener = solNative.addListener(
		"onTextCopied",
		store.onTextCopied,
	);

	onFileCopiedListener = solNative.addListener(
		"onFileCopied",
		store.onFileCopied,
	);

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
				items = items.map((item: any) => ({
					...item,
					datetime:
						typeof item.datetime === "number" && !Number.isNaN(item.datetime)
							? item.datetime
							: item.id || Date.now(),
				}));
				runInAction(() => {
					store.items = items;
					for (const item of store.items) {
						addToIndex(item);
					}
					rebuildHashMap();
				});
			}
		}
	};

	const doPersist = async () => {
		if (store.saveHistory) {
			try {
				await solNative.securelyStore(
					"@sol.clipboard_history_v2",
					JSON.stringify(store.items),
				);
			} catch (e) {
				console.warn("Could not persist data", e);
			}
		}

		const storeState = { saveHistory: store.saveHistory };
		try {
			await AsyncStorage.setItem(
				"@clipboard.store",
				JSON.stringify(storeState),
			);
		} catch (e) {
			await AsyncStorage.clear();
			await AsyncStorage.setItem(
				"@clipboard.store",
				JSON.stringify(storeState),
			).catch((e) =>
				console.warn("Could re-persist clipboard store", e),
			);
		}
	};

	hydrate().then(() => {
		autorun(() => {
			// Touch observables to track them
			const _ = store.items.length;
			const __ = store.saveHistory;
			const ___ = store._persistVersion;

			// Debounce the actual persist
			if (persistTimer) {
				clearTimeout(persistTimer);
			}
			persistTimer = setTimeout(doPersist, PERSIST_DEBOUNCE_MS);
		});
	});

	return store;
};
