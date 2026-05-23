import {
	readJsonConfig,
	UI_PERSISTED_KEYS,
	type UIPersistedKey,
	writeJsonConfig,
} from "./config";
import { readLegacyStoreState } from "./storage";

export type PersistedStoreKey = "calendar" | "clipboard" | "emoji";

type PersistedConfig = Record<string, any>;
type UIPersistedState = Partial<Record<UIPersistedKey, any>>;

const LEGACY_UI_STORE_KEY = "@ui.store";

const LEGACY_STORE_KEYS: Record<PersistedStoreKey, string> = {
	calendar: "@calendar.store",
	clipboard: "@clipboard.store",
	emoji: "@emoji.store",
};

const getPersistedConfig = (): PersistedConfig => {
	const config = readJsonConfig();
	if (config == null || typeof config !== "object") {
		return {};
	}

	return config;
};

const pickUiState = (config: PersistedConfig): UIPersistedState => {
	const uiState: UIPersistedState = {};

	for (const key of UI_PERSISTED_KEYS) {
		if (config[key] !== undefined) {
			uiState[key] = config[key];
		}
	}

	return uiState;
};

const parseLegacyState = async (
	legacyStoreKey: string,
): Promise<Record<string, any> | null> => {
	const raw = await readLegacyStoreState(legacyStoreKey);
	if (!raw) {
		return null;
	}

	try {
		const parsed = JSON.parse(raw);
		return parsed != null && typeof parsed === "object" ? parsed : null;
	} catch (e) {
		console.error(`Failed to parse legacy state for ${legacyStoreKey}:`, e);
		return null;
	}
};

export const readPersistedUIState = async (): Promise<UIPersistedState | null> => {
	const config = getPersistedConfig();
	const nextConfig: PersistedConfig = { ...config };
	let didMigrate = false;

	const legacyState = await parseLegacyState(LEGACY_UI_STORE_KEY);
	if (legacyState) {
		for (const key of UI_PERSISTED_KEYS) {
			if (nextConfig[key] === undefined && legacyState[key] !== undefined) {
				nextConfig[key] = legacyState[key];
				didMigrate = true;
			}
		}

		if (nextConfig.note === undefined && Array.isArray(legacyState.notes)) {
			nextConfig.note = legacyState.notes.join("\n");
			didMigrate = true;
		}
	}

	if (didMigrate) {
		writeJsonConfig(nextConfig);
	}

	const uiState = pickUiState(nextConfig);
	return Object.keys(uiState).length > 0 ? uiState : null;
};

export const writePersistedUIState = (data: UIPersistedState): boolean => {
	const config = getPersistedConfig();

	for (const key of UI_PERSISTED_KEYS) {
		delete config[key];
	}

	Object.assign(config, pickUiState(data));

	return writeJsonConfig(config);
};

export const readPersistedStore = async <T>(
	storeKey: PersistedStoreKey,
	mapLegacyState?: (legacyState: Record<string, any>) => Record<string, any> | null,
): Promise<T | null> => {
	const config = getPersistedConfig();
	const existingStoreState = config[storeKey];
	const nextStoreState =
		existingStoreState != null && typeof existingStoreState === "object"
			? { ...existingStoreState }
			: {};
	let didMigrate = false;

	if (mapLegacyState) {
		const legacyState = await parseLegacyState(LEGACY_STORE_KEYS[storeKey]);
		const migratedLegacyState = legacyState ? mapLegacyState(legacyState) : null;

		if (migratedLegacyState) {
			for (const [key, value] of Object.entries(migratedLegacyState)) {
				if (nextStoreState[key] === undefined && value !== undefined) {
					nextStoreState[key] = value;
					didMigrate = true;
				}
			}
		}
	}

	if (didMigrate) {
		config[storeKey] = nextStoreState;
		writeJsonConfig(config);
	}

	return Object.keys(nextStoreState).length > 0 ? (nextStoreState as T) : null;
};

export const writePersistedStore = (
	storeKey: PersistedStoreKey,
	data: Record<string, any>,
): boolean => {
	const config = getPersistedConfig();
	config[storeKey] = data;
	return writeJsonConfig(config);
};
