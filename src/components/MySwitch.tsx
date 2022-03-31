import React, {FC} from 'react'
import {TouchableOpacity, View} from 'react-native'
import tw from 'tailwind'

interface Props {
  value: boolean
  onValueChange: (v: boolean) => void
}

export const MySwitch: FC<Props> = ({value, onValueChange}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        onValueChange(!value)
      }}
      style={tw.style(`w-7 h-4 rounded-full justify-center`, {
        'bg-blue-500': value,
        'bg-gray-300 dark:bg-gray-700': !value,
      })}>
      <View
        style={tw.style('w-3 h-3 rounded-full', {
          'ml-1 bg-gray-100 dark:bg-gray-800': !value,
          'ml-3 bg-white': value,
        })}
      />
    </TouchableOpacity>
  )
}
