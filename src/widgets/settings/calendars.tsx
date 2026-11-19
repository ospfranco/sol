import { Input } from "components/Input";
import { MySwitch } from "components/MySwitch";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useStore } from "store";

const ExcludeKeywordsInput = observer(() => {
	const store = useStore();
	const stored = store.calendar.menuBarExcludeKeywords.join(", ");
	const [value, setValue] = useState(stored);

	useEffect(() => {
		setValue(stored);
	}, [stored]);

	const commit = () => {
		store.calendar.setMenuBarExcludeKeywords(value);
	};

	return (
		<Input
			bordered
			value={value}
			onChangeText={setValue}
			onBlur={commit}
			onSubmitEditing={commit}
			placeholder="e.g. Focus, Lunch, OOO"
			autoCorrect={false}
			autoCapitalize="none"
		/>
	);
});

export const Calendars = observer(() => {
	const store = useStore();
	const hasCalendarAccess =
		store.calendar.calendarAuthorizationStatus === "authorized";

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			automaticallyAdjustContentInsets
			className="flex-1"
			contentContainerClassName="p-5 gap-2"
		>
			<View className="p-3 subBg gap-3 rounded-lg border border-lightBorder dark:border-darkBorder">
				<View className="flex-row items-center">
					<View className="flex-1">
						<Text className="text-sm text">Show In-App Calendar</Text>
						<Text className="text-xxs text-neutral-500 dark:text-neutral-400">
							Display calendar events inside Sol.
						</Text>
					</View>
					<MySwitch
						value={store.ui.calendarEnabled}
						onValueChange={store.ui.setCalendarEnabled}
					/>
				</View>
				<View className="border-t border-lightBorder dark:border-darkBorder" />
				<View className="flex-row items-center">
					<View className="flex-1">
						<Text className="text-sm text">
							Show Upcoming Event In Menu Bar
						</Text>
						<Text className="text-xxs text-neutral-500 dark:text-neutral-400">
							Show the next event title and time in the menu bar.
						</Text>
					</View>
					<MySwitch
						value={store.ui.showUpcomingEvent}
						onValueChange={store.ui.setShowUpcomingEvent}
					/>
				</View>
			</View>

			<View className="p-3 subBg gap-2 rounded-lg border border-lightBorder dark:border-darkBorder">
				<Text className="text-sm text">Calendar Sources</Text>

				{!hasCalendarAccess && (
					<Text className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
						Calendar access is not granted yet. Enable calendar access in system
						settings to manage sources.
					</Text>
				)}
				<View className="flex-row items-center justify-between">
					<Text className="text-xs text-neutral-500 dark:text-neutral-400">
						Selected {store.calendar.selectedCalendarIds.length} of{" "}
						{store.calendar.calendars.length}
					</Text>
					<View className="flex-row items-center gap-3">
						<TouchableOpacity
							onPress={store.calendar.selectAllCalendars}
							disabled={
								!hasCalendarAccess || store.calendar.calendars.length === 0
							}
						>
							<Text className="text-blue-500 text-xs">Select all</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={store.calendar.clearCalendarSelection}
							disabled={
								!hasCalendarAccess || store.calendar.calendars.length === 0
							}
						>
							<Text className="text-blue-500 text-xs">Clear</Text>
						</TouchableOpacity>
					</View>
				</View>

				{store.calendar.calendars.length === 0 && (
					<Text className="text-xs text-neutral-500 dark:text-neutral-400">
						No calendars found.
					</Text>
				)}

				{store.calendar.calendars.map((calendar, idx) => {
					const isSelected = store.calendar.isCalendarSelected(calendar.id);
					return (
						<View key={calendar.id}>
							{idx > 0 && (
								<View className="border-t border-lightBorder dark:border-darkBorder" />
							)}
							<View className="flex-row items-center py-2">
								<Text className="text-sm text flex-1">{calendar.title}</Text>
								<MySwitch
									value={isSelected}
									onValueChange={() => {
										store.calendar.toggleCalendarSelection(calendar.id);
									}}
									disabled={!hasCalendarAccess}
								/>
							</View>
						</View>
					);
				})}
			</View>

			<View className="p-3 subBg gap-2 rounded-lg border border-lightBorder dark:border-darkBorder">
				<Text className="text-sm text">Menu Bar Filters</Text>
				<Text className="text-xxs text-neutral-500 dark:text-neutral-400">
					Choose which events can appear as the upcoming event in the menu bar.
					These don't affect the in-app calendar.
				</Text>

				<View className="border-t border-lightBorder dark:border-darkBorder" />
				<View className="flex-row items-center">
					<View className="flex-1">
						<Text className="text-sm text">Only Events With Meeting Link</Text>
						<Text className="text-xxs text-neutral-500 dark:text-neutral-400">
							Hide events without a Zoom, Meet, Teams or similar link.
						</Text>
					</View>
					<MySwitch
						value={store.calendar.menuBarRequireMeetingLink}
						onValueChange={store.calendar.setMenuBarRequireMeetingLink}
					/>
				</View>

				<View className="border-t border-lightBorder dark:border-darkBorder" />
				<View className="gap-1">
					<Text className="text-sm text">Exclude Titles Containing</Text>
					<Text className="text-xxs text-neutral-500 dark:text-neutral-400">
						Comma-separated, case-insensitive.
					</Text>
					<ExcludeKeywordsInput />
				</View>

				<View className="border-t border-lightBorder dark:border-darkBorder" />
				<View className="flex-row items-center justify-between">
					<Text className="text-xs text-neutral-500 dark:text-neutral-400">
						Menu bar calendars:{" "}
						{store.calendar.menuBarCalendarIds === null
							? "all"
							: `${store.calendar.menuBarCalendarIds.length} of ${store.calendar.calendars.length}`}
					</Text>
					<View className="flex-row items-center gap-3">
						<TouchableOpacity
							onPress={store.calendar.selectAllMenuBarCalendars}
							disabled={!hasCalendarAccess}
						>
							<Text className="text-blue-500 text-xs">Select all</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={store.calendar.clearMenuBarCalendars}
							disabled={!hasCalendarAccess}
						>
							<Text className="text-blue-500 text-xs">Clear</Text>
						</TouchableOpacity>
					</View>
				</View>

				{store.calendar.calendars.map((calendar, idx) => (
					<View key={calendar.id}>
						{idx > 0 && (
							<View className="border-t border-lightBorder dark:border-darkBorder" />
						)}
						<View className="flex-row items-center py-2">
							<Text className="text-sm text flex-1">{calendar.title}</Text>
							<MySwitch
								value={store.calendar.isMenuBarCalendarSelected(calendar.id)}
								onValueChange={() => {
									store.calendar.toggleMenuBarCalendar(calendar.id);
								}}
								disabled={!hasCalendarAccess}
							/>
						</View>
					</View>
				))}
			</View>
		</ScrollView>
	);
});
