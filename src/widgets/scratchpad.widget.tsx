import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, forwardRef, useEffect, useRef} from 'react'
import {
  FlatList,
  Text,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import colors from 'tailwindcss/colors'

interface Props {
  style?: ViewStyle
  className?: string
}

interface WrappedInputProps extends TextInputProps {
  focused: boolean
}

export const ScratchpadWidget: FC<Props> = observer(({style}) => {
  let store = useStore()
  useFullSize()
  let selectedIndex = store.ui.selectedIndex
  let listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    solNative.turnOffVerticalArrowsListeners()
    solNative.turnOffEnterListener()
    return () => {
      solNative.turnOnEnterListener()
      solNative.turnOnVerticalArrowsListeners()
    }
  }, [])

  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: store.ui.selectedIndex,
      viewOffset: 80,
    })
  }, [selectedIndex])

  return (
    <View style={style} className="flex-1 p-4">
      <View className="flex-1 rounded-lg border border-lightBorder dark:border-darkBorder p-2 bg-white dark:bg-darker">
        <TextInput
          autoFocus
          value={store.ui.note}
          onChangeText={store.ui.setNote}
          // @ts-expect-error
          enableFocusRing={false}
          placeholderTextColor={colors.neutral[400]}
          placeholder="Write something..."
          className="flex-1"
          multiline
          spellCheck
        />
        <Text className="text-xs text-neutral-400 self-end">
          {store.ui.note.split(' ').filter(v => v).length} Words •{' '}
          {store.ui.note.length} Characters
        </Text>
      </View>
    </View>
  )
})
