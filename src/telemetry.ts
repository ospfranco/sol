import * as Sentry from "@sentry/react-native";
import { SentryDSN } from "./env";

let telemetryEnabled = true;

if (!__DEV__) {
	Sentry.init({
		dsn: SentryDSN,
		enableAppHangTracking: false,
	});
} else {
	Sentry.setUser({ email: "ospfranco@gmail.com" });
}

export function setTelemetryEnabled(enabled: boolean) {
	telemetryEnabled = enabled;
}

export function safeCaptureException(error: unknown) {
	if (!__DEV__ && telemetryEnabled) {
		Sentry.captureException(error);
	}
}
