import * as chrono from "chrono-node";
import axios from "axios";
import convert from "convert-units";
import { DateTime } from "luxon";

export type TemporaryResult =
	| {
			kind: "text";
			value: string;
			secondary?: string;
	  }
	| {
			kind: "comparison";
			left: { label: string; value: string };
			right: { label: string; value: string };
			footer?: string;
	  }
	| {
			kind: "flight";
			flight: string;
			status?: string;
			departureTime?: string;
			arrivalTime?: string;
			terminal?: string;
			gate?: string;
	  };

type BookmarkNode = {
	type: "folder" | "url";
	name: string;
	url?: string;
	children?: BookmarkNode[];
};

const EXPRESSION_RESULT_DECIMALS = 12;

const TIMEZONE_ABBREVIATION_OFFSETS: Record<string, number> = {
	UTC: 0,
	GMT: 0,
	EST: -300,
	EDT: -240,
	CST: -360,
	CDT: -300,
	MST: -420,
	MDT: -360,
	PST: -480,
	PDT: -420,
	CET: 60,
	CEST: 120,
	EET: 120,
	EEST: 180,
	BST: 60,
	IST: 330,
	JST: 540,
	AEST: 600,
	AEDT: 660,
	ACST: 570,
	ACDT: 630,
	AWST: 480,
};

const UNIT_ALIASES: Record<string, string> = {
	meter: "m",
	meters: "m",
	metre: "m",
	metres: "m",
	kilometer: "km",
	kilometers: "km",
	kilometre: "km",
	kilometres: "km",
	centimeter: "cm",
	centimeters: "cm",
	centimetre: "cm",
	centimetres: "cm",
	millimeter: "mm",
	millimeters: "mm",
	millimetre: "mm",
	millimetres: "mm",
	inch: "in",
	inches: "in",
	foot: "ft",
	feet: "ft",
	yard: "yd",
	yards: "yd",
	mile: "mi",
	miles: "mi",
	gram: "g",
	grams: "g",
	kilogram: "kg",
	kilograms: "kg",
	mg: "mg",
	milligram: "mg",
	milligrams: "mg",
	lb: "lb",
	lbs: "lb",
	pound: "lb",
	pounds: "lb",
	oz: "oz",
	ounce: "oz",
	ounces: "oz",
	liter: "l",
	liters: "l",
	litre: "l",
	litres: "l",
	milliliter: "ml",
	milliliters: "ml",
	millilitre: "ml",
	millilitres: "ml",
	second: "s",
	seconds: "s",
	sec: "s",
	minute: "min",
	minutes: "min",
	hour: "h",
	hours: "h",
	day: "d",
	days: "d",
	celsius: "C",
	fahrenheit: "F",
	kelvin: "K",
};

function offsetMinutesToUtcZone(offsetMinutes: number) {
	const sign = offsetMinutes >= 0 ? "+" : "-";
	const absoluteMinutes = Math.abs(offsetMinutes);
	const hours = Math.floor(absoluteMinutes / 60);
	const minutes = absoluteMinutes % 60;
	const paddedMinutes = minutes.toString().padStart(2, "0");
	return `UTC${sign}${hours}:${paddedMinutes}`;
}

function normalizeUnit(rawUnit: string) {
	const normalized = rawUnit.trim().toLowerCase().replace(/\s+/g, "");
	if (UNIT_ALIASES[normalized]) {
		return UNIT_ALIASES[normalized];
	}

	if (normalized === "c") {
		return "C";
	}

	if (normalized === "f") {
		return "F";
	}

	if (normalized === "k") {
		return "K";
	}

	return normalized;
}

function formatConvertedValue(value: number) {
	if (!Number.isFinite(value)) {
		return value.toString();
	}

	const rounded = Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
	return rounded.toString();
}

export function createTextTemporaryResult(
	value: string,
	secondary?: string,
): TemporaryResult {
	return {
		kind: "text",
		value,
		secondary,
	};
}

function stripHtmlTags(input: string) {
	return input.replace(/<[^>]+>/g, " ");
}

function decodeHtmlEntities(input: string) {
	return input
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&nbsp;/g, " ");
}

export function getInitials(name: string) {
	return name
		.toLowerCase()
		.split(" ")
		.map((s) => s.charAt(0))
		.join("");
}

export function traverse(
	bookmarks: Array<{
		title: string;
		url: string;
		bookmarkFolder: null | string;
	}>,
	nodes: BookmarkNode[],
	bookmarkFolder: null | string,
) {
	for (const node of nodes) {
		if (node.type === "folder") {
			traverse(bookmarks, node.children ?? [], node.name);
		} else if (node.type === "url" && node.url) {
			bookmarks.push({ title: node.name, url: node.url, bookmarkFolder });
		}
	}
}

export function parseTimezoneConversion(query: string): TemporaryResult | null {
	const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
	if (!localZone) {
		return null;
	}

	const normalized = query.trim().replace(/\s+/g, " ");
	const match = normalized.match(
		/^(?<timeExpression>.+?)\s+(?<sourceTz>[A-Za-z]{2,5})(?:\s+to\s+(?<targetTz>[A-Za-z]{2,10}))?$/i,
	);

	if (!match?.groups) {
		return null;
	}

	const sourceTz = match.groups.sourceTz.toUpperCase();
	const timeExpression = match.groups.timeExpression.trim();
	const targetInput = match.groups.targetTz?.toUpperCase();
	const sourceOffset = TIMEZONE_ABBREVIATION_OFFSETS[sourceTz];

	if (sourceOffset == null) {
		return null;
	}

	let targetZone = localZone;
	let targetLabel: string | null = null;

	if (targetInput) {
		if (targetInput === "LOCAL") {
			targetZone = localZone;
		} else {
			const targetOffset = TIMEZONE_ABBREVIATION_OFFSETS[targetInput];
			if (targetOffset == null) {
				return null;
			}
			targetZone = offsetMinutesToUtcZone(targetOffset);
			targetLabel = targetInput;
		}
	}

	const parsedDate = chrono.parseDate(
		`${timeExpression} ${sourceTz}`,
		new Date(),
		{
			timezones: TIMEZONE_ABBREVIATION_OFFSETS,
		},
	);

	if (parsedDate == null) {
		return null;
	}

	const sourceDateTime = DateTime.fromJSDate(parsedDate).setZone(
		offsetMinutesToUtcZone(sourceOffset),
	);
	const targetDateTime = DateTime.fromJSDate(parsedDate).setZone(targetZone);

	if (!sourceDateTime.isValid || !targetDateTime.isValid) {
		return null;
	}

	if (targetLabel == null) {
		const shortName = targetDateTime.offsetNameShort;
		targetLabel =
			shortName != null && !/^(GMT|UTC)/i.test(shortName)
				? shortName
				: localZone;
	}

	return {
		kind: "comparison",
		left: {
			label: sourceTz,
			value: sourceDateTime.toFormat("ccc dd LLL HH:mm"),
		},
		right: {
			label: targetLabel,
			value: targetDateTime.toFormat("ccc dd LLL HH:mm"),
		},
	};
}

export function parseUnitConversion(query: string): TemporaryResult | null {
	const normalized = query.trim().replace(/,/g, "").replace(/\s+/g, " ");
	const match = normalized.match(
		/^(?<value>-?\d*\.?\d+)\s*(?<from>[a-zA-Z]+)\s*(?:to|in)\s*(?<to>[a-zA-Z]+)$/i,
	);

	if (!match?.groups) {
		return null;
	}

	const value = Number.parseFloat(match.groups.value);
	if (Number.isNaN(value)) {
		return null;
	}

	const fromUnit = normalizeUnit(match.groups.from);
	const toUnit = normalizeUnit(match.groups.to);

	try {
		const converted = convert(value)
			.from(fromUnit as any)
			.to(toUnit as any);
		return {
			kind: "comparison",
			left: {
				label: fromUnit,
				value: formatConvertedValue(value),
			},
			right: {
				label: toUnit,
				value: formatConvertedValue(converted),
			},
		};
	} catch {
		return null;
	}
}

export function parseFlightIdentifier(query: string) {
	const normalized = query.trim().toUpperCase().replace(/\s+/g, "");
	if (!/^[A-Z]{2,3}\d{2,4}[A-Z]?$/.test(normalized)) {
		return null;
	}

	return normalized;
}

function extractFlightSnippetsFromHtml(html: string, engine: "ddg" | "google") {
	const rawMatches =
		engine === "ddg"
			? [...html.matchAll(/result__snippet[^>]*>([\s\S]*?)<\/a>/gi)].map(
					(m) => m[1],
				)
			: [
					...html.matchAll(
						/class="(?:VwiC3b|aCOpRe)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
					),
				].map((m) => m[1]);

	return rawMatches
		.map((s) => decodeHtmlEntities(stripHtmlTags(s)))
		.map((s) => s.replace(/\s+/g, " ").trim())
		.filter(Boolean)
		.slice(0, 6);
}

function parseFlightTemporaryResultFromSnippets(
	flightIdentifier: string,
	snippets: string[],
): TemporaryResult | null {
	if (snippets.length === 0) {
		return null;
	}

	const merged = snippets.join(" ");
	const statusMatch = merged.match(
		/\b(on\s*time|delayed|cancelled|boarding|departed|landed|scheduled)\b/i,
	);
	const terminalMatch = merged.match(/\bterminal\s*([a-z0-9-]+)/i);
	const gateMatch = merged.match(/\bgate\s*([a-z0-9-]+)/i);
	const times = [...merged.matchAll(/\b\d{1,2}:\d{2}\s?(?:am|pm)?\b/gi)]
		.map((m) => m[0].toUpperCase())
		.slice(0, 2);

	if (!statusMatch && !terminalMatch && !gateMatch && times.length === 0) {
		return null;
	}

	return {
		kind: "flight",
		flight: flightIdentifier,
		status: statusMatch?.[1]?.toUpperCase(),
		departureTime: times[0],
		arrivalTime: times[1],
		terminal: terminalMatch?.[1]?.toUpperCase(),
		gate: gateMatch?.[1]?.toUpperCase(),
	};
}

export async function fetchFlightInfoFromWeb(
	flightIdentifier: string,
): Promise<TemporaryResult | null> {
	const searchQuery = `${flightIdentifier} flight status gate terminal departure time`;
	const requestConfig = {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
		},
		timeout: 6000,
	};

	let ddgError: unknown;
	try {
		const ddgResponse = await axios.get<string>(
			"https://duckduckgo.com/html/",
			{
				...requestConfig,
				params: { q: searchQuery },
			},
		);
		const ddgResult = parseFlightTemporaryResultFromSnippets(
			flightIdentifier,
			extractFlightSnippetsFromHtml(ddgResponse.data, "ddg"),
		);
		if (ddgResult != null) {
			return ddgResult;
		}
	} catch (error) {
		ddgError = error;
	}

	let googleError: unknown;
	try {
		const googleResponse = await axios.get<string>(
			"https://www.google.com/search",
			{
				...requestConfig,
				params: { q: searchQuery, hl: "en" },
			},
		);
		const googleResult = parseFlightTemporaryResultFromSnippets(
			flightIdentifier,
			extractFlightSnippetsFromHtml(googleResponse.data, "google"),
		);
		if (googleResult != null) {
			return googleResult;
		}
	} catch (error) {
		googleError = error;
	}

	if (googleError != null) {
		throw googleError;
	}

	if (ddgError != null) {
		throw ddgError;
	}

	return null;
}

export function formatTemporaryResultForClipboard(result: TemporaryResult) {
	if (result.kind === "text") {
		return result.secondary
			? `${result.value} (${result.secondary})`
			: result.value;
	}

	if (result.kind === "comparison") {
		const footer = result.footer ? ` | ${result.footer}` : "";
		return `${result.left.value} ${result.left.label} = ${result.right.value} ${result.right.label}${footer}`;
	}

	const parts: string[] = [];
	if (result.status) {
		parts.push(`Status: ${result.status}`);
	}
	if (result.departureTime) {
		parts.push(`Departure: ${result.departureTime}`);
	}
	if (result.arrivalTime) {
		parts.push(`Arrival: ${result.arrivalTime}`);
	}
	if (result.terminal) {
		parts.push(`Terminal: ${result.terminal}`);
	}
	if (result.gate) {
		parts.push(`Gate: ${result.gate}`);
	}

	const details = parts.join(" | ");
	return details ? `${result.flight} | ${details}` : result.flight;
}

export function formatExpressionResult(value: number) {
	if (!Number.isFinite(value)) {
		return value.toString();
	}

	const scale = 10 ** EXPRESSION_RESULT_DECIMALS;
	const rounded = Math.round((value + Number.EPSILON) * scale) / scale;
	return rounded.toString();
}
