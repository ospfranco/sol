import { MySwitch } from "components/MySwitch";
import { observer } from "mobx-react-lite";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useStore } from "store";

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
		</ScrollView>
	);
});
