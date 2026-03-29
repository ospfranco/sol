import { captureException } from "@sentry/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { extractMeetingLink } from "lib/calendar";
import { solNative } from "lib/SolNative";
import { DateTime } from "luxon";
import { autorun, makeAutoObservable, runInAction, toJS } from "mobx";
import { type EmitterSubscription, Linking } from "react-native";
import type { IRootStore } from "store";
import { storage } from "./storage";

const MAX_DAYS_AHEAD = 14;
const CALENDAR_STORE_KEY = "@calendar.store";

let onShowListener: EmitterSubscription | undefined;
let onStatusBarItemClickListener: EmitterSubscription | undefined;
let persistDisposer: (() => void) | undefined;

export type CalendarStore = ReturnType<typeof createCalendarStore>;

export const createCalendarStore = (root: IRootStore) => {
	const persist = async () => {
		try {
			storage.set(
				CALENDAR_STORE_KEY,
				JSON.stringify({
					selectedCalendarIds: toJS(store.selectedCalendarIds),
					hasInitializedSelection: store.hasInitializedSelection,
				}),
			);
		} catch (error) {
			captureException(error);
		}
	};

	const hydrate = async () => {
		let storeState: string | null | undefined;

		try {
			storeState = storage.getString(CALENDAR_STORE_KEY);
		} catch {
			// intentionally left blank
		}

		if (!storeState) {
			storeState = await AsyncStorage.getItem(CALENDAR_STORE_KEY);
		}

		if (!storeState) {
			return;
		}

		try {
			const parsedStore = JSON.parse(storeState);
			runInAction(() => {
				store.selectedCalendarIds = parsedStore.selectedCalendarIds ?? [];
				store.hasInitializedSelection =
					parsedStore.hasInitializedSelection ?? false;
			});
		} catch (error) {
			captureException(error);
		}
	};

	const store = makeAutoObservable({
		//    ____  _                              _     _
		//   / __ \| |                            | |   | |
		//  | |  | | |__  ___  ___ _ ____   ____ _| |__ | | ___  ___
		//  | |  | | '_ \/ __|/ _ \ '__\ \ / / _` | '_ \| |/ _ \/ __|
		//  | |__| | |_) \__ \  __/ |   \ V / (_| | |_) | |  __/\__ \
		//   \____/|_.__/|___/\___|_|    \_/ \__,_|_.__/|_|\___||___/

		calendarAuthorizationStatus: "notDetermined" as CalendarAuthorizationStatus,
		events: [] as INativeEvent[],
		calendars: [] as INativeCalendar[],
		selectedCalendarIds: [] as string[],
		hasInitializedSelection: false,

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
				runInAction(() => {
					store.events = [];
				});
				return;
			}

			if (
				store.hasInitializedSelection &&
				store.selectedCalendarIds.length === 0
			) {
				runInAction(() => {
					store.events = [];
				});
				return;
			}

			try {
				const selectedCalendarIds = store.hasInitializedSelection
					? (toJS(store.selectedCalendarIds) as string[])
					: undefined;
				const events = await solNative.getEvents(selectedCalendarIds);

				runInAction(() => {
					store.events = events;
				});
			} catch (error) {
				captureException(error);
				console.error("Failed to fetch calendar events:", error);
			}
		},
		fetchCalendars: async () => {
			if (store.calendarAuthorizationStatus !== "authorized") {
				runInAction(() => {
					store.calendars = [];
				});
				return;
			}

			try {
				const calendars = await solNative.getCalendars();
				const sortedCalendars = [...calendars].sort((a, b) =>
					a.title.localeCompare(b.title),
				);

				runInAction(() => {
					store.calendars = sortedCalendars;

					if (!store.hasInitializedSelection) {
						store.selectedCalendarIds = sortedCalendars.map(
							(calendar) => calendar.id,
						);
						store.hasInitializedSelection = true;
						return;
					}

					const availableIds = new Set(
						sortedCalendars.map((calendar) => calendar.id),
					);
					store.selectedCalendarIds = store.selectedCalendarIds.filter((id) =>
						availableIds.has(id),
					);
				});
			} catch (error) {
				captureException(error);
				console.error("Failed to fetch calendars:", error);
			}
		},
		toggleCalendarSelection: (calendarId: string) => {
			if (store.selectedCalendarIds.includes(calendarId)) {
				store.selectedCalendarIds = store.selectedCalendarIds.filter(
					(id) => id !== calendarId,
				);
			} else {
				store.selectedCalendarIds = [...store.selectedCalendarIds, calendarId];
			}

			store.hasInitializedSelection = true;
			store.fetchEvents();
		},
		selectAllCalendars: () => {
			store.selectedCalendarIds = store.calendars.map(
				(calendar) => calendar.id,
			);
			store.hasInitializedSelection = true;
			store.fetchEvents();
		},
		clearCalendarSelection: () => {
			store.selectedCalendarIds = [];
			store.hasInitializedSelection = true;
			store.fetchEvents();
		},
		isCalendarSelected: (calendarId: string) => {
			return store.selectedCalendarIds.includes(calendarId);
		},
		cleanUp: () => {
			onShowListener?.remove();
			onStatusBarItemClickListener?.remove();
			persistDisposer?.();
		},
		onShow: () => {
			store.getCalendarAccess();
			store.fetchCalendars();
			store.fetchEvents();
		},
		getCalendarAccess: () => {
			store.calendarAuthorizationStatus =
				solNative.getCalendarAuthorizationStatus();
		},
		onStatusBarItemClick: async () => {
			try {
				const selectedCalendarIds = store.hasInitializedSelection
					? (toJS(store.selectedCalendarIds) as string[])
					: undefined;
				const events = await solNative.getEvents(selectedCalendarIds);
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
		initialize: async () => {
			await hydrate();
			store.getCalendarAccess();
			await store.fetchCalendars();
			await store.fetchEvents();
		},
	});

	persistDisposer = autorun(() => {
		void persist();
	});

	void store.initialize();

	onShowListener = solNative.addListener("onShow", store.onShow);
	onStatusBarItemClickListener = solNative.addListener(
		"onStatusBarItemClick",
		store.onStatusBarItemClick,
	);

	return store;
};
