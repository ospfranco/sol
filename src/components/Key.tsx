import clsx from 'clsx'
import React, {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import colors from 'tailwindcss/colors'
import {BlurView} from './BlurView'
import {observer} from 'mobx-react-lite'
import {useStore} from 'store'
import {solNative} from 'lib/SolNative'

interface IProps {
  title?: string
  symbol?: string
  primary?: boolean
  style?: ViewStyle
  brRounded?: boolean
  className?: string
}

export const Key: FC<IProps> = observer(
  ({title, primary = false, style, symbol}) => {
    let store = useStore()
    let borderColor1 = store.ui.isDarkMode ? '#66666611' : '#00000011'
    let borderColor2 = store.ui.isDarkMode ? '#AAAAAA44' : '#00000044'

    return (
      <View className="items-center g-2 flex-row" style={style}>
        {!!title && (
          <Text
            className={clsx(
              'text-center font-semibold text-neutral-600 dark:text-neutral-300',
            )}>
            {title.trim()}
          </Text>
        )}

        {!!symbol && (
          <BlurView
            startColor={borderColor1}
            endColor={borderColor2}
            cornerRadius={5}
            disabled={store.ui.reduceTransparency}
            className={'min-w-[18] min-h-[18] items-center justify-center'}>
            <View
              className="min-w-[18] px-1 min-h-[18] items-center justify-center"
              style={{
                backgroundColor: primary
                  ? store.ui.isDarkMode
                    ? `${solNative.accentColor}44`
                    : `${solNative.accentColor}BB`
                  : store.ui.isDarkMode
                  ? '#00000066'
                  : '#DDDDDD88',
              }}>
              <Text
                className="text-xs text-center"
                style={{
                  color: primary
                    ? '#FFFFFF'
                    : store.ui.isDarkMode
                    ? colors.neutral[300]
                    : colors.neutral[600],
                }}>
                {symbol}
              </Text>
            </View>
          </BlurView>
        )}
      </View>
    )
  },
)
