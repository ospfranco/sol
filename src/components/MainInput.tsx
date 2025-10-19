import { observer } from 'mobx-react-lite'
import { DevSettings, Image, Text, TouchableOpacity, View } from 'react-native'
import { TextInput } from 'react-native-macos'
import { useStore } from 'store'
import colors from 'tailwindcss/colors'
import { Widget } from 'stores/ui.store'
import { BackButton } from './BackButton'
import { Assets } from 'assets'

type Props = {
  placeholder?: string
  showBackButton?: boolean
  style?: any
  className?: string
  hideIcon?: boolean
}

export const MainInput = observer<Props>(
  ({
    placeholder = 'Search for apps and commands...',
    showBackButton,
    hideIcon,
  }) => {
    const store = useStore()
    const isDarkMode = store.ui.isDarkMode
    const reloadApp = async () => {
      DevSettings.reload()
    }

    let leftButton = null
    if (showBackButton) {
      leftButton = (
        <BackButton
          onPress={() => {
            store.ui.setQuery('')
            store.ui.focusWidget(Widget.SEARCH)
          }}
        />
      )
    }

    if (!showBackButton) {
      leftButton = (
        <TouchableOpacity onPress={reloadApp}>
          <Image
            source={isDarkMode ? Assets.logoMinimal : Assets.logoMinimalWhite}
            style={{ width: 20, height: 20 }}
          />
        </TouchableOpacity>
      )
    }

    if (hideIcon) {
      leftButton = null
    }

    return (
      <View className="min-h-[42px] flex-row items-center gap-2 my-1 flex-1 px-2">
        {leftButton}
        <TextInput
          autoFocus
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          // @ts-ignore
          className="text-lg flex-1"
          cursorColor={isDarkMode ? colors.white : colors.black}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#888' : '#888'}
        />
        {__DEV__ && <Text>Debug</Text>}
      </View>
    )
  },
)
