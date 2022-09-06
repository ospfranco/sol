import {Assets} from 'assets'
import React, {FC} from 'react'
import {Image, TouchableOpacity} from 'react-native'
import tw from 'tailwind'

interface Props {
  value: boolean
  onValueChange: (v: boolean) => void
  disabled?: boolean
}

export const MySwitch: FC<Props> = ({value, onValueChange, disabled}) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      // @ts-expect-error
      enableFocusRing={false}
      onPress={() => {
        onValueChange(!value)
      }}
      style={tw.style(`w-3 h-3 rounded justify-center items-center border`, {
        'border-gray-400': value,
        'border-gray-500': !value,
      })}>
      {!!value && (
        <Image
          source={Assets.CheckIcon}
          style={tw.style('h-3 w-3', {tintColor: 'white'})}
        />
      )}
    </TouchableOpacity>
  )
}
