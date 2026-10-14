import assert from "node:assert/strict";
import { test } from "bun:test";
import {
	applyEmojiSkinTone,
	normalizeEmojiSkinTone,
} from "./emojiSkinTones";

test("invalid persisted preferences normalize to default", () => {
	for (const value of [undefined, null, "", "yellow", "LIGHT", 2, {}, "__proto__"]) {
		assert.equal(normalizeEmojiSkinTone(value), "default");
	}
	assert.equal(normalizeEmojiSkinTone("medium-dark"), "medium-dark");
});

test("default and nonmodifiable characters remain unchanged", () => {
	assert.equal(applyEmojiSkinTone("👋", "default", 27), "👋");
	for (const base of ["😀", "❤️", "⚙️", "🏻", "", "__proto__"]) {
		assert.equal(applyEmojiSkinTone(base, "dark", 27), base);
	}
});

test("tone substitution preserves valid variation selectors and ZWJ sequences", () => {
	assert.equal(applyEmojiSkinTone("👋", "medium-light", 14), "👋🏼");
	assert.equal(applyEmojiSkinTone("☝️", "medium", 14), "☝🏽");
	assert.equal(applyEmojiSkinTone("👩‍⚕️", "dark", 14), "👩🏿‍⚕️");
	assert.equal(
		applyEmojiSkinTone("🧑‍🤝‍🧑", "medium-dark", 14),
		"🧑🏾‍🤝‍🧑🏾",
	);
	assert.equal(applyEmojiSkinTone("💑", "light", 14), "💑🏻");
});

test("directional Emoji 15.1 sequences require macOS 14.4", () => {
	assert.equal(applyEmojiSkinTone("🚶‍➡️", "medium", "14.3.99"), "🚶‍➡️");
	assert.equal(applyEmojiSkinTone("🚶‍➡️", "medium", "14.4"), "🚶🏽‍➡️");
});

test("new tones for existing bunny and wrestling bases require macOS 26.4", () => {
	for (const [base, toned] of [["👯", "👯🏿"], ["🤼", "🤼🏿"]]) {
		assert.equal(applyEmojiSkinTone(base, "dark", "26.3"), base);
		assert.equal(applyEmojiSkinTone(base, "dark", "26.4"), toned);
		assert.equal(applyEmojiSkinTone(base, "dark", 27), toned);
	}
});
