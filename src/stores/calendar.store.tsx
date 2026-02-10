import { captureException } from "@sentry/react-native";
import { extractMeetingLink } from "lib/calendar";
import { solNative } from "lib/SolNative";
import { DateTime } from "luxon";
import { makeAutoObservable, runInAction } from "mobx";
import { type EmitterSubscription, Linking } from "react-native";
import type { IRootStore } from "store";

const MAX_DAYS_AHEAD = 14;

let onShowListener: EmitterSubscription | undefined;
let onStatusBarItemClickListener: EmitterSubscription | undefined;

export type CalendarStore = ReturnType<typeof createCalendarStore>;

export const createCalendarStore = (root: IRootStore) => {
	const store = makeAutoObservable({
		//    ____  _                              _     _
		//   / __ \| |                            | |   | |
		//  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
		//  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
		//  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
		//   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/

		calendarAuthorizationStatus: "notDetermined" as CalendarAuthorizationStatus,
		events: [] as INativeEvent[],

		//    _____                            _           _
		//   / ____|                          | |         | |
		//  | |     ___  _ __ ___  _ __  _   _| |_ ___  __| |
		//  | |    / _ \| '_ ` _ \| '_ \| | | | __/ _ \/ _` |
		//  | |___| (_) | | | | | | |_) | |_| | ||  __/ (_| |
		//   \_____\___/|_| |_| |_| .__/ \__,_|\__\___|\__,_|
		//                        | |
		//                        |_|

		get upcomingEvent(): INativeEvent | null {
			const lNow = DateTime.now();
			const found = store.events.find((e) => {
				if (e.isAllDay) {
					return false; // Skip all-day events
				}

				const lStart = DateTime.fromISO(e.date);
				const lEnd = DateTime.fromISO(e.endDate || e.date);

				const isCurrentlyOngoing = +lNow >= +lStart && +lNow <= +lEnd;

				if (isCurrentlyOngoing) {
					return true;
				}

				const isUpcoming = +lStart >= +lNow && +lStart <= +lNow.endOf("day");

				if (isUpcoming) {
					return true;
				}

				return false;
			});

			if (found) {
				let eventLink: string | null | undefined = found.url;

				if (!eventLink) {
					eventLink = extractMeetingLink(found.notes, found.location);
				}

				return { ...found, eventLink };
			}

			return null;
		},
		get groupedEvents(): Array<{
			date: DateTime;
			data: Array<INativeEvent>;
		}> {
			const events = store.events;
			const acc: Record<string, { date: DateTime; data: Array<INativeEvent> }> =
				{};
			for (let i = 0; i < events.length; i++) {
				const e = events[i];
				const lEventDate = DateTime.fromISO(e.date);
				const lEventDay = lEventDate.startOf("day");
				const diffDays = lEventDay.diffNow("days").days;

				// Skip past events
				if (diffDays <= -1) {
					continue;
				}

				if (diffDays > MAX_DAYS_AHEAD) {
					break;
				}

				const dayISODate = lEventDay.toISODate();
				if (!acc[dayISODate]) {
					acc[dayISODate] = {
						date: lEventDay,
						data: [],
					};
				}

				acc[dayISODate].data.push(e);
			}

			return Object.values(acc);
		},
		get filteredEvents(): INativeEvent[] {
			const events = store.events;
			return events.filter((e) => {
				if (root.ui.query) {
					return e.title?.toLowerCase().includes(root.ui.query.toLowerCase());
				}
				const notFiltered = e.status !== 3 && !e.declined;

				return notFiltered;
			});
		},
		//                _   _
		//      /\       | | (_)
		//     /  \   ___| |_ _  ___  _ __  ___
		//    / /\ \ / __| __| |/ _ \| '_ \/ __|
		//   / ____ \ (__| |_| | (_) | | | \__ \
		//  /_/    \_\___|\__|_|\___/|_| |_|___/
		fetchEvents: async () => {
			if (store.calendarAuthorizationStatus !== "authorized") {
				return;
			}

			try {
				const events = await solNative.getEvents();

				runInAction(() => {
					store.events = events;
				});
			} catch (error) {
				captureException(error);
				console.error("Failed to fetch calendar events:", error);
			}
		},
		cleanUp: () => {
			onShowListener?.remove();
			onStatusBarItemClickListener?.remove();
		},
		onShow: () => {
			console.log("Fetching events");
			store.fetchEvents();
		},
		getCalendarAccess: () => {
			store.calendarAuthorizationStatus =
				solNative.getCalendarAuthorizationStatus();
		},
		onStatusBarItemClick: async () => {
			try {
				const events = await solNative.getEvents();
				const lNow = DateTime.now();

				const found = events.find((e) => {
					if (e.isAllDay) return false;
					const lStart = DateTime.fromISO(e.date);
					const lEnd = DateTime.fromISO(e.endDate || e.date);
					const isOngoing = +lNow >= +lStart && +lNow <= +lEnd;
					if (isOngoing) return true;
					const isUpcoming = +lStart >= +lNow && +lStart <= +lNow.endOf("day");
					return isUpcoming;
				});

				if (!found) {
					Linking.openURL("ical://");
					return;
				}

				let eventLink: string | null | undefined = found.url;
				if (!eventLink) {
					eventLink = extractMeetingLink(found.notes, found.location);
				}

				if (eventLink) {
					Linking.openURL(eventLink);
				} else {
					Linking.openURL("ical://");
				}
			} catch (e) {
				Linking.openURL("ical://");
			}
		},
	});

	store.getCalendarAccess();
	store.fetchEvents();

	onShowListener = solNative.addListener("onShow", store.onShow);
	onStatusBarItemClickListener = solNative.addListener(
		"onStatusBarItemClick",
		store.onStatusBarItemClick,
	);

	return store;
};
