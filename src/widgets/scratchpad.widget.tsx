import clsx from 'clsx'
import {GradientView} from 'components/GradientView'
import {Key} from 'components/Key'
import {useFullSize} from 'hooks/useFullSize'
import {solNative} from 'lib/SolNative'
import {observer} from 'mobx-react-lite'
import React, {FC, useEffect} from 'react'
import {Text, TextInput, View, ViewStyle, useColorScheme} from 'react-native'
import {TouchableOpacity} from 'react-native-macos'
import {useStore} from 'store'
import {ScratchPadColor} from 'stores/ui.store'
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
  let isDarkMode = useColorScheme() === 'dark'
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
      className="flex-1 pt-4"
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
        className="flex-1 p-4"
        multiline
        spellCheck
      />
      <View className="flex-row gap-1 subBg justify-end px-4 py-2">
        <Text className={clsx('text-xs darker-text mr-1')}>Switch themes</Text>
        <Key symbol={'tab'} />
      </View>
    </GradientView>
  )
})
