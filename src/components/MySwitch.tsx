import clsx from 'clsx'
import {solNative} from 'lib/SolNative'
import React, {FC} from 'react'
import {TouchableOpacity, View} from 'react-native'
import colors from 'tailwindcss/colors'

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
      className={clsx(`w-7 h-[17px] rounded-full`)}
      style={{
        backgroundColor: value ? solNative.accentColor : colors.neutral[400],
      }}>
      <View
        className={clsx(
          `w-[13px] h-[13px] rounded-full bg-white absolute top-[2px]`,
          {
            'right-[2px]': !!value,
            'left-[2px]': !value,
          },
        )}
      />
    </TouchableOpacity>
  )
}
