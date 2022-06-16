import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {
  FlatList,
  Text,
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

const WrappedInput: FC<WrappedInputProps> = ({focused, ...props}) => {
  const ref = useRef<TextInput | null>(null)

  useEffect(() => {
    solNative.turnOffVerticalArrowsListeners()

    return () => {
      solNative.turnOnVerticalArrowsListeners()
    }
  }, [])

  useEffect(() => {
    if (focused) {
      ref.current?.focus()
    }
  }, [focused])

  useEffect(() => {
    solNative.turnOffVerticalArrowsListeners()
    return () => {
      solNative.turnOnVerticalArrowsListeners()
    }
  }, [])

  return <TextInput ref={ref} selectTextOnFocus={false} {...props} />
}

export const ScratchpadWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex
  const listRef = useRef<FlatList | null>(null)

  useEffect(() => {
    listRef.current?.scrollToIndex({
      index: store.ui.selectedIndex,
      viewOffset: 80,
    })
  }, [selectedIndex])

  return (
    <View style={tw`flex-1`}>
      <View style={tw.style('flex-1', style)}>
        <FlatList
          ref={listRef}
          data={[...store.ui.notes]}
          style={tw.style('flex-1')}
          contentContainerStyle={tw`px-6`}
          renderItem={({item, index}) => {
            return (
              <WrappedInput
                value={item}
                onChangeText={v => {
                  store.ui.updateNote(index, v)
                }}
                focused={index === selectedIndex}
                autoFocus={index === 0}
                // @ts-expect-error
                enableFocusRing={false}
                selectionColor={solNative.accentColor}
                placeholderTextColor={tw.color('text-gray-500')}
                placeholder="Write something..."
                style={tw.style('', {
                  'text-gray-500 dark:text-gray-400': selectedIndex !== index,
                })}
                onFocus={() => {
                  store.ui.setSelectedIndex(index)
                }}
                multiline
              />
            )
          }}
          ItemSeparatorComponent={() => (
            <View
              style={tw`w-full border-b border-lightBorder dark:border-darkBorder mt-2 mb-4`}
            />
          )}
        />
      </View>
      <View
        style={tw`border-t bg-gray-100 dark:bg-black bg-opacity-80 dark:bg-opacity-30 border-lightBorder dark:border-darkBorder px-6 pt-1 pb-2 flex-row items-center`}>
        <Text style={tw`text-xs dark:text-gray-400 text-gray-500`}>
          <Text style={tw`text-xs`}>⇧ + ↩</Text> new
        </Text>
        <View
          style={tw`border-r border-lightBorder dark:border-darkBorder h-3 mx-4`}
        />
        <Text style={tw`text-xs dark:text-gray-400 text-gray-500`}>
          <Text style={tw`text-xs`}>⇥</Text> next
        </Text>
        <View
          style={tw`border-r border-lightBorder dark:border-darkBorder h-3 mx-4`}
        />
        <Text style={tw`text-xs dark:text-gray-400 text-gray-500`}>
          <Text style={tw`text-xs`}>⇧ + ⇥</Text> previous
        </Text>
        <View
          style={tw`border-r border-lightBorder dark:border-darkBorder h-3 mx-4`}
        />
        <Text style={tw`text-xs dark:text-gray-400 text-gray-500`}>
          <Text style={tw`text-xs`}>⌘ + ↩</Text> copy & delete
        </Text>
      </View>
    </View>
  )
})
