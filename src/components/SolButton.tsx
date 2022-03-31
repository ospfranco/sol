import React, {FC} from 'react'
import {Text, TouchableOpacity, TouchableOpacityProps} from 'react-native'
import tw from 'tailwind'

interface Props extends TouchableOpacityProps {
  title: string
}

export const SolButton: FC<Props> = ({title, ...props}) => {
  return (
    <TouchableOpacity
      style={tw`rounded px-4 h-7 bg-blue-500 text-white justify-center items-center border-blue-400 border`}
      {...props}>
      <Text style={tw`font-medium text-sm`}>{title}</Text>
    </TouchableOpacity>
  )
}
