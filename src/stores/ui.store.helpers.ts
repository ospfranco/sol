import * as chrono from "chrono-node";
import convert from "convert-units";
import { DateTime } from "luxon";

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

export function parseTimezoneConversion(query: string) {
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

	return `${sourceDateTime.toFormat("HH:mm")} ${sourceTz} = ${targetDateTime.toFormat("HH:mm")} ${targetLabel}`;
}

export function parseUnitConversion(query: string) {
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
		return `${formatConvertedValue(value)} ${fromUnit} = ${formatConvertedValue(converted)} ${toUnit}`;
	} catch {
		return null;
	}
}

export function formatExpressionResult(value: number) {
	if (!Number.isFinite(value)) {
		return value.toString();
	}

	const scale = 10 ** EXPRESSION_RESULT_DECIMALS;
	const rounded = Math.round((value + Number.EPSILON) * scale) / scale;
	return rounded.toString();
}
