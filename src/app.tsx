import "./global.css";
import "config";
import { RootContainer } from "containers";
import "intl";
import "intl/locale-data/jsonp/en";
import { LegendList } from "@legendapp/list/react-native";
import { accentRgb } from "mytailwind";
import { remapProps, vars } from "nativewind";
import { LogBox, View } from "react-native";
import { root, StoreProvider } from "store";

const userTheme = vars({
	"--color-accent": `${accentRgb?.r}, ${accentRgb?.g}, ${accentRgb?.b}`,
});

LogBox.ignoreLogs(["Sending ", "[legend-list]"]);

remapProps(LegendList, {
	className: "style",
	contentContainerClassName: "contentContainerStyle",
});

export const App = () => {
	return (
		<StoreProvider value={root}>
			<View style={userTheme}>
				<RootContainer />
			</View>
		</StoreProvider>
	);
};
