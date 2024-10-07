import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {
  Image,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  useColorScheme,
} from 'react-native'
import {observer} from 'mobx-react-lite'
import {useStore} from 'store'
import {Assets} from 'assets'

type Props = {} & TouchableOpacityProps

export const BackButton: FC<Props> = observer(props => {
  const [hovered, hoverOn, hoverOff] = useBoolean()
  const colorScheme = useColorScheme()
  return (
    <TouchableOpacity
      className="w-6"
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      {...props}
      // @ts-ignore
      enableFocusRing={false}>
      <View
        className={clsx('h-6 w-6 items-center justify-center rounded', {
          'bg-transparent': !hovered,
          'bg-neutral-400 dark:bg-neutral-700': hovered,
        })}>
        <Image
          source={Assets.ArrowLeftWhite}
          tintColor={colorScheme === 'dark' ? 'white' : 'black'}
          className="h-6 w-6"
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  )
})
