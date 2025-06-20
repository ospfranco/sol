import clsx from 'clsx'
import {FC} from 'react'
import {Text, View, ViewStyle} from 'react-native'
import colors from 'tailwindcss/colors'
import {observer} from 'mobx-react-lite'
import {useStore} from 'store'

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
              'w-[20px] h-[20px] items-center justify-center rounded border subBg border-color',
              {
                'bg-accent border-accent': primary,
              },
            )}>
            <Text
              className="text-xs text-center"
              style={{
                color: store.ui.isDarkMode
                  ? colors.neutral[300]
                  : colors.neutral[500],
              }}>
              {symbol}
            </Text>
          </View>
        )}
      </View>
    )
  },
)
