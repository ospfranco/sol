import assert from "node:assert/strict";
import { test } from "bun:test";
import {
	getDisplayedEmoji,
	getVisibleEmojiFavorites,
	isEmojiSupported,
	normalizePersistedFrequentlyUsedEmojis,
	recordEmojiUse,
	serializeFrequentlyUsedEmojis,
} from "./emojiCompatibility";

const rowSize = 7;

for (const [current, required, supported] of [
	["14.3.99", "14.4", false],
	["14.10", "14.4", true],
	["14.4", "14.10", false],
	["14.4", "14.4.1", false],
	["14.4.10", "14.4.2", true],
	["14.4.2", "14.4.10", false],
	["14.4", "14.4.0", true],
	["15.0", "14.10.99", true],
	[27, "26.4", true],
]) {
	test(`macOS ${current} ${supported ? "supports" : "does not support"} ${required}`, () => {
		assert.equal(isEmojiSupported({ macos_version: required }, current), supported);
	});
}

test("baseline emoji need no additional macOS requirement", () => {
	assert.equal(isEmojiSupported({}, "14.0"), true);
});

test("hidden-only history produces no visible favorite row", () => {
	const history = { "🫩": 50 };
	assert.deepEqual(getVisibleEmojiFavorites(history, new Set(["😀"]), rowSize), []);
	assert.deepEqual(history, { "🫩": 50 });
});

test("favorites rank only supported history and expose at most seven entries", () => {
	const history = {
		"😀": 1,
		"😃": 9,
		"😄": 2,
		"😁": 8,
		"😆": 3,
		"😅": 7,
		"😂": 4,
		"🤣": 6,
		"🫩": 100,
	};
	const snapshot = { ...history };
	const supported = new Set(Object.keys(history).filter((emoji) => emoji !== "🫩"));
	assert.deepEqual(getVisibleEmojiFavorites(history, supported, rowSize), [
		["😃", 9], ["😁", 8], ["😅", 7], ["🤣", 6],
		["😂", 4], ["😆", 3], ["😄", 2],
	]);
	assert.deepEqual(history, snapshot);
	assert.deepEqual(
		getVisibleEmojiFavorites(history, new Set(Object.keys(history)), rowSize)[0],
		["🫩", 100],
	);
});

test("hydration keeps hidden history and insertion only evicts a visible favorite", () => {
	const persisted = {
		"😀": 7,
		"😃": 6,
		"😄": 5,
		"😁": 4,
		"😆": 3,
		"😅": 2,
		"😂": 1,
		"🫩": 100,
	};
	const known = new Set([...Object.keys(persisted), "🤣"]);
	const supported = new Set([...known].filter((emoji) => emoji !== "🫩"));
	const history = normalizePersistedFrequentlyUsedEmojis(persisted, known, supported, rowSize);
	assert.deepEqual(history, persisted);
	assert.equal(Object.keys(history).length, 8);

	recordEmojiUse(history, "🤣", getVisibleEmojiFavorites(history, supported, rowSize), rowSize);
	assert.equal(history["🫩"], 100);
	assert.equal(history["🤣"], 1);
	assert.equal(history["😂"], undefined);
	assert.equal(getVisibleEmojiFavorites(history, supported, rowSize).length, rowSize);
	assert.equal(getVisibleEmojiFavorites(history, supported, rowSize).some(([emoji]) => emoji === "🤣"), true);

	recordEmojiUse(history, "😃", getVisibleEmojiFavorites(history, supported, rowSize), rowSize);
	assert.equal(history["😃"], 7);
	const encoded = serializeFrequentlyUsedEmojis(history, known);
	assert.equal(encoded["cp:1f600"], 7);
	assert.equal(Object.keys(encoded).every((key) => key.startsWith("cp:")), true);
	assert.deepEqual(normalizePersistedFrequentlyUsedEmojis(encoded, known, supported, rowSize), history);
});

test("an OS upgrade caps newly supported history while preserving still-hidden counts", () => {
	const persisted = {
		"😀": 10, "😃": 9, "😄": 8, "😁": 7,
		"😆": 6, "😅": 5, "😂": 4, "🫩": 100, "🫪": 200,
	};
	const known = new Set([...Object.keys(persisted), "🤣"]);
	const beforeUpgrade = new Set([...known].filter((emoji) => emoji !== "🫩" && emoji !== "🫪"));
	const afterUpgrade = new Set([...known].filter((emoji) => emoji !== "🫪"));
	const oldHistory = normalizePersistedFrequentlyUsedEmojis(persisted, known, beforeUpgrade, rowSize);
	assert.equal(Object.keys(oldHistory).length, 9);
	const history = normalizePersistedFrequentlyUsedEmojis(
		serializeFrequentlyUsedEmojis(oldHistory, known), known, afterUpgrade, rowSize,
	);
	assert.equal(history["🫪"], 200);
	assert.equal(history["🫩"], 100);
	assert.equal(history["😂"], undefined);
	assert.equal(Object.keys(history).length, 8);
	recordEmojiUse(history, "🤣", getVisibleEmojiFavorites(history, afterUpgrade, rowSize), rowSize);
	assert.equal(history["😅"], undefined);
	assert.equal(history["🫪"], 200);
	assert.equal(getVisibleEmojiFavorites(history, afterUpgrade, rowSize).some(([emoji]) => emoji === "🤣"), true);
});

test("hidden favorites never fill or evict an incomplete visible row", () => {
	const history = { "🫩": 100, "😀": 5 };
	const supported = new Set(["😀", "😃"]);
	recordEmojiUse(history, "😃", getVisibleEmojiFavorites(history, supported, rowSize), rowSize);
	assert.deepEqual(history, { "🫩": 100, "😀": 5, "😃": 1 });
});

test("hydration still merges raw and cp keys and rejects unknown or invalid counts", () => {
	const known = new Set(["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣"]);
	assert.deepEqual(normalizePersistedFrequentlyUsedEmojis({
		"😀": 3,
		"cp:1f600": "2",
		"😃": 0,
		"😄": -1,
		"😁": Number.NaN,
		"😆": Number.POSITIVE_INFINITY,
		"😅": "invalid",
		"😂": 4,
		"🤣": 6,
		"not an emoji": 100,
		"cp:110000": 100,
		"cp:invalid": 100,
		"cp:": 100,
		"cp:1fae9": 100,
	}, known, known, rowSize), { "😀": 5, "😂": 4, "🤣": 6 });
	assert.deepEqual(normalizePersistedFrequentlyUsedEmojis(undefined, known, known, rowSize), {});
	assert.deepEqual(serializeFrequentlyUsedEmojis({
		"😀": 5, "😃": 0, "😄": -1, "😁": Number.NaN,
		"😆": Number.POSITIVE_INFINITY, "unknown": 10,
	}, known), { "cp:1f600": 5 });
});

test("insertion addresses the displayed favorite padding and final browse row", () => {
	const favoriteRow = [
		{ emoji: "😀" },
		...Array.from({ length: rowSize - 1 }, () => ({ emoji: "" })),
	];
	const catalogRow = ["😃", "😄", "😁", "😆", "😅", "😂", "🤣"].map((emoji) => ({ emoji }));
	const finalRow = [{ emoji: "🥰" }, { emoji: "😍" }];
	const rows = [favoriteRow, catalogRow, finalRow];
	assert.equal(getDisplayedEmoji(rows, 0, rowSize), favoriteRow[0]);
	for (let index = 1; index < rowSize; index++) {
		assert.equal(getDisplayedEmoji(rows, index, rowSize), undefined);
	}
	assert.equal(getDisplayedEmoji(rows, rowSize, rowSize), catalogRow[0]);
	assert.equal(getDisplayedEmoji(rows, 2 * rowSize + 1, rowSize), finalRow[1]);
	assert.equal(getDisplayedEmoji(rows, 2 * rowSize + 2, rowSize), undefined);
	assert.equal(getDisplayedEmoji(rows, -1, rowSize), undefined);
});

test("insertion uses displayed search order without a hidden favorite offset", () => {
	const searchRows = [[{ emoji: "😄" }, { emoji: "😀" }]];
	assert.equal(getDisplayedEmoji(searchRows, 0, rowSize), searchRows[0][0]);
	assert.equal(getDisplayedEmoji(searchRows, 1, rowSize), searchRows[0][1]);
	assert.equal(getDisplayedEmoji(searchRows, 2, rowSize), undefined);
});
