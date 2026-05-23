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

export const UI_PERSISTED_KEYS = [
	"frequencies",
	"history",
	"note",
	"onboardingStep",
	...PORTABLE_KEYS,
] as const;

export type PortableKey = (typeof PORTABLE_KEYS)[number];
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

export function readJsonConfig(): Record<string, any> | null {
	try {
		const path = getConfigPath();
		const raw = solNative.readFile(path);
		if (raw == null) return null;
		return JSON.parse(raw);
	} catch (e) {
		console.error("Failed to read config.json:", e);
		return null;
	}
}

export function writeJsonConfig(data: Record<string, any>): boolean {
	try {
		const path = getConfigPath();
		const json = JSON.stringify(data, null, 2);
		return solNative.writeFile(path, json);
	} catch (e) {
		console.error("Failed to write config.json:", e);
		return false;
	}
}
