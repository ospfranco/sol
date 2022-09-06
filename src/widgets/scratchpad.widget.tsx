import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native'
import {useStore} from 'store'
import tw from 'tailwind'
import {useDeviceContext} from 'twrnc'

interface Props {
  style?: ViewStyle
}

interface WrappedInputProps extends TextInputProps {
  focused: boolean
}

const WrappedInput: FC<WrappedInputProps> = ({focused, value, ...props}) => {
  const ref = useRef<TextInput | null>(null)
  useFullSize()

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
  useDeviceContext(tw)
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<FlatList | null>(null)

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
    <View style={tw.style(`flex-1`, style)}>
      <View style={tw`flex-1 p-4`}>
        <WrappedInput
          autoFocus
          value={store.ui.note}
          onChangeText={store.ui.setNote}
          scrollEnabled={true}
          // @ts-expect-error
          enableFocusRing={false}
          placeholderTextColor={tw.color('text-gray-400')}
          placeholder="Write something..."
          style={tw.style('flex-1 -mt-7 -mr-4')}
          multiline
        />
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
