import { solNative } from "../lib/SolNative";

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
	"hyperKeyEnabled",
	"customItems",
	"disabledItemIds",
] as const;

export type PortableKey = (typeof PORTABLE_KEYS)[number];

export function getConfigPath(): string {
	return `/Users/${solNative.userName()}/.config/sol/config.json`;
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
		const configDir = `/Users/${solNative.userName()}/.config/sol`;
		if (!solNative.exists(configDir)) {
			solNative.mkdir(configDir);
		}
		const existing = readJsonConfig() ?? {};
		const merged = { ...existing, ...data };
		const path = getConfigPath();
		const json = JSON.stringify(merged, null, 2);
		return solNative.writeFile(path, json);
	} catch (e) {
		console.error("Failed to write config.json:", e);
		return false;
	}
}
