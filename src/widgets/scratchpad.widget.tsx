import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
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
}

interface WrappedInputProps extends TextInputProps {
  focused: boolean
}

const WrappedInput: FC<WrappedInputProps> = ({focused, value, ...props}) => {
  const ref = useRef<TextInput | null>(null)

  useEffect(() => {
    if (focused) {
      ref.current?.focus()
    }
  }, [focused])

  return (
    <TextInput ref={ref} selectTextOnFocus={false} value={value} {...props} />
  )
}

export const ScratchpadWidget: FC<Props> = observer(({style}) => {
  const store = useStore()
  useFullSize()
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<FlatList | null>(null)
  const colorScheme = useColorScheme()

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
        <WrappedInput
          autoFocus
          value={store.ui.note}
          onChangeText={store.ui.setNote}
          // @ts-expect-error
          enableFocusRing={false}
          placeholderTextColor={colors.neutral[400]}
          placeholder="Write something..."
          className="flex-1"
          selectionColor={colorScheme === 'dark' ? 'white' : 'black'}
          multiline
          spellCheck
        />
        <Text className="text-xs text-neutral-400 self-end">
          {store.ui.note.split(' ').filter(v => v).length} Words •{' '}
          {store.ui.note.length} Characters
        </Text>
      </View>
      {/* <View
        style={tw`flex-row items-center border-t border-lightBorder dark:border-darkBorder px-3 py-2 bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30`}>
        <Text style={tw`mr-1 text-gray-500`}>BG</Text>
        <Dropdown
          value={'none'}
          options={[{label: 'None', value: 'none'}]}
          onValueChange={() => {}}
          style={tw`w-20`}
          upward
        />
      </View> */}
    </View>
  )
})
