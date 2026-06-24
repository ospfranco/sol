import {
	readJsonConfig,
	UI_PERSISTED_KEYS,
	type UIPersistedKey,
	writeJsonConfig,
} from "./config";

export type PersistedStoreKey = "calendar" | "clipboard" | "emoji";

type PersistedConfig = Record<string, any>;
type UIPersistedState = Partial<Record<UIPersistedKey, any>>;

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

export const readPersistedUIState = async (): Promise<UIPersistedState | null> => {
	const config = getPersistedConfig();
	const uiState = pickUiState(config);
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
): Promise<T | null> => {
	const config = getPersistedConfig();
	const existingStoreState = config[storeKey];
	const nextStoreState =
		existingStoreState != null && typeof existingStoreState === "object"
			? { ...existingStoreState }
			: {};

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
