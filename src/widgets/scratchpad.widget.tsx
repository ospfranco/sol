import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect, useRef} from 'react'
import {FlatList, TextInput, View, ViewStyle, useColorScheme} from 'react-native'
import {useStore} from 'store'
import colors from 'tailwindcss/colors'

interface Props {
  style?: ViewStyle
  className?: string
}

export const ScratchpadWidget: FC<Props> = observer(({style}) => {
  let store = useStore()
  let isDarkMode = useColorScheme() === 'dark'
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
    <View style={style} className="flex-1 p-4 bg-white dark:bg-dark">
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
        cursorColor={isDarkMode ? 'white' : 'black'}
      />
    </View>
  )
})
