import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC} from 'react'
import {Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'

interface Props extends TouchableOpacityProps {
  title: string
}

export const SolButton: FC<Props> = ({title, ...props}) => {
  const [isHovered, hoverOn, hoverOff] = useBoolean()
  return (
    <TouchableOpacity
      // @ts-expect-error
      onMouseEnter={hoverOn}
      onMouseLeave={hoverOff}
      className={clsx(
        `rounded px-4 h-7 border-blue-400 text-white justify-center items-center border`,
        {
          'bg-blue-500': !isHovered,
          'bg-blue-600': isHovered,
        },
      )}
      {...props}>
      <Text className="font-medium text-sm text-white">{title}</Text>
    </TouchableOpacity>
  )
}
