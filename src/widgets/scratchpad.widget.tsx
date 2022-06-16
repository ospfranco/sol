import { solNative } from 'lib/SolNative'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useRef } from 'react'
import {
  FlatList,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle
} from 'react-native'
import { useStore } from 'store'
import tw from 'tailwind'
import { useDeviceContext } from 'twrnc'

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

  return <TextInput ref={ref} selectTextOnFocus={false} value={value} {...props} />
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
    <View style={tw`flex-1`}>
      <View style={tw.style('flex-1', style)}>
        <FlatList
          ref={listRef}
          data={[...store.ui.notes]}
          style={tw.style('flex-1 -mt-3')}
          contentContainerStyle={tw`px-5`}
          renderItem={({item, index}) => {
            const focused = selectedIndex === index
            return (
              <WrappedInput
                value={item}
                onChangeText={v => {
                  const oldBreakCount = (item.match(/\n/g) || []).length
                  const newBreakCount = (v.match(/\n/g) || []).length
                  const newLineInserted = newBreakCount > oldBreakCount
                  
                  if(newLineInserted) {
                    const handled = store.ui.handleEnterPressOnScratchpad()
                    if(handled) {
                      return
                    }
                  }

                  // character was deleted
                  if(item.length -1 === v.length) {
                    const handled = store.ui.handleDeletePressOnScrachpad()
                    if(handled) {
                      return
                    }
                  }

                  store.ui.updateNote(index, v)
                }}
                scrollEnabled={false}
                focused={focused}
                // @ts-expect-error
                enableFocusRing={false}
                placeholderTextColor={tw.color('text-gray-400')}
                placeholder="Write something..."
                style={tw.style('border-b border-lightBorder dark:border-darkBorder pb-2 mb-4', {
                  'border-accent dark:border-accent': focused,
                })}
                onFocus={() => {
                  store.ui.setSelectedIndex(index)
                }}
                multiline
              />
            )
          }}
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
          <Text style={tw`text-xs`}>⇧ + delete</Text> copy & delete
        </Text>
      </View>
    </View>
  )
})
