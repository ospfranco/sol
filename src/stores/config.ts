import { solNative } from "../lib/SolNative";

const CONFIG_DIRECTORY_PATH = `/Users/${solNative.userName()}/.config/sol`;
const SCRIPTS_DIRECTORY_PATH = `${CONFIG_DIRECTORY_PATH}/scripts`;

export const PORTABLE_KEYS = [
	"firstTranslationLanguage",
	"secondTranslationLanguage",
	"thirdTranslationLanguage",
	"globalShortcut",
	"showWindowOn",
	"calendarEnabled",
	"showAllDayEvents",
	"launchAtLogin",
	"mediaKeyForwardingEnabled",
	"showUpcomingEvent",
	"scratchPadColor",
	"searchFolders",
	"searchEngine",
	"customSearchUrl",
	"shortcuts",
	"showInAppBrowserBookMarks",
	"hasDismissedGettingStarted",
	"hyperKeyEnabled",
	"customItems",
	"disabledItemIds",
] as const;

export const RUNTIME_CONFIG_KEYS = [
	"frequencies",
	"selectionTimestamps",
	"history",
	"note",
	"onboardingStep",
] as const;

export const UI_PERSISTED_KEYS = [
	...RUNTIME_CONFIG_KEYS,
	...PORTABLE_KEYS,
] as const;

export type PortableKey = (typeof PORTABLE_KEYS)[number];
export type RuntimeConfigKey = (typeof RUNTIME_CONFIG_KEYS)[number];
export type UIPersistedKey = (typeof UI_PERSISTED_KEYS)[number];

const ensureDirectory = (path: string) => {
	if (solNative.exists(path)) {
		return;
	}

	try {
		solNative.mkdir(path);
	} catch (e) {
		console.error(`Failed to create ${path}:`, e);
	}
};

const ensureConfigDirectories = () => {
	ensureDirectory(CONFIG_DIRECTORY_PATH);
	ensureDirectory(SCRIPTS_DIRECTORY_PATH);
};

ensureConfigDirectories();

export function getConfigPath(): string {
	return `${CONFIG_DIRECTORY_PATH}/config.json`;
}

export function getRuntimeStatePath(): string {
	return `${CONFIG_DIRECTORY_PATH}/state.json`;
}

const readJsonFile = (
	path: string,
	fileName: string,
): Record<string, any> | null => {
	try {
		const raw = solNative.readFile(path);
		if (raw == null) return null;
		return JSON.parse(raw);
	} catch (e) {
		console.error(`Failed to read ${fileName}:`, e);
		return null;
	}
};

const writeJsonFile = (
	path: string,
	fileName: string,
	data: Record<string, any>,
): boolean => {
	try {
		const json = JSON.stringify(data, null, 2);
		return solNative.writeFile(path, json);
	} catch (e) {
		console.error(`Failed to write ${fileName}:`, e);
		return false;
	}
};

export function readJsonConfig(): Record<string, any> | null {
	return readJsonFile(getConfigPath(), "config.json");
}

export function writeJsonConfig(data: Record<string, any>): boolean {
	return writeJsonFile(getConfigPath(), "config.json", data);
}

export function readJsonRuntimeState(): Record<string, any> | null {
	return readJsonFile(getRuntimeStatePath(), "state.json");
}

export function writeJsonRuntimeState(data: Record<string, any>): boolean {
	return writeJsonFile(getRuntimeStatePath(), "state.json", data);
}
