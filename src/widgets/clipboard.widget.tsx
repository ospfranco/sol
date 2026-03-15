import { LegendList, type LegendListRef } from "@legendapp/list";
import clsx from "clsx";
import { FileIcon } from "components/FileIcon";
import { FileImageView } from "components/FileImageView";
import { Key } from "components/Key";
import { LoadingBar } from "components/LoadingBar";
import { MainInput } from "components/MainInput";
import { observer } from "mobx-react-lite";
import { type FC, useEffect, useRef } from "react";
import {
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	type ViewStyle,
} from "react-native";
import { useStore } from "store";
import type { PasteItem } from "stores/clipboard.store";

interface Props {
	style?: ViewStyle;
	className?: string;
}

const MAX_PREVIEW_LENGTH = 5000;

function truncateText(text: string | undefined | null): string {
	if (!text) return "";
	if (text.length <= MAX_PREVIEW_LENGTH) return text;
	return text.slice(0, MAX_PREVIEW_LENGTH) + `\n\n... (${text.length.toLocaleString()} chars total)`;
}

const RenderItem = observer(
	({ item, index }: { item: PasteItem; index: number }) => {
		const store = useStore();
		const selectedIndex = store.ui.selectedIndex;
		const isActive = index === selectedIndex;
		return (
			<TouchableOpacity
				onPress={() => {
					store.ui.setSelectedIndex(index);
					store.keystroke.simulateEnter();
				}}
				className={clsx("items-center flex-row rounded gap-2 p-2 mr-2", {
					"bg-accent": isActive,
					"opacity-80": !isActive,
				})}
			>
				{isPngOrJpg(item.url) ? (
					<FileImageView
						url={item.url ?? ""}
						style={{ width: 24, height: 24, borderRadius: 4 }}
					/>
				) : (
					<FileIcon
						url={
							item.bundleId ??
							decodeURIComponent(
								item.bundle?.replace("file://", "") ??
									item.url?.replace("file://", "") ??
									"",
							)
						}
						className="h-6 w-6"
					/>
				)}

				<Text
					className={clsx("text-xs text flex-1", {
						"text-white": isActive,
					})}
					numberOfLines={1}
				>
					{isPngOrJpg(item.url) ? item.text : item.text.trim()}
				</Text>

				{item.pinned && (
					<Text
						className={clsx("text-xs mr-1", {
							"text-white": isActive,
							"darker-text": !isActive,
						})}
					>
						{"\u{1F4CC}"}
					</Text>
				)}
			</TouchableOpacity>
		);
	},
);

function isPngOrJpg(url: string | null | undefined) {
	if (!url) {
		return false;
	}
	const lowercaseUrl = url.toLowerCase();
	return (
		lowercaseUrl.includes(".png") ||
		lowercaseUrl.includes(".jpg") ||
		lowercaseUrl.includes(".jpeg")
	);
}

export const ClipboardWidget: FC<Props> = observer(() => {
	const store = useStore();
	const data = store.clipboard.clipboardItems;
	const selectedIndex = store.ui.selectedIndex;
	const listRef = useRef<LegendListRef | null>(null);
	const isInitialMount = useRef(true);

	useEffect(() => {
		if (isInitialMount.current) {
			isInitialMount.current = false;
			return;
		}
		if (data.length > 0 && selectedIndex < data.length) {
			listRef.current?.scrollToIndex({
				index: selectedIndex,
				animated: false,
				viewPosition: 0.5,
			});
		}
	}, [selectedIndex, data.length]);

	return (
		<View className="flex-1">
			<View className="flex-row px-3">
				<MainInput placeholder="Search Pasteboard..." showBackButton />
			</View>
			<LoadingBar />
			<View className="flex-1 flex-row">
				<View className="w-64 h-full">
					<LegendList
						data={data}
						className="flex-1"
						contentContainerStyle={STYLES.contentContainer}
						ref={listRef}
						ListEmptyComponent={
							<View className="flex-1 justify-center items-center">
								<Text className="darker-text">No items</Text>
							</View>
						}
						renderItem={RenderItem}
					/>
				</View>
				<View className="flex-1 px-3 py-2">
					{!!data[selectedIndex] && (
						<ScrollView
							className="dark:bg-black/20 bg-white rounded-lg flex-1"
							contentContainerStyle={{ padding: 12 }}
						>
							{!data[selectedIndex].url && (
								<Text className="text-xs" selectable>
									{truncateText(data[selectedIndex]?.text)}
								</Text>
							)}
							{!!data[selectedIndex].url &&
								isPngOrJpg(data[selectedIndex].url) && (
									<View className="flex-1 w-full items-center justify-center">
										<FileImageView
											url={data[selectedIndex].url ?? ""}
											style={{
												width: 280,
												height: 280,
												borderRadius: 8,
											}}
										/>
										<Text className="text-xs darker-text mt-2">
											{data[selectedIndex].text}
										</Text>
									</View>
								)}
							{!!data[selectedIndex].url &&
								!isPngOrJpg(data[selectedIndex].url) && (
									<View className="flex-1 w-full items-center justify-center">
										<FileIcon
											url={`file://${data[selectedIndex].url}`}
											className="h-20 w-20"
										/>
										<Text className="font-mono">
											{data[selectedIndex].text}
										</Text>
									</View>
								)}
						</ScrollView>
					)}
				</View>
			</View>
			{/* Shortcut bar at the bottom */}
			<View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg border-t border-color">
				<View style={{ position: "relative" }}>
					{store.clipboard.clipboardMenuOpen && !!data[selectedIndex] && (
						<View
							style={{
								position: "absolute",
								bottom: 36,
								left: 0,
								zIndex: 10,
							}}
						>
							<View
								className="rounded-lg p-1 border border-color"
								style={{
									minWidth: 200,
									backgroundColor: store.ui.isDarkMode
										? "rgba(50,50,50,0.95)"
										: "rgba(235,235,235,0.95)",
								}}
							>
								<Text className="text-xs darker-text px-3 py-1.5 font-semibold">
									Actions
								</Text>
								<TouchableOpacity
									onPress={() => {
										store.clipboard.togglePin(selectedIndex);
										store.clipboard.closeClipboardMenu();
									}}
									className="flex-row items-center gap-2 px-3 py-1.5 rounded"
								>
									<Text className="text-sm flex-1">
										{data[selectedIndex]?.pinned ? "Unpin" : "Pin to top"}
									</Text>
									<Key symbol={"⌘"} />
									<Key symbol="P" />
								</TouchableOpacity>
							</View>
						</View>
					)}
					<View className="flex-row items-center gap-1">
						<Text className="text-xs darker-text mr-1">More</Text>
						<Key symbol={"⌘"} />
						<Key symbol={"K"} />
					</View>
				</View>
				<View className="mx-2" />
				<Text className="text-xs darker-text mr-1">Delete Item</Text>
				<Key symbol={"⇧"} />
				<Key symbol={"⌫"} />
				<View className="mx-2" />
				<Text className={"text-xs mr-1"}>Paste</Text>
				<Key symbol={"⏎"} primary />
			</View>
		</View>
	);
});

const STYLES = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		paddingVertical: 6,
		paddingHorizontal: 8,
	},
});
