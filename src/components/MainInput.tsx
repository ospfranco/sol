import {observer} from 'mobx-react-lite'
import {
  DevSettings,
  Image,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native'
import {TextInput} from 'react-native-macos'
import {useStore} from 'store'
import colors from 'tailwindcss/colors'
import {Widget} from 'stores/ui.store'
import {BackButton} from './BackButton'
import {Assets} from 'assets'

type Props = {
  placeholder?: string
  showBackButton?: boolean
  style?: any
  className?: string
  hideIcon?: boolean
}

export const MainInput = observer<Props>(
  ({
    placeholder = 'What would you like to do?',
    showBackButton,
    style,
    hideIcon,
  }) => {
    const store = useStore()
    const colorScheme = useColorScheme()
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
            source={Assets.Logo}
            className="w-6 h-6"
            tintColor={
              colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[600]
            }
          />
        </TouchableOpacity>
      )
    }

    if (hideIcon) {
      leftButton = null
    }

    return (
      <View className="min-h-[42px] flex-row items-center gap-2 my-1 flex-1">
        {leftButton}
        <TextInput
          autoFocus
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          // @ts-ignore
          className="text-lg flex-1"
          cursorColor={colorScheme === 'dark' ? colors.white : colors.black}
          placeholder={placeholder}
          placeholderTextColor={colorScheme === 'dark' ? '#555' : '#888'}
        />
      </View>
    )
  },
)
