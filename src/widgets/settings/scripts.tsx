import type { FC } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { observer } from "mobx-react-lite";
import { useStore } from "store";
import { solNative } from "lib/SolNative";
import { Assets } from "assets";

export const Scripts: FC = observer(() => {
	const store = useStore();
	const username = solNative.userName();

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			automaticallyAdjustContentInsets
			className="flex-1 -mt-10"
			contentContainerClassName="p-5 gap-2"
		>
			<View className="flex-row items-center p-3 subBg rounded-lg border border-lightBorder dark:border-darkBorder mb-2">
				<Image
					source={Assets.terminal}
					className="h-8 w-8 mr-3"
					resizeMode="contain"
				/>
				<View className="flex-1">
					<Text className="text-xxs text-neutral-500 dark:text-neutral-400">
						Scripts are located at{" "}
						<Text className="font-bold">
							/Users/{username}/.config/sol/scripts
						</Text>
						.
					</Text>
					<Text className="text-xxs text-neutral-500 dark:text-neutral-400 mt-2">
						Place your scripts in this folder to have them automatically picked
						up by Sol.
					</Text>
					<Text className="text-xxs text-neutral-500 dark:text-neutral-400 mt-2">
						Each script must contain two comments:
					</Text>
					<Text className="text-xxs text-neutral-500 dark:text-neutral-400 mt-2">
						# name: Script Name
					</Text>
					<Text className="text-xxs text-neutral-500 dark:text-neutral-400 mt-2">
						# icon: Emoji Icon
					</Text>
				</View>
			</View>
			<View className="p-3 subBg gap-3 rounded-lg border border-lightBorder dark:border-darkBorder">
				<Text className="text-sm font-semibold mb-2">Detected Scripts:</Text>
				{store.scripts.scripts.length === 0 ? (
					<Text className="italic text-neutral-500">No scripts found.</Text>
				) : (
					store.scripts.scripts.map((script) => (
						<View key={script.id} className="mb-2 flex-row items-center">
							<Text className="mr-2">{script.icon}</Text>
							<Text className="text-xs mr-2">{script.name}</Text>
							<View className="flex-1" />
							<Text className="text-xs text-neutral-500">
								{script.id.replace("script-", "")}
							</Text>
						</View>
					))
				)}
			</View>
		</ScrollView>
	);
});
