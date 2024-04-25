import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {
  Image,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native'
import colors from '../colors'
import {observer} from 'mobx-react-lite'
import {useStore} from 'store'
import {Assets} from 'assets'

type Props = {} & TouchableOpacityProps

export const BackButton: FC<Props> = observer(props => {
  const store = useStore()
  const [hovered, hoverOn, hoverOff] = useBoolean()
  return (
    <TouchableOpacity
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      {...props}
      // @ts-ignore
      enableFocusRing={false}>
      <View
        className={clsx('h-9 w-9 items-center justify-center rounded', {
          'bg-transparent': !hovered,
          'bg-neutral-400 dark:bg-neutral-700': hovered,
        })}>
        <Image
          source={
            store.ui.isDarkMode ? Assets.ArrowLeftWhite : Assets.ArrowLeftBlack
          }
          className="h-6 w-6"
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  )
})
