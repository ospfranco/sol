import clsx from 'clsx'
import {GradientView} from 'components/GradientView'
import {Key} from 'components/Key'
import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
import {Text, TextInput, View, ViewStyle} from 'react-native'
import {useStore} from 'store'
import colors from 'tailwindcss/colors'

interface Props {
  style?: ViewStyle
  className?: string
}

const BG_COLORS = {
  SYSTEM: {
    start: '#00000000',
    end: '#00000000',
  },
  BLUE: {
    start: '#00415277',
    end: '#012b3677',
  },
  ORANGE: {
    start: '#ff9e0077',
    end: '#8063ff77',
  },
}

export const ScratchpadWidget: FC<Props> = observer(({style}) => {
  let store = useStore()
  useFullSize()

  useEffect(() => {
    solNative.turnOffVerticalArrowsListeners()
    solNative.turnOffEnterListener()
    return () => {
      solNative.turnOnEnterListener()
      solNative.turnOnVerticalArrowsListeners()
    }
  }, [])

  return (
    <GradientView
      className="flex-1"
      startColor={BG_COLORS[store.ui.scratchPadColor].start}
      endColor={BG_COLORS[store.ui.scratchPadColor].end}
      angle={45}>
      <TextInput
        autoFocus
        value={store.ui.note}
        onChangeText={store.ui.setNote}
        // @ts-expect-error
        enableFocusRing={false}
        placeholderTextColor={colors.neutral[400]}
        style={{
          fontFamily: 'Avenir',
        }}
        placeholder="Write something..."
        className="flex-1 p-4 mt-2"
        multiline
        spellCheck
      />
      <View className="flex-row gap-2 subBg justify-end px-4 py-2">
        <Text className={clsx('text-xs darker-text')}>Switch themes</Text>
        <Key symbol={'\u21E5'} />
      </View>
    </GradientView>
  )
})
