import { cssInterop } from "nativewind";
import { requireNativeComponent, type ViewStyle } from "react-native";

const FileImageViewNative = requireNativeComponent<{
	url: string;
	style?: ViewStyle;
	className?: string;
}>("FileImageView");

export const FileImageView = (props: any) => {
	return <FileImageViewNative {...props} />;
};

cssInterop(FileImageView, {
	className: "style",
});
