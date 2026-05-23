import AsyncStorage from "@react-native-async-storage/async-storage";
import { MMKV } from "react-native-mmkv";
import { solNative } from "../lib/SolNative";

const STORAGE_PATH = `/Users/${solNative.userName()}/.config/sol`;
const OLD_STORAGE_PATH = `/Users/${solNative.userName()}/Documents/mmkv`;

const ensureStorageDirectory = () => {
	if (solNative.exists(STORAGE_PATH)) {
		return;
	}

	try {
		solNative.mkdir(STORAGE_PATH);
	} catch (e) {
		console.error("Failed to create storage directory:", e);
	}
};

const migrateStorageFiles = () => {
	if (!solNative.exists(OLD_STORAGE_PATH)) {
		return;
	}

	try {
		const newFiles = solNative.exists(STORAGE_PATH)
			? solNative.ls(STORAGE_PATH)
			: [];
		const hasNewData = newFiles.some((file) => file.includes("mmkv.default"));

		if (hasNewData) {
			return;
		}

		solNative.cp(
			`${OLD_STORAGE_PATH}/mmkv.default`,
			`${STORAGE_PATH}/mmkv.default`,
		);
		solNative.cp(
			`${OLD_STORAGE_PATH}/mmkv.default.crc`,
			`${STORAGE_PATH}/mmkv.default.crc`,
		);
	} catch (error) {
		console.error("Failed to migrate storage files:", error);
	}
};

ensureStorageDirectory();
migrateStorageFiles();

export const storage = new MMKV({
	id: "mmkv.default",
	path: STORAGE_PATH,
});

export const readLegacyStoreState = async (
	storeKey: string,
): Promise<string | null> => {
	let state: string | null | undefined;

	try {
		state = storage.getString(storeKey);
	} catch {
		// intentionally left blank
	}

	if (!state) {
		state = await AsyncStorage.getItem(storeKey);
	}

	return state ?? null;
};