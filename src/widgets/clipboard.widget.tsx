import { LegendList, type LegendListRef } from "@legendapp/list/react-native";
import clsx from "clsx";
import { FileIcon } from "components/FileIcon";
import { Key } from "components/Key";
import { LoadingBar } from "components/LoadingBar";
import { MainInput } from "components/MainInput";
import { solNative } from "lib/SolNative";
import { observer } from "mobx-react-lite";
import { type FC, useEffect, useRef } from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	type ViewStyle,
} from "react-native";
import { TextInput } from "react-native-macos";
import { useStore } from "store";
import type { PasteItem } from "stores/clipboard.store";
import { MAX_CLIPBOARD_PREVIEW_LENGTH } from "stores/ui.store";

interface Props {
	style?: ViewStyle;
	className?: string;
}

// Swallowed by the text view so the Edit menu does not copy on top of us.
const COPY_KEY_EVENTS = [{ key: "c", metaKey: true }];

function isImageUrl(url: string | null | undefined) {
	if (!url) {
		return false;
	}
	const lowercaseUrl = url.toLowerCase();
	return (
		lowercaseUrl.includes(".png") ||
		lowercaseUrl.includes(".jpg") ||
		lowercaseUrl.includes(".jpeg") ||
		lowercaseUrl.includes(".tif") ||
		lowercaseUrl.includes(".tiff")
	);
}

function toFileUri(path: string) {
	return encodeURI(`file://${path}`);
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
				className={clsx("items-center flex-row rounded gap-2 p-2", {
					"bg-accent": isActive,
					"opacity-80": !isActive,
				})}
			>
				{isImageUrl(item.url) ? (
					<Image
						source={{ uri: toFileUri(item.url as string) }}
						className="h-6 w-6 rounded"
						resizeMode="cover"
					/>
				) : (
					<FileIcon
						url={decodeURIComponent(
							item.bundle?.replace("file://", "") ??
								item.url?.replace("file://", "") ??
								"",
						)}
						className="h-6 w-6"
					/>
				)}

				<Text
					className={clsx("text-xs text flex-1", {
						"text-white": isActive,
					})}
					numberOfLines={1}
				>
					{item.text.trim()}
				</Text>
			</TouchableOpacity>
		);
	},
);

export const ClipboardWidget: FC<Props> = observer(() => {
	const store = useStore();
	const data = store.clipboard.clipboardItems;
	const selectedIndex = store.ui.selectedIndex;
	const listRef = useRef<LegendListRef | null>(null);
	const previewRef = useRef<TextInput | null>(null);
	const previouslyFocusedRef = useRef<ReturnType<
		typeof TextInput.State.currentlyFocusedInput
	> | null>(null);
	const entry = data[selectedIndex];
	const previewFocused = store.ui.clipboardPreviewFocused;
	const focusRequest = store.ui.clipboardPreviewFocusRequest;
	const hasSelection = store.ui.clipboardPreviewSelectedText != null;

	useEffect(() => {
		if (data.length > 0 && selectedIndex < data.length) {
			listRef.current?.scrollToIndex({
				index: store.ui.selectedIndex,
				viewOffset: 80,
			});
		}
	}, [selectedIndex, data.length, store.ui.selectedIndex]);

	// While the preview is not focused the search input holds the focus. Remember
	// it so it can be handed back, no matter how the preview got focused.
	useEffect(() => {
		if (previewFocused) {
			return;
		}
		const focused = TextInput.State.currentlyFocusedInput();
		if (focused != null) {
			previouslyFocusedRef.current = focused;
		}
	});

	useEffect(() => {
		if (focusRequest === 0) {
			return;
		}
		previewRef.current?.focus();
		// Gives shift + arrow keys an anchor to extend from.
		previewRef.current?.setSelection(0, 0);
	}, [focusRequest]);

	useEffect(() => {
		if (!previewFocused && previouslyFocusedRef.current != null) {
			TextInput.State.focusTextInput(previouslyFocusedRef.current);
		}
	}, [previewFocused]);

	useEffect(() => {
		// Arrow keys are swallowed natively to drive the list, which would leave the
		// preview unable to extend a selection vertically.
		if (previewFocused) {
			solNative.turnOffVerticalArrowsListeners();
		} else {
			solNative.turnOnVerticalArrowsListeners();
		}

		return () => {
			solNative.turnOnVerticalArrowsListeners();
		};
	}, [previewFocused]);

	return (
		<View className="flex-1">
			<View className="flex-row px-3">
				<MainInput placeholder="Search Pasteboard..." showBackButton />
			</View>
			<LoadingBar />
			<View className="flex-1 flex-row">
				<View className="w-64 h-full">
					<LegendList
						key={`${data.length}`}
						data={data}
						className="flex-1"
						contentContainerStyle={STYLES.contentContainer}
						ref={listRef}
						recycleItems
						ListEmptyComponent={
							<View className="flex-1 justify-center items-center">
								<Text className="darker-text">[ ]</Text>
							</View>
						}
						renderItem={RenderItem}
					/>
				</View>
				<View className="flex-1 px-3 py-2">
					{!!entry && !entry.url && (
						<View
							className={clsx(
								"dark:bg-black/20 bg-white rounded-lg flex-1 p-3 border",
								previewFocused ? "border-accent" : "border-transparent",
							)}
						>
							<TextInput
								ref={previewRef}
								multiline
								editable={false}
								enableFocusRing={false}
								keyDownEvents={COPY_KEY_EVENTS}
								value={entry.text.slice(0, MAX_CLIPBOARD_PREVIEW_LENGTH)}
								onFocus={() => store.ui.setClipboardPreviewFocused(true)}
								onBlur={() => store.ui.setClipboardPreviewFocused(false)}
								onSelectionChange={(e) => {
									const { start, end } = e.nativeEvent.selection;
									store.ui.setClipboardPreviewSelection(
										start === end ? null : { start, end, entryId: entry.id },
									);
								}}
								className="text-xs flex-1"
							/>
							{entry.text.length > MAX_CLIPBOARD_PREVIEW_LENGTH && (
								<Text className="text-xs darker-text mt-2">
									{`Preview truncated — ${entry.text.length.toLocaleString()} chars total`}
								</Text>
							)}
						</View>
					)}

					{!!entry?.url && (
						<ScrollView
							className="dark:bg-black/20 bg-white rounded-lg flex-1"
							contentContainerStyle={STYLES.previewContainer}
						>
							{isImageUrl(entry.url) ? (
								<View className="flex-1 items-center justify-center">
									<Image
										source={{ uri: toFileUri(entry.url as string) }}
										style={STYLES.previewImage}
										resizeMode="contain"
									/>
								</View>
							) : (
								<View className="flex-1 w-full items-center justify-center">
									<FileIcon url={`file://${entry.url}`} className="h-20 w-20" />
									<Text className="font-mono">{entry.text}</Text>
								</View>
							)}
						</ScrollView>
					)}
				</View>
			</View>
			{/* Shortcut bar at the bottom */}
			<View className="py-2 px-4 flex-row items-center justify-end gap-1 subBg border-t border-color">
				{previewFocused ? (
					<>
						<Text className="text-xs darker-text mr-1">Back to List</Text>
						<Key symbol={"⇥"} />
						{hasSelection && (
							<>
								<View className="mx-2" />
								<Text className="text-xs darker-text mr-1">Copy</Text>
								<Key symbol={"⌘"} />
								<Key symbol={"C"} />
							</>
						)}
						<View className="mx-2" />
						<Text className={"text-xs mr-1"}>
							{hasSelection ? "Paste Selection" : "Paste"}
						</Text>
						<Key symbol={"⏎"} primary />
					</>
				) : (
					<>
						{store.ui.canFocusClipboardPreview && (
							<>
								<Text className="text-xs darker-text mr-1">
									Select in Preview
								</Text>
								<Key symbol={"⇥"} />
								<View className="mx-2" />
							</>
						)}
						<Text className="text-xs darker-text mr-1">Delete Item</Text>
						<Key symbol={"⇧"} />
						<Key symbol={"⌫"} />
						<View className="mx-2" />
						<Text className={"text-xs mr-1"}>Paste</Text>
						<Key symbol={"⏎"} primary />
					</>
				)}
			</View>
		</View>
	);
});

const STYLES = StyleSheet.create({
	contentContainer: {
		flexGrow: 1,
		paddingVertical: 6,
		paddingLeft: 8,
	},
	previewContainer: {
		padding: 12,
	},
	previewImage: {
		width: "100%",
		height: 360,
	},
});
