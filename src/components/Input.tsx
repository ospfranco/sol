import clsx from 'clsx'
import {useBoolean} from 'hooks'
import React, {FC, MutableRefObject} from 'react'
import {TextInput, TextInputProps, View, ViewStyle} from 'react-native'
import colors from 'tailwindcss/colors'

interface Props extends TextInputProps {
  inputRef?: MutableRefObject<TextInput | null>
  style?: ViewStyle
  inputStyle?: ViewStyle
  inputClassName?: string
  bordered?: boolean
}

export const Input: FC<Props> = ({
  inputRef,
  style,
  inputStyle,
  bordered,
  autoFocus,
  inputClassName,
  ...props
}) => {
  const [focused, focusOn, focusOff] = useBoolean(autoFocus)
  const [hovered, hoverOn, hoverOff] = useBoolean(false)
  return (
    <View
      //@ts-ignore
      onMouseEnter={hoverOn}
      //@ts-ignore
      onMouseLeave={hoverOff}
      className={clsx('w-full rounded bg-transparent px-2 h-7 justify-center', {
        'border border-lightBorder dark:border-darkBorder':
          !!bordered && !focused && !hovered,
        'border border-accent': !!bordered && !!focused,
        'border border-neutral-500 dark:border-white':
          !!bordered && !focused && !!hovered,
      })}
      style={style}>
      <TextInput
        // @ts-ignore
        enableFocusRing={false}
        ref={inputRef}
        onFocus={focusOn}
        onBlur={focusOff}
        className={`text-sm ${inputClassName}`}
        style={inputStyle}
        autoFocus={autoFocus}
        placeholderTextColor={colors.neutral[400]}
        {...props}
      />
    </View>
  )
}
