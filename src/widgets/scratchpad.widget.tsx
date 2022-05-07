import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {
  createRef,
  FC,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Button,
  FlatList,
  ScrollView,
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
    if (focused) {
      ref.current?.focus()
    }
  }, [focused])

  return <TextInput ref={ref} selectTextOnFocus={false} {...props} />
}

export const ScratchpadWidget: FC<Props> = observer(({style}) => {
  useDeviceContext(tw)
  const store = useStore()
  const selectedIndex = store.ui.selectedIndex

  return (
    <>
      <FlatList
        data={[...store.ui.notes]}
        style={tw.style('flex-1', style)}
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
                'dark:text-gray-400': selectedIndex !== index,
              })}
              onFocus={() => {
                store.ui.setSelectedIndex(index)
              }}
              multiline
            />
          )
        }}
        ItemSeparatorComponent={() => (
          <View style={tw`w-full border-b dark:border-darkBorder mt-2 mb-4`} />
        )}
      />
    </>
  )
})
