import { Assets } from "assets";
import { observer } from "mobx-react-lite";
import type { RefObject } from "react";
import { DevSettings, Image, Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-macos";
import { useStore } from "store";
import { Widget } from "stores/ui.store";
import colors from "tailwindcss/colors";
import { BackButton } from "./BackButton";

type Props = {
	placeholder?: string;
	showBackButton?: boolean;
	style?: any;
	className?: string;
	hideIcon?: boolean;
	selectTextOnFocus?: boolean;
	inputRef?: RefObject<any>;
};

export const MainInput = observer<Props>(
	({
		placeholder = "Search your mac...",
		showBackButton,
		hideIcon,
		selectTextOnFocus = false,
		inputRef,
	}) => {
		const store = useStore();
		const isDarkMode = store.ui.isDarkMode;
		const reloadApp = async () => {
			DevSettings.reload();
		};

		let leftButton = null;
		if (showBackButton) {
			leftButton = (
				<BackButton
					onPress={() => {
						store.ui.setQuery("");
						store.ui.focusWidget(Widget.SEARCH);
					}}
				/>
			);
		}

		if (!showBackButton) {
			leftButton = (
				<TouchableOpacity onPress={reloadApp}>
					<Image
						source={isDarkMode ? Assets.logoMinimal : Assets.logoMinimalWhite}
						style={{ width: 20, height: 20 }}
					/>
				</TouchableOpacity>
			);
		}

		if (hideIcon) {
			leftButton = null;
		}

		return (
			<View className="min-h-[42px] flex-row items-center gap-2 my-1 flex-1 px-2">
				{leftButton}
				<TextInput
					ref={inputRef}
					autoFocus
					selectTextOnFocus={selectTextOnFocus}
					enableFocusRing={false}
					value={store.ui.query}
					onChangeText={store.ui.setQuery}
					className="text-lg flex-1"
					cursorColor={isDarkMode ? colors.white : colors.black}
					placeholder={placeholder}
					placeholderTextColor={isDarkMode ? "#888" : "#888"}
				/>
				{__DEV__ && (
					<TouchableOpacity onPress={reloadApp}>
						<Text>Debug</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	},
);
