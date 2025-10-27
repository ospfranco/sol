import clsx from 'clsx'
import { FC } from 'react'
import { Text, View, ViewStyle } from 'react-native'

interface IProps {
  title?: string
  symbol?: string
  primary?: boolean
  style?: ViewStyle
  brRounded?: boolean
  className?: string
}

export const Key: FC<IProps> =
  ({ title, primary = false, style, symbol }) => {
    return (
      <View className="items-center gap-2 flex-row" style={style}>
        {!!title && (
          <Text
            className={clsx(
              'text-center font-semibold text-neutral-600 dark:text-neutral-300',
            )}>
            {title.trim()}
          </Text>
        )}

        {!!symbol && (
          <View
            className={clsx(
              'w-[20px] h-[20px] items-center justify-center rounded ',
              {
                'bg-neutral-100 dark:bg-neutral-700': !primary,
                'bg-accent dark:bg-accent': primary,
              },
            )}>
            <Text
              className="text-xs text-center"
            >
              {symbol}
            </Text>
          </View>
        )}
      </View>
    )
  }
