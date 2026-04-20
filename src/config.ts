import * as Sentry from "@sentry/react-native";
import type { IFuseOptions } from "fuse.js";
import { LogBox } from "react-native";
import { SentryDSN } from "./env";

LogBox.ignoreLogs([
	"Clipboard ",
	"Component",
	"Require cycle:",
	"SafeAreaView has been deprecated and will be removed in a future release.",
]);

export const FUSE_OPTIONS: IFuseOptions<any> = {
	threshold: 0.15,
	ignoreLocation: true,
	findAllMatches: true,
	keys: [
		{ name: "name", weight: 0.9 },
		{ name: "alias", weight: 0.1 },
	],
};

if (!__DEV__) {
	Sentry.init({
		dsn: SentryDSN,
		enableAppHangTracking: false,
	});
} else {
	Sentry.setUser({ email: "ospfranco@gmail.com" });
}
