import {Assets} from 'assets'
import {observer} from 'mobx-react-lite'
import {useRef} from 'react'
import {Image, TextInput, View, useColorScheme} from 'react-native'
import {useStore} from 'store'
import colors from 'tailwindcss/colors'
import {SelectableButton} from './SelectableButton'
import {Widget} from 'stores/ui.store'
import {BackButton} from './BackButton'

type Props = {
  placeholder?: string
  showBackButton?: boolean
  style?: any
  className?: string
}

export const MainInput = observer<Props>(
  ({
    placeholder = 'Search for commands, apps, bookmarks and shortcuts...',
    showBackButton,
    style,
  }) => {
    const store = useStore()
    const inputRef = useRef<TextInput | null>(null)
    const colorScheme = useColorScheme()

    return (
      <View className="h-16 px-4 flex-row items-center g-1" style={style}>
        {showBackButton && (
          <View className="">
            <BackButton
              onPress={() => {
                store.ui.setQuery('')
                store.ui.focusWidget(Widget.SEARCH)
              }}
            />
          </View>
        )}
        <TextInput
          autoFocus
          // @ts-expect-error
          enableFocusRing={false}
          value={store.ui.query}
          onChangeText={store.ui.setQuery}
          ref={inputRef}
          className="text-2xl flex-1"
          placeholderTextColor={
            colorScheme === 'dark' ? colors.neutral[500] : colors.neutral[400]
          }
          placeholder={placeholder}
        />
      </View>
    )
  },
)
