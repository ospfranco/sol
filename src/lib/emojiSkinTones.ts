import { isEmojiSupported } from "./emojiCompatibility";
import { emojiSkinToneVariants } from "./emojiSkinToneVariants";

export type EmojiSkinTone =
	| "default"
	| "light"
	| "medium-light"
	| "medium"
	| "medium-dark"
	| "dark";

export const emojiSkinToneOptions: ReadonlyArray<{
	value: EmojiSkinTone;
	label: string;
	emoji: string;
}> = [
	{ value: "default", label: "Default (yellow)", emoji: "🫶" },
	{ value: "light", label: "Light", emoji: "🫶🏻" },
	{ value: "medium-light", label: "Medium-light", emoji: "🫶🏼" },
	{ value: "medium", label: "Medium", emoji: "🫶🏽" },
	{ value: "medium-dark", label: "Medium-dark", emoji: "🫶🏾" },
	{ value: "dark", label: "Dark", emoji: "🫶🏿" },
];

const skinToneModifiers = {
	light: "🏻",
	"medium-light": "🏼",
	medium: "🏽",
	"medium-dark": "🏾",
	dark: "🏿",
} as const;

export function normalizeEmojiSkinTone(value: unknown): EmojiSkinTone {
	switch (value) {
		case "light":
		case "medium-light":
		case "medium":
		case "medium-dark":
		case "dark":
			return value;
		default:
			return "default";
	}
}

export function applyEmojiSkinTone(
	baseEmoji: string,
	tone: EmojiSkinTone,
	macOSVersion: string | number,
): string {
	if (
		tone === "default" ||
		!Object.prototype.hasOwnProperty.call(emojiSkinToneVariants, baseEmoji)
	) {
		return baseEmoji;
	}

	const variant = emojiSkinToneVariants[baseEmoji];
	if (!isEmojiSupported(variant, macOSVersion)) {
		return baseEmoji;
	}

	return variant.emoji.replaceAll("🏻", skinToneModifiers[tone]);
}
