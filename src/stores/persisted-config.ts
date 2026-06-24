import {
	PORTABLE_KEYS,
	RUNTIME_CONFIG_KEYS,
	readJsonConfig,
	readJsonRuntimeState,
	type PortableKey,
	UI_PERSISTED_KEYS,
	type UIPersistedKey,
	type RuntimeConfigKey,
	writeJsonConfig,
	writeJsonRuntimeState,
} from "./config";

export type PersistedStoreKey = "calendar" | "clipboard" | "emoji";

type PersistedConfig = Record<string, any>;
type PortableConfigState = Partial<Record<PortableKey, any>>;
type RuntimeConfigState = Partial<Record<RuntimeConfigKey, any>>;
type UIPersistedState = Partial<Record<UIPersistedKey, any>>;
type RuntimeState = RuntimeConfigState & Partial<Record<PersistedStoreKey, any>>;

const PERSISTED_STORE_KEYS: PersistedStoreKey[] = [
	"calendar",
	"clipboard",
	"emoji",
];

const getPersistedConfig = (): PersistedConfig => {
	const config = readJsonConfig();
	if (config == null || typeof config !== "object") {
		return {};
	}

	return config;
};

const getRuntimeState = (): RuntimeState => {
	const state = readJsonRuntimeState();
	if (state == null || typeof state !== "object") {
		return {};
	}

	return state;
};

const pickKeys = <TKeys extends readonly string[]>(
	source: PersistedConfig,
	keys: TKeys,
): Partial<Record<TKeys[number], any>> => {
	const picked: Partial<Record<TKeys[number], any>> = {};

	for (const key of keys) {
		const typedKey = key as TKeys[number];
		if (source[typedKey] !== undefined) {
			picked[typedKey] = source[typedKey];
		}
	}

	return picked;
};

const pickPortableState = (config: PersistedConfig): PortableConfigState => {
	return pickKeys(config, PORTABLE_KEYS);
};

const pickRuntimeConfigState = (state: PersistedConfig): RuntimeConfigState => {
	return pickKeys(state, RUNTIME_CONFIG_KEYS);
};

const migrateLegacyRuntimeState = (): {
	config: PersistedConfig;
	runtimeState: RuntimeState;
} => {
	const config = getPersistedConfig();
	const runtimeState = getRuntimeState();
	const legacyRuntimeState = {
		...pickRuntimeConfigState(config),
		...pickKeys(config, PERSISTED_STORE_KEYS),
	};

	if (Object.keys(legacyRuntimeState).length === 0) {
		return { config, runtimeState };
	}

	const nextRuntimeState = {
		...legacyRuntimeState,
		...runtimeState,
	};
	const nextConfig = { ...config };

	for (const key of [...RUNTIME_CONFIG_KEYS, ...PERSISTED_STORE_KEYS]) {
		delete nextConfig[key];
	}

	const stateWriteSucceeded = writeJsonRuntimeState(nextRuntimeState);
	if (!stateWriteSucceeded) {
		return { config, runtimeState: nextRuntimeState };
	}

	writeJsonConfig(nextConfig);

	return {
		config: nextConfig,
		runtimeState: nextRuntimeState,
	};
};

const getPersistedState = (): {
	config: PersistedConfig;
	runtimeState: RuntimeState;
} => {
	return migrateLegacyRuntimeState();
};

const pickUiState = (
	config: PersistedConfig,
	runtimeState: RuntimeState,
): UIPersistedState => {
	const uiState: UIPersistedState = {};

	Object.assign(uiState, pickPortableState(config));
	Object.assign(uiState, pickRuntimeConfigState(runtimeState));

	for (const key of UI_PERSISTED_KEYS) {
		if (uiState[key] === undefined) {
			delete uiState[key];
		}
	}

	return uiState;
};

export const readPersistedUIState = async (): Promise<UIPersistedState | null> => {
	const { config, runtimeState } = getPersistedState();
	const uiState = pickUiState(config, runtimeState);
	return Object.keys(uiState).length > 0 ? uiState : null;
};

export const writePersistedUIState = (data: UIPersistedState): boolean => {
	const { config, runtimeState } = getPersistedState();
	const nextConfig = { ...config };
	const nextRuntimeState = { ...runtimeState };

	for (const key of PORTABLE_KEYS) {
		delete nextConfig[key];
	}
	for (const key of RUNTIME_CONFIG_KEYS) {
		delete nextRuntimeState[key];
	}

	Object.assign(nextConfig, pickPortableState(data));
	Object.assign(nextRuntimeState, pickRuntimeConfigState(data));

	if (!writeJsonRuntimeState(nextRuntimeState)) {
		return false;
	}

	return writeJsonConfig(nextConfig);
};

export const readPersistedStore = async <T>(
	storeKey: PersistedStoreKey,
): Promise<T | null> => {
	const { runtimeState } = getPersistedState();
	const existingStoreState = runtimeState[storeKey];
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
	const { runtimeState } = getPersistedState();
	const nextRuntimeState = { ...runtimeState, [storeKey]: data };
	return writeJsonRuntimeState(nextRuntimeState);
};
