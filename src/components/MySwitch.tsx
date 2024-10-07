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
      className={clsx(`w-7 h-[15px] rounded-full border`, {
        'bg-[#4078D6] border-[#4078D6]': !!value,
        'bg-neutral-300 dark:bg-neutral-700 border-neutral-200 dark:border-neutral-600':
          !value,
      })}>
      <View
        className={clsx(
          `w-[13px] h-[13px] rounded-full bg-white dark:bg-neutral-200 absolute`,
          {
            'right-0': !!value,
            'left-0': !value,
          },
        )}
      />
    </TouchableOpacity>
  )
}
