import clsx from 'clsx'
import React, {FC} from 'react'
import {TouchableOpacity, View} from 'react-native'

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
      className={clsx(`w-7 h-[17px] rounded-full`, {
        'bg-accent': !!value,
        'bg-neutral-700': !value,
      })}>
      <View
        className={clsx(
          `w-[13px] h-[13px] rounded-full bg-neutral-200 absolute top-[2px]`,
          {
            'right-[2px]': !!value,
            'left-[2px]': !value,
          },
        )}
      />
    </TouchableOpacity>
  )
}
