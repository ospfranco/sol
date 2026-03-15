import AsyncStorage from "@react-native-async-storage/async-storage";
import { Assets } from "assets";
import { Parser } from "expr-eval";
import { solNative } from "lib/SolNative";
import { CONSTANTS } from "lib/constants";
import { googleTranslate } from "lib/translator";
import {
	autorun,
	type IReactionDisposer,
	makeAutoObservable,
	reaction,
	runInAction,
	toJS,
} from "mobx";
import {
	Appearance,
	type EmitterSubscription,
	type LayoutChangeEvent,
	Linking,
	type NativeEventSubscription,
} from "react-native";
import type { IRootStore } from "store";
import { createBaseItems } from "./items";
import MiniSearch from "minisearch";
import * as Sentry from "@sentry/react-native";
import { storage } from "./storage";
import { defaultShortcuts } from "lib/shortcuts";

const exprParser = new Parser();
const QUERY_PREFERENCE_BOOST = 4;
const MAX_QUERY_PREFERENCE_ITEMS = 25;

type FrequencyMap = Record<string, number>;
type QueryFrequencyMap = Record<string, FrequencyMap>;

let onShowListener: EmitterSubscription | undefined;
let onHideListener: EmitterSubscription | undefined;
let onFileSearchListener: EmitterSubscription | undefined;
let onHotkeyListener: EmitterSubscription | undefined;
let onAppsChangedListener: EmitterSubscription | undefined;
let appareanceListener: NativeEventSubscription | undefined;
let bookmarksDisposer: IReactionDisposer | undefined;
let fileSearchTimer: ReturnType<typeof setTimeout> | undefined;
let fileSearchDisposer: IReactionDisposer | undefined;

export enum Widget {
	ONBOARDING = "ONBOARDING",
	SEARCH = "SEARCH",
	CALENDAR = "CALENDAR",
	TRANSLATION = "TRANSLATION",
	SETTINGS = "SETTINGS",
	CREATE_ITEM = "CREATE_ITEM",
	GOOGLE_MAP = "GOOGLE_MAP",
	SCRATCHPAD = "SCRATCHPAD",
	EMOJIS = "EMOJIS",
	CLIPBOARD = "CLIPBOARD",
	PROCESSES = "PROCESSES",
	FILE_SEARCH = "FILE_SEARCH",
}

export enum ItemType {
	FILE = "FILE",
	APPLICATION = "APPLICATION",
	CONFIGURATION = "CONFIGURATION",
	CUSTOM = "CUSTOM",
	USER_SCRIPT = "USER_SCRIPT",
	TEMPORARY_RESULT = "TEMPORARY_RESULT",
	BOOKMARK = "BOOKMARK",
	PREFERENCE_PANE = "PREFERENCE_PANE",
	SHORTCUT = "SHORTCUT",
}

export enum ScratchPadColor {
	SYSTEM = "SYSTEM",
	BLUE = "BLUE",
	ORANGE = "ORANGE",
}

export enum FileSearchMode {
	FUZZY = 0,
	PATH = 1,
	REGEX = 2,
}

const minisearch = new MiniSearch({
	fields: ["name", "localizedName", "alias", "type"],
	storeFields: [
		"name",
		"localizedName",
		"icon",
		"iconName",
		"iconImage",
		"IconComponent",
		"color",
		"url",
		"preventClose",
		"type",
		"alias",
		"subName",
		"callback",
		"metaCallback",
		"isApplescript",
		"text",
		"shortcut",
		"isFavorite",
		"isRunning",
		"bookmarkFolder",
		"faviconFallback",
	],
	tokenize: (text: string, fieldName?: string) =>
		text.toLowerCase().split(/[\s\.-]+/),
});

const userName = solNative.userName();
const defaultSearchFolders = [
	`/Users/${userName}/Downloads`,
	`/Users/${userName}/Documents`,
	`/Users/${userName}/Desktop`,
	`/Users/${userName}/Pictures`,
	`/Users/${userName}/Movies`,
	`/Users/${userName}/Music`,
];

export type UIStore = ReturnType<typeof createUIStore>;
type SearchEngine = "google" | "bing" | "duckduckgo" | "perplexity" | "custom";

const itemsThatShouldShowWindow = [
	"emoji_picker",
	"clipboard_manager",
	"process_manager",
	"scratchpad",
	"file_search",
];

const itemIdToWidget: Record<string, Widget> = {
	emoji_picker: Widget.EMOJIS,
	clipboard_manager: Widget.CLIPBOARD,
	process_manager: Widget.PROCESSES,
	scratchpad: Widget.SCRATCHPAD,
	file_search: Widget.FILE_SEARCH,
};

function getInitials(name: string) {
	return name
		.toLowerCase()
		.split(" ")
		.map((s) => s.charAt(0))
		.join("");
}

function traverse(
	bookmarks: any[],
	nodes: any[],
	bookmarkFolder: null | string,
) {
	for (const node of nodes) {
		if (node.type === "folder") {
			traverse(bookmarks, node.children, node.name);
		} else if (node.type === "url") {
			bookmarks.push({ title: node.name, url: node.url, bookmarkFolder });
		}
	}
}

const EXPRESSION_RESULT_DECIMALS = 12;

function formatExpressionResult(value: number) {
	if (!Number.isFinite(value)) {
		return value.toString();
	}

	const scale = 10 ** EXPRESSION_RESULT_DECIMALS;
	const rounded = Math.round((value + Number.EPSILON) * scale) / scale;
	return rounded.toString();
}

function normalizeSearchQuery(query: string) {
	return query.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeFrequencyMap(raw: unknown): FrequencyMap {
	if (raw == null || typeof raw !== "object") {
		return {};
	}

	const frequencyEntries = Object.entries(
		raw as Record<string, unknown>,
	).filter(
		([key, value]) =>
			key.length > 0 &&
			typeof value === "number" &&
			Number.isFinite(value) &&
			value > 0,
	);

	if (frequencyEntries.length === 0) {
		return {};
	}

	const frequencies = Object.fromEntries(frequencyEntries) as FrequencyMap;
	const maxValue = Math.max(0, ...Object.values(frequencies));

	if (maxValue <= 100) {
		return frequencies;
	}

	return Object.fromEntries(
		Object.entries(frequencies).map(([key, value]) => [
			key,
			Math.floor((value / maxValue) * 100),
		]),
	) as FrequencyMap;
}

function compactFrequencyMap(frequencies: FrequencyMap): FrequencyMap {
	const entries = Object.entries(frequencies)
		.filter(([, value]) => Number.isFinite(value) && value > 0)
		.sort(([, left], [, right]) => right - left);

	if (entries.length <= MAX_QUERY_PREFERENCE_ITEMS) {
		return Object.fromEntries(entries) as FrequencyMap;
	}

	return Object.fromEntries(
		entries.slice(0, MAX_QUERY_PREFERENCE_ITEMS),
	) as FrequencyMap;
}

function normalizeQueryFrequencyMap(raw: unknown): QueryFrequencyMap {
	if (raw == null || typeof raw !== "object") {
		return {};
	}

	const queryFrequencies: QueryFrequencyMap = {};

	for (const [query, bucket] of Object.entries(
		raw as Record<string, unknown>,
	)) {
		const normalizedQuery = normalizeSearchQuery(query);
		if (normalizedQuery.length === 0) {
			continue;
		}

		const normalizedBucket = normalizeFrequencyMap(bucket);
		if (Object.keys(normalizedBucket).length === 0) {
			continue;
		}

		const mergedBucket = queryFrequencies[normalizedQuery] ?? {};
		for (const [itemKey, value] of Object.entries(normalizedBucket)) {
			mergedBucket[itemKey] = (mergedBucket[itemKey] ?? 0) + value;
		}
		queryFrequencies[normalizedQuery] = compactFrequencyMap(mergedBucket);
	}

	return queryFrequencies;
}

function getQueryPrefixes(query: string) {
	const normalizedQuery = normalizeSearchQuery(query);
	return Array.from({ length: normalizedQuery.length }, (_, index) =>
		normalizedQuery.slice(0, index + 1),
	);
}

function getItemPreferenceKey(item: Pick<Item, "id" | "type" | "url">) {
	if (
		(item.type === ItemType.APPLICATION || item.type === ItemType.BOOKMARK) &&
		item.url
	) {
		return `${item.type}:${item.url}`;
	}

	return `${item.type}:${item.id}`;
}

export const createUIStore = (root: IRootStore) => {
	// Generation counter for showWindow rAF callbacks; incremented on every
	// hotkey toggle so stale deferred callbacks from earlier presses are ignored.
	let showGeneration = 0;

	// Counter for JS-initiated hideWindow calls. Each JS hide (via onHotkey
	// toggle-off) already resets state, so the subsequent onHide event from
	// native hideWindow() is redundant. This counter lets onHide skip the
	// redundant reset, preventing a stale onHide from clobbering state set
	// by a rapid reopen.
	let pendingJsHideCount = 0;

	const persist = async () => {
		const plainState = toJS(store);
		try {
			storage.set("@ui.store", JSON.stringify(plainState));
		} catch (e) {
			Sentry.captureException(e);
		}
	};

	const hydrate = async () => {
		let storeState: string | null | undefined;
		try {
			storeState = storage.getString("@ui.store");
		} catch {
			// intentionally left blank
		}
		if (!storeState) {
			storeState = await AsyncStorage.getItem("@ui.store");
		}

		if (storeState) {
			const parsedStore = JSON.parse(storeState);

			runInAction(() => {
				store.frequencies = normalizeFrequencyMap(parsedStore.frequencies);
				store.queryFrequencies = normalizeQueryFrequencyMap(
					parsedStore.queryFrequencies,
				);
				store.onboardingStep = parsedStore.onboardingStep;
				store.firstTranslationLanguage =
					parsedStore.firstTranslationLanguage ?? "en";
				store.secondTranslationLanguage =
					parsedStore.secondTranslationLanguage ?? "de";
				store.thirdTranslationLanguage =
					parsedStore.thirdTranslationLanguage ?? null;
				store.customItems = parsedStore.customItems ?? [];
				if (
					store.onboardingStep !== "v1_completed" &&
					store.onboardingStep !== "v1_skipped"
				) {
					store.focusedWidget = Widget.ONBOARDING;
				}
				store.note = parsedStore.note ?? "";
				// temporary code to prevent loss of data
				if (parsedStore.notes) {
					store.note = parsedStore.notes.reduce((acc: string, n: string) => {
						return `${acc}\n${n}`;
					}, "");
				}
				store.globalShortcut = parsedStore.globalShortcut;
				store.showWindowOn = parsedStore.showWindowOn ?? "screenWithFrontmost";
				store.calendarEnabled = parsedStore.calendarEnabled ?? true;
				store.showAllDayEvents = parsedStore.showAllDayEvents ?? true;
				store.launchAtLogin = parsedStore.launchAtLogin ?? true;
				store.mediaKeyForwardingEnabled =
					parsedStore.mediaKeyForwardingEnabled ?? true;
				store.history = parsedStore.history ?? [];
				store.showUpcomingEvent = parsedStore.showUpcomingEvent ?? true;
				store.scratchPadColor =
					parsedStore.scratchPadColor ?? ScratchPadColor.SYSTEM;
				store.searchFolders = parsedStore.searchFolders ?? defaultSearchFolders;
				store.searchEngine = parsedStore.searchEngine ?? "google";
				store.customSearchUrl =
					parsedStore.customSearchUrl ?? "https://google.com/search?q=%s";
				store.shortcuts = parsedStore.shortcuts ?? defaultShortcuts;
				store.showInAppBrowserBookMarks =
					parsedStore.showInAppBrowserBookMarks ?? true;
				store.hasDismissedGettingStarted =
					parsedStore.hasDismissedGettingStarted ?? false;
				store.hyperKeyEnabled = parsedStore.hyperKeyEnabled ?? false;
				store.disabledItemIds = parsedStore.disabledItemIds ?? [];
			});

			solNative.setLaunchAtLogin(parsedStore.launchAtLogin ?? true);
			solNative.setGlobalShortcut(parsedStore.globalShortcut);
			solNative.setShowWindowOn(
				parsedStore.showWindowOn ?? "screenWithFrontmost",
			);
			solNative.setMediaKeyForwardingEnabled(store.mediaKeyForwardingEnabled);
			solNative.setHyperKeyEnabled(store.hyperKeyEnabled);
			solNative.updateHotkeys(toJS(store.shortcuts), {}, {});

			store.username = solNative.userName();
			store.getApps();
			store.migrateCustomItems();
		} else {
			runInAction(() => {
				store.focusedWidget = Widget.ONBOARDING;
			});
		}
	};

	const baseItems = createBaseItems(root);

	const store = makeAutoObservable({
		//    ____  _                              _     _
		//   / __ \| |                            | |   | |
		//  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
		//  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
		//  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
		//   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/
		username: "",
		note: "",
		isAccessibilityTrusted: false,
		calendarAuthorizationStatus: null as CalendarAuthorizationStatus | null,
		onboardingStep: "v1_start" as OnboardingStep,
		searchEngine: "google" as SearchEngine,
		customSearchUrl: "https://google.com/search?q=%s" as string,
		globalShortcut: "option" as "command" | "option" | "control",
		scratchpadShortcut: "command" as "command" | "option" | "none",
		clipboardManagerShortcut: "shift" as "shift" | "option" | "none",
		showWindowOn: "screenWithFrontmost" as
			| "screenWithFrontmost"
			| "screenWithCursor",
		query: "",
		selectedIndex: 0,
		focusedWidget: Widget.SEARCH,
		events: [] as INativeEvent[],
		customItems: [] as Item[],
		disabledItemIds: [] as string[],
		editingCustomItem: null as Item | null,
		apps: [] as Item[],
		isLoading: false,
		translationResults: [] as string[],
		frequencies: {} as Record<string, number>,
		queryFrequencies: {} as QueryFrequencyMap,
		temporaryResult: null as string | null,
		firstTranslationLanguage: "en" as string,
		secondTranslationLanguage: "de" as string,
		thirdTranslationLanguage: null as null | string,
		fileSearchResults: [] as Item[],
		fileResults: [] as FileDescription[],
		fileSearchMode: FileSearchMode.FUZZY as FileSearchMode,
		fileSearchMenuOpen: false,
		fileSearchMenuIndex: 0,
		calendarEnabled: true,
		showAllDayEvents: true,
		launchAtLogin: true,
		hasFullDiskAccess: false,
		bookmarks: [] as Item[],
		mediaKeyForwardingEnabled: true,
		targetHeight: 64,
		isDarkMode: Appearance.getColorScheme() === "dark",
		history: [] as string[],
		historyPointer: 0,
		showUpcomingEvent: true,
		scratchPadColor: ScratchPadColor.SYSTEM,
		searchFolders: [] as string[],
		shortcuts: defaultShortcuts as Record<string, string>,
		showInAppBrowserBookMarks: true,
		hoveredEventId: null as string | null,
		hasDismissedGettingStarted: false,
		isVisible: false,
		showKeyboardRecorder: false,
		keyboardRecorderSelectedItem: null as string | null,
		shortcutSearchMode: false,
		shortcutSearchFilter: null as string | null,
		confirmDialogShown: false,
		confirmCallback: null as (() => any) | null,
		confirmTitle: null as string | null,
		macShortcuts: [] as Item[],
		hyperKeyEnabled: false,
		//    _____                            _           _
		//   / ____|                          | |         | |
		//  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
		//  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
		//  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
		//   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
		//                        | |
		//                        |_|
		get files(): Item[] {
			return store.fileSearchResults;
		},
		get items(): Item[] {
			const allItems = [
				...store.apps,
				...baseItems,
				...store.customItems,
				...root.scripts.scripts,
				...(store.showInAppBrowserBookMarks ? store.bookmarks : []),
				...store.macShortcuts,
			];

			// If the query is empty, return all items
			if (!store.query) {
				return allItems.sort((a, b) =>
					a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1,
				);
			}

			if (minisearch.documentCount === 0) {
				minisearch.addAll(allItems);
			} else {
				for (const item of allItems) {
					if (!minisearch.has(item.id)) {
						minisearch.add(item);
					}
				}
			}

			const normalizedQuery = normalizeSearchQuery(store.query);
			const queryFrequencies =
				store.queryFrequencies[normalizedQuery] ?? ({} as FrequencyMap);
			const maxFreq = Math.max(0, ...Object.values(store.frequencies));
			const maxQueryFreq = Math.max(0, ...Object.values(queryFrequencies));

			const results: Item[] = minisearch.search(store.query, {
				boost: {
					name: 2,
				},
				prefix: true,
				fuzzy: true,
				boostDocument: (
					documentId: any,
					term: string,
					storedFields?: Record<string, any>,
				) => {
					if (storedFields) {
						const freq = store.frequencies[storedFields.name] ?? 0;
						const globalBoost = maxFreq > 0 ? freq / maxFreq : 0;
						const queryPreferenceKey = getItemPreferenceKey({
							id: String(documentId),
							type: storedFields.type as ItemType,
							url: storedFields.url,
						});
						const queryFreq = queryFrequencies[queryPreferenceKey] ?? 0;
						const queryBoost =
							maxQueryFreq > 0
								? (queryFreq / maxQueryFreq) * QUERY_PREFERENCE_BOOST
								: 0;
						return 1 + globalBoost + queryBoost;
					}

					return 1;
				},
			}) as any;

			const temporaryResultItems = store.temporaryResult
				? [{ id: "temporary", type: ItemType.TEMPORARY_RESULT, name: "" }]
				: [];

			const finalResults: Item[] = [
				...(CONSTANTS.LESS_VALID_URL.test(store.query)
					? [
							{
								id: "open_url",
								type: ItemType.CONFIGURATION,
								name: "Open URL",
								icon: "🌎",
								callback: () => {
									if (store.query.startsWith("https://")) {
										Linking.openURL(store.query);
									} else {
										Linking.openURL(`https://${store.query}`);
									}
								},
							},
						]
					: []),
				...temporaryResultItems,
				...results,
			];

			return finalResults;
		},
		get currentItem(): Item | undefined {
			return store.items[store.selectedIndex];
		},
		//                _   _
		//      /\       | | (_)
		//     /  \   ___| |_ _  ___  _ __  ___
		//    / /\ \ / __| __| |/ _ \| '_ \/ __|
		//   / ____ \ (__| |_| | (_) | | | \__ \
		//  /_/    \_\___|\__|_|\___/|_| |_|___/
		setHoveredEventId: (id: string | null) => {
			store.hoveredEventId = id;
		},
		setHyperKeyEnabled: (enabled: boolean) => {
			store.hyperKeyEnabled = enabled;
			solNative.setHyperKeyEnabled(enabled);
		},
		rotateScratchPadColor: () => {
			if (store.scratchPadColor === ScratchPadColor.SYSTEM) {
				store.scratchPadColor = ScratchPadColor.BLUE;
			} else if (store.scratchPadColor === ScratchPadColor.BLUE) {
				store.scratchPadColor = ScratchPadColor.ORANGE;
			} else {
				store.scratchPadColor = ScratchPadColor.SYSTEM;
			}
		},
		setShowUpcomingEvent: (v: boolean) => {
			store.showUpcomingEvent = v;
			solNative.setUpcomingEventEnabled(v && store.calendarEnabled);
		},
		showEmojiPicker: () => {
			store.query = "";
			if (store.focusedWidget === Widget.EMOJIS) {
				store.focusedWidget = Widget.SEARCH;
			} else {
				store.focusWidget(Widget.EMOJIS);
			}
		},
		showSettings: () => {
			store.setQuery("");
			store.focusWidget(Widget.SETTINGS);
		},
		setSelectedIndex: (idx: number) => {
			store.selectedIndex = idx;
		},
		setNote: (note: string) => {
			store.note = note;
		},
		createCustomItem: (item: Item) => {
			store.customItems.push(item);
		},
		updateCustomItem: (updatedItem: Item) => {
			const index = store.customItems.findIndex((i) => i.id === updatedItem.id);
			if (index !== -1) {
				store.customItems[index] = updatedItem;
				minisearch.discard(updatedItem.id);
			}
		},
		deleteCustomItem: (itemId: string) => {
			store.customItems = store.customItems.filter((i) => i.id !== itemId);
			if (minisearch.has(itemId)) {
				minisearch.discard(itemId);
			}
		},
		setEditingCustomItem: (item: Item | null) => {
			store.editingCustomItem = item;
		},
		disableItem: (itemId: string) => {
			if (!store.disabledItemIds.includes(itemId)) {
				store.disabledItemIds.push(itemId);
				// Remove shortcut if present
				if (store.shortcuts[itemId]) {
					delete store.shortcuts[itemId];
				}
			}
		},
		enableItem: (itemId: string) => {
			store.disabledItemIds = store.disabledItemIds.filter(
				(id) => id !== itemId,
			);
		},
		isItemDisabled: (itemId: string) => {
			return store.disabledItemIds.includes(itemId);
		},
		translateQuery: async () => {
			store.isLoading = true;
			store.translationResults = [];
			store.focusedWidget = Widget.TRANSLATION;
			store.selectedIndex = 0;

			try {
				const translations = await googleTranslate(
					store.firstTranslationLanguage,
					store.secondTranslationLanguage,
					store.thirdTranslationLanguage,
					store.query,
				);

				runInAction(() => {
					store.translationResults = translations;
					store.isLoading = false;
				});
			} catch (e) {
				runInAction(() => {
					store.isLoading = false;
				});
			}
		},
		openKeyboardSettings: () => {
			try {
				Linking.openURL(`/System/Library/PreferencePanes/Keyboard.prefPane`);
			} catch (e) {
				console.error(`Could not open keyboard preferences ${e}`);
			}
		},
		setFirstTranslationLanguage: (l: string) => {
			store.firstTranslationLanguage = l;
		},
		setSecondTranslationLanguage: (l: string) => {
			store.secondTranslationLanguage = l;
		},
		setThirdTranslationLanguage: (l: string) => {
			store.thirdTranslationLanguage = l;
		},
		setOnboardingStep: (step: OnboardingStep) => {
			store.onboardingStep = step;
		},
		setGlobalShortcut: (key: "command" | "option" | "control") => {
			solNative.setGlobalShortcut(key);
			store.globalShortcut = key;
		},
		setShowWindowOn: (on: "screenWithFrontmost" | "screenWithCursor") => {
			solNative.setShowWindowOn(on);
			store.showWindowOn = on;
		},
		focusWidget: (widget: Widget) => {
			store.selectedIndex = 0;
			store.focusedWidget = widget;
		},
		setFocus: (widget: Widget) => {
			store.focusedWidget = widget;
		},
		setQuery: (query: string) => {
			store.query = query.replace("\n", " ");
			store.selectedIndex = 0;

			if (store.query === "") {
				return;
			}

			if (store.focusedWidget === Widget.SEARCH) {
				try {
					const res = exprParser.evaluate(store.query);
					if (typeof res === "number" && !Number.isNaN(res)) {
						store.temporaryResult = formatExpressionResult(res);
					} else {
						store.temporaryResult = null;
					}
				} catch (e) {
					store.temporaryResult = null;
				}

				if (query === "ip") {
					const info = solNative.getWifiInfo();
					if (info.ip) {
						store.temporaryResult = info.ip;
					}
				}
			}
		},
		trackSelectionForQuery: (query: string, item: Item) => {
			const prefixes = getQueryPrefixes(query);
			if (prefixes.length === 0 || !minisearch.has(item.id)) {
				return;
			}

			const itemPreferenceKey = getItemPreferenceKey(item);
			for (const prefix of prefixes) {
				const nextBucket = {
					...(store.queryFrequencies[prefix] ?? {}),
					[itemPreferenceKey]:
						(store.queryFrequencies[prefix]?.[itemPreferenceKey] ?? 0) + 1,
				};
				store.queryFrequencies[prefix] = compactFrequencyMap(nextBucket);
			}
		},
		updateApps: (
			apps: Array<{
				name: string;
				localizedName: string;
				url: string;
				isRunning: boolean;
			}>,
		) => {
			// First update the app list
			const appsRecord: Record<string, Item> = {};

			for (const { name, localizedName, url, isRunning } of apps) {
				if (name === "sol") {
					continue;
				}

				const alias = getInitials(name);
				// const plistPath = decodeURIComponent(
				//   url.replace('file://', '') + 'Contents/Info.plist',
				// )

				// if (solNative.exists(plistPath)) {
				//   try {
				//     let plistContent = solNative.readFile(plistPath)
				//     if (plistContent != null) {
				//       const properties = plist.parse(plistContent)
				//       alias = properties.CFBundleIdentifier ?? '' + getInitials(name)
				//     } else {
				//       alias = getInitials(name)
				//     }
				//   } catch (e) {
				//     // intentionally left blank
				//   }
				// }

				appsRecord[url] = {
					id: url,
					type: ItemType.APPLICATION as ItemType.APPLICATION,
					url: decodeURI(url.replace("file://", "")),
					name: name,
					localizedName: localizedName,
					isRunning,
					alias,
				};
			}

			// minisearch is stupid and there is no way to remove a single item via scanning
			// so we remove all items and add them again
			minisearch.removeAll();

			runInAction(() => {
				store.apps = Object.values(appsRecord);
			});

			// As a courtesy, we also remove keyboard shortcuts for applications that are no longer found
			// const shorcutsKeys = Object.keys(root.ui.shortcuts)
			// const ids = store.items.map(i => i.id)
			// for (const shortcutKey of shorcutsKeys) {
			//   if (!ids.includes(shortcutKey)) {
			//     delete root.ui.shortcuts[shortcutKey]
			//   }
			// }
		},
		getApps: () => {
			solNative.getApplications().then((apps) => {
				store.updateApps(apps);
				store.syncHotkeys();
			});
		},
		fetchMacShortcuts: () => {
			solNative.executeBashScriptSilent("shortcuts list").then((output) => {
				if (!output) return;
				const shortcuts: Item[] = output
					.split("\n")
					.map((line) => line.trim())
					.filter((line) => line.length > 0)
					.map((name) => ({
						id: `shortcut_${name}`,
						name,
						type: ItemType.SHORTCUT,
						icon: "⌨️",
						callback: () => {
							const escaped = name.replace(/'/g, "'\\''");
							solNative.executeBashScriptSilent(`shortcuts run '${escaped}'`);
							solNative.showToast("Shortcut executed", "success");
						},
					}));
				runInAction(() => {
					minisearch.removeAll();
					store.macShortcuts = shortcuts;
				});
			});
		},
		onShow: ({
			target,
			isToggle,
		}: { target?: string; isToggle?: boolean }) => {
			const showTargetWidget = (widget: string) => {
				switch (widget) {
					case Widget.CLIPBOARD:
						store.showClipboardManager();
						break;
					case Widget.SCRATCHPAD:
						store.showScratchpad();
						break;
					case Widget.EMOJIS:
						store.showEmojiPicker();
						break;
					case Widget.PROCESSES:
						store.showProcessManager();
						break;
					case Widget.FILE_SEARCH:
						store.showFileSearch();
						break;
					case Widget.SETTINGS:
						store.showSettings();
						break;
				}
			};

			// Main hotkey pressed while window is on screen (toggle())
			if (isToggle) {
				// Race condition: JS already initiated a hide (ESC or toggle-off),
				// but the async hideWindow hasn't executed on the native main queue
				// yet, so toggle() still sees the window as visible. Treat as a
				// fresh show request.
				if (!store.isVisible) {
					// Ensure the pending hideWindow's onHide event gets suppressed
					if (pendingJsHideCount === 0) {
						pendingJsHideCount = 1;
					}
					store.isVisible = true;
					store.getApps();
					store.focusedWidget = Widget.SEARCH;
					store.setQuery("");
					store.selectedIndex = 0;
					const gen = ++showGeneration;
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (showGeneration !== gen) return;
							solNative.showWindow();
						});
					});
					return;
				}

				if (store.focusedWidget === Widget.SEARCH) {
					// Search visible — normal toggle off
					pendingJsHideCount++;
					store.isVisible = false;
					showGeneration++;
					solNative.hideWindow();
				} else {
					// Widget visible — switch to Search without hiding
					store.focusedWidget = Widget.SEARCH;
					store.setQuery("");
					store.selectedIndex = 0;
				}
				return;
			}

			// If isVisible is still true, the window was soft-hidden (click outside).
			// Widget hotkeys (target != null) resume; the main hotkey resets to Search.
			if (store.isVisible) {
				if (target == null) {
					// Main hotkey from soft-hide — reset to fresh Search
					store.focusedWidget = Widget.SEARCH;
					store.setQuery("");
					store.selectedIndex = 0;
					const gen = ++showGeneration;
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (showGeneration !== gen) return;
							solNative.showWindow();
						});
					});
					return;
				}
				if (target !== store.focusedWidget) {
					showTargetWidget(target);
					const gen = ++showGeneration;
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (showGeneration !== gen) return;
							solNative.showWindow();
						});
					});
				} else {
					// Same widget — resume where user left off
					solNative.showWindow();
				}
				return;
			}

			store.getApps();
			store.fetchMacShortcuts();
			store.isVisible = true;

			if (target != null) {
				showTargetWidget(target);
				// Widget set — wait for render, then show window
				const gen = ++showGeneration;
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						if (showGeneration !== gen) return;
						solNative.showWindow();
					});
				});
				return;
			}

			// Main hotkey — window already shown by native
			setImmediate(() => {
				if (!store.isAccessibilityTrusted) {
					store.getAccessibilityStatus();
				}

				if (!store.hasFullDiskAccess) {
					store.getFullDiskAccessStatus();
				}
			});
		},
		onHide: () => {
			// JS-initiated hides (onHotkey toggle-off) already reset state
			// before calling solNative.hideWindow(). The native hideWindow()
			// emits a redundant onHide — skip it to prevent clobbering state
			// that may have been set by a rapid reopen.
			if (pendingJsHideCount > 0) {
				pendingJsHideCount--;
				return;
			}
			store.isVisible = false;
			store.focusedWidget = Widget.SEARCH;
			store.editingCustomItem = null;
			if (store.temporaryResult == null) {
				store.setQuery("");
			}
			store.selectedIndex = 0;
			store.translationResults = [];
			store.historyPointer = 0;
			store.fileSearchMode = FileSearchMode.FUZZY;
		},
		cleanUp: () => {
			onShowListener?.remove();
			onHideListener?.remove();
			onFileSearchListener?.remove();
			onHotkeyListener?.remove();
			onAppsChangedListener?.remove();
			appareanceListener?.remove();
			bookmarksDisposer?.();
			fileSearchDisposer?.();
			if (fileSearchTimer) {
				clearTimeout(fileSearchTimer);
				fileSearchTimer = undefined;
			}
		},
		getCalendarAccess: () => {
			store.calendarAuthorizationStatus =
				solNative.getCalendarAuthorizationStatus();
		},
		getAccessibilityStatus: () => {
			solNative.getAccessibilityStatus().then((v) => {
				runInAction(() => {
					store.isAccessibilityTrusted = v;
				});
			});
		},
		showScratchpad: () => {
			if (store.focusedWidget === Widget.SCRATCHPAD) {
				store.focusWidget(Widget.SEARCH);
			} else {
				store.focusWidget(Widget.SCRATCHPAD);
			}
		},
		showClipboardManager: () => {
			store.query = "";
			if (store.focusedWidget === Widget.CLIPBOARD) {
				store.focusWidget(Widget.SEARCH);
			} else {
				store.focusWidget(Widget.CLIPBOARD);
				const items = root.clipboard.clipboardItems;
				const firstUnpinned = items.findIndex((i) => !i.pinned);
				if (firstUnpinned >= 0) {
					store.selectedIndex = firstUnpinned;
				}
			}
		},
		showProcessManager: () => {
			store.query = "";
			store.focusWidget(Widget.PROCESSES);
		},
		onFileSearch: (files: FileDescription[]) => {
			if (store.focusedWidget !== Widget.FILE_SEARCH) return;
			store.fileResults = files;
		},
		setCalendarEnabled: (v: boolean) => {
			store.calendarEnabled = v;
			solNative.setUpcomingEventEnabled(v && store.showUpcomingEvent);
		},
		setShowAllDayEvents: (v: boolean) => {
			store.showAllDayEvents = v;
		},
		setLaunchAtLogin: (v: boolean) => {
			store.launchAtLogin = v;
			solNative.setLaunchAtLogin(v);
		},
		getFullDiskAccessStatus: async () => {
			const hasAccess = await solNative.hasFullDiskAccess();
			store.getBookmarks();
		},
		getBookmarks: async () => {
			// Fetch all bookmarks and deduplicate by id
			const allBookmarks: Item[] = [];

			const safariBookmarks = await store.getSafariBookmarks();
			const braveBookmarks = await store.getBraveBookmarks();
			const chromeBookmarks = await store.getChromeBookmarks();

			// Use a Set to keep track of unique ids
			const seenIds = new Set<string>();

			for (const bookmark of [
				...safariBookmarks,
				...braveBookmarks,
				...chromeBookmarks,
			]) {
				if (!seenIds.has(bookmark.id)) {
					allBookmarks.push(bookmark);
					seenIds.add(bookmark.id);
				}
			}

			runInAction(() => {
				store.bookmarks = allBookmarks;
			});
		},
		getSafariBookmarks: async (): Promise<Item[]> => {
			if (!store.hasFullDiskAccess) {
				return [];
			}
			const safariBookmarksRaw = await solNative.getSafariBookmarks();

			return safariBookmarksRaw.map((bookmark: any, idx: number): Item => {
				return {
					id: `${bookmark.title}_safari_${idx}`,
					name: bookmark.title,
					type: ItemType.BOOKMARK,
					bookmarkFolder: null,
					faviconFallback: Assets.Safari,
					url: bookmark.url,
					callback: () => {
						Linking.openURL(bookmark.url);
					},
				};
			});
		},
		getBraveBookmarks: async (): Promise<Item[]> => {
			const path = `/Users/${store.username}/Library/Application Support/BraveSoftware/Brave-Browser/Default/Bookmarks`;
			const exists = solNative.exists(path);
			if (!exists) {
				return [];
			}

			const bookmarksString = solNative.readFile(path);
			if (!bookmarksString) {
				return [];
			}

			const OGbookmarks = JSON.parse(bookmarksString);

			const bookmarks: {
				title: string;
				url: string;
				bookmarkFolder: null | string;
			}[] = [];

			traverse(bookmarks, OGbookmarks.roots.bookmark_bar.children, null);

			return bookmarks.map((bookmark, idx): Item => {
				return {
					id: `${bookmark.title}_brave_${idx}`,
					name: bookmark.title,
					bookmarkFolder: bookmark.bookmarkFolder,
					type: ItemType.BOOKMARK,
					faviconFallback: Assets.Brave,
					url: bookmark.url,
					callback: () => {
						try {
							Linking.openURL(bookmark.url);
						} catch (e) {
							// intentionally left blank
						}
					},
				};
			});
		},
		getChromeBookmarks: async (): Promise<Item[]> => {
			const username = solNative.userName();
			const path = `/Users/${username}/Library/Application Support/Google/Chrome/Default/Bookmarks`;
			const exists = solNative.exists(path);
			if (!exists) {
				return [];
			}
			const bookmarksString = solNative.readFile(path);
			if (!bookmarksString) {
				return [];
			}
			const OGbookmarks = JSON.parse(bookmarksString);

			const bookmarks: {
				title: string;
				url: string;
				bookmarkFolder: null | string;
			}[] = [];

			traverse(bookmarks, OGbookmarks.roots.bookmark_bar.children, null);

			return bookmarks.map((bookmark, idx): Item => {
				return {
					id: `${bookmark.title}_brave_${idx}`,
					name: bookmark.title,
					bookmarkFolder: bookmark.bookmarkFolder,
					type: ItemType.BOOKMARK,
					faviconFallback: Assets.Chrome,
					url: bookmark.url,
					callback: () => {
						Linking.openURL(bookmark.url);
					},
				};
			});
		},

		setMediaKeyForwardingEnabled: (enabled: boolean) => {
			store.mediaKeyForwardingEnabled = enabled;
			solNative.setMediaKeyForwardingEnabled(enabled);
		},

		setTargetHeight: (height: number) => {
			store.targetHeight = height;
		},

		onColorSchemeChange({
			colorScheme,
		}: {
			colorScheme: "light" | "dark" | null | undefined;
		}) {
			if (colorScheme === "dark") {
				store.isDarkMode = true;
				// nativeWindColorScheme.set("dark")
			} else {
				store.isDarkMode = false;
				// nativeWindColorScheme.set("light")
			}
		},

		addToHistory: (query: string) => {
			store.history.push(query);
		},

		setHistoryPointer: (pointer: number) => {
			if (pointer > store.history.length - 1) {
				return;
			}
			store.historyPointer = pointer;
		},

		showFileSearch: () => {
			store.focusWidget(Widget.FILE_SEARCH);
			store.query = "";
			store.fileSearchMode = FileSearchMode.FUZZY;
		},
		setFileSearchMode: (mode: FileSearchMode) => {
			store.fileSearchMode = mode;
			store.selectedIndex = 0;
			store.fileSearchMenuOpen = false;
		},
		toggleFileSearchMenu: () => {
			store.fileSearchMenuOpen = !store.fileSearchMenuOpen;
			store.fileSearchMenuIndex = 0;
		},
		closeFileSearchMenu: () => {
			store.fileSearchMenuOpen = false;
			store.fileSearchMenuIndex = 0;
		},

		addSearchFolder: (folder: string) => {
			store.searchFolders.push(folder);
		},

		removeSearchFolder: (folder: string) => {
			store.searchFolders = store.searchFolders.filter((f) => f !== folder);
		},

		setSearchEngine: (engine: SearchEngine) => {
			store.searchEngine = engine;
		},

		setCustomSearchUrl: (url: string) => {
			store.customSearchUrl = url;
		},

		onHotkey({ id }: { id: string }) {
			// Record whether the panel was already visible before processing
			const wasVisible = store.isVisible;

			// Widget hotkeys use direct lookup (O(1)) instead of scanning all items
			const targetWidget = itemIdToWidget[id];
			if (targetWidget) {
				if (wasVisible && store.focusedWidget === targetWidget) {
					// Same widget — toggle off
					store.setQuery("");
					store.focusWidget(Widget.SEARCH);
					store.isVisible = false;
					showGeneration++;
					pendingJsHideCount++;
					solNative.hideWindow();
					return;
				}
				if (wasVisible && store.focusedWidget !== targetWidget) {
					// Different widget — switch to it
					switch (targetWidget) {
						case Widget.CLIPBOARD:
							store.showClipboardManager();
							break;
						case Widget.SCRATCHPAD:
							store.showScratchpad();
							break;
						case Widget.EMOJIS:
							store.showEmojiPicker();
							break;
						case Widget.PROCESSES:
							store.showProcessManager();
							break;
						case Widget.FILE_SEARCH:
							store.showFileSearch();
							break;
						case Widget.SETTINGS:
							store.showSettings();
							break;
					}
					return;
				}
			}

			// For items that need callbacks, find and execute
			const item = store.items.find((i) => i.id === id);
			if (item == null) {
				return;
			}

			if (item.callback) {
				item.callback();
			} else if (item.url) {
				solNative.openFile(item.url);
			}

			if (itemsThatShouldShowWindow.includes(id)) {
				store.isVisible = true;
				// Only show the window if it was hidden beforehand;
				// switching widgets while already visible doesn't need to re-show
				if (!wasVisible) {
					// Capture current generation; if a hide/show cycle happens
					// before the rAF fires, this callback becomes stale
					const gen = ++showGeneration;
					// Double rAF: first frame lets React reconcile the widget tree,
					// second frame lets RN bridge commit native view changes
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							if (showGeneration !== gen) return;
							solNative.showWindow();
						});
					});
				}
			}
		},

		syncHotkeys() {
			const shortcuts = toJS(store.shortcuts);
			const urlMap: Record<string, string> = {};
			const widgetMap: Record<string, string> = {};
			const allItems = [
				...store.apps,
				...store.customItems,
			];
			for (const item of allItems) {
				if (shortcuts[item.id] && item.url) {
					urlMap[item.id] = item.url;
				}
			}
			// Tell native which hotkeys correspond to widgets so it can show
			// the window instantly without waiting for a JS round-trip
			for (const [id, widget] of Object.entries(itemIdToWidget)) {
				if (shortcuts[id]) {
					widgetMap[id] = widget;
				}
			}
			solNative.updateHotkeys(shortcuts, urlMap, widgetMap);
		},

		setShortcut(id: string, shortcut: string) {
			// Check for duplicate shortcut
			if (shortcut !== "") {
				const isDuplicate = Object.entries(store.shortcuts).some(
					([key, value]) => value === shortcut && key !== id,
				);
				if (isDuplicate) {
					solNative.showToast("Shortcut already exists", "error", 4);
					return;
				}
			}

			store.shortcuts[id] = shortcut;
			store.syncHotkeys();
		},

		restoreDefaultShorcuts() {
			store.shortcuts = defaultShortcuts;
			store.syncHotkeys();
		},

		setWindowHeight(e: LayoutChangeEvent) {
			solNative.setWindowHeight(e.nativeEvent.layout.height);
		},

		setShowInAppBrowserBookmarks: (v: boolean) => {
			store.showInAppBrowserBookMarks = v;
		},

		// Old custom items are not migrated to the new format which has an id
		// This function is used to migrate the old custom items to the new format
		// by just adding a random id
		migrateCustomItems() {
			store.customItems = store.customItems.map((i) => {
				if (i.id) {
					return i;
				}

				return { ...i, id: Math.random().toString() };
			});
		},
		setHasDismissedGettingStarted: (v: boolean) => {
			store.hasDismissedGettingStarted = v;
		},
		applicationsChanged: () => {
			store.getApps();
		},
		closeKeyboardRecorder: () => {
			store.showKeyboardRecorder = false;
			store.keyboardRecorderSelectedItem = null;
			store.shortcutSearchMode = false;
		},
		setShowKeyboardRecorderForItem: (show: boolean, itemId: string) => {
			store.showKeyboardRecorder = show;
			store.keyboardRecorderSelectedItem = itemId;
			store.shortcutSearchMode = false;
		},
		startShortcutSearch: () => {
			store.showKeyboardRecorder = true;
			store.shortcutSearchMode = true;
			store.keyboardRecorderSelectedItem = null;
		},
		setShortcutSearchFilter: (shortcut: string | null) => {
			store.shortcutSearchFilter = shortcut;
		},
		clearShortcutSearch: () => {
			store.shortcutSearchFilter = null;
			store.shortcutSearchMode = false;
		},
		setShortcutFromUI: (shortcut: string[]) => {
			// Check if we're in shortcut search mode
			if (store.shortcutSearchMode) {
				store.shortcutSearchFilter = shortcut.join("+");
				setTimeout(() => {
					runInAction(() => {
						store.showKeyboardRecorder = false;
						store.shortcutSearchMode = false;
					});
				}, 500);
				return;
			}

			setTimeout(() => {
				runInAction(() => {
					store.showKeyboardRecorder = false;
				});
			}, 2000);

			const itemId = store.keyboardRecorderSelectedItem;
			store.keyboardRecorderSelectedItem = null;
			if (!itemId) {
				return;
			}
			store.setShortcut(itemId, shortcut.join("+"));
		},
		confirm: async (title: string, callback: () => unknown) => {
			store.confirmDialogShown = true;
			store.confirmCallback = callback;
			store.confirmTitle = title;
		},
		closeConfirm: () => {
			store.confirmDialogShown = false;
			store.confirmCallback = null;
			store.confirmTitle = null;
		},
		executeConfirmCallback: async () => {
			const callback = store.confirmCallback;
			store.closeConfirm();
			await callback?.();
		},
	});

	bookmarksDisposer = reaction(
		() => [store.showInAppBrowserBookMarks],
		() => {
			minisearch.removeAll();
		},
	);

	fileSearchDisposer = reaction(
		() => [store.query, store.focusedWidget, store.fileSearchMode] as const,
		([query, widget, mode]) => {
			if (fileSearchTimer) {
				clearTimeout(fileSearchTimer);
				fileSearchTimer = undefined;
			}

			if (!query || widget !== Widget.FILE_SEARCH) {
				store.fileSearchResults = [];
				store.fileResults = [];
				store.isLoading = false;
				return;
			}

			store.isLoading = true;
			fileSearchTimer = setTimeout(() => {
				const fileResults = solNative.searchFiles(
					toJS(store.searchFolders),
					query,
					mode,
				);

				runInAction(() => {
					store.fileSearchResults = fileResults.map((f) => ({
						id: f.path,
						type: ItemType.FILE,
						name: f.name,
						url: f.path,
					}));
					store.isLoading = false;
				});
			}, 200);
		},
	);

	hydrate().then(() => {
		autorun(persist);
		store.getCalendarAccess();
		store.getAccessibilityStatus();
		store.getFullDiskAccessStatus();
		solNative.setUpcomingEventEnabled(
			store.showUpcomingEvent && store.calendarEnabled,
		);
	});

	appareanceListener = Appearance.addChangeListener(store.onColorSchemeChange);
	onShowListener = solNative.addListener("onShow", store.onShow);
	onHideListener = solNative.addListener("onHide", store.onHide);
	onHotkeyListener = solNative.addListener("hotkey", store.onHotkey);
	// onAppsChangedListener = solNative.addListener(
	// 	"applicationsChanged",
	// 	store.applicationsChanged,
	// );
	onFileSearchListener = solNative.addListener(
		"onFileSearch",
		store.onFileSearch,
	);

	return store;
};
